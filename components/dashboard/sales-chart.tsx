"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesByPeriod } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SalesChartProps {
  data: SalesByPeriod[];
}

export function SalesChart({ data }: SalesChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Weekly Sales Overview</CardTitle>
        <CardDescription>
          Compare sales performance for the current week
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "hsl(var(--muted))" : "#f0f0f0"}
                vertical={false}
              />
              <XAxis
                dataKey="period"
                tick={{ fill: isDark ? "hsl(var(--muted-foreground))" : "#888" }}
                axisLine={{ stroke: isDark ? "hsl(var(--muted))" : "#f0f0f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: isDark ? "hsl(var(--muted-foreground))" : "#888" }}
                axisLine={{ stroke: isDark ? "hsl(var(--muted))" : "#f0f0f0" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "hsl(var(--card))" : "#fff",
                  borderColor: isDark ? "hsl(var(--border))" : "#f0f0f0",
                  color: isDark ? "hsl(var(--card-foreground))" : "#000",
                }}
              />
              <Legend />
              <Bar
                dataKey="sales"
                name="Sales ($)"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}