"use client";

import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/lib/context/currency-context";

interface RevenueChartProps {
  sales: Sale[];
  loading: boolean;
}

export function RevenueChart({ sales, loading }: RevenueChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { currency } = useCurrency();

  if (loading) {
    return <div>Loading revenue data...</div>;
  }

  // Process sales data for the chart
  const monthlyData = sales.reduce((acc: any[], sale) => {
    const date = new Date(sale.date);
    const monthKey = date.toLocaleString('default', { month: 'short' });
    
    const existingMonth = acc.find(item => item.name === monthKey);
    if (existingMonth) {
      existingMonth.revenue += sale.total;
      existingMonth.profit += sale.total * 0.6; // Assuming 60% profit margin
    } else {
      acc.push({
        name: monthKey,
        revenue: sale.total,
        profit: sale.total * 0.6
      });
    }
    return acc;
  }, []);

  // Sort by month
  const sortedData = monthlyData.sort((a, b) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(a.name) - months.indexOf(b.name);
  });

  if (sortedData.length === 0) {
    return <div className="h-[400px] flex items-center justify-center">No revenue data available for the selected period.</div>;
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={sortedData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "hsl(var(--muted))" : "#f0f0f0"}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: isDark ? "hsl(var(--muted-foreground))" : "#888" }}
            axisLine={{ stroke: isDark ? "hsl(var(--muted))" : "#f0f0f0" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value, currency)}
            tick={{ fill: isDark ? "hsl(var(--muted-foreground))" : "#888" }}
            axisLine={{ stroke: isDark ? "hsl(var(--muted))" : "#f0f0f0" }}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(value as number, currency), ""]}
            contentStyle={{
              backgroundColor: isDark ? "hsl(var(--card))" : "#fff",
              borderColor: isDark ? "hsl(var(--border))" : "#f0f0f0",
              color: isDark ? "hsl(var(--card-foreground))" : "#000",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="hsl(var(--chart-1))"
            fill="hsl(var(--chart-1) / 0.2)"
          />
          <Area
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="hsl(var(--chart-2))"
            fill="hsl(var(--chart-2) / 0.2)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}