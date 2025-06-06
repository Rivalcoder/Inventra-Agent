"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QueryExamplesProps {
  onSelect: (query: string) => void;
}

export function QueryExamples({ onSelect }: QueryExamplesProps) {
  const examples = [
    "What are my top selling products?",
    "Show me sales from last month",
    "Which items are low in stock?",
    "What was my revenue by category?",
    "Show sales trends for the last quarter",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Example Queries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {examples.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-2"
              onClick={() => onSelect(example)}
            >
              {example}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}