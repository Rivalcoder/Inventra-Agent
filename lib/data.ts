import { 
  Product, 
  Sale, 
  DashboardStats, 
  SalesByPeriod, 
  TopProduct 
} from '@/lib/types';

// Mock data for the application
// In a real application, this would be fetched from a database

// Products
export const products: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    category: 'Electronics',
    price: 1299.99,
    stock: 15,
    minStock: 5,
    supplier: 'TechWorld Inc',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-04-20T14:45:00Z',
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with long battery life',
    category: 'Accessories',
    price: 29.99,
    stock: 42,
    minStock: 10,
    supplier: 'TechWorld Inc',
    createdAt: '2023-01-20T11:15:00Z',
    updatedAt: '2023-05-12T09:30:00Z',
  },
  {
    id: '3',
    name: 'USB-C Dock',
    description: 'All-in-one docking station with multiple ports',
    category: 'Accessories',
    price: 89.99,
    stock: 28,
    minStock: 8,
    supplier: 'ConnectAll Ltd',
    createdAt: '2023-02-05T13:45:00Z',
    updatedAt: '2023-04-18T16:20:00Z',
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    description: 'Tactile mechanical keyboard with RGB lighting',
    category: 'Accessories',
    price: 129.99,
    stock: 4,
    minStock: 5,
    supplier: 'KeyMasters Co',
    createdAt: '2023-02-10T15:30:00Z',
    updatedAt: '2023-05-15T10:15:00Z',
  },
  {
    id: '5',
    name: 'Ultrawide Monitor',
    description: '34-inch curved ultrawide monitor',
    category: 'Electronics',
    price: 399.99,
    stock: 7,
    minStock: 3,
    supplier: 'DisplayTech Inc',
    createdAt: '2023-03-01T09:20:00Z',
    updatedAt: '2023-05-10T11:45:00Z',
  },
  {
    id: '6',
    name: 'Wireless Earbuds',
    description: 'True wireless earbuds with noise cancellation',
    category: 'Audio',
    price: 149.99,
    stock: 23,
    minStock: 7,
    supplier: 'SoundWave Audio',
    createdAt: '2023-03-15T14:10:00Z',
    updatedAt: '2023-05-05T13:25:00Z',
  },
  {
    id: '7',
    name: 'Smartphone Stand',
    description: 'Adjustable desktop stand for smartphones',
    category: 'Accessories',
    price: 19.99,
    stock: 51,
    minStock: 15,
    supplier: 'MobileGear Ltd',
    createdAt: '2023-03-20T16:40:00Z',
    updatedAt: '2023-04-25T12:30:00Z',
  },
];

// Sales
export const sales: Sale[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Laptop Pro',
    quantity: 2,
    price: 1299.99,
    total: 2599.98,
    date: '2023-05-10T14:30:00Z',
    customer: 'John Smith',
  },
  {
    id: '2',
    productId: '2',
    productName: 'Wireless Mouse',
    quantity: 5,
    price: 29.99,
    total: 149.95,
    date: '2023-05-11T10:15:00Z',
    customer: 'Sarah Johnson',
  },
  {
    id: '3',
    productId: '3',
    productName: 'USB-C Dock',
    quantity: 3,
    price: 89.99,
    total: 269.97,
    date: '2023-05-12T15:45:00Z',
    customer: 'Michael Brown',
  },
  {
    id: '4',
    productId: '6',
    productName: 'Wireless Earbuds',
    quantity: 4,
    price: 149.99,
    total: 599.96,
    date: '2023-05-13T11:20:00Z',
    customer: 'Emma Wilson',
  },
  {
    id: '5',
    productId: '5',
    productName: 'Ultrawide Monitor',
    quantity: 1,
    price: 399.99,
    total: 399.99,
    date: '2023-05-14T13:10:00Z',
    customer: 'James Davis',
  },
  {
    id: '6',
    productId: '2',
    productName: 'Wireless Mouse',
    quantity: 3,
    price: 29.99,
    total: 89.97,
    date: '2023-05-15T16:30:00Z',
    customer: 'Olivia Martinez',
  },
  {
    id: '7',
    productId: '4',
    productName: 'Mechanical Keyboard',
    quantity: 2,
    price: 129.99,
    total: 259.98,
    date: '2023-05-16T09:45:00Z',
    customer: 'Daniel Wilson',
  },
  {
    id: '8',
    productId: '1',
    productName: 'Laptop Pro',
    quantity: 1,
    price: 1299.99,
    total: 1299.99,
    date: '2023-05-17T14:15:00Z',
    customer: 'Sophia Anderson',
  },
  {
    id: '9',
    productId: '7',
    productName: 'Smartphone Stand',
    quantity: 8,
    price: 19.99,
    total: 159.92,
    date: '2023-05-18T10:30:00Z',
    customer: 'William Taylor',
  },
  {
    id: '10',
    productId: '3',
    productName: 'USB-C Dock',
    quantity: 2,
    price: 89.99,
    total: 179.98,
    date: '2023-05-19T15:20:00Z',
    customer: 'Ava Thomas',
  },
];

// Dashboard data
export const getDashboardStats = (): DashboardStats => {
  const totalSales = sales.length;
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.stock < p.minStock).length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  return {
    totalSales,
    totalProducts,
    lowStockItems,
    totalRevenue,
  };
};

export const getSalesByPeriod = (): SalesByPeriod[] => {
  return [
    { period: 'Mon', sales: 5200 },
    { period: 'Tue', sales: 4800 },
    { period: 'Wed', sales: 6100 },
    { period: 'Thu', sales: 5400 },
    { period: 'Fri', sales: 7200 },
    { period: 'Sat', sales: 8500 },
    { period: 'Sun', sales: 6700 },
  ];
};

export const getTopProducts = (): TopProduct[] => {
  // Group sales by product
  const productSales = sales.reduce((acc, sale) => {
    if (!acc[sale.productId]) {
      acc[sale.productId] = {
        id: sale.productId,
        name: sale.productName,
        sales: 0,
        revenue: 0,
      };
    }
    acc[sale.productId].sales += sale.quantity;
    acc[sale.productId].revenue += sale.total;
    return acc;
  }, {} as Record<string, TopProduct>);

  // Convert to array and sort by revenue
  return Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};

// Get recent sales
export const getRecentSales = (): Sale[] => {
  return [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
};

// Get low stock products
export const getLowStockProducts = (): Product[] => {
  return products
    .filter(product => product.stock <= product.minStock)
    .sort((a, b) => a.stock - b.stock);
};