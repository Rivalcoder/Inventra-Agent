"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HistoryIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QueryHistoryProps {
  history: string[];
  onSelect: (query: string) => void;
}

export function QueryHistory({ history, onSelect }: QueryHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <HistoryIcon className="mr-2 h-4 w-4" />
            Recent Queries
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Your recent queries will appear here
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <HistoryIcon className="mr-2 h-4 w-4" />
          Recent Queries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 pr-3">
            {history.map((query, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2 text-sm truncate"
                onClick={() => onSelect(query)}
              >
                {query}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}