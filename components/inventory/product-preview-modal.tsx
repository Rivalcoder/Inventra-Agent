"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, Check, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type StructuredProduct = {
  name: string;
  description?: string;
  category?: string;
  price?: number;
  stock?: number;
  minStock?: number;
  supplier?: string;
};

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: StructuredProduct[];
  onProductsChange: (products: StructuredProduct[]) => void;
  onSave: () => Promise<void>;
  isLoading?: boolean;
}

export default function ProductPreviewModal({
  isOpen,
  onClose,
  products,
  onProductsChange,
  onSave,
  isLoading = false
}: ProductPreviewModalProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<StructuredProduct | null>(null);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValues({ ...products[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValues) {
      const updatedProducts = [...products];
      updatedProducts[editingIndex] = editValues;
      onProductsChange(updatedProducts);
      setEditingIndex(null);
      setEditValues(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValues(null);
  };

  const handleDelete = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    onProductsChange(updatedProducts);
  };

  const handleClearAll = () => {
    onProductsChange([]);
  };

  const handleConfirmAndSave = async () => {
    await onSave();
    onClose();
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'electronics': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'accessories': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'stationery': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Review and Edit Products ({products.length} items)
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                <TableRow>
                  <TableHead className="w-[200px]">Product Name</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead className="w-[100px]">Price</TableHead>
                  <TableHead className="w-[80px]">Stock</TableHead>
                  <TableHead className="w-[100px]">Min Stock</TableHead>
                  <TableHead className="w-[150px]">Supplier</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {editingIndex === index ? (
                      // Edit Mode
                      <>
                        <TableCell>
                          <Input
                            value={editValues?.name || ''}
                            onChange={(e) => setEditValues(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editValues?.category || ''}
                            onChange={(e) => setEditValues(prev => prev ? { ...prev, category: e.target.value } : null)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editValues?.price || 0}
                            onChange={(e) => setEditValues(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editValues?.stock || 0}
                            onChange={(e) => setEditValues(prev => prev ? { ...prev, stock: Number(e.target.value) } : null)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editValues?.minStock || 0}
                            onChange={(e) => setEditValues(prev => prev ? { ...prev, minStock: Number(e.target.value) } : null)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editValues?.supplier || ''}
                            onChange={(e) => setEditValues(prev => prev ? { ...prev, supplier: e.target.value } : null)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleSaveEdit}
                              className="h-8 w-8 text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelEdit}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      // View Mode
                      <>
                        <TableCell className="font-medium">
                          {product.name || 'Unnamed Product'}
                        </TableCell>
                        <TableCell>
                          {product.category && (
                            <Badge className={cn("text-xs", getCategoryColor(product.category))}>
                              {product.category}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">
                          {formatPrice(product.price)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            (product.stock || 0) <= (product.minStock || 0) 
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          )}>
                            {product.stock || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {product.minStock || 0}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {product.supplier || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(index)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(index)}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No products to review. Upload a file to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleClearAll}
              disabled={products.length === 0}
            >
              Clear All
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          <Button 
            onClick={handleConfirmAndSave} 
            disabled={products.length === 0 || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Confirm & Save ({products.length} items)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
