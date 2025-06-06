"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryResult } from "@/lib/types";
import { useTheme } from "next-themes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface QueryResultDisplayProps {
  result: QueryResult;
}

export function QueryResultDisplay({ result }: QueryResultDisplayProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Query Results</CardTitle>
        {result.explanation && (
          <CardDescription>{result.explanation}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {result.type === "table" && (
          <Table>
            <TableHeader>
              <TableRow>
                {result.data.columns.map((column: string, i: number) => (
                  <TableHead key={i}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.rows.map((row: any[], i: number) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>
                      {typeof cell === "string" && cell.startsWith("$")
                        ? cell
                        : cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {result.type === "chart" && (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.data.labels.map((label, i) => ({
                name: label,
                value: result.data.datasets[0].data[i]
              }))}>
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
                  tick={{ fill: isDark ? "hsl(var(--muted-foreground))" : "#888" }}
                  axisLine={{ stroke: isDark ? "hsl(var(--muted))" : "#f0f0f0" }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`$${value}`, result.data.datasets[0].label]}
                  contentStyle={{
                    backgroundColor: isDark ? "hsl(var(--card))" : "#fff",
                    borderColor: isDark ? "hsl(var(--border))" : "#f0f0f0",
                    color: isDark ? "hsl(var(--card-foreground))" : "#000",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="value"
                  name={result.data.datasets[0].label}
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {result.type === "text" && (
          <p className="text-foreground">{result.data}</p>
        )}
      </CardContent>
    </Card>
  );
}