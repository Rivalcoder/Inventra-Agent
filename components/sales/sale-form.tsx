"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Sale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { products } from "@/lib/data";

const saleSchema = z.object({
  productId: z.string({
    required_error: "Please select a product",
  }),
  quantity: z.coerce
    .number()
    .int()
    .positive({ message: "Quantity must be a positive number" }),
  customer: z.string().optional(),
});

type SaleFormValues = z.infer<typeof saleSchema>;

interface SaleFormProps {
  onSubmit: (data: Omit<Sale, "id" | "date" | "productName" | "price" | "total">) => void;
  submitLabel?: string;
}

export function SaleForm({ onSubmit, submitLabel = "Submit" }: SaleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductPrice, setSelectedProductPrice] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productId: "",
      quantity: 1,
      customer: "",
    },
  });

  const watchProductId = form.watch("productId");
  const watchQuantity = form.watch("quantity");

  useEffect(() => {
    if (watchProductId) {
      const product = products.find((p) => p.id === watchProductId);
      if (product) {
        setSelectedProductPrice(product.price);
      }
    } else {
      setSelectedProductPrice(null);
    }
  }, [watchProductId]);

  useEffect(() => {
    if (selectedProductPrice !== null && watchQuantity > 0) {
      setTotalPrice(selectedProductPrice * watchQuantity);
    } else {
      setTotalPrice(null);
    }
  }, [selectedProductPrice, watchQuantity]);

  const handleSubmit = async (data: SaleFormValues) => {
    setIsSubmitting(true);
    try {
      onSubmit({
        productId: data.productId,
        quantity: data.quantity,
        customer: data.customer,
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (${product.price.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Customer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {totalPrice !== null && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              Price per unit:{" "}
              <span className="font-medium text-foreground">
                ${selectedProductPrice?.toFixed(2)}
              </span>
            </p>
            <p className="text-sm font-bold">
              Total: ${totalPrice.toFixed(2)}
            </p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}