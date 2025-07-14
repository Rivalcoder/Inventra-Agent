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
        lowStockData.forEach(product => {
          addNotification({
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: `${product.name} is running low on stock (${product.stock} units remaining, minimum: ${product.minStock})`,
            productId: product.id
          });
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
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay isLoading={loading} />
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0, currency)}</p>
              <p className="text-sm text-muted-foreground">
                {stats?.totalSales || 0} sales this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats?.totalValue || 0, currency)}</p>
              <p className="text-sm text-muted-foreground">
                {stats?.totalStock || 0} units in stock
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalSales || 0}</p>
              <p className="text-sm text-muted-foreground">
                {stats?.totalQuantity || 0} units sold
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0, currency)}</p>
              <p className="text-sm text-muted-foreground">
                {stats?.totalSales || 0} sales this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <Alert key={product.id} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{product.name}</AlertTitle>
                    <AlertDescription>
                      Only {product.stock} units left (Minimum: {product.minStock})
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No low stock alerts</p>
            )}
          </CardContent>
        </Card>

        {/* Sales Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${month}/${year.slice(2)}`;
                    }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={(value) => formatCurrency(value, currency)}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    name="Revenue"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="quantity"
                    stroke="#82ca9d"
                    name="Quantity"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value, currency)}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, currency)}
                    labelFormatter={(label) => `Product: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    fill="#8884d8" 
                    name="Revenue"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold">{sale.productName}</h3>
                  <p className="text-sm text-gray-600">
                    {sale.quantity} x {formatCurrency(sale.price, currency)} = {formatCurrency(sale.total, currency)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(sale.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}