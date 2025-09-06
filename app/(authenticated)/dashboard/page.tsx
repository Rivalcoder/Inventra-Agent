'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { TopProductsTable } from "@/components/dashboard/top-products-table";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { 
  getDashboardStats, 
  getSalesByPeriod, 
  getTopProducts, 
  getRecentSales,
  getLowStockProducts
} from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/lib/context/notification-context";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useCurrency } from "@/lib/context/currency-context";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();
  const { currency } = useCurrency();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Revenue' ? formatCurrency(entry.value, currency) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, salesData, topProductsData, recentSalesData, lowStockData] = await Promise.all([
          getDashboardStats(),
          getSalesByPeriod(),
          getTopProducts(),
          getRecentSales(),
          getLowStockProducts()
        ]);
        setStats(statsData);
        setSalesData(salesData);
        setTopProducts(topProductsData);
        setRecentSales(recentSalesData);
        setLowStockProducts(lowStockData);

        // Add notifications for low stock products
        // Prevent duplicate low stock notifications for the same product and stock level
        let lowStockState: Record<string, { stock: number }> = {};
        try {
          const savedLowStockState = localStorage.getItem('lowStockState');
          if (savedLowStockState) lowStockState = JSON.parse(savedLowStockState);
        } catch {}
        lowStockData.forEach(product => {
          const prev = lowStockState[product.id];
          if (!prev || prev.stock !== product.stock) {
            addNotification({
              type: 'low_stock',
              title: 'Low Stock Alert',
              message: `${product.name} is running low on stock (${product.stock} units remaining, minimum: ${product.minStock})`,
              productId: product.id
            });
          }
        });

        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [addNotification]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md shadow-lg rounded-xl">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay isLoading={loading} />
      <div className="px-2 py-6 md:px-8 md:py-10 max-w-7xl mx-auto w-full space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Dashboard</h1>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-md rounded-2xl transition-transform hover:scale-[1.02]">
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary truncate">{formatCurrency(stats?.totalRevenue || 0, currency)}</p>
              <p className="text-sm text-muted-foreground">
                {stats?.totalSales || 0} sales this month
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-md rounded-2xl transition-transform hover:scale-[1.02]">
            <CardHeader>
              <CardTitle>Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary truncate">{formatCurrency(stats?.totalValue || 0, currency)}</p>
              <p className="text-sm text-muted-foreground">
                {stats?.totalStock || 0} units in stock
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-md rounded-2xl transition-transform hover:scale-[1.02]">
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary truncate">{stats?.totalSales || 0}</p>
              <p className="text-sm text-muted-foreground">
                {stats?.totalQuantity || 0} units sold
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-md rounded-2xl transition-transform hover:scale-[1.02]">
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary truncate">{formatCurrency(stats?.totalRevenue || 0, currency)}</p>
              <p className="text-sm text-muted-foreground">
                {stats?.totalSales || 0} sales this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        <Card className="shadow rounded-xl">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 bg-muted/60 border border-destructive/30 rounded-md px-3 py-2"
                  >
                    <AlertTriangle className="h-4 w-4 text-destructive mr-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-destructive">{product.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">({product.stock} left, min {product.minStock})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No low stock alerts</p>
            )}
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart */}
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year.slice(2)}`;
                      }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={(value) => formatCurrency(value, currency)}
                      tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tickFormatter={(value) => value.toLocaleString()}
                      tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--chart-1))"
                      name="Revenue"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="quantity"
                      stroke="hsl(var(--chart-2))"
                      name="Quantity"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Products Chart */}
          <Card className="shadow rounded-2xl">
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value, currency)}
                      tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value, currency)}
                      labelFormatter={(label) => `Product: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      fill="hsl(var(--chart-1))" 
                      name="Revenue"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card className="shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.length === 0 && (
                <p className="text-muted-foreground">No recent sales</p>
              )}
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-transparent dark:bg-transparent rounded-lg border border-border transition-all duration-200 hover:shadow-md hover:bg-muted/50 dark:hover:bg-muted/20">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base md:text-lg text-foreground">{sale.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {sale.customer} • {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 md:ml-4 text-right">
                    <span className="font-bold text-foreground text-lg">{formatCurrency(sale.total, currency)}</span>
                    <div className="text-xs text-muted-foreground">{sale.quantity} x {formatCurrency(sale.price, currency)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 