import { TrendingUp, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ManagingSalesGuide() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary shrink-0" />
          <h1 className="text-3xl font-bold">Managing Sales</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Learn how to record, search, and analyze sales effectively.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Steps</CardTitle>
            <CardDescription>Quick workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal ml-5 space-y-2 text-sm">
              <li>Open Sales and click Add Sale</li>
              <li>Add products, quantities, and customer</li>
              <li>Apply taxes/discounts, then save</li>
              <li>Review in Sales History</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related</CardTitle>
            <CardDescription>Go further</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/features/sales">
                Sales Feature Overview
                <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
              </Link>
            </Button>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" /> Best with updated inventory
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


