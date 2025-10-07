import { Brain, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AIQueriesGuide() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-primary shrink-0" />
          <h1 className="text-3xl font-bold">Using AI Queries</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Ask natural language questions to get business insights instantly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Examples</CardTitle>
          <CardDescription>Try these queries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>"What were my top 5 products last month?"</div>
          <div>"Show revenue trend for the last 6 months"</div>
          <div>"Which items need restocking this week?"</div>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/query">Open AI Console <ArrowRight className="ml-2 h-4 w-4 shrink-0" /></Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


