import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/lib/context/currency-context";

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  const { currency } = useCurrency();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {sales.map((sale) => (
            <div key={sale.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{sale.productName}</p>
                <p className="text-sm text-muted-foreground">
                  {sale.customer} • {new Date(sale.date).toLocaleDateString()}
                </p>
              </div>
              <div className="ml-auto font-medium">
                {formatCurrency(sale.total, currency)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}