"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Camera, FileUp, ScanText, Trash2 } from "lucide-react";
import CameraCapture from "@/components/inventory/camera-capture";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type StructuredSale = {
  productId?: string;
  productName?: string;
  quantity?: number;
  price?: number;
  total?: number;
  date?: string;
  customer?: string;
};

export default function ImportSales() {
  const [file, setFile] = useState<File | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [kind, setKind] = useState<"pdf" | "image">("pdf");
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<StructuredSale[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const canProcess = useMemo(() => !!file || pendingFiles.length > 0, [file, pendingFiles]);
  const canSave = useMemo(() => sales.length > 0, [sales]);

  async function handleExtract() {
    const filesToProcess: File[] = pendingFiles.length ? pendingFiles : (file ? [file] : []);
    if (filesToProcess.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const aggregated: StructuredSale[] = [];
      for (const f of filesToProcess) {
        const inferredKind: "pdf" | "image" = f.type?.includes('pdf') ? 'pdf' : 'image';
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch(`/api/extract?kind=${inferredKind}`, { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Extraction failed");

        const textForAI = typeof data === 'string' ? data : (data.text || data.raw || JSON.stringify(data));
        const sres = await fetch(`/api/structure-sales`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ raw: textForAI }),
        });
        const structured = await sres.json();
        if (!sres.ok) throw new Error(structured?.error || "Structuring failed");
        aggregated.push(...(structured.sales || []));
      }
      setSales(prev => [...prev, ...aggregated]);
      setPreviewOpen(true);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
      setPendingFiles([]);
      setFile(null);
    }
  }

  async function handleSave() {
    if (!canSave) return;
    setLoading(true);
    setError(null);
    try {
      const dbConfig = typeof window !== 'undefined' ? (localStorage.getItem('databaseConfig') || localStorage.getItem('default_db_config') || '') : '';
      for (const s of sales) {
        // Normalize numbers
        const body = {
          productId: s.productId || '',
          productName: s.productName || '',
          quantity: Number(s.quantity) || 0,
          price: Number(s.price) || 0,
          total: Number(s.total) || ((Number(s.quantity) || 0) * (Number(s.price) || 0)),
          date: s.date,
          customer: s.customer || ''
        };
        const res = await fetch('/api/db?action=sale', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(dbConfig ? { 'x-user-db-config': dbConfig } : {}) },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || 'Failed to save sale');
        }
      }
      setSales([]);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={showPicker} onOpenChange={setShowPicker}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ScanText className="mr-2 h-4 w-4" /> Import Sales
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => { setKind('pdf'); document.getElementById('importSalesInput')?.click(); }}>
            <FileUp className="mr-2 h-4 w-4" /> Upload PDF
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { setKind('image'); document.getElementById('importSalesInput')?.click(); }}>
            <FileUp className="mr-2 h-4 w-4" /> Upload Image
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { setKind('image'); setCameraOpen(true); }}>
            <Camera className="mr-2 h-4 w-4" /> Scan with Camera
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Input id="importSalesInput" multiple type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => {
        const files = Array.from(e.target.files || []);
        if (files.length) setPendingFiles(prev => [...prev, ...files]);
      }} />

      <Button onClick={handleExtract} disabled={!canProcess || loading} size="sm">Process</Button>
      <Button onClick={handleSave} disabled={!canSave || loading} variant="secondary" size="sm">Save</Button>
      {error ? <span className="text-red-600 text-xs">{error}</span> : null}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[1000px] w-[95vw]">
          <DialogHeader>
            <DialogTitle>Review and Edit Sales</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Input value={s.productId || ''} onChange={(e) => setSales(prev => prev.map((it, i) => i === idx ? { ...it, productId: e.target.value } : it))} /></TableCell>
                    <TableCell><Input value={s.productName || ''} onChange={(e) => setSales(prev => prev.map((it, i) => i === idx ? { ...it, productName: e.target.value } : it))} /></TableCell>
                    <TableCell><Input type="number" value={s.quantity ?? 0} onChange={(e) => setSales(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) } : it))} /></TableCell>
                    <TableCell><Input type="number" value={s.price ?? 0} onChange={(e) => setSales(prev => prev.map((it, i) => i === idx ? { ...it, price: Number(e.target.value) } : it))} /></TableCell>
                    <TableCell><Input type="number" value={s.total ?? 0} onChange={(e) => setSales(prev => prev.map((it, i) => i === idx ? { ...it, total: Number(e.target.value) } : it))} /></TableCell>
                    <TableCell><Input value={s.date || ''} onChange={(e) => setSales(prev => prev.map((it, i) => i === idx ? { ...it, date: e.target.value } : it))} /></TableCell>
                    <TableCell><Input value={s.customer || ''} onChange={(e) => setSales(prev => prev.map((it, i) => i === idx ? { ...it, customer: e.target.value } : it))} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSales(prev => prev.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">No sales parsed.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSales([])}>Clear All</Button>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button onClick={async () => { await handleSave(); setPreviewOpen(false); }}>Confirm & Save</Button>
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
    </div>
  );
}


