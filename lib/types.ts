// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  supplier: string;
  createdAt: string;
  updatedAt: string;
}

// Sales Types
export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
  customer?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  lowStockItems: number;
  totalRevenue: number;
}

export interface SalesByPeriod {
  period: string;
  sales: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

// Query Types
export interface QueryResult {
  type: 'table' | 'chart' | 'text';
  data: any;
  explanation?: string;
  rawData?: {
    products?: Product[];
    sales?: Sale[];
    stats?: DashboardStats;
    topProducts?: TopProduct[];
    lowStock?: Product[];
  };
}

// Reports Types
export interface ReportOptions {
  startDate: string;
  endDate: string;
  type: 'sales' | 'inventory' | 'revenue';
  format: 'pdf' | 'csv';
}

// Settings Types
export interface Settings {
  id: string;
  setting_key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'icon' | 'credential';
  description?: string;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
}