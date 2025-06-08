"use client";

import { Card, CardContent } from "@/components/ui/card";
import { QueryResult } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface QueryResultDisplayProps {
  result: QueryResult;
}

export function QueryResultDisplay({ result }: QueryResultDisplayProps) {
  const renderContent = () => {
    switch (result.type) {
      case "table":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                {result.data.columns.map((column: string, index: number) => (
                  <TableHead key={index}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.rows.map((row: any[], rowIndex: number) => (
                <TableRow key={rowIndex}>
                  {row.map((cell: any, cellIndex: number) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "chart":
        return (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.data.datasets[0].data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case "text":
      default:
        return (
          <div className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              {result.data}
            </div>
            {result.explanation && (
              <div className="text-sm text-muted-foreground">
                {result.explanation}
              </div>
            )}
            {result.rawData && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Data Used:</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(result.rawData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}