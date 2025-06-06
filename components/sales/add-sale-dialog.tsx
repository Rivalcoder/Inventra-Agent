"use client";

import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SaleForm } from "@/components/sales/sale-form";
import { Sale } from "@/lib/types";
import { products } from "@/lib/data";

interface AddSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (sale: Sale) => void;
}

export function AddSaleDialog({
  open,
  onOpenChange,
  onAdd,
}: AddSaleDialogProps) {
  const handleSubmit = (data: Omit<Sale, "id" | "date" | "productName" | "price" | "total">) => {
    const product = products.find(p => p.id === data.productId);
    
    if (!product) {
      console.error("Product not found");
      return;
    }
    
    const newSale: Sale = {
      id: uuidv4(),
      productId: data.productId,
      productName: product.name,
      quantity: data.quantity,
      price: product.price,
      total: product.price * data.quantity,
      date: new Date().toISOString(),
      customer: data.customer,
    };

    onAdd(newSale);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
          <DialogDescription>
            Enter the details of the sale below.
          </DialogDescription>
        </DialogHeader>
        <SaleForm onSubmit={handleSubmit} submitLabel="Record Sale" />
      </DialogContent>
    </Dialog>
  );
}