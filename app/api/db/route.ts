import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { Product, Sale } from '@/lib/types';
import { getPool } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

// Configure the route to be dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Prakash@24',
  database: process.env.DB_NAME || 'ai_inventory',
};

// Helper function to format date for MySQL
function formatDateForMySQL(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Create connection pool without database
let pool: mysql.Pool;

async function getPool() {
  if (!pool) {
    try {
      console.log('Creating new database pool...');
      pool = mysql.createPool({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });
      
      // Test the connection
      const connection = await pool.getConnection();
      console.log('Database connection successful');
      connection.release();
    } catch (error) {
      console.error('Error creating database pool:', error);
      throw error;
    }
  }
  return pool;
}

// Initialize database and tables
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    const pool = await getPool();
    
    // Create database if not exists
    console.log('Creating database if not exists...');
    await pool.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    
    // Switch to the database
    console.log('Switching to database...');
    await pool.query(`USE ${dbConfig.database}`);

    // Create tables if they don't exist
    console.log('Creating tables if they don\'t exist...');
    const tables = [
      `CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(100),
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL,
        minStock INT NOT NULL,
        supplier VARCHAR(255),
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(36) PRIMARY KEY,
        productId VARCHAR(36) NOT NULL,
        productName VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        date DATETIME NOT NULL,
        customer VARCHAR(255),
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL UNIQUE,
        value TEXT,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        isEncrypted BOOLEAN DEFAULT false,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )`
    ];

    for (const table of tables) {
      await pool.query(table);
    }

    // Check if products table is empty
    console.log('Checking for existing data...');
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as count FROM products');
    
    if (rows[0].count === 0) {
      console.log('No existing data found. Inserting dummy data...');
      await insertDummyData();
    } else {
      console.log('Database already contains data. Skipping dummy data insertion.');
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

async function ensureInitialized() {
  if (!isInitialized) {
    if (!initializationPromise) {
      initializationPromise = initializeDatabase().then(() => {
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

async function insertDummyData() {
  try {
    console.log('Starting dummy data insertion...');
    const pool = await getPool();
    const now = formatDateForMySQL(new Date());
    
    // Clear existing data first
    console.log('Clearing existing data...');
    await pool.query('DELETE FROM sales');
    await pool.query('DELETE FROM products');
    
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
    for (const product of dummyProducts) {
      try {
        console.log(`Inserting product: ${product.name} (ID: ${product.id})`);
        await pool.query(
          'INSERT INTO products (id, name, description, category, price, stock, minStock, supplier, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
    for (const sale of dummySales) {
      try {
        console.log(`Inserting sale for product: ${sale.productName}`);
        await pool.query(
          'INSERT INTO sales (id, productId, productName, quantity, price, total, date, customer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [sale.id, sale.productId, sale.productName, sale.quantity, sale.price, sale.total, sale.date, sale.customer]
        );
        console.log(`Successfully inserted sale for product: ${sale.productName}`);
      } catch (error) {
        console.error(`Error inserting sale for product ${sale.productName}:`, error);
        throw error;
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
    await ensureInitialized();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    console.log('Action:', action);

    const pool = await getPool();
    await pool.query(`USE ${dbConfig.database}`);

    switch (action) {
      case 'stats':
        console.log('Calculating dashboard stats...');
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

      case 'sales-by-period':
        console.log('Fetching sales by period...');
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

      case 'low-stock':
        console.log('Fetching low stock products...');
        const [lowStockProducts] = await pool.query<mysql.RowDataPacket[]>(`
          SELECT * FROM products 
          WHERE stock <= minStock 
          ORDER BY (stock / minStock) ASC
        `);
        console.log(`Found ${lowStockProducts.length} low stock products`);
        return NextResponse.json(lowStockProducts);

      case 'top-products':
        console.log('Fetching top products...');
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

      case 'recent-sales':
        console.log('Fetching recent sales...');
        const [recentSales] = await pool.query<mysql.RowDataPacket[]>(`
          SELECT * FROM sales 
          ORDER BY date DESC 
          LIMIT 5
        `);
        console.log(`Found ${recentSales.length} recent sales`);
        return NextResponse.json(recentSales);

      case 'products':
        console.log('Fetching products...');
        const [products] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM products');
        console.log(`Found ${products.length} products`);
        return NextResponse.json(products);

      case 'sales':
        console.log('Fetching sales...');
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

      case 'product':
        const id = searchParams.get('id');
        if (!id) {
          return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }
        console.log('Fetching product:', id);
        const [product] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
        return NextResponse.json(product[0] || null);

      case 'settings':
        console.log('Fetching all settings...');
        const [settings] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM settings');
        console.log(`Found ${settings.length} settings`);
        return NextResponse.json(settings);

      case 'setting':
        const settingKey = searchParams.get('key');
        if (!settingKey) {
          return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
        }
        console.log('Fetching setting:', settingKey);
        const [setting] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM settings WHERE setting_key = ?', [settingKey]);
        return NextResponse.json(setting[0] || null);

      case 'export-database':
        console.log('Exporting database...');
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

      case 'import-inventory':
        console.log('Importing inventory data...');
        const { data: inventoryData } = await request.json();
        
        // Start a transaction
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

      case 'import-sales':
        console.log('Importing sales data...');
        const { data: salesData } = await request.json();
        
        // Start a transaction
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

      case 'check-backup-status':
        try {
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
    await ensureInitialized();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    console.log('Action:', action);

    const pool = await getPool();
    await pool.query(`USE ${dbConfig.database}`);
    const body = await request.json();

    switch (action) {
      case 'products':
        const productId = crypto.randomUUID();
        const now = formatDateForMySQL(new Date());
        console.log('Creating product:', body);
        await pool.query(
          'INSERT INTO products (id, name, description, category, price, stock, minStock, supplier, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [productId, body.name, body.description, body.category, body.price, body.stock, body.minStock, body.supplier, now, now]
        );
        return NextResponse.json({ ...body, id: productId, createdAt: now, updatedAt: now });

      case 'update-product':
        console.log('Updating product:', body);
        const updateNow = formatDateForMySQL(new Date());
        await pool.query(
          'UPDATE products SET name = ?, description = ?, category = ?, price = ?, stock = ?, minStock = ?, supplier = ?, updatedAt = ? WHERE id = ?',
          [body.name, body.description, body.category, body.price, body.stock, body.minStock, body.supplier, updateNow, body.id]
        );
        return NextResponse.json({ ...body, updatedAt: updateNow });

      case 'delete-product':
        console.log('Deleting product:', body.productId);
        await pool.query('DELETE FROM products WHERE id = ?', [body.productId]);
        return NextResponse.json({ success: true });

      case 'sale':
        const saleId = crypto.randomUUID();
        console.log('Creating sale:', body);
        await pool.query(
          'INSERT INTO sales (id, productId, productName, quantity, price, total, date, customer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            saleId,
            body.productId,
            body.productName,
            Number(body.quantity),
            Number(body.price),
            Number(body.total),
            formatDateForMySQL(body.date),
            body.customer || ""
          ]
        );
        return NextResponse.json({ ...body, id: saleId });

      case 'update-stock':
        const { productId: stockProductId, newStock } = body;
        if (!stockProductId || typeof newStock !== 'number') {
          return NextResponse.json({ error: 'Invalid product ID or stock value' }, { status: 400 });
        }
        console.log('Updating product stock:', stockProductId, newStock);
        await pool.query(
          'UPDATE products SET stock = ? WHERE id = ?',
          [newStock, stockProductId]
        );
        return NextResponse.json({ success: true });

      case 'settings':
        const settingId = crypto.randomUUID();
        const settingNow = formatDateForMySQL(new Date());
        console.log('Creating setting:', body);
        
        // Check if setting already exists
        const [existingSetting] = await pool.query<mysql.RowDataPacket[]>(
          'SELECT * FROM settings WHERE setting_key = ?',
          [body.setting_key]
        );

        if (existingSetting.length > 0) {
          // Update existing setting
          await pool.query(
            'UPDATE settings SET value = ?, type = ?, description = ?, isEncrypted = ?, updatedAt = ? WHERE setting_key = ?',
            [body.value, body.type, body.description, body.isEncrypted || false, settingNow, body.setting_key]
          );
          return NextResponse.json({ ...body, id: existingSetting[0].id, updatedAt: settingNow });
        } else {
          // Create new setting
          await pool.query(
            'INSERT INTO settings (id, setting_key, value, type, description, isEncrypted, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [settingId, body.setting_key, body.value, body.type, body.description, body.isEncrypted || false, settingNow, settingNow]
          );
          return NextResponse.json({ ...body, id: settingId, createdAt: settingNow, updatedAt: settingNow });
        }

      case 'update-setting':
        console.log('Updating setting:', body);
        const updateSettingNow = formatDateForMySQL(new Date());
        
        // Check if setting exists
        const [settingToUpdate] = await pool.query<mysql.RowDataPacket[]>(
          'SELECT * FROM settings WHERE setting_key = ?',
          [body.setting_key]
        );

        if (settingToUpdate.length === 0) {
          // Create new setting if it doesn't exist
          const newSettingId = crypto.randomUUID();
          await pool.query(
            'INSERT INTO settings (id, setting_key, value, type, description, isEncrypted, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newSettingId, body.setting_key, body.value, body.type, body.description, body.isEncrypted || false, updateSettingNow, updateSettingNow]
          );
          return NextResponse.json({ ...body, id: newSettingId, createdAt: updateSettingNow, updatedAt: updateSettingNow });
        } else {
          // Update existing setting
          await pool.query(
            'UPDATE settings SET value = ?, type = ?, description = ?, isEncrypted = ?, updatedAt = ? WHERE setting_key = ?',
            [body.value, body.type, body.description, body.isEncrypted || false, updateSettingNow, body.setting_key]
          );
          return NextResponse.json({ ...body, id: settingToUpdate[0].id, updatedAt: updateSettingNow });
        }

      case 'delete-setting':
        console.log('Deleting setting:', body.setting_key);
        await pool.query('DELETE FROM settings WHERE setting_key = ?', [body.setting_key]);
        return NextResponse.json({ success: true });

      case 'import-database':
        console.log('Importing database...');
        const { products, sales, settings } = body;

        // Start a transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
          // Clear existing data
          await connection.query('DELETE FROM sales');
          await connection.query('DELETE FROM products');
          await connection.query('DELETE FROM settings');

          // Import products
          if (Array.isArray(products)) {
            for (const product of products) {
              await connection.query(
                'INSERT INTO products (id, name, description, category, price, stock, minStock, supplier, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [product.id, product.name, product.description, product.category, product.price, product.stock, product.minStock, product.supplier, product.createdAt, product.updatedAt]
              );
            }
          }

          // Import sales
          if (Array.isArray(sales)) {
            for (const sale of sales) {
              await connection.query(
                'INSERT INTO sales (id, productId, productName, quantity, price, total, date, customer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [sale.id, sale.productId, sale.productName, sale.quantity, sale.price, sale.total, sale.date, sale.customer]
              );
            }
          }

          // Import settings
          if (Array.isArray(settings)) {
            for (const setting of settings) {
              await connection.query(
                'INSERT INTO settings (id, setting_key, value, type, description, isEncrypted, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [setting.id, setting.setting_key, setting.value, setting.type, setting.description, setting.isEncrypted, setting.createdAt, setting.updatedAt]
              );
            }
          }

          // Commit the transaction
          await connection.commit();
          return NextResponse.json({ success: true, message: 'Database imported successfully' });
        } catch (error) {
          // Rollback in case of error
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }

      case 'save-backup':
        try {
          const formData = await request.formData();
          const backup = formData.get('backup') as File;
          const location = formData.get('location') as string;

          if (!backup || !location) {
            console.error('Missing backup file or location:', { backup: !!backup, location });
            return new NextResponse(JSON.stringify({ 
              error: 'Missing backup file or location' 
            }), { 
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          // Validate backup location
          if (!location.startsWith('/') && !location.match(/^[A-Za-z]:/)) {
            console.error('Invalid backup location:', location);
            return new NextResponse(JSON.stringify({ 
              error: 'Invalid backup location. Must be an absolute path.' 
            }), { 
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          try {
            // Ensure the backup directory exists
            await fs.mkdir(location, { recursive: true });
            console.log('Backup directory created/verified:', location);
          } catch (error) {
            console.error('Error creating backup directory:', error);
            return new NextResponse(JSON.stringify({ 
              error: 'Failed to create backup directory' 
            }), { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          try {
            // Save the backup file
            const buffer = Buffer.from(await backup.arrayBuffer());
            const backupPath = path.join(location, backup.name);
            await fs.writeFile(backupPath, buffer);
            console.log('Backup file saved:', backupPath);
          } catch (error) {
            console.error('Error saving backup file:', error);
            return new NextResponse(JSON.stringify({ 
              error: 'Failed to save backup file' 
            }), { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          try {
            // Update the last backup time in the database
            const pool = getPool();
            await pool.query(
              'INSERT INTO settings (setting_key, value, type, description, isEncrypted) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE value = ?',
              ['last_backup_time', new Date().toISOString(), 'string', 'Last automatic backup time', false, new Date().toISOString()]
            );
            console.log('Last backup time updated in database');
          } catch (error) {
            console.error('Error updating last backup time:', error);
            // Don't return error here as the backup was successful
          }

          try {
            // Clean up old backups based on retention period
            const pool = getPool();
            const [retentionSetting] = await pool.query<mysql.RowDataPacket[]>(
              'SELECT value FROM settings WHERE setting_key = "data_retention"'
            );
            
            if (retentionSetting.length) {
              const retentionDays = parseInt(retentionSetting[0].value);
              const files = await fs.readdir(location);
              const now = new Date();

              for (const file of files) {
                if (file.startsWith('database-backup-')) {
                  const filePath = path.join(location, file);
                  const stats = await fs.stat(filePath);
                  const fileAge = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

                  if (fileAge > retentionDays) {
                    await fs.unlink(filePath);
                    console.log('Deleted old backup:', filePath);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error cleaning up old backups:', error);
            // Don't return error here as the backup was successful
          }

          return new NextResponse(JSON.stringify({ 
            success: true, 
            message: 'Backup saved successfully',
            backupPath: path.join(location, backup.name)
          }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('Error in save-backup:', error);
          return new NextResponse(JSON.stringify({ 
            error: 'Failed to save backup',
            details: error instanceof Error ? error.message : 'Unknown error'
          }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
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