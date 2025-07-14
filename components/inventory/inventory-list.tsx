"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Search, Plus, AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { EditProductDialog } from "@/components/inventory/edit-product-dialog";
import { DeleteProductDialog } from "@/components/inventory/delete-product-dialog";
import { AddProductDialog } from "@/components/inventory/add-product-dialog";
import { createProduct, postToApi } from "@/lib/data";
import { useCurrency } from "@/lib/context/currency-context";

interface InventoryListProps {
  initialProducts: Product[];
}

export function InventoryList({ initialProducts }: InventoryListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const { currency } = useCurrency();

  // Get unique categories for filter
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  // Apply filters
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    // Stock filter
    let matchesStock = true;
    if (stockFilter === "low") {
      matchesStock = product.stock <= product.minStock;
    } else if (stockFilter === "out") {
      matchesStock = product.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleAddProduct = async (newProduct: Product) => {
    try {
      const createdProduct = await createProduct(newProduct);
      setProducts([...products, createdProduct]);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding product:', error);
      // You might want to show an error toast here
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await postToApi('update-product', updatedProduct);
      setProducts(
        products.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      // You might want to show an error toast here
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await postToApi('delete-product', { productId });
      setProducts(products.filter((product) => product.id !== productId));
      setDeletingProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      // You might want to show an error toast here
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="default"
                size="icon"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.price, currency)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200
                          ${product.stock === 0
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-300"
                            : product.stock <= product.minStock
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-300"
                          }`
                        }
                        title={
                          product.stock === 0
                            ? `Out of Stock (Minimum required: ${product.minStock})`
                            : product.stock <= product.minStock
                            ? `Low Stock (Minimum required: ${product.minStock})`
                            : `In Stock`
                        }
                      >
                        {product.stock === 0 ? (
                          <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
                        ) : product.stock <= product.minStock ? (
                          <AlertTriangle className="w-4 h-4 mr-1 text-amber-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                        )}
                        {product.stock}
                        <span className="ml-2 font-normal">
                          {product.stock === 0
                            ? "Out of Stock"
                            : product.stock <= product.minStock
                            ? "Low"
                            : "In Stock"}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>{product.supplier}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingProduct(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showAddDialog && (
        <AddProductDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAdd={handleAddProduct}
        />
      )}

      {editingProduct && (
        <EditProductDialog
          open={!!editingProduct}
          onOpenChange={() => setEditingProduct(null)}
          product={editingProduct}
          onUpdate={handleUpdateProduct}
        />
      )}

      {deletingProduct && (
        <DeleteProductDialog
          open={!!deletingProduct}
          onOpenChange={() => setDeletingProduct(null)}
          product={deletingProduct}
          onDelete={handleDeleteProduct}
        />
      )}
    </>
  );
}