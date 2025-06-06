import { Suspense } from "react";
import { SalesList } from "@/components/sales/sales-list";
import { SalesActions } from "@/components/sales/sales-actions";
import { sales } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">
            Manage your sales and track revenue
          </p>
        </div>
        <SalesActions />
      </div>

      <Suspense fallback={<SalesListSkeleton />}>
        <SalesList initialSales={sales} />
      </Suspense>
    </div>
  );
}

function SalesListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
      <div className="rounded-md border">
        <Skeleton className="h-[500px] w-full" />
      </div>
    </div>
  );
}