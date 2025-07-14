"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/lib/types";
import { useCurrency } from "@/lib/context/currency-context";

interface InventoryReportTableProps {
  products: Product[];
  loading: boolean;
}

export function InventoryReportTable({ products, loading }: InventoryReportTableProps) {
  const { currency } = useCurrency();

  if (loading) {
    return <div>Loading inventory data...</div>;
  }

  // Calculate inventory value for each product
  const productsWithValue = products.map((product) => ({
    ...product,
    value: product.stock * product.price,
  }));

  // Calculate totals
  const totalStock = productsWithValue.reduce((sum, product) => sum + product.stock, 0);
  const totalValue = productsWithValue.reduce((sum, product) => sum + product.value, 0);

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsWithValue.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.price, currency)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(product.value, currency)}
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border p-4">
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            Total Products: {products.length}
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground mr-4">
            Total Stock: {totalStock} units
          </span>
          <span className="text-sm font-bold">
            Total Inventory Value: {formatCurrency(totalValue, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}