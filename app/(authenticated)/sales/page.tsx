'use client';

import { SalesList } from "@/components/sales/sales-list";
import { getSales } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddSaleDialog } from "@/components/sales/add-sale-dialog";
import { useState, useEffect, useCallback } from "react";
import { Sale } from "@/lib/types";
import { toast } from "sonner";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const refreshSales = useCallback(async () => {
    try {
      setLoading(true);
      const salesData = await getSales();
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSales();
  }, [refreshSales]);

  const handleAddSale = async (newSale: Sale) => {
    try {
      // Add the new sale to the current state
      setSales(prevSales => [newSale, ...prevSales]);
      toast.success('Sale recorded successfully');
      setShowAddDialog(false);
      
      // Then refresh the entire list to ensure consistency
      await refreshSales();
    } catch (error) {
      console.error('Error recording sale:', error);
      toast.error('Failed to record sale');
    }
  };

  if (loading) {
    return <div>Loading sales data...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">
            View and manage your sales records
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Sale
        </Button>
      </div>

      <SalesList initialSales={sales} />

      <AddSaleDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddSale}
      />
    </div>
  );
}