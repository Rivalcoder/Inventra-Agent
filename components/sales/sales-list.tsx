"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileDown, Eye, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DeleteSaleDialog } from "@/components/sales/delete-sale-dialog";
import { ViewSaleDialog } from "@/components/sales/view-sale-dialog";
import { DateRangePicker } from "@/components/sales/date-range-picker";

interface SalesListProps {
  initialSales: Sale[];
}

export function SalesList({ initialSales }: SalesListProps) {
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);

  // Apply filters
  const filteredSales = sales.filter((sale) => {
    // Search filter
    const matchesSearch =
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customer && sale.customer.toLowerCase().includes(searchTerm.toLowerCase()));

    // Date range filter
    let matchesDateRange = true;
    if (dateRange.from || dateRange.to) {
      const saleDate = new Date(sale.date);
      
      if (dateRange.from && dateRange.to) {
        matchesDateRange = saleDate >= dateRange.from && saleDate <= dateRange.to;
      } else if (dateRange.from) {
        matchesDateRange = saleDate >= dateRange.from;
      } else if (dateRange.to) {
        matchesDateRange = saleDate <= dateRange.to;
      }
    }

    return matchesSearch && matchesDateRange;
  });

  const handleDeleteSale = (saleId: string) => {
    setSales(sales.filter((sale) => sale.id !== saleId));
    setDeletingSale(null);
  };

  const exportToCSV = () => {
    // In a real application, this would export the sales data to CSV
    console.log("Exporting sales to CSV...");
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sales..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={exportToCSV}
                title="Export to CSV"
              >
                <FileDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.date)}</TableCell>
                    <TableCell className="font-medium">
                      {sale.productName}
                    </TableCell>
                    <TableCell className="text-center">
                      {sale.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(sale.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(sale.total)}
                    </TableCell>
                    <TableCell>{sale.customer || "Anonymous"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingSale(sale)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingSale(sale)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSales.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center"
                    >
                      No sales found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {viewingSale && (
        <ViewSaleDialog
          open={!!viewingSale}
          onOpenChange={() => setViewingSale(null)}
          sale={viewingSale}
        />
      )}

      {deletingSale && (
        <DeleteSaleDialog
          open={!!deletingSale}
          onOpenChange={() => setDeletingSale(null)}
          sale={deletingSale}
          onDelete={handleDeleteSale}
        />
      )}
    </>
  );
}