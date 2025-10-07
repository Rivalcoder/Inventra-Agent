import { BarChart3, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsFeaturePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary shrink-0" />
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Generate interactive reports for sales, inventory, and performance, ready to export.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Types</CardTitle>
          <CardDescription>Insights at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {[
              "Sales performance and trends",
              "Inventory status and low-stock",
              "Revenue analytics",
              "Export to CSV/PDF",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


