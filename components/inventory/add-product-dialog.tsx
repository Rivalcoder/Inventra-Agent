"use client";

import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/inventory/product-form";
import { Product } from "@/lib/types";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: Product) => void;
}

export function AddProductDialog({
  open,
  onOpenChange,
  onAdd,
}: AddProductDialogProps) {
  const handleSubmit = (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newProduct: Product = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAdd(newProduct);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new product to your inventory.
          </DialogDescription>
        </DialogHeader>
        <ProductForm onSubmit={handleSubmit} submitLabel="Add Product" />
      </DialogContent>
    </Dialog>
  );
}