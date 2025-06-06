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

export default function Dashboard() {
  const stats = getDashboardStats();
  const salesByPeriod = getSalesByPeriod();
  const topProducts = getTopProducts();
  const recentSales = getRecentSales();
  const lowStockProducts = getLowStockProducts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business performance and key metrics
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          description="Total revenue from all sales"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 12.5, positive: true }}
        />
        <StatsCard
          title="Total Sales"
          value={formatNumber(stats.totalSales)}
          description="Number of completed sales"
          icon={<ShoppingCart className="h-4 w-4" />}
          trend={{ value: 8.2, positive: true }}
        />
        <StatsCard
          title="Products"
          value={formatNumber(stats.totalProducts)}
          description="Total products in inventory"
          icon={<Package className="h-4 w-4" />}
          trend={{ value: 2.1, positive: true }}
        />
        <StatsCard
          title="Low Stock Items"
          value={formatNumber(stats.lowStockItems)}
          description="Products below minimum stock level"
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={{ value: 5.4, positive: false }}
          className={stats.lowStockItems > 0 ? "border-amber-500" : ""}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <SalesChart data={salesByPeriod} />
        <div className="space-y-4 col-span-1 xl:col-span-1">
          <RecentSales sales={recentSales} />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <TopProductsTable products={topProducts} />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <Alert key={product.id} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="ml-2">Low Stock Warning</AlertTitle>
                  <AlertDescription className="ml-2">
                    {product.name} has only {product.stock} units left (minimum: {product.minStock})
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                All products have adequate stock levels.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}