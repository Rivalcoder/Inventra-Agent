"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sales } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export function SalesReportTable() {
  // Sort sales by date (newest first)
  const sortedSales = [...sales].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate totals
  const totalQuantity = sortedSales.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalRevenue = sortedSales.reduce((sum, sale) => sum + sale.total, 0);

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
            {sortedSales.map((sale) => (
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
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border p-4">
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            Total Sales: {sortedSales.length}
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