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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

interface QueryResultDisplayProps {
  result: QueryResult;
}

export function QueryResultDisplay({ result }: QueryResultDisplayProps) {
  const renderContent = () => {
    switch (result.type) {
      case "table":
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {result.data.columns.map((column: string, index: number) => (
                    <TableHead key={index} className="font-semibold">{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.rows.map((row: any[], rowIndex: number) => (
                  <TableRow key={rowIndex} className={cn(
                    rowIndex % 2 === 0 ? "bg-muted/50" : "bg-background",
                    "hover:bg-muted/80 transition-colors"
                  )}>
                    {row.map((cell: any, cellIndex: number) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case "chart":
        return (
          <div className="h-[300px] w-full bg-muted/30 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.data.datasets[0].data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case "text":
      default:
        return (
          <div className="space-y-4">
            {result.data.Topic.Heading && (
              <div className="border-b pb-2">
                <h2 className="text-xl text-foreground">
                  {result.data.Topic.Heading}
                </h2>
              </div>
            )}
            {renderDescription(result.data.Topic.Description)}
            {result.data.Topic.SqlQuery && result.data.Topic.SqlQuery.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <h3 className="text-base font-normal mb-2 flex items-center gap-2">
                  <span className="text-primary">💻</span>
                  SQL Queries
                </h3>
                <div className="space-y-2">
                  {result.data.Topic.SqlQuery.map((query: string, index: number) => (
                    <pre key={index} className="bg-muted p-3 rounded-lg overflow-auto text-xs border border-border">
                      <code className="language-sql">{query}</code>
                    </pre>
                  ))}
                </div>
              </div>
            )}
            {result.explanation && (
              <div className="mt-4 border-t pt-3">
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result.explanation}
                  </ReactMarkdown>
                </div>
              </div>
            )}
            {result.rawData && (
              <div className="mt-4 border-t pt-3">
                <h3 className="text-base font-normal mb-2 flex items-center gap-2">
                  <span className="text-primary">📊</span>
                  Data Used
                </h3>
                <pre className="bg-muted p-3 rounded-lg overflow-auto text-xs border border-border">
                  {JSON.stringify(result.rawData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
    }
  };

  const renderDescription = (description: string) => {
    if (!description) return null;

    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2" {...props} />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap" {...props} />
            ),
            tr: ({ node, ...props }) => (
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-sm text-gray-600 dark:text-gray-300" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-2 text-sm text-gray-600 dark:text-gray-300 italic" {...props} />
            ),
            code: ({ node, inline, ...props }: any) => (
              inline ? 
                <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono" {...props} /> :
                <code className="block p-3 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono overflow-x-auto" {...props} />
            ),
            pre: ({ node, ...props }) => (
              <pre className="p-3 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono overflow-x-auto" {...props} />
            ),
          }}
        >
          {description}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}