import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { Db } from 'mongodb';
import { Pool } from 'pg';
import { Product, Sale } from '@/lib/types';
import { dbService } from '@/lib/services/db';
import { DatabaseConfig } from '@/lib/types/database';
import fs from "fs/promises";
import path from "path";

// Configure the route to be dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper function to format date for MySQL
function formatDateForMySQL(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Helper function to get user ID from request
function getUserIdFromRequest(request: Request): string | null {
  try {
    // Try to get userId from request headers
    const userId = request.headers.get('x-user-id');
    if (userId) return userId;
    
    // Try to get from user config
    const userConfig = request.headers.get('x-user-db-config');
    if (userConfig) {
      const config = JSON.parse(userConfig);
      return config.userId || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting userId from request:', error);
    return null;
  }
}

// Helper function to get collection name (now returns base collection name)
function getUserCollectionName(baseCollection: string, request: Request): string {
  // Always return the base collection name since we now use userId field for isolation
  return baseCollection;
}

// Get database configuration from request or user's stored config
async function getDatabaseConfig(request: Request): Promise<DatabaseConfig> {
  try {
    // Try to get config from request headers or body
    const url = new URL(request.url);
    const configParam = url.searchParams.get('config');
    
    if (configParam) {
      const config = JSON.parse(configParam);
      if (config.type === 'mysql') {
        const masked = typeof config.password === 'string' ? (config.password.length > 0 ? `${config.password[0]}***(${config.password.length})` : '(empty)') : '(unset)';
        console.log('Resolved DB Config from URL (MySQL):', { host: config.host, port: config.port, username: config.username, password: masked, database: config.database });
      }
      // Check for corrupted configurations (MongoDB only)
      if (config.type === 'mongodb') {
        if (config.host && (config.host.includes('gmail.com') || config.host.includes('yahoo.com') || config.host.includes('hotmail.com'))) {
          throw new Error(`Corrupted database configuration detected. Host contains invalid domain: ${config.host}. Please clear your configuration and try again.`);
        }
        if (config.password && (config.password.includes('gmail.com') || config.password.includes('yahoo.com') || config.password.includes('hotmail.com'))) {
          throw new Error(`Corrupted database configuration detected. Password contains invalid domain: ${config.password}. Please clear your configuration and try again.`);
        }
      }
      return config;
    }
    
    // Check for user's database configuration in request headers
    const userConfig = request.headers.get('x-user-db-config');
    if (userConfig) {
      const config = JSON.parse(userConfig);
      if (config.type === 'mysql') {
        const masked = typeof config.password === 'string' ? (config.password.length > 0 ? `${config.password[0]}***(${config.password.length})` : '(empty)') : '(unset)';
        console.log('Resolved DB Config from Header (MySQL):', { host: config.host, port: config.port, username: config.username, password: masked, database: config.database });
      }
      // Check for corrupted configurations (MongoDB only)
      if (config.type === 'mongodb') {
        if (config.host && (config.host.includes('gmail.com') || config.host.includes('yahoo.com') || config.host.includes('hotmail.com'))) {
          throw new Error(`Corrupted database configuration detected. Host contains invalid domain: ${config.host}. Please clear your configuration and try again.`);
        }
        if (config.password && (config.password.includes('gmail.com') || config.password.includes('yahoo.com') || config.password.includes('hotmail.com'))) {
          throw new Error(`Corrupted database configuration detected. Password contains invalid domain: ${config.password}. Please clear your configuration and try again.`);
        }
      }
      return config;
    }
    
    // For development, provide a sensible default configuration
    if (process.env.NODE_ENV === 'development') {
      console.log('Using default development database configuration');

      // Prefer MongoDB Atlas if env credentials are present (cloud only)
      if (process.env.DB_USERNAME && process.env.DB_PASSWORD && process.env.DB_HOST) {
        console.log('Using MongoDB Atlas configuration from environment variables');
        return {
          type: 'mongodb',
          host: process.env.DB_HOST,
          port: 27017,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.MONGODB_DATABASE || 'ai_inventory',
          options: {
            ssl: true,
            connectionLimit: 10,
            charset: 'utf8'
          }
        };
      }

      // Fallback to local MySQL for quick dev start if no env Atlas credentials
      const cfg = {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'ai_inventory',
        options: {
          ssl: false,
          connectionLimit: 10,
          charset: 'utf8mb4'
        }
      } as DatabaseConfig;
      const masked = cfg.password.length > 0 ? `${cfg.password[0]}***(${cfg.password.length})` : '(empty)';
      console.log('Resolved DB Config from DEV fallback (MySQL):', { host: cfg.host, port: cfg.port, username: cfg.username, password: masked, database: cfg.database });
      return cfg;
    }
    
    // If no user config provided, throw error - user must be authenticated
    throw new Error('No database configuration provided. User must be authenticated and have database configuration.');
  } catch (error) {
    console.error('Error getting database config:', error);
    throw error;
  }
}

// Initialize database and tables
async function initializeDatabase(config: DatabaseConfig) {
  try {
    console.log('Initializing database...');
    await dbService.initializeDatabase(config);
    
    // Check if products table is empty and insert dummy data if needed
    const connection = await dbService.connect(config);
    
    try {
      if (config.type === 'mysql') {
        const pool = connection.connection as mysql.Pool;
        const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as count FROM products');
        const includeDummy = (config.options as any)?.includeDummyData !== false;

        if (rows[0].count === 0 && includeDummy) {
          console.log('No existing data found. Inserting dummy data...');
          await insertDummyData(config);
        } else {
          console.log('Database already contains data. Skipping dummy data insertion.');
        }
      } else if (config.type === 'mongodb') {
        const db = connection.connection;
        const count = await db.collection('products').countDocuments();
        const includeDummy = (config.options as any)?.includeDummyData !== false;

        if (count === 0 && includeDummy) {
          console.log('No existing data found. Inserting dummy data...');
          await insertDummyData(config);
        } else {
          console.log('Database already contains data. Skipping dummy data insertion.');
        }
      } else if (config.type === 'postgresql') {
        const pool = connection.connection;
        const result = await pool.query('SELECT COUNT(*) as count FROM products');
        const includeDummy = (config.options as any)?.includeDummyData !== false;

        if (parseInt(result.rows[0].count) === 0 && includeDummy) {
          console.log('No existing data found. Inserting dummy data...');
          await insertDummyData(config);
        } else {
          console.log('Database already contains data. Skipping dummy data insertion.');
        }
      }
    } catch (error) {
      console.error('Error checking/inserting dummy data:', error);
      throw error;
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize database when the API route is first accessed
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

async function ensureInitialized(request: Request) {
  // Check if user is authenticated by looking for database config in headers
  const userConfig = request.headers.get('x-user-db-config');
  if (!userConfig && process.env.NODE_ENV !== 'development') {
    throw new Error('Authentication required. No database configuration provided.');
  }

  if (!isInitialized) {
    if (!initializationPromise) {
      const config = await getDatabaseConfig(request);
      initializationPromise = initializeDatabase(config).then(() => {
        isInitialized = true;
      }).catch((error) => {
        console.error('Failed to initialize database:', error);
        isInitialized = false;
        initializationPromise = null;
        throw error;
      });
    }
    await initializationPromise;
  }
}

async function insertDummyData(config: DatabaseConfig) {
  try {
    console.log('Starting dummy data insertion...');
    const connection = await dbService.connect(config);
    const now = formatDateForMySQL(new Date());
    
    // Clear existing data first
    console.log('Clearing existing data...');
    
    if (config.type === 'mysql') {
      const pool = connection.connection as mysql.Pool;
      await pool.query('DELETE FROM sales');
      await pool.query('DELETE FROM products');
    } else if (config.type === 'mongodb') {
      const db = connection.connection;
      await db.collection('sales').deleteMany({});
      await db.collection('products').deleteMany({});
    } else if (config.type === 'postgresql') {
      const pool = connection.connection;
      await pool.query('DELETE FROM sales');
      await pool.query('DELETE FROM products');
    }
    
    // Create products with fixed IDs
    const dummyProducts: Product[] = [
      {
        id: '1',
        name: 'Laptop Pro',
        description: 'High-performance laptop for professionals',
        category: 'Electronics',
        price: 1299.99,
        stock: 15,
        minStock: 5,
        supplier: 'TechWorld Inc',
        createdAt: now,
        updatedAt: now,
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
        createdAt: now,
        updatedAt: now,
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
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '4',
        name: '4K Monitor',
        description: '32-inch 4K UHD display with HDR',
        category: 'Electronics',
        price: 499.99,
        stock: 12,
        minStock: 3,
        supplier: 'DisplayTech Co',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '5',
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with customizable keys',
        category: 'Accessories',
        price: 149.99,
        stock: 35,
        minStock: 7,
        supplier: 'KeyMaster Inc',
        createdAt: now,
        updatedAt: now,
      }
    ];

    // Insert products first and store their IDs
    console.log(`Attempting to insert ${dummyProducts.length} products...`);
    const insertedProductIds = new Set<string>();
    
    if (config.type === 'mysql') {
      const pool = connection.connection as mysql.Pool;
      for (const product of dummyProducts) {
        try {
          console.log(`Inserting product: ${product.name} (ID: ${product.id})`);
          // Idempotent upsert to avoid duplicate key errors if concurrent inserts happen
          await pool.query(
            'INSERT INTO products (id, name, description, category, price, stock, minStock, supplier, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), category=VALUES(category), price=VALUES(price), stock=VALUES(stock), minStock=VALUES(minStock), supplier=VALUES(supplier), updatedAt=VALUES(updatedAt)',
            [product.id, product.name, product.description, product.category, product.price, product.stock, product.minStock, product.supplier, product.createdAt, product.updatedAt]
          );
          insertedProductIds.add(product.id);
          console.log(`Successfully inserted product: ${product.name}`);
        } catch (error) {
          console.error(`Error inserting product ${product.name}:`, error);
          throw error;
        }
      }

      // Verify all products were inserted
      console.log('Verifying product insertions...');
      const [productCount] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as count FROM products');
      console.log(`Found ${productCount[0].count} products in database, expected ${dummyProducts.length}`);
      
      if (productCount[0].count !== dummyProducts.length) {
        const [existingProducts] = await pool.query<mysql.RowDataPacket[]>('SELECT id, name FROM products');
        console.log('Products in database:', existingProducts);
        console.log('Expected product IDs:', dummyProducts.map(p => ({ id: p.id, name: p.name })));
        throw new Error('Not all products were inserted successfully');
      }
    } else if (config.type === 'mongodb') {
      const db = connection.connection;
      for (const product of dummyProducts) {
        try {
          console.log(`Inserting product: ${product.name} (ID: ${product.id})`);
          await db.collection('products').insertOne(product);
          insertedProductIds.add(product.id);
          console.log(`Successfully inserted product: ${product.name}`);
        } catch (error: any) {
          // Handle duplicate key errors gracefully
          if (error.code === 11000) {
            console.log(`Product ${product.name} already exists, skipping...`);
            insertedProductIds.add(product.id);
            continue;
          }
          console.error(`Error inserting product ${product.name}:`, error);
          throw error;
        }
      }

      // Verify all products exist (either newly inserted or already present)
      console.log('Verifying product insertions...');
      const count = await db.collection('products').countDocuments();
      console.log(`Found ${count} products in database, expected ${dummyProducts.length}`);
      
      if (count < dummyProducts.length) {
        const existingProducts = await db.collection('products').find({}, { projection: { id: 1, name: 1 } }).toArray();
        console.log('Products in database:', existingProducts);
        console.log('Expected product IDs:', dummyProducts.map(p => ({ id: p.id, name: p.name })));
        throw new Error('Not all products were inserted successfully');
      }
    } else if (config.type === 'postgresql') {
      const pool = connection.connection;
      for (const product of dummyProducts) {
        try {
          console.log(`Inserting product: ${product.name} (ID: ${product.id})`);
          await pool.query(
            'INSERT INTO products (id, name, description, category, price, stock, min_stock, supplier, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [product.id, product.name, product.description, product.category, product.price, product.stock, product.minStock, product.supplier, product.createdAt, product.updatedAt]
          );
          insertedProductIds.add(product.id);
          console.log(`Successfully inserted product: ${product.name}`);
        } catch (error) {
          console.error(`Error inserting product ${product.name}:`, error);
          throw error;
        }
      }

      // Verify all products were inserted
      console.log('Verifying product insertions...');
      const result = await pool.query('SELECT COUNT(*) as count FROM products');
      const count = parseInt(result.rows[0].count);
      console.log(`Found ${count} products in database, expected ${dummyProducts.length}`);
      
      if (count !== dummyProducts.length) {
        const existingProducts = await pool.query('SELECT id, name FROM products');
        console.log('Products in database:', existingProducts.rows);
        console.log('Expected product IDs:', dummyProducts.map(p => ({ id: p.id, name: p.name })));
        throw new Error('Not all products were inserted successfully');
      }
    }

    // Create sales for each product with more realistic data
    console.log('Creating sales records...');
    const dummySales: Sale[] = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // Sales from last 3 months

    for (const product of dummyProducts) {
      if (!insertedProductIds.has(product.id)) {
        console.warn(`Skipping sales for product ${product.name} as it was not inserted successfully`);
        continue;
      }
      
      // Create 5-10 sales for each product
      const numSales = Math.floor(Math.random() * 6) + 5;
      for (let i = 0; i < numSales; i++) {
        const saleDate = new Date(startDate);
        saleDate.setDate(saleDate.getDate() + Math.floor(Math.random() * 90)); // Random date within last 3 months
        const quantity = Math.floor(Math.random() * 5) + 1;
        const sale: Sale = {
          id: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price,
          total: product.price * quantity,
          date: formatDateForMySQL(saleDate),
          customer: `Customer ${Math.floor(Math.random() * 1000)}`,
        };
        dummySales.push(sale);
      }
    }

    // Insert sales
    console.log(`Attempting to insert ${dummySales.length} sales...`);
    
    if (config.type === 'mysql') {
      const pool = connection.connection as mysql.Pool;
      for (const sale of dummySales) {
        try {
          console.log(`Inserting sale for product: ${sale.productName}`);
          await pool.query(
            'INSERT INTO sales (id, productId, productName, quantity, price, total, date, customer) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE productId=VALUES(productId), productName=VALUES(productName), quantity=VALUES(quantity), price=VALUES(price), total=VALUES(total), date=VALUES(date), customer=VALUES(customer)',
            [sale.id, sale.productId, sale.productName, sale.quantity, sale.price, sale.total, sale.date, sale.customer]
          );
          console.log(`Successfully inserted sale for product: ${sale.productName}`);
        } catch (error) {
          console.error(`Error inserting sale for product ${sale.productName}:`, error);
          throw error;
        }
      }
    } else if (config.type === 'mongodb') {
      const db = connection.connection as Db;
      await db.collection('sales').insertMany(dummySales);
    } else if (config.type === 'postgresql') {
      const pool = connection.connection as Pool;
      for (const sale of dummySales) {
        try {
          console.log(`Inserting sale for product: ${sale.productName}`);
          await pool.query(
            'INSERT INTO sales (id, "productId", "productName", quantity, price, total, date, customer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [sale.id, sale.productId, sale.productName, sale.quantity, sale.price, sale.total, sale.date, sale.customer]
          );
          console.log(`Successfully inserted sale for product: ${sale.productName}`);
        } catch (error) {
          console.error(`Error inserting sale for product ${sale.productName}:`, error);
          throw error;
        }
      }
    }

    console.log('Dummy data insertion completed successfully');
  } catch (error) {
    console.error('Error inserting dummy data:', error);
    throw error;
  }
}

// API route handlers
export async function GET(request: Request) {
  try {
    console.log('GET request received');
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    console.log('Action:', action);

    // Check for database configuration in headers
    const userConfig = request.headers.get('x-user-db-config');
    console.log('User config header:', userConfig ? 'Present' : 'Missing');

    // For lightweight actions, return safe defaults without touching DB
    // Note: settings need to be retrieved from database, so we'll handle them below

    // For other actions, proceed with initialization
    const isLightweight = false;
    if (!isLightweight) {
      await ensureInitialized(request);
    }

    const config = await getDatabaseConfig(request);
    let connection: any;
    try {
      connection = await dbService.connect(config);
    } catch (connError) {
      throw connError;
    }

    switch (action) {
      case 'stats':
        console.log('Calculating dashboard stats...');
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          const [salesResult] = await pool.query<mysql.RowDataPacket[]>(`
            SELECT 
              COALESCE(COUNT(*), 0) as totalSales,
              COALESCE(SUM(quantity), 0) as totalQuantity,
              COALESCE(SUM(total), 0) as totalRevenue
            FROM sales
          `);
          const [productsResult] = await pool.query<mysql.RowDataPacket[]>(`
            SELECT 
              COALESCE(COUNT(*), 0) as totalProducts,
              COALESCE(SUM(stock), 0) as totalStock,
              COALESCE(SUM(price * stock), 0) as totalValue
            FROM products
          `);
                  const stats = {
            totalSales: Number(salesResult[0].totalSales) || 0,
            totalQuantity: Number(salesResult[0].totalQuantity) || 0,
            totalRevenue: Number(salesResult[0].totalRevenue) || 0,
            totalProducts: Number(productsResult[0].totalProducts) || 0,
            totalStock: Number(productsResult[0].totalStock) || 0,
            totalValue: Number(productsResult[0].totalValue) || 0
          };
          console.log('Stats calculated:', stats);
          return NextResponse.json(stats);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json({ totalSales: 0, totalQuantity: 0, totalRevenue: 0, totalProducts: 0, totalStock: 0, totalValue: 0 });
          const user = await db.collection('users').findOne({ userId }, { projection: { 'data.products': 1, 'data.sales': 1 } });
          const products = Array.isArray(user?.data?.products) ? user.data.products : [];
          const sales = Array.isArray(user?.data?.sales) ? user.data.sales : [];
          const stats = {
            totalSales: sales.length,
            totalQuantity: sales.reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0),
            totalRevenue: sales.reduce((sum: number, s: any) => sum + (Number(s.total) || ((Number(s.price) || 0) * (Number(s.quantity) || 0))), 0),
            totalProducts: products.length,
            totalStock: products.reduce((sum: number, p: any) => sum + (Number(p.stock) || 0), 0),
            totalValue: products.reduce((sum: number, p: any) => sum + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0)
          };
          console.log('Stats calculated:', stats);
          return NextResponse.json(stats);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          const salesResult = await pool.query(`
            SELECT 
              COALESCE(COUNT(*), 0) as totalSales,
              COALESCE(SUM(quantity), 0) as totalQuantity,
              COALESCE(SUM(total), 0) as totalRevenue
            FROM sales
          `);
          const productsResult = await pool.query(`
            SELECT 
              COALESCE(COUNT(*), 0) as totalProducts,
              COALESCE(SUM(stock), 0) as totalStock,
              COALESCE(SUM(price * stock), 0) as totalValue
            FROM products
          `);
          
          const stats = {
            totalSales: Number(salesResult.rows[0].totalsales) || 0,
            totalQuantity: Number(salesResult.rows[0].totalquantity) || 0,
            totalRevenue: Number(salesResult.rows[0].totalrevenue) || 0,
            totalProducts: Number(productsResult.rows[0].totalproducts) || 0,
            totalStock: Number(productsResult.rows[0].totalstock) || 0,
            totalValue: Number(productsResult.rows[0].totalvalue) || 0
          };
          console.log('Stats calculated:', stats);
          return NextResponse.json(stats);
        }

      case 'sales-by-period':
        console.log('Fetching sales by period...');
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          const [salesByPeriod] = await pool.query<mysql.RowDataPacket[]>(`
            SELECT 
              DATE_FORMAT(date, '%Y-%m') as month,
              COALESCE(SUM(total), 0) as revenue,
              COALESCE(SUM(quantity), 0) as quantity
            FROM sales
            WHERE date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(date, '%Y-%m')
            ORDER BY month ASC
          `);
          console.log(`Found ${salesByPeriod.length} months of sales data`);
          return NextResponse.json(salesByPeriod);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json([]);
          const user = await db.collection('users').findOne({ userId }, { projection: { 'data.sales': 1 } });
          const sales = Array.isArray(user?.data?.sales) ? user.data.sales : [];
          const since = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000;
          const buckets = new Map<string, { month: string; revenue: number; quantity: number }>();
          for (const s of sales) {
            const d = new Date(s.date || s.saleDate);
            if (isNaN(d.getTime()) || d.getTime() < since) continue;
            const y = d.getUTCFullYear();
            const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
            const key = `${y}-${m}`;
            const bucket = buckets.get(key) || { month: key, revenue: 0, quantity: 0 };
            bucket.quantity += Number(s.quantity) || 0;
            bucket.revenue += Number(s.total) || ((Number(s.price) || 0) * (Number(s.quantity) || 0));
            buckets.set(key, bucket);
          }
          const result = Array.from(buckets.values()).sort((a, b) => a.month.localeCompare(b.month));
          console.log(`Found ${result.length} months of sales data`);
          return NextResponse.json(result);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          const salesByPeriod = await pool.query(`
            SELECT 
              TO_CHAR(date, 'YYYY-MM') as month,
              COALESCE(SUM(total), 0) as revenue,
              COALESCE(SUM(quantity), 0) as quantity
            FROM sales
            WHERE date >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(date, 'YYYY-MM')
            ORDER BY month ASC
          `);
          console.log(`Found ${salesByPeriod.rows.length} months of sales data`);
          return NextResponse.json(salesByPeriod.rows);
        }

      case 'low-stock':
        console.log('Fetching low stock products...');
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          const [lowStockProducts] = await pool.query<mysql.RowDataPacket[]>(`
            SELECT * FROM products 
            WHERE stock <= minStock 
            ORDER BY (stock / minStock) ASC
          `);
          console.log(`Found ${lowStockProducts.length} low stock products`);
          return NextResponse.json(lowStockProducts);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json([]);
          const user = await db.collection('users').findOne({ userId }, { projection: { 'data.products': 1 } });
          const products = Array.isArray(user?.data?.products) ? user.data.products : [];
          const lowStock = products
            .filter((p: any) => (Number(p.stock) || 0) <= (Number(p.minStock) || 0))
            .map((p: any) => ({ ...p, stockRatio: (Number(p.minStock) || 0) === 0 ? Infinity : (Number(p.stock) || 0) / (Number(p.minStock) || 0) }))
            .sort((a: any, b: any) => (a.stockRatio as number) - (b.stockRatio as number));
          console.log(`Found ${lowStock.length} low stock products`);
          return NextResponse.json(lowStock);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          const lowStockProducts = await pool.query(`
            SELECT * FROM products 
            WHERE stock <= min_stock 
            ORDER BY (stock::float / min_stock::float) ASC
          `);
          console.log(`Found ${lowStockProducts.rows.length} low stock products`);
          return NextResponse.json(lowStockProducts.rows);
        }

      case 'top-products':
        console.log('Fetching top products...');
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          const [topProducts] = await pool.query<mysql.RowDataPacket[]>(`
            SELECT 
              p.*,
              COALESCE(COUNT(s.id), 0) as sales,
              COALESCE(SUM(s.total), 0) as revenue
            FROM products p
            LEFT JOIN sales s ON p.id = s.productId
            GROUP BY p.id
            ORDER BY revenue DESC
            LIMIT 5
          `);
          console.log(`Found ${topProducts.length} top products`);
          return NextResponse.json(topProducts);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json([]);
          const user = await db.collection('users').findOne({ userId }, { projection: { 'data.products': 1, 'data.sales': 1 } });
          const products = Array.isArray(user?.data?.products) ? user.data.products : [];
          const sales = Array.isArray(user?.data?.sales) ? user.data.sales : [];
          const revenueByProduct = new Map<string, { revenue: number; sales: number }>();
          for (const s of sales) {
            const entry = revenueByProduct.get(s.productId) || { revenue: 0, sales: 0 };
            entry.sales += 1;
            entry.revenue += Number(s.total) || ((Number(s.price) || 0) * (Number(s.quantity) || 0));
            revenueByProduct.set(s.productId, entry);
          }
          const enriched = products.map((p: any) => {
            const agg = revenueByProduct.get(p.id) || { revenue: 0, sales: 0 };
            return { ...p, revenue: agg.revenue, sales: agg.sales };
          })
          .sort((a: any, b: any) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0))
          .slice(0, 5);
          console.log(`Found ${enriched.length} top products`);
          return NextResponse.json(enriched);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          const topProducts = await pool.query(`
            SELECT 
              p.*,
              COALESCE(COUNT(s.id), 0) as sales,
              COALESCE(SUM(s.total), 0) as revenue
            FROM products p
            LEFT JOIN sales s ON p.id = s.product_id
            GROUP BY p.id
            ORDER BY revenue DESC
            LIMIT 5
          `);
          console.log(`Found ${topProducts.rows.length} top products`);
          return NextResponse.json(topProducts.rows);
        }

      case 'recent-sales':
        console.log('Fetching recent sales...');
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          const [recentSales] = await pool.query<mysql.RowDataPacket[]>(`
            SELECT * FROM sales 
            ORDER BY date DESC 
            LIMIT 5
          `);
          console.log(`Found ${recentSales.length} recent sales`);
          return NextResponse.json(recentSales);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json([]);
          const user = await db.collection('users').findOne({ userId }, { projection: { 'data.sales': 1 } });
          const sales = Array.isArray(user?.data?.sales) ? user.data.sales : [];
          const recent = sales
            .slice()
            .sort((a: any, b: any) => new Date(b.date || b.saleDate).getTime() - new Date(a.date || a.saleDate).getTime())
            .slice(0, 5);
          console.log(`Found ${recent.length} recent sales for user: ${userId}`);
          return NextResponse.json(recent);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          const recentSales = await pool.query(`
            SELECT * FROM sales 
            ORDER BY date DESC 
            LIMIT 5
          `);
          console.log(`Found ${recentSales.rows.length} recent sales`);
          return NextResponse.json(recentSales.rows);
        }

      case 'products':
        console.log('Fetching products...');
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          const [products] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM products');
          console.log(`Found ${products.length} products`);
          return NextResponse.json(products);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json([]);
          const user = await db.collection('users').findOne({ userId }, { projection: { 'data.products': 1 } });
          const products = Array.isArray(user?.data?.products) ? user.data.products : [];
          console.log(`Found ${products.length} products for user: ${userId}`);
          return NextResponse.json(products);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          const products = await pool.query('SELECT * FROM products');
          console.log(`Found ${products.rows.length} products`);
          return NextResponse.json(products.rows);
        }

      case 'sales':
        console.log('Fetching sales...');
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          const [sales] = await pool.query<mysql.RowDataPacket[]>(`
            SELECT 
              id,
              productId,
              productName,
              CAST(quantity AS SIGNED) as quantity,
              CAST(price AS DECIMAL(10,2)) as price,
              CAST(total AS DECIMAL(10,2)) as total,
              date,
              customer
            FROM sales
          `);
          console.log(`Found ${sales.length} sales`);
          return NextResponse.json(sales);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json([]);
          const user = await db.collection('users').findOne({ userId }, { projection: { 'data.sales': 1 } });
          const sales = Array.isArray(user?.data?.sales) ? user.data.sales : [];
          console.log(`Found ${sales.length} sales for user: ${userId}`);
          return NextResponse.json(sales);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          const sales = await pool.query(`
            SELECT 
              id,
              product_id,
              product_name,
              quantity,
              price,
              total,
              date,
              customer
            FROM sales
          `);
          console.log(`Found ${sales.rows.length} sales`);
          return NextResponse.json(sales.rows);
        }

      case 'product':
        const id = searchParams.get('id');
        if (!id) {
          return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }
        console.log('Fetching product:', id);
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          const [product] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
          return NextResponse.json(product[0] || null);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json(null);
          const user = await db.collection('users').findOne({ userId }, { projection: { 'data.products': 1 } });
          const products = Array.isArray(user?.data?.products) ? user.data.products : [];
          const product = products.find((p: any) => p.id === id) || null;
          return NextResponse.json(product);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
          return NextResponse.json(product.rows[0] || null);
        }

      case 'settings':
        console.log('Fetching all settings...');
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          const [settings] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM settings');
          console.log(`Found ${settings.length} settings`);
          return NextResponse.json(settings);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json([]);
          const user = await db.collection('users').findOne({ userId }, { projection: { 'data.settings': 1 } });
          const settingsObj = user?.data?.settings || {};
          const settingsArr = Object.keys(settingsObj).map((k) => settingsObj[k]);
          console.log(`Found ${settingsArr.length} settings in user document for user: ${userId}`);
          return NextResponse.json(settingsArr);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          const settings = await pool.query('SELECT * FROM settings');
          console.log(`Found ${settings.rows.length} settings`);
          return NextResponse.json(settings.rows);
        }

      case 'setting':
        const settingKey = searchParams.get('key');
        if (!settingKey) {
          return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
        }
        console.log('Fetching setting:', settingKey);
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          const [setting] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM settings WHERE setting_key = ?', [settingKey]);
          return NextResponse.json(setting[0] || null);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json(null);
          const user = await db.collection('users').findOne({ userId }, { projection: { [`data.settings.${settingKey}`]: 1 } });
          const setting = (user as any)?.data?.settings?.[settingKey] || null;
          return NextResponse.json(setting);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          const setting = await pool.query('SELECT * FROM settings WHERE setting_key = $1', [settingKey]);
          return NextResponse.json(setting.rows[0] || null);
        }

      case 'export-database':
        console.log('Exporting database...');
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          const [exportedProducts] = await pool.query<mysql.RowDataPacket[]>(
            'SELECT * FROM products'
          );
          const [exportedSales] = await pool.query<mysql.RowDataPacket[]>(
            'SELECT * FROM sales'
          );
          const [exportedSettings] = await pool.query<mysql.RowDataPacket[]>(
            'SELECT * FROM settings'
          );

          return NextResponse.json({
            products: exportedProducts,
            sales: exportedSales,
            settings: exportedSettings,
            exportDate: new Date().toISOString(),
            version: '1.0'
          });
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json({ products: [], sales: [], settings: [], exportDate: new Date().toISOString(), version: '1.0' });
          const user = await db.collection('users').findOne({ userId }, { projection: { 'data.products': 1, 'data.sales': 1, 'data.settings': 1 } });
          const settingsObj = user?.data?.settings || {};
          const settingsArr = Object.keys(settingsObj).map((k) => settingsObj[k]);
          return NextResponse.json({
            products: Array.isArray(user?.data?.products) ? user!.data.products : [],
            sales: Array.isArray(user?.data?.sales) ? user!.data.sales : [],
            settings: settingsArr,
            exportDate: new Date().toISOString(),
            version: '1.0'
          });
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          const exportedProducts = await pool.query('SELECT * FROM products');
          const exportedSales = await pool.query('SELECT * FROM sales');
          const exportedSettings = await pool.query('SELECT * FROM settings');

          return NextResponse.json({
            products: exportedProducts.rows,
            sales: exportedSales.rows,
            settings: exportedSettings.rows,
            exportDate: new Date().toISOString(),
            version: '1.0'
          });
        }

      case 'import-inventory':
        console.log('Importing inventory data...');
        const { data: inventoryData } = await request.json();
        
        if (config.type === 'mysql') {
          // Start a transaction
          const pool = connection.connection as mysql.Pool;
          const inventoryConn = await pool.getConnection();
          await inventoryConn.beginTransaction();

          try {
            // Clear existing inventory data
            await inventoryConn.query('DELETE FROM products');
            
            // Insert new inventory data
            for (const item of inventoryData) {
              await inventoryConn.query(
                'INSERT INTO products (id, name, description, price, quantity, category, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                  item.id,
                  item.name,
                  item.description,
                  item.price,
                  item.quantity,
                  item.category,
                  item.createdAt,
                  item.updatedAt
                ]
              );
            }

            await inventoryConn.commit();
            return NextResponse.json({ success: true, message: 'Inventory data imported successfully' });
          } catch (error) {
            await inventoryConn.rollback();
            throw error;
          } finally {
            inventoryConn.release();
          }
        } else if (config.type === 'mongodb') {
          const db = connection.connection as Db;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json({ error: 'No user' }, { status: 400 });
          try {
            await db.collection('users').updateOne(
              { userId },
              { $set: { 'data.products': inventoryData } }
            );
            return NextResponse.json({ success: true, message: 'Inventory data imported successfully' });
          } catch (error) {
            throw error;
          }
        } else if (config.type === 'postgresql') {
          const pool = connection.connection as Pool;
          const client = await pool.connect();
          
          try {
            await client.query('BEGIN');
            
            // Clear existing inventory data
            await client.query('DELETE FROM products');
            
            // Insert new inventory data
            for (const item of inventoryData) {
              await client.query(
                'INSERT INTO products (id, name, description, price, quantity, category, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [
                  item.id,
                  item.name,
                  item.description,
                  item.price,
                  item.quantity,
                  item.category,
                  item.createdAt,
                  item.updatedAt
                ]
              );
            }

            await client.query('COMMIT');
            return NextResponse.json({ success: true, message: 'Inventory data imported successfully' });
          } catch (error) {
            await client.query('ROLLBACK');
            throw error;
          } finally {
            client.release();
          }
        }

      case 'import-sales':
        console.log('Importing sales data...');
        const { data: salesData } = await request.json();
        
        if (config.type === 'mysql') {
          // Start a transaction
          const pool = connection.connection as mysql.Pool;
          const salesConn = await pool.getConnection();
          await salesConn.beginTransaction();

          try {
            // Clear existing sales data
            await salesConn.query('DELETE FROM sales');
            
            // Insert new sales data
            for (const sale of salesData) {
              await salesConn.query(
                'INSERT INTO sales (id, product_id, quantity, total_price, sale_date, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                  sale.id,
                  sale.product_id,
                  sale.quantity,
                  sale.total_price,
                  sale.sale_date,
                  sale.createdAt,
                  sale.updatedAt
                ]
              );
            }

            await salesConn.commit();
            return NextResponse.json({ success: true, message: 'Sales data imported successfully' });
          } catch (error) {
            await salesConn.rollback();
            throw error;
          } finally {
            salesConn.release();
          }
        } else if (config.type === 'mongodb') {
          const db = connection.connection as Db;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json({ error: 'No user' }, { status: 400 });
          try {
            await db.collection('users').updateOne(
              { userId },
              { $set: { 'data.sales': salesData } }
            );
            return NextResponse.json({ success: true, message: 'Sales data imported successfully' });
          } catch (error) {
            throw error;
          }
        } else if (config.type === 'postgresql') {
          const pool = connection.connection as Pool;
          const client = await pool.connect();
          
          try {
            await client.query('BEGIN');
            
            // Clear existing sales data
            await client.query('DELETE FROM sales');
            
            // Insert new sales data
            for (const sale of salesData) {
              await client.query(
                'INSERT INTO sales (id, product_id, quantity, total_price, sale_date, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [
                  sale.id,
                  sale.product_id,
                  sale.quantity,
                  sale.total_price,
                  sale.sale_date,
                  sale.createdAt,
                  sale.updatedAt
                ]
              );
            }

            await client.query('COMMIT');
            return NextResponse.json({ success: true, message: 'Sales data imported successfully' });
          } catch (error) {
            await client.query('ROLLBACK');
            throw error;
          } finally {
            client.release();
          }
        }

      case 'check-backup-status':
        try {
          if (config.type === 'mysql') {
            const pool = connection.connection as mysql.Pool;
            const [settings] = await pool.query<mysql.RowDataPacket[]>(
              'SELECT value FROM settings WHERE setting_key = "auto_backup"'
            );
            
            if (!settings.length || settings[0].value !== 'true') {
              return NextResponse.json({ needsBackup: false });
            }

            // Get the last backup time
            const [lastBackup] = await pool.query<mysql.RowDataPacket[]>(
              'SELECT value FROM settings WHERE setting_key = "last_backup_time"'
            );

            if (!lastBackup.length) {
              return NextResponse.json({ needsBackup: true });
            }

            const lastBackupTime = new Date(lastBackup[0].value);
            const now = new Date();
            const hoursSinceLastBackup = (now.getTime() - lastBackupTime.getTime()) / (1000 * 60 * 60);

            // If it's been more than 24 hours since the last backup
            return NextResponse.json({ needsBackup: hoursSinceLastBackup >= 24 });
          } else if (config.type === 'mongodb') {
            const db = connection.connection as Db;
            const settings = await db.collection('settings').findOne({ setting_key: 'auto_backup' });
            
            if (!settings || settings.value !== 'true') {
              return NextResponse.json({ needsBackup: false });
            }

            // Get the last backup time
            const lastBackup = await db.collection('settings').findOne({ setting_key: 'last_backup_time' });

            if (!lastBackup) {
              return NextResponse.json({ needsBackup: true });
            }

            const lastBackupTime = new Date(lastBackup.value);
            const now = new Date();
            const hoursSinceLastBackup = (now.getTime() - lastBackupTime.getTime()) / (1000 * 60 * 60);

            // If it's been more than 24 hours since the last backup
            return NextResponse.json({ needsBackup: hoursSinceLastBackup >= 24 });
          } else if (config.type === 'postgresql') {
            const pool = connection.connection as Pool;
            const settingsResult = await pool.query(
              'SELECT value FROM settings WHERE setting_key = $1',
              ['auto_backup']
            );
            
            if (!settingsResult.rows.length || settingsResult.rows[0].value !== 'true') {
              return NextResponse.json({ needsBackup: false });
            }

            // Get the last backup time
            const lastBackupResult = await pool.query(
              'SELECT value FROM settings WHERE setting_key = $1',
              ['last_backup_time']
            );

            if (!lastBackupResult.rows.length) {
              return NextResponse.json({ needsBackup: true });
            }

            const lastBackupTime = new Date(lastBackupResult.rows[0].value);
            const now = new Date();
            const hoursSinceLastBackup = (now.getTime() - lastBackupTime.getTime()) / (1000 * 60 * 60);

            // If it's been more than 24 hours since the last backup
            return NextResponse.json({ needsBackup: hoursSinceLastBackup >= 24 });
          }
        } catch (error) {
          console.error('Error checking backup status:', error);
          return NextResponse.json({ error: 'Failed to check backup status' }, { status: 500 });
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST request received');
    
    // Check for database configuration in headers
    const userConfig = request.headers.get('x-user-db-config');
    console.log('User config header:', userConfig ? 'Present' : 'Missing');
    
    await ensureInitialized(request);
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    console.log('Action:', action);

    const config = await getDatabaseConfig(request);
    const connection = await dbService.connect(config);

    switch (action) {
      case 'run-sql':
        console.log('Executing SQL query...');
        const { sql } = await request.json();
        
        if (!sql) {
          return NextResponse.json({ error: 'SQL query is required' }, { status: 400 });
        }

        console.log('SQL Query to execute:', sql);

        try {
          if (config.type === 'mysql') {
            const pool = connection.connection as mysql.Pool;
            const [result] = await pool.query(sql);
            console.log('SQL execution result:', result);
            return NextResponse.json({ 
              success: true, 
              result,
              message: 'SQL query executed successfully'
            });
          } else if (config.type === 'mongodb') {
            // For MongoDB, we would need to parse and execute the SQL-like query
            // This is a simplified implementation
            return NextResponse.json({ 
              error: 'SQL execution not yet implemented for MongoDB',
              message: 'Please use MySQL or PostgreSQL for SQL queries'
            }, { status: 400 });
          } else if (config.type === 'postgresql') {
            const pool = connection.connection;
            const result = await pool.query(sql);
            console.log('SQL execution result:', result);
            return NextResponse.json({ 
              success: true, 
              result: result.rows,
              message: 'SQL query executed successfully'
            });
          }
        } catch (error) {
          console.error('SQL execution error:', error);
          return NextResponse.json({ 
            error: 'SQL execution failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }

      case 'update-product': {
        const body = await request.json();
        const { id, ...updateFields } = body;

        if (!id) {
          return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          const [result] = await pool.query('UPDATE products SET ? WHERE id = ?', [updateFields, id]);
          return NextResponse.json({ success: true, result });
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json({ error: 'No user' }, { status: 400 });
          const setDoc: Record<string, any> = {};
          for (const [k, v] of Object.entries(updateFields)) {
            setDoc[`data.products.$[p].${k}`] = v;
          }
          const result = await db.collection('users').updateOne(
            { userId },
            { $set: setDoc },
            { arrayFilters: [{ 'p.id': id }] }
          );
          return NextResponse.json({ success: true, result });
        } else if (config.type === 'postgresql') {
          return NextResponse.json({ error: 'PostgreSQL update not implemented' }, { status: 400 });
        }
        break;
      }

      case 'settings': {
        console.log('Creating/Updating setting...');
        const settingData = await request.json();
        
        if (!settingData.setting_key) {
          return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
        }

        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          
          // Check if setting exists
          const [existing] = await pool.query<mysql.RowDataPacket[]>(
            'SELECT id FROM settings WHERE setting_key = ?',
            [settingData.setting_key]
          );

          if (existing.length > 0) {
            // Update existing setting
            await pool.query(
              'UPDATE settings SET value = ?, type = ?, description = ?, isEncrypted = ?, updatedAt = NOW() WHERE setting_key = ?',
              [settingData.value, settingData.type, settingData.description, settingData.isEncrypted || false, settingData.setting_key]
            );
          } else {
            // Create new setting
            const settingId = crypto.randomUUID();
            await pool.query(
              'INSERT INTO settings (id, setting_key, value, type, description, isEncrypted, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
              [settingId, settingData.setting_key, settingData.value, settingData.type, settingData.description, settingData.isEncrypted || false]
            );
          }

          // Return the setting
          const [result] = await pool.query<mysql.RowDataPacket[]>(
            'SELECT * FROM settings WHERE setting_key = ?',
            [settingData.setting_key]
          );
          
          return NextResponse.json(result[0] || null);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json({ error: 'No user' }, { status: 400 });
          const key = settingData.setting_key;
          const setting = {
            ...settingData,
            id: settingData.id || crypto.randomUUID(),
            updatedAt: new Date().toISOString()
          };
          await db.collection('users').updateOne(
            { userId },
            { $set: { [`data.settings.${key}`]: setting } }
          );
          const user = await db.collection('users').findOne({ userId }, { projection: { [`data.settings.${key}`]: 1 } });
          return NextResponse.json(user?.data?.settings?.[key] || setting);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          
          // Check if setting exists
          const existingResult = await pool.query(
            'SELECT id FROM settings WHERE setting_key = $1',
            [settingData.setting_key]
          );

          if (existingResult.rows.length > 0) {
            // Update existing setting
            await pool.query(
              'UPDATE settings SET value = $1, type = $2, description = $3, is_encrypted = $4, updated_at = NOW() WHERE setting_key = $5',
              [settingData.value, settingData.type, settingData.description, settingData.isEncrypted || false, settingData.setting_key]
            );
          } else {
            // Create new setting
            const settingId = crypto.randomUUID();
            await pool.query(
              'INSERT INTO settings (id, setting_key, value, type, description, is_encrypted, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
              [settingId, settingData.setting_key, settingData.value, settingData.type, settingData.description, settingData.isEncrypted || false]
            );
          }

          // Return the setting
          const result = await pool.query(
            'SELECT * FROM settings WHERE setting_key = $1',
            [settingData.setting_key]
          );
          
          return NextResponse.json(result.rows[0]);
        }
        break;
      }

      case 'update-setting': {
        console.log('Updating setting...');
        const settingData = await request.json();
        
        if (!settingData.setting_key) {
          return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
        }

        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          
          await pool.query(
            'UPDATE settings SET value = ?, type = ?, description = ?, isEncrypted = ?, updatedAt = NOW() WHERE setting_key = ?',
            [settingData.value, settingData.type, settingData.description, settingData.isEncrypted || false, settingData.setting_key]
          );

          // Return the updated setting
          const [result] = await pool.query<mysql.RowDataPacket[]>(
            'SELECT * FROM settings WHERE setting_key = ?',
            [settingData.setting_key]
          );
          
          return NextResponse.json(result[0] || null);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json({ error: 'No user' }, { status: 400 });
          const key = settingData.setting_key;
          const update = {
            ...settingData,
            updatedAt: new Date().toISOString()
          };
          const result = await db.collection('users').findOneAndUpdate(
            { userId },
            { $set: { [`data.settings.${key}`]: update } },
            { returnDocument: 'after' }
          );
          const value = result.value?.data?.settings?.[key] || null;
          return NextResponse.json(value);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          
          await pool.query(
            'UPDATE settings SET value = $1, type = $2, description = $3, is_encrypted = $4, updated_at = NOW() WHERE setting_key = $5',
            [settingData.value, settingData.type, settingData.description, settingData.isEncrypted || false, settingData.setting_key]
          );

          // Return the updated setting
          const result = await pool.query(
            'SELECT * FROM settings WHERE setting_key = $1',
            [settingData.setting_key]
          );
          
          return NextResponse.json(result.rows[0]);
        }
        break;
      }

      case 'delete-setting': {
        console.log('Deleting setting...');
        const { setting_key } = await request.json();
        
        if (!setting_key) {
          return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
        }

        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          await pool.query('DELETE FROM settings WHERE setting_key = ?', [setting_key]);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json({ error: 'No user' }, { status: 400 });
          await db.collection('users').updateOne(
            { userId },
            { $unset: { [`data.settings.${setting_key}`]: '' } }
          );
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          await pool.query('DELETE FROM settings WHERE setting_key = $1', [setting_key]);
        }
        
        return NextResponse.json({ success: true });
      }

      case 'products': {
        console.log('Creating product...');
        const productData = await request.json();
        
        if (!productData.name) {
          return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
        }

        const productId = crypto.randomUUID();
        const now = formatDateForMySQL(new Date());
        
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          await pool.query(
            'INSERT INTO products (id, name, description, category, price, stock, minStock, supplier, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [productId, productData.name, productData.description || '', productData.category || '', productData.price || 0, productData.stock || 0, productData.minStock || 0, productData.supplier || '', now, now]
          );
          
          const [result] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [productId]);
          return NextResponse.json(result[0]);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json({ error: 'No user' }, { status: 400 });
          const product = {
            id: productId,
            userId: userId,
            ...productData,
            createdAt: now,
            updatedAt: now
          };
          await db.collection('users').updateOne(
            { userId },
            { $push: { 'data.products': product } }
          );
          return NextResponse.json(product);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          await pool.query(
            'INSERT INTO products (id, name, description, category, price, stock, min_stock, supplier, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [productId, productData.name, productData.description || '', productData.category || '', productData.price || 0, productData.stock || 0, productData.minStock || 0, productData.supplier || '', now, now]
          );
          
          const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
          return NextResponse.json(result.rows[0]);
        }
        break;
      }

      case 'sale': {
        console.log('Creating sale...');
        const saleData = await request.json();
        
        if (!saleData.productId || !saleData.quantity) {
          return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
        }

        const saleId = crypto.randomUUID();
        const now = formatDateForMySQL(new Date());
        
        if (config.type === 'mysql') {
          const pool = connection.connection as mysql.Pool;
          await pool.query(
            'INSERT INTO sales (id, productId, productName, quantity, price, total, date, customer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [saleId, saleData.productId, saleData.productName || '', saleData.quantity, saleData.price || 0, saleData.total || 0, saleData.date || now, saleData.customer || '']
          );
          
          const [result] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM sales WHERE id = ?', [saleId]);
          return NextResponse.json(result[0]);
        } else if (config.type === 'mongodb') {
          const db = connection.connection;
          const userId = getUserIdFromRequest(request);
          if (!userId) return NextResponse.json({ error: 'No user' }, { status: 400 });
          const sale = {
            id: saleId,
            userId: userId,
            ...saleData,
            date: saleData.date || now
          };
          await db.collection('users').updateOne(
            { userId },
            { $push: { 'data.sales': sale } }
          );
          return NextResponse.json(sale);
        } else if (config.type === 'postgresql') {
          const pool = connection.connection;
          await pool.query(
            'INSERT INTO sales (id, "productId", "productName", quantity, price, total, date, customer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [saleId, saleData.productId, saleData.productName || '', saleData.quantity, saleData.price || 0, saleData.total || 0, saleData.date || now, saleData.customer || '']
          );
          
          const result = await pool.query('SELECT * FROM sales WHERE id = $1', [saleId]);
          return NextResponse.json(result.rows[0]);
        }
        break;
      }
      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          message: 'POST operations are under development',
          action: action 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 