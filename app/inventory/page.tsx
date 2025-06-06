import { Suspense } from "react";
import { InventoryList } from "@/components/inventory/inventory-list";
import { InventoryActions } from "@/components/inventory/inventory-actions";
import { products } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your products and stock levels
          </p>
        </div>
        <InventoryActions />
      </div>

      <Suspense fallback={<InventoryListSkeleton />}>
        <InventoryList initialProducts={products} />
      </Suspense>
    </div>
  );
}

function InventoryListSkeleton() {
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