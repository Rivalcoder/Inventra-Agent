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

const data = [
  {
    name: "Jan",
    revenue: 4000,
    profit: 2400,
  },
  {
    name: "Feb",
    revenue: 3000,
    profit: 1398,
  },
  {
    name: "Mar",
    revenue: 2000,
    profit: 800,
  },
  {
    name: "Apr",
    revenue: 2780,
    profit: 1908,
  },
  {
    name: "May",
    revenue: 1890,
    profit: 800,
  },
  {
    name: "Jun",
    revenue: 2390,
    profit: 1200,
  },
  {
    name: "Jul",
    revenue: 3490,
    profit: 2300,
  },
  {
    name: "Aug",
    revenue: 4000,
    profit: 2400,
  },
  {
    name: "Sep",
    revenue: 4500,
    profit: 2800,
  },
  {
    name: "Oct",
    revenue: 5200,
    profit: 3100,
  },
  {
    name: "Nov",
    revenue: 4800,
    profit: 2700,
  },
  {
    name: "Dec",
    revenue: 6000,
    profit: 3800,
  },
];

export function RevenueChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
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
            tickFormatter={(value) => `$${value}`}
            tick={{ fill: isDark ? "hsl(var(--muted-foreground))" : "#888" }}
            axisLine={{ stroke: isDark ? "hsl(var(--muted))" : "#f0f0f0" }}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`$${value}`, ""]}
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