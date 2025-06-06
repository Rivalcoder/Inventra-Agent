"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/inventory/product-form";
import { Product } from "@/lib/types";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onUpdate: (product: Product) => void;
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  onUpdate,
}: EditProductDialogProps) {
  const handleSubmit = (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const updatedProduct: Product = {
      ...data,
      id: product.id,
      createdAt: product.createdAt,
      updatedAt: new Date().toISOString(),
    };

    onUpdate(updatedProduct);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the product information below.
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}