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
import { Sale, Product } from "@/lib/types";
import { getProducts, postToApi, createSale } from "@/lib/data";
import { toast } from "sonner";
import { useState, useEffect } from "react";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (data: Omit<Sale, "id" | "date" | "productName" | "price" | "total">) => {
    try {
      const product = products.find(p => p.id === data.productId);
      
      if (!product) {
        toast.error("Product not found");
        return;
      }

      if (product.stock < data.quantity) {
        toast.error(`Insufficient stock. Only ${product.stock} units available.`);
        return;
      }
      
      const saleData = {
        productId: data.productId,
        productName: product.name,
        quantity: Number(data.quantity),
        price: Number(product.price),
        total: Number(product.price * data.quantity),
        date: new Date().toISOString(),
        customer: data.customer || ""
      };

      // First create the sale record
      const createdSale = await createSale(saleData);

      // Then update the product stock
      const newStock = product.stock - data.quantity;
      await postToApi('update-stock', {
        productId: product.id,
        newStock: newStock
      });

      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id 
            ? { ...p, stock: newStock }
            : p
        )
      );

      onAdd(createdSale);
      onOpenChange(false); // Close the dialog after successful submission
      toast.success("Sale recorded successfully");
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Failed to record sale');
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

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