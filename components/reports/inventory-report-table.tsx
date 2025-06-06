"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { products } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export function InventoryReportTable() {
  // Calculate inventory value for each product
  const productsWithValue = products.map((product) => ({
    ...product,
    value: product.stock * product.price,
  }));

  // Sort by stock (ascending)
  const sortedProducts = [...productsWithValue].sort(
    (a, b) => a.stock - b.stock
  );

  // Calculate totals
  const totalStock = sortedProducts.reduce((sum, product) => sum + product.stock, 0);
  const totalValue = sortedProducts.reduce((sum, product) => sum + product.value, 0);

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-center">Current Stock</TableHead>
              <TableHead className="text-center">Min Stock</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.supplier}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock === 0
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : product.stock <= product.minStock
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    }`}
                  >
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="text-center">{product.minStock}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(product.value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border p-4">
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            Total Products: {sortedProducts.length}
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground mr-4">
            Total Stock: {totalStock} units
          </span>
          <span className="text-sm font-bold">
            Total Inventory Value: {formatCurrency(totalValue)}
          </span>
        </div>
      </div>
    </div>
  );
}