"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/sales/date-range-picker";
import { FileText, Download, PieChart, TrendingUp, ShoppingCart } from "lucide-react";
import { SalesReportTable } from "@/components/reports/sales-report-table";
import { InventoryReportTable } from "@/components/reports/inventory-report-table";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  
  const [reportFormat, setReportFormat] = useState<string>("pdf");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = (type: string) => {
    if (!dateRange.from || !dateRange.to) {
      toast.error("Please select a date range first");
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      toast.success(`${type} report generated successfully`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
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
              <DateRangePicker 
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
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
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="sales">
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Sales Report</CardTitle>
              <Button 
                onClick={() => handleGenerateReport("Sales")}
                disabled={isGenerating || !dateRange.from || !dateRange.to}
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
            </CardHeader>
            <CardContent>
              <SalesReportTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Inventory Report</CardTitle>
              <Button 
                onClick={() => handleGenerateReport("Inventory")}
                disabled={isGenerating || !dateRange.from || !dateRange.to}
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Download Report
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <InventoryReportTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Revenue Analysis</CardTitle>
              <Button 
                onClick={() => handleGenerateReport("Revenue")}
                disabled={isGenerating || !dateRange.from || !dateRange.to}
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Download Report
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}