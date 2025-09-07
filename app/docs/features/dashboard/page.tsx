import { LayoutDashboard, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardFeaturePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6 text-primary shrink-0" />
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Real-time overview of key metrics, alerts, and quick actions to manage your business.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Widgets</CardTitle>
          <CardDescription>Customize what matters most</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Revenue and sales trends",
              "Low-stock alerts",
              "Top products",
              "Quick add actions",
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


