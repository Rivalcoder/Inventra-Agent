"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QueryResultDisplay } from "@/components/query/query-result-display";
import { QueryExamples } from "@/components/query/query-examples";
import { QueryHistory } from "@/components/query/query-history";
import { QueryResult } from "@/lib/types";
import { SendHorizontal, Loader2 } from "lucide-react";

export default function QueryPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const processQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    
    // This is a mock implementation that would be replaced by real AI processing
    // In a real app, this would call the Vercel AI SDK endpoint
    setTimeout(() => {
      // Example results based on common queries
      let mockResult: QueryResult;
      
      const lowerQuery = query.toLowerCase();
      
      if (lowerQuery.includes("top selling products")) {
        mockResult = {
          type: "table",
          data: {
            columns: ["Product", "Units Sold", "Revenue"],
            rows: [
              ["Laptop Pro", 42, "$54,599.58"],
              ["Wireless Earbuds", 38, "$5,699.62"],
              ["Wireless Mouse", 31, "$929.69"],
              ["USB-C Dock", 25, "$2,249.75"],
              ["Mechanical Keyboard", 18, "$2,339.82"]
            ]
          },
          explanation: "Here are the top selling products based on units sold. Laptop Pro is your best-selling product with 42 units sold, generating $54,599.58 in revenue."
        };
      } else if (lowerQuery.includes("sales last month") || lowerQuery.includes("monthly sales")) {
        mockResult = {
          type: "chart",
          data: {
            type: "bar",
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [
              {
                label: "Sales",
                data: [12450, 14280, 15320, 18640]
              }
            ]
          },
          explanation: "Sales have shown consistent growth throughout last month, with Week 4 having the highest performance at $18,640."
        };
      } else if (lowerQuery.includes("low stock")) {
        mockResult = {
          type: "table",
          data: {
            columns: ["Product", "Current Stock", "Min Stock", "Status"],
            rows: [
              ["Mechanical Keyboard", 4, 5, "Low"],
              ["Ultrawide Monitor", 7, 3, "OK"],
              ["Laptop Pro", 15, 5, "OK"]
            ]
          },
          explanation: "Your Mechanical Keyboard is below the minimum stock level. Consider restocking soon to avoid stockouts."
        };
      } else {
        mockResult = {
          type: "text",
          data: "I'm sorry, I couldn't understand your query. Try asking about sales performance, inventory status, or revenue trends.",
          explanation: "Try queries like 'Show me top selling products' or 'What items are low in stock?'"
        };
      }
      
      setResult(mockResult);
      setHistory(prev => [query, ...prev.slice(0, 4)]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQuery();
  };

  const selectFromHistory = (historicalQuery: string) => {
    setQuery(historicalQuery);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Query Console</h1>
        <p className="text-muted-foreground">
          Ask questions about your inventory and sales in natural language
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Ask a question about your inventory or sales..."
                className="min-h-[120px] resize-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="mr-2 h-4 w-4" />
                      Ask Question
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              {result ? (
                <QueryResultDisplay result={result} />
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">
                    Your query results will appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <QueryHistory history={history} onSelect={selectFromHistory} />
          <QueryExamples onSelect={setQuery} />
        </div>
      </div>
    </div>
  );
}