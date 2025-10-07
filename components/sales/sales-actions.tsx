"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddSaleDialog } from "@/components/sales/add-sale-dialog";
import { Plus, FileText } from "lucide-react";
import { Sale } from "@/lib/types";
import ImportSales from "@/components/sales/import-sales";

export function SalesActions() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleExport = () => {
    // In a real application, this would generate a sales report
    console.log("Generating sales report...");
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Sale
        </Button>
        <ImportSales />
        <Button variant="outline" onClick={handleExport}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <AddSaleDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={(sale: Sale) => {
          console.log("Added sale:", sale);
          setShowAddDialog(false);
        }}
      />
    </>
  );
}