'use client';

import { useEffect, useState } from 'react';
import { InventoryList } from "@/components/inventory/inventory-list";
import { getProducts } from "@/lib/data";
import { Product } from "@/lib/types";
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Check if database configuration exists
      const databaseConfig = localStorage.getItem('databaseConfig');
      if (!databaseConfig) {
        setError('Database configuration not found. Please configure your database first.');
        return;
      }

      const productsData = await getProducts();
      setProducts(productsData);
    } catch (err) {
      console.error('Error loading products:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      
      // If it's an authentication error, redirect to database configuration
      if (errorMessage.includes('Authentication required') || errorMessage.includes('No database configuration')) {
        router.push('/auth/signup');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [router]);

  const handleRefresh = () => {
    loadProducts();
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600 text-lg text-center">
            <p>Error: {error}</p>
            <button 
              onClick={() => router.push('/auth/signup')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Configure Database
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
      <InventoryList initialProducts={products} onRefresh={handleRefresh} />
    </div>
  );
}