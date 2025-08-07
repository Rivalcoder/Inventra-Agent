"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/sales/date-range-picker";
import { DateRange } from "react-day-picker";
import { FileText, Download, PieChart, TrendingUp, ShoppingCart, X } from "lucide-react";
import { SalesReportTable } from "@/components/reports/sales-report-table";
import { InventoryReportTable } from "@/components/reports/inventory-report-table";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { downloadPDF, convertToCSV, downloadCSV, formatCurrency, formatDate } from "@/lib/utils";
import { getSales, getProducts } from "@/lib/data";
import { Sale, Product } from "@/lib/types";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const [reportFormat, setReportFormat] = useState<string>("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("sales");
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const salesReportRef = useRef<HTMLDivElement>(null);
  const inventoryReportRef = useRef<HTMLDivElement>(null);
  const revenueReportRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesData, productsData] = await Promise.all([
          getSales(),
          getProducts()
        ]);
        setSales(salesData);
        setFilteredSales(salesData);
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply date filters when date range changes
  useEffect(() => {
    if (dateRange && dateRange.from && dateRange.to) {
      const filteredSalesData = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dateRange.from! && saleDate <= dateRange.to!;
      });
      setFilteredSales(filteredSalesData);
    } else {
      setFilteredSales(sales);
    }
  }, [dateRange, sales]);

  const handleClearFilters = () => {
    setDateRange(undefined);
    setFilteredSales(sales);
    setFilteredProducts(products);
  };

  const handleGenerateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select a date range first");
      return;
    }

    setIsGenerating(true);
    
    try {
      let content: HTMLElement | null = null;
      let filename = "";

      switch (activeTab) {
        case "sales": {
          content = salesReportRef.current;
          filename = `sales-report-${new Date().toISOString().split('T')[0]}`;
          
          if (reportFormat === "csv") {
            const headers = [
              { key: 'date', label: 'Date' },
              { key: 'productName', label: 'Product' },
              { key: 'customer', label: 'Customer' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'price', label: 'Unit Price' },
              { key: 'total', label: 'Total' }
            ];

            const csvData = filteredSales.map(sale => ({
              date: formatDate(sale.date),
              productName: sale.productName,
              customer: sale.customer || 'Anonymous',
              quantity: sale.quantity,
              price: formatCurrency(sale.price),
              total: formatCurrency(sale.total)
            }));

            const csv = convertToCSV(csvData, headers);
            downloadCSV(csv, `${filename}.csv`);
            break;
          }
          break;
        }
        case "inventory": {
          content = inventoryReportRef.current;
          filename = `inventory-report-${new Date().toISOString().split('T')[0]}`;
          
          if (reportFormat === "csv") {
            const headers = [
              { key: 'name', label: 'Product' },
              { key: 'category', label: 'Category' },
              { key: 'stock', label: 'Stock' },
              { key: 'price', label: 'Unit Price' },
              { key: 'value', label: 'Total Value' }
            ];

            const csvData = filteredProducts.map(product => ({
              name: product.name,
              category: product.category,
              stock: product.stock,
              price: formatCurrency(product.price),
              value: formatCurrency(product.stock * product.price)
            }));

            const csv = convertToCSV(csvData, headers);
            downloadCSV(csv, `${filename}.csv`);
            break;
          }
          break;
        }
        case "revenue": {
          content = revenueReportRef.current;
          filename = `revenue-report-${new Date().toISOString().split('T')[0]}`;
          
          if (reportFormat === "csv") {
            const headers = [
              { key: 'date', label: 'Date' },
              { key: 'revenue', label: 'Revenue' },
              { key: 'quantity', label: 'Quantity' }
            ];

            const csvData = filteredSales.map(sale => ({
              date: formatDate(sale.date),
              revenue: formatCurrency(sale.total),
              quantity: sale.quantity
            }));

            const csv = convertToCSV(csvData, headers);
            downloadCSV(csv, `${filename}.csv`);
            break;
          }
          break;
        }
      }

      if (content && reportFormat === "pdf") {
        downloadPDF(content, `${filename}.pdf`);
      }
      
      toast.success("Report generated successfully");
    } catch (error) {
      toast.error("Failed to generate report");
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download detailed business reports
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Report Parameters</CardTitle>
              <CardDescription>Select parameters for your report</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2">
                <DateRangePicker 
                  dateRange={dateRange || { from: undefined, to: undefined }}
                  onDateRangeChange={setDateRange}
                />
                {(dateRange && (dateRange.from || dateRange.to)) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearFilters}
                    title="Clear filters"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Select 
                value={reportFormat}
                onValueChange={setReportFormat}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleGenerateReport}
                disabled={isGenerating || !dateRange?.from || !dateRange?.to}
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="sales" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales" className="flex items-center gap-1">
            <ShoppingCart className="h-4 w-4" />
            <span>Sales Report</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-1">
            <PieChart className="h-4 w-4" />
            <span>Inventory Report</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Revenue Analysis</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sales Report</CardTitle>
            </CardHeader>
            <CardContent ref={salesReportRef}>
              <SalesReportTable sales={filteredSales} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventory Report</CardTitle>
            </CardHeader>
            <CardContent ref={inventoryReportRef}>
              <InventoryReportTable products={filteredProducts} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Analysis</CardTitle>
            </CardHeader>
            <CardContent ref={revenueReportRef}>
              <RevenueChart sales={filteredSales} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}