import { TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SalesFeaturePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary shrink-0" />
          <h1 className="text-3xl font-bold">Sales Management</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Record transactions, track customers, and analyze revenue trends with real-time insights.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Core Capabilities</CardTitle>
            <CardDescription>Everything you need for day-to-day sales</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Record and search sales",
                "Customer tracking and history",
                "Revenue and profit calculation",
                "Discounts, taxes, and notes",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Learn how to use the feature effectively</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/guides/managing-sales">
                Read Managing Sales Guide
                <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs/reports">
                Explore Sales Reports
                <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


