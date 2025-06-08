"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Sale } from "@/lib/types";

interface SalesReportTableProps {
  sales: Sale[];
  loading: boolean;
}

export function SalesReportTable({ sales, loading }: SalesReportTableProps) {
  if (loading) {
    return <div>Loading sales data...</div>;
  }

  // Calculate totals
  const totalQuantity = sales.reduce((sum, sale) => sum + (Number(sale.quantity) || 0), 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{formatDate(sale.date)}</TableCell>
                <TableCell className="font-medium">{sale.productName}</TableCell>
                <TableCell>{sale.customer || "Anonymous"}</TableCell>
                <TableCell className="text-center">{sale.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(sale.price)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(sale.total)}
                </TableCell>
              </TableRow>
            ))}
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No sales found for the selected date range.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border p-4">
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            Total Sales: {sales.length}
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground mr-4">
            Total Quantity: {totalQuantity}
          </span>
          <span className="text-sm font-bold">
            Total Revenue: {formatCurrency(totalRevenue)}
          </span>
        </div>
      </div>
    </div>
  );
}