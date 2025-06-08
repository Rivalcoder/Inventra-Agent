import { 
  Product, 
  Sale, 
  DashboardStats, 
  SalesByPeriod, 
  TopProduct 
} from '@/lib/types';
import { getApiBase } from './utils';

// Helper function to fetch data from API
async function fetchFromApi(endpoint: string, params: Record<string, string> = {}) {
  try {
    const searchParams = new URLSearchParams({ action: endpoint, ...params });
    const response = await fetch(`${getApiBase()}/api/db?${searchParams}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Helper function to post data to API
export async function postToApi(endpoint: string, data: any) {
  try {
    const searchParams = new URLSearchParams({ action: endpoint });
    const response = await fetch(`${getApiBase()}/api/db?${searchParams}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
}

// Database operations
export async function getProducts(): Promise<Product[]> {
  return fetchFromApi('products', { action: 'products' });
}

export async function getSales(): Promise<Sale[]> {
  const data = await fetchFromApi('sales');
  return data.map((item: any) => ({
    ...item,
    quantity: Number(item.quantity) || 0,
    price: Number(item.price) || 0,
    total: Number(item.total) || 0
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  return fetchFromApi('product', { id });
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  return postToApi('products', product);
}

export async function createSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
  const saleData = {
    ...sale,
    quantity: Number(sale.quantity),
    price: Number(sale.price),
    total: Number(sale.total)
  };
  return postToApi('sale', saleData);
}

// Dashboard data
export async function getDashboardStats(): Promise<DashboardStats> {
  const data = await fetchFromApi('stats');
  return {
    totalSales: Number(data.totalSales) || 0,
    totalQuantity: Number(data.totalQuantity) || 0,
    totalRevenue: Number(data.totalRevenue) || 0,
    totalProducts: Number(data.totalProducts) || 0,
    totalStock: Number(data.totalStock) || 0,
    totalValue: Number(data.totalValue) || 0
  };
}

export async function getSalesByPeriod(): Promise<SalesByPeriod[]> {
  const data = await fetchFromApi('sales-by-period');
  return data.map((item: any) => ({
    month: item.month,
    revenue: Number(item.revenue) || 0,
    quantity: Number(item.quantity) || 0
  }));
}

export async function getTopProducts(): Promise<TopProduct[]> {
  const data = await fetchFromApi('top-products');
  return data.map((item: any) => ({
    ...item,
    revenue: Number(item.revenue) || 0,
    sales: Number(item.sales) || 0
  }));
}

export async function getRecentSales(): Promise<Sale[]> {
  const data = await fetchFromApi('recent-sales');
  return data.map((item: any) => ({
    ...item,
    price: Number(item.price) || 0,
    total: Number(item.total) || 0,
    quantity: Number(item.quantity) || 0
  }));
}

export async function getLowStockProducts(): Promise<Product[]> {
  const data = await fetchFromApi('low-stock');
  return data.map((item: any) => ({
    ...item,
    price: Number(item.price) || 0,
    stock: Number(item.stock) || 0,
    minStock: Number(item.minStock) || 0
  }));
}