"use client";

import { useState, useEffect } from "react";
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
import { formatCurrency, formatDate, convertToCSV, downloadCSV } from "@/lib/utils";
import { DeleteSaleDialog } from "@/components/sales/delete-sale-dialog";
import { ViewSaleDialog } from "@/components/sales/view-sale-dialog";
import { DateRangePicker } from "@/components/sales/date-range-picker";
import { getSales } from "@/lib/data";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useCurrency } from "@/lib/context/currency-context";

interface SalesListProps {
  initialSales?: Sale[];
}

export function SalesList({ initialSales }: SalesListProps) {
  const [sales, setSales] = useState<Sale[]>(initialSales || []);
  const [loading, setLoading] = useState(!initialSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: undefined, to: undefined });
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);
  const { currency } = useCurrency();

  // Update local state when initialSales changes
  useEffect(() => {
    if (initialSales) {
      setSales(initialSales);
    }
  }, [initialSales]);

  // Function to refresh sales data
  const refreshSales = async () => {
    try {
      const salesData = await getSales();
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  useEffect(() => {
    if (!initialSales) {
      refreshSales();
    }
  }, [initialSales]);

  // Refresh sales when the component mounts and when initialSales changes
  useEffect(() => {
    refreshSales();
  }, []);

  // Apply filters
  const filteredSales = sales
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((sale) => {
      // Search filter
      const matchesSearch =
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customer && sale.customer.toLowerCase().includes(searchTerm.toLowerCase()));

      // Date range filter
      let matchesDateRange = true;
      if (dateRange && (dateRange.from || dateRange.to)) {
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

  // Calculate totals for filtered sales
  const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  const handleDeleteSale = async (saleId: string) => {
    try {
      setSales(prevSales => prevSales.filter(sale => sale.id !== saleId));
      setDeletingSale(null);
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  const exportToCSV = () => {
    const headers = [
      { key: 'date', label: 'Date' },
      { key: 'productName', label: 'Product' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'price', label: 'Price' },
      { key: 'total', label: 'Total' },
      { key: 'customer', label: 'Customer' }
    ];

    const csvData = filteredSales.map(sale => ({
      date: formatDate(sale.date),
      productName: sale.productName,
      quantity: sale.quantity,
      price: formatCurrency(sale.price, currency),
      total: formatCurrency(sale.total, currency),
      customer: sale.customer || 'Anonymous'
    }));

    const csv = convertToCSV(csvData, headers);
    const filename = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  if (loading) {
    return <div>Loading sales data...</div>;
  }

  return (
    <div className="space-y-4">
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="icon"
                onClick={exportToCSV}
                title="Export to CSV"
              >
                <Download className="h-4 w-4" />
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
                      {formatCurrency(sale.price, currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(sale.total, currency)}
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

      {/* Summary Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border p-4">
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            Total Sales: {filteredSales.length}
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground mr-4">
            Total Quantity: {totalQuantity}
          </span>
          <span className="text-sm font-bold">
            Total Revenue: {formatCurrency(totalRevenue, currency)}
          </span>
        </div>
      </div>

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
    </div>
  );
}