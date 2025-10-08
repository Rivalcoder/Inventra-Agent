"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Camera, FileUp, ScanText } from "lucide-react";
import CameraCapture from "@/components/inventory/camera-capture";
import { FullPageLoading } from "@/components/ui/loading-overlay";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Eye, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type StructuredProduct = {
  name: string;
  description?: string;
  category?: string;
  price?: number;
  stock?: number;
  minStock?: number;
  supplier?: string;
};

interface ImportFromFileProps {
  onProductsAdded?: () => void; // Callback to refresh parent component
}

export default function ImportFromFile({ onProductsAdded }: ImportFromFileProps = {}) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [kind, setKind] = useState<"pdf" | "image">("pdf");
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState<any>(null);
  const [products, setProducts] = useState<StructuredProduct[]>([]);
  const [allAccumulatedProducts, setAllAccumulatedProducts] = useState<StructuredProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedProducts, setSavedProducts] = useState<StructuredProduct[]>([]);
  const [showSavedPreview, setShowSavedPreview] = useState(false);

  const canImport = useMemo(() => allAccumulatedProducts && allAccumulatedProducts.length > 0, [allAccumulatedProducts]);
  const canProcess = useMemo(() => !!file || pendingFiles.length > 0, [file, pendingFiles]);

  async function handleExtract() {
    const filesToProcess: File[] = pendingFiles.length ? pendingFiles : (file ? [file] : []);
    if (filesToProcess.length === 0) return;
    
    setIsProcessing(true);
    setLoading(true);
    setError(null);
    
    try {
      const aggregated: StructuredProduct[] = [];
      for (const f of filesToProcess) {
        const inferredKind: "pdf" | "image" = f.type?.includes('pdf') ? 'pdf' : 'image';
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch(`/api/extract?kind=${inferredKind}`, { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Extraction failed");
        setRaw(data);

        const textForAI = typeof data === 'string' ? data : (data.text || data.raw || JSON.stringify(data));
        const sres = await fetch(`/api/structure-products`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ raw: textForAI }),
        });
        const structured = await sres.json();
        if (!sres.ok) throw new Error(structured?.error || "Structuring failed");
        aggregated.push(...(structured.products || []));
      }
      // Add new products to accumulated list
      setAllAccumulatedProducts(prev => [...prev, ...aggregated]);
      setProducts(aggregated); // Keep current batch for individual processing
      setPreviewOpen(true); // Auto-open preview dialog like before
      
      // Show toast notification about minStock default
      toast({
        title: "Processing Complete",
        description: "No minStock given for products - using default value of 5",
        duration: 4000,
      });
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setPendingFiles([]);
      setFile(null);
    }
  }

  async function handleSave() {
    if (!canImport) return;
    setIsSaving(true);
    setLoading(true);
    setError(null);
    try {
      const dbConfig = typeof window !== 'undefined' ? (localStorage.getItem('databaseConfig') || localStorage.getItem('default_db_config') || '') : '';
      for (const p of allAccumulatedProducts) {
        const body = {
          name: p.name,
          description: p.description || '',
          category: p.category || '',
          price: p.price || 0,
          stock: p.stock || 0,
          minStock: p.minStock || 0,
          supplier: p.supplier || '',
        };
        const res = await fetch('/api/db?action=products', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(dbConfig ? { 'x-user-db-config': dbConfig } : {}) },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || 'Failed to save product');
        }
      }
      // Store saved products for preview
      setSavedProducts([...allAccumulatedProducts]);
      setAllAccumulatedProducts([]);
      setProducts([]);
      setPreviewOpen(false);
      setShowSavedPreview(true);
      
      // Notify parent component to refresh
      if (onProductsAdded) {
        onProductsAdded();
      }
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  }

  return (
    <>
      <FullPageLoading 
        isLoading={isProcessing} 
        message="Processing Files..." 
        subMessage="Extracting and structuring product data from your files..."
      />
      
      <FullPageLoading 
        isLoading={isSaving} 
        message="Saving Products..." 
        subMessage={`Saving ${allAccumulatedProducts.length} products to your database...`}
      />
      
      <div className="flex items-center gap-2">
        <DropdownMenu open={showPicker} onOpenChange={setShowPicker}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ScanText className="mr-2 h-4 w-4" /> Import
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => { setKind('pdf'); document.getElementById('importFileInput')?.click(); }}>
              <FileUp className="mr-2 h-4 w-4" /> Upload PDF
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { setKind('image'); document.getElementById('importFileInput')?.click(); }}>
              <FileUp className="mr-2 h-4 w-4" /> Upload Image
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { setKind('image'); setCameraOpen(true); }}>
              <Camera className="mr-2 h-4 w-4" /> Scan with Camera
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input id="importFileInput" multiple type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) setPendingFiles(prev => [...prev, ...files]);
        }} />

        <Button onClick={handleExtract} disabled={!canProcess || loading} size="sm">Process</Button>
        <Button onClick={handleSave} disabled={!canImport || loading} variant="secondary" size="sm">
          {isSaving ? `Saving ${allAccumulatedProducts.length} products...` : `Save All (${allAccumulatedProducts.length})`}
        </Button>
        {allAccumulatedProducts.length > 0 && (
          <Button 
            onClick={() => setPreviewOpen(true)} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            View Processed ({allAccumulatedProducts.length})
          </Button>
        )}
        {savedProducts.length > 0 && (
          <Button 
            onClick={() => setShowSavedPreview(true)} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            View Added ({savedProducts.length})
          </Button>
        )}
        {error ? <span className="text-red-600 text-xs">{error}</span> : null}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[1000px] w-[95vw]">
          <DialogHeader>
            <DialogTitle>Review and Edit All Products ({allAccumulatedProducts.length} items)</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allAccumulatedProducts.map((p, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Input value={p.name} onChange={(e) => setAllAccumulatedProducts(prev => prev.map((it, i) => i === idx ? { ...it, name: e.target.value } : it))} />
                    </TableCell>
                    <TableCell>
                      <Input value={p.category || ''} onChange={(e) => setAllAccumulatedProducts(prev => prev.map((it, i) => i === idx ? { ...it, category: e.target.value } : it))} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={p.price ?? 0} onChange={(e) => setAllAccumulatedProducts(prev => prev.map((it, i) => i === idx ? { ...it, price: Number(e.target.value) } : it))} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={p.stock ?? 0} onChange={(e) => setAllAccumulatedProducts(prev => prev.map((it, i) => i === idx ? { ...it, stock: Number(e.target.value) } : it))} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={p.minStock ?? 0} onChange={(e) => setAllAccumulatedProducts(prev => prev.map((it, i) => i === idx ? { ...it, minStock: Number(e.target.value) } : it))} />
                    </TableCell>
                    <TableCell>
                      <Input value={p.supplier || ''} onChange={(e) => setAllAccumulatedProducts(prev => prev.map((it, i) => i === idx ? { ...it, supplier: e.target.value } : it))} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setAllAccumulatedProducts(prev => prev.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {allAccumulatedProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">No products parsed.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllAccumulatedProducts([])}>Clear All</Button>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button onClick={async () => { await handleSave(); setPreviewOpen(false); }} disabled={isSaving}>
              {isSaving ? `Saving ${allAccumulatedProducts.length} products...` : `Confirm & Save All (${allAccumulatedProducts.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved Products Preview Dialog */}
      <Dialog open={showSavedPreview} onOpenChange={setShowSavedPreview}>
        <DialogContent className="max-w-[1000px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Successfully Added Products ({savedProducts.length} items)
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Supplier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedProducts.map((p, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {p.category || 'General'}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">
                      ₹{p.price?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell className="text-center">{p.stock || 0}</TableCell>
                    <TableCell className="text-center">{p.minStock || 0}</TableCell>
                    <TableCell className="text-sm text-gray-600">{p.supplier || 'N/A'}</TableCell>
                  </TableRow>
                ))}
                {savedProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No products added yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSavedProducts([])}>Clear History</Button>
            <Button onClick={() => setShowSavedPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {cameraOpen && (
        <CameraCapture onClose={() => setCameraOpen(false)} onCapture={(blob: Blob) => {
          setKind('image');
          setFile(new File([blob], 'scan.jpg', { type: 'image/jpeg' }));
          setCameraOpen(false);
        }} />
      )}
    </>
  );
}


