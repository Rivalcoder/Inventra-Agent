"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddProductDialog } from "@/components/inventory/add-product-dialog";
import { Plus, File as FileExport, Import as FileImport } from "lucide-react";
import { Product } from "@/lib/types";

export function InventoryActions() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const handleExport = () => {
    // In a real application, this would export the inventory data
    console.log("Exporting inventory...");
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real application, this would process the imported file
      console.log("Importing file:", file.name);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <FileExport className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" onClick={handleImport}>
          <FileImport className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv,.xlsx"
          onChange={handleFileUpload}
        />
      </div>

      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={(product: Product) => {
          console.log("Added product:", product);
          setShowAddDialog(false);
        }}
      />
    </>
  );
}