"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Sale, Product } from "@/lib/types";
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
import { getProducts } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { toast } from "react-hot-toast";

const saleSchema = z.object({
  productId: z.string({
    required_error: "Please select a product",
  }),
  quantity: z.coerce
    .number()
    .int()
    .positive({ message: "Quantity must be a positive number" })
    .refine((val) => val > 0, {
      message: "Quantity must be greater than 0",
    }),
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
  const [selectedProductStock, setSelectedProductStock] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
        setSelectedProductStock(product.stock);
      }
    } else {
      setSelectedProductPrice(null);
      setSelectedProductStock(null);
    }
  }, [watchProductId, products]);

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
      const selectedProduct = products.find((p) => p.id === data.productId);
      if (!selectedProduct) {
        form.setError("productId", {
          type: "manual",
          message: "Please select a valid product",
        });
        return;
      }

      if (data.quantity > selectedProduct.stock) {
        form.setError("quantity", {
          type: "manual",
          message: `Quantity cannot exceed available stock (${selectedProduct.stock} units)`,
        });
        return;
      }
      
      await onSubmit({
        productId: data.productId,
        quantity: data.quantity,
        customer: data.customer,
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

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
                      {product.name} ({formatCurrency(product.price)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "" : parseInt(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              {selectedProductStock !== null && (
                <div className="mt-1 text-sm text-muted-foreground">
                  Available Stock: {selectedProductStock} units
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {totalPrice !== null && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              Price per unit:{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(selectedProductPrice || 0)}
              </span>
            </p>
            <p className="text-sm font-bold">
              Total: {formatCurrency(totalPrice)}
            </p>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Recording..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}