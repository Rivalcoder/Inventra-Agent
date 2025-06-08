import { InventoryList } from "@/components/inventory/inventory-list";
import { getProducts } from "@/lib/data";

export default async function InventoryPage() {
  const products = await getProducts();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
      <InventoryList initialProducts={products} />
    </div>
  );
}