"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QueryExamplesProps {
  onSelect: (query: string) => void;
}

const EXAMPLE_QUERIES = [
  "What are our top selling products?",
  "Show me products with low stock",
  "What's our total revenue this month?",
  "Which products have the highest profit margin?",
  "Show me sales trends for the last 3 months",
  "What's our inventory value by category?",
  "Which suppliers do we order from most frequently?",
  "What's our average order value?",
  "Show me products that haven't sold in 30 days",
  "What's our best performing product category?"
];

export function QueryExamples({ onSelect }: QueryExamplesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Queries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {EXAMPLE_QUERIES.map((query, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start text-left font-normal"
            onClick={() => onSelect(query)}
          >
            {query}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}