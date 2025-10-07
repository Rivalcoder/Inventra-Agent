import mysql from 'mysql2/promise';
import { MongoClient, Db } from 'mongodb';
import { Pool } from 'pg';
import { DatabaseType, DatabaseConfig } from '@/lib/types/database';

export interface DatabaseConnection {
  type: DatabaseType;
  connection: any;
  isConnected: boolean;
}

class DatabaseService {
  private connections: Map<string, DatabaseConnection> = new Map();
  private defaultConfig: DatabaseConfig | null = null;

  constructor() {
    this.loadDefaultConfig();
  }

  private loadDefaultConfig() {
    if (typeof window !== 'undefined') {
      // Client-side: load from localStorage
      const stored = localStorage.getItem('default_db_config');
      if (stored) {
        this.defaultConfig = JSON.parse(stored);
      }
      
      // Also check for user's database configuration
      const userDbConfig = localStorage.getItem('databaseConfig');
      if (userDbConfig) {
        this.defaultConfig = JSON.parse(userDbConfig);
      }
    } else {
      // Server-side: should not use default config - must be provided by user
      this.defaultConfig = null;
    }
  }

  setDefaultConfig(config: DatabaseConfig) {
    this.defaultConfig = config;
    if (typeof window !== 'undefined') {
      localStorage.setItem('default_db_config', JSON.stringify(config));
    }
  }

  getDefaultConfig(): DatabaseConfig | null {
    return this.defaultConfig;
  }

  // Method to get user-specific collection names
  getUserCollectionName(baseCollection: string, userId?: string): string {
    if (!userId) {
      // If no userId provided, try to get from current user data
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          userId = user.userId;
        }
      }
    }
    
    if (userId) {
      return `${baseCollection}_${userId}`;
    }
    
    // Fallback to base collection name if no userId
    return baseCollection;
  }

  // Method to check if user has database configuration
  hasUserConfig(): boolean {
    if (typeof window !== 'undefined') {
      const userDbConfig = localStorage.getItem('databaseConfig');
      return !!userDbConfig;
    }
    return false;
  }

  async connect(config: DatabaseConfig): Promise<DatabaseConnection> {
    const configKey = `${config.type}_${config.host}_${config.port}_${config.database}`;
    
    // Check if connection already exists
    if (this.connections.has(configKey)) {
      const existing = this.connections.get(configKey)!;
      if (existing.isConnected) {
        console.log(`Reusing existing connection for ${configKey}`);
        return existing;
      } else {
        console.log(`Removing stale connection for ${configKey}`);
        this.connections.delete(configKey);
      }
    }

    console.log(`Creating new connection for ${configKey}`);
    let connection: any;
    let isConnected = false;

    try {
      switch (config.type) {
        case 'mysql':
          connection = await this.connectMySQL(config);
          isConnected = true;
          break;
        case 'mongodb':
          connection = await this.connectMongoDB(config);
          isConnected = true;
          break;
        case 'postgresql':
          connection = await this.connectPostgreSQL(config);
          isConnected = true;
          break;
        default:
          throw new Error(`Unsupported database type: ${config.type}`);
      }

      const dbConnection: DatabaseConnection = {
        type: config.type,
        connection,
        isConnected
      };

      this.connections.set(configKey, dbConnection);
      console.log(`Successfully created connection for ${configKey}`);
      return dbConnection;

    } catch (error) {
      console.error(`Failed to connect to ${config.type}:`, error);
      throw error;
    }
  }

  private async connectMySQL(config: DatabaseConfig): Promise<mysql.Pool> {
    // Debug: Log incoming MySQL credentials (password masked)
    try {
      const maskedPassword = typeof config.password === 'string'
        ? (config.password.length > 0 ? `${config.password[0]}***(${config.password.length})` : '(empty)')
        : '(unset)';
      console.log('MySQL Config Debug:', {
        host: config.host,
        port: config.port,
        username: config.username,
        password: maskedPassword,
        database: config.database
      });
    } catch (e) {
      // ignore logging errors
    }

    // First, create a pool without specifying database to check if we can connect
    const initialPool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      waitForConnections: true,
      connectionLimit: config.options?.connectionLimit || 10,
      queueLimit: 0,
      charset: config.options?.charset || 'utf8mb4',
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    try {
      // Test initial connection
      const connection = await initialPool.getConnection();
      
      // Create database if it doesn't exist
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
      connection.release();
      
      // Close the initial pool
      await initialPool.end();
      
      // Now create the final pool with the database specified
      const pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: config.options?.connectionLimit || 10,
        queueLimit: 0,
        charset: config.options?.charset || 'utf8mb4',
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      // Test final connection
      const finalConnection = await pool.getConnection();
      finalConnection.release();
      
      return pool;
    } catch (error) {
      // Clean up initial pool if there was an error
      try {
        await initialPool.end();
      } catch (cleanupError) {
        console.error('Error cleaning up initial pool:', cleanupError);
      }
      throw error;
    }
  }

  private async connectMongoDB(config: DatabaseConfig): Promise<Db> {
    // Check for corrupted configurations
    if (config.host && (config.host.includes('gmail.com') || config.host.includes('yahoo.com') || config.host.includes('hotmail.com'))) {
      throw new Error(`Corrupted database configuration detected. Host contains invalid domain: ${config.host}. Please clear your configuration and try again.`);
    }
    
    // Check for corrupted password (contains email domains)
    if (config.password && (config.password.includes('gmail.com') || config.password.includes('yahoo.com') || config.password.includes('hotmail.com'))) {
      throw new Error(`Corrupted database configuration detected. Password contains invalid domain: ${config.password}. Please clear your configuration and try again.`);
    }
    
    // Debug: Log the configuration being used
    console.log('MongoDB Config Debug:', {
      host: config.host,
      username: config.username,
      password: config.password ? '***SET***' : 'NOT SET',
      database: config.database,
      port: config.port
    });
    
    // Handle MongoDB Atlas connection format and authSource for local auth
    let url: string;
    if (!config.username || !config.password) {
      url = `mongodb://${config.host}:${config.port}/${config.database}`;
    } else {
      // For MongoDB Atlas, use the proper connection string format
      if (config.host.includes('mongodb.net')) {
        // MongoDB Atlas connection string - ensure host doesn't already contain mongodb+srv
        const cleanHost = config.host.replace(/^mongodb\+srv:\/\//, '').replace(/^mongodb:\/\//, '');
        const encUser = encodeURIComponent(config.username);
        const encPass = encodeURIComponent(config.password);
        url = `mongodb+srv://${encUser}:${encPass}@${cleanHost}/${config.database}?retryWrites=true&w=majority`;
      } else {
        // Regular MongoDB connection string
        const encUser = encodeURIComponent(config.username);
        const encPass = encodeURIComponent(config.password);
        const params: string[] = [];
        // Respect explicit authSource if provided (common for local users created in 'admin')
        const authSource = config.options?.authSource || config.database;
        if (authSource) params.push(`authSource=${encodeURIComponent(authSource)}`);
        url = `mongodb://${encUser}:${encPass}@${config.host}:${config.port}/${config.database}${params.length ? `?${params.join('&')}` : ''}`;
      }
    }
    
    // Debug: Log the constructed URL (without password)
    console.log('MongoDB URL Debug:', url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    const isLocalHost = config.host.includes('localhost') || config.host.includes('127.0.0.1');
    const client = new MongoClient(url, {
      ssl: config.options?.ssl || config.host.includes('mongodb.net'), // Auto-enable SSL for Atlas
      serverSelectionTimeoutMS: 3000,
      directConnection: isLocalHost
    });

    try {
      await client.connect();
      return Object.assign(client.db(config.database), { client });
    } catch (error: any) {
      // Provide clearer guidance for local MongoDB not running
      if (isLocalHost && (error?.code === 'ECONNREFUSED' || /ECONNREFUSED|ServerSelectionError/i.test(String(error?.message)))) {
        throw new Error(`Unable to connect to local MongoDB at ${config.host}:${config.port}. Ensure MongoDB is installed and running (e.g., "mongod").`);
      }
      throw error;
    }
  }

  private async connectPostgreSQL(config: DatabaseConfig): Promise<Pool> {
    // First, try to connect to the default 'postgres' database to create our target database
    const initialPool = new Pool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: 'postgres', // Connect to default postgres database
      ssl: config.options?.ssl ? { rejectUnauthorized: false } : false,
      max: config.options?.connectionLimit || 10
    });

    try {
      // Test initial connection
      await initialPool.query('SELECT NOW()');
      
      // Create database if it doesn't exist
      await initialPool.query(`CREATE DATABASE "${config.database}"`);
      
      // Close the initial pool
      await initialPool.end();
      
      // Now create the final pool with the target database
      const pool = new Pool({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database,
        ssl: config.options?.ssl ? { rejectUnauthorized: false } : false,
        max: config.options?.connectionLimit || 10
      });

      // Test final connection
      await pool.query('SELECT NOW()');
      
      return pool;
    } catch (error) {
      // If database already exists or other error, try connecting directly
      try {
        await initialPool.end();
      } catch (cleanupError) {
        console.error('Error cleaning up initial pool:', cleanupError);
      }
      
      // Try connecting directly to the target database
      const pool = new Pool({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database,
        ssl: config.options?.ssl ? { rejectUnauthorized: false } : false,
        max: config.options?.connectionLimit || 10
      });

      // Test connection
      await pool.query('SELECT NOW()');
      
      return pool;
    }
  }

  async disconnect(config: DatabaseConfig): Promise<void> {
    const configKey = `${config.type}_${config.host}_${config.port}_${config.database}`;
    const connection = this.connections.get(configKey);

    if (connection && connection.isConnected) {
      console.log(`Disconnecting from ${configKey}`);
      try {
        switch (connection.type) {
          case 'mysql':
            // Check if connection is still active before trying to end it
            if (connection.connection && typeof connection.connection.end === 'function') {
              await connection.connection.end();
            }
            break;
          case 'mongodb':
            if (connection.connection && connection.connection.client) {
              await connection.connection.client.close();
            }
            break;
          case 'postgresql':
            if (connection.connection && typeof connection.connection.end === 'function') {
              await connection.connection.end();
            }
            break;
        }
        console.log(`Successfully disconnected from ${configKey}`);
      } catch (error) {
        console.error(`Error disconnecting from ${connection.type}:`, error);
      }

      connection.isConnected = false;
      this.connections.delete(configKey);
    } else {
      console.log(`No active connection found for ${configKey}`);
    }
  }

  async testConnection(config: DatabaseConfig): Promise<boolean> {
    try {
      const connection = await this.connect(config);
      await this.disconnect(config);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async initializeDatabase(config: DatabaseConfig): Promise<void> {
    const connection = await this.connect(config);

    try {
      switch (config.type) {
        case 'mysql':
          await this.initializeMySQL(connection.connection, config.database);
          break;
        case 'mongodb':
          await this.initializeMongoDB(connection.connection, config.database);
          break;
        case 'postgresql':
          await this.initializePostgreSQL(connection.connection, config.database);
          break;
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async initializeMySQL(pool: mysql.Pool, database: string): Promise<void> {
    // Database is already created and selected in connectMySQL method
    // Create tables
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
        value LONGTEXT,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        isEncrypted BOOLEAN DEFAULT FALSE,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )`
    ];

    for (const table of tables) {
      await pool.query(table);
    }

    // Add missing columns to existing settings table if they don't exist
    await this.migrateMySQLSettingsTable(pool);
  }

  private async migrateMySQLSettingsTable(pool: mysql.Pool): Promise<void> {
    try {
      // Check if description column exists
      const [columns] = await pool.query<mysql.RowDataPacket[]>(
        "SHOW COLUMNS FROM settings LIKE 'description'"
      );
      if (columns.length === 0) {
        await pool.query('ALTER TABLE settings ADD COLUMN description TEXT');
        console.log('Added description column to settings table');
      }

      // Check if isEncrypted column exists
      const [encryptedColumns] = await pool.query<mysql.RowDataPacket[]>(
        "SHOW COLUMNS FROM settings LIKE 'isEncrypted'"
      );
      if (encryptedColumns.length === 0) {
        await pool.query('ALTER TABLE settings ADD COLUMN isEncrypted BOOLEAN DEFAULT FALSE');
        console.log('Added isEncrypted column to settings table');
      }

      // Check if value column is TEXT and needs to be upgraded to LONGTEXT
      const [valueColumns] = await pool.query<mysql.RowDataPacket[]>(
        "SHOW COLUMNS FROM settings WHERE Field = 'value'"
      );
      if (valueColumns.length > 0 && valueColumns[0].Type === 'text') {
        await pool.query('ALTER TABLE settings MODIFY COLUMN value LONGTEXT');
        console.log('Upgraded value column from TEXT to LONGTEXT for large image data');
      }
    } catch (error) {
      console.error('Error migrating settings table:', error);
    }
  }

  private async initializeMongoDB(db: Db, database: string): Promise<void> {
    // Create collections if they don't exist
    const collections = ['products', 'sales', 'settings'];
    
    for (const collectionName of collections) {
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length === 0) {
        await db.createCollection(collectionName);
      }
    }

    // Create per-user indexes (compound where relevant)
    await db.collection('products').createIndex({ userId: 1, name: 1 }, { unique: true });
    await db.collection('products').createIndex({ userId: 1, id: 1 }, { unique: true });
    await db.collection('sales').createIndex({ userId: 1, productId: 1 });
    await db.collection('settings').createIndex({ setting_key: 1 }, { unique: true });
  }

  private async initializePostgreSQL(pool: Pool, database: string): Promise<void> {
    // Create tables
    const tables = [
      `CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(100),
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER NOT NULL,
        min_stock INTEGER NOT NULL,
        supplier VARCHAR(255),
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(36) PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        date TIMESTAMP NOT NULL,
        customer VARCHAR(255),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL UNIQUE,
        value TEXT,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        is_encrypted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )`
    ];

    for (const table of tables) {
      await pool.query(table);
    }

    // Add missing columns to existing settings table if they don't exist
    await this.migratePostgreSQLSettingsTable(pool);
  }

  private async migratePostgreSQLSettingsTable(pool: Pool): Promise<void> {
    try {
      // Check if description column exists
      const descriptionResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'description'
      `);
      if (descriptionResult.rows.length === 0) {
        await pool.query('ALTER TABLE settings ADD COLUMN description TEXT');
        console.log('Added description column to settings table');
      }

      // Check if is_encrypted column exists
      const encryptedResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'is_encrypted'
      `);
      if (encryptedResult.rows.length === 0) {
        await pool.query('ALTER TABLE settings ADD COLUMN is_encrypted BOOLEAN DEFAULT FALSE');
        console.log('Added is_encrypted column to settings table');
      }

      // Check if value column is VARCHAR and needs to be upgraded to TEXT
      const valueResult = await pool.query(`
        SELECT data_type, character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'value'
      `);
      if (valueResult.rows.length > 0 && valueResult.rows[0].data_type === 'character varying') {
        await pool.query('ALTER TABLE settings ALTER COLUMN value TYPE TEXT');
        console.log('Upgraded value column from VARCHAR to TEXT for large image data');
      }
    } catch (error) {
      console.error('Error migrating settings table:', error);
    }
  }

  getConnection(config: DatabaseConfig): DatabaseConnection | undefined {
    const configKey = `${config.type}_${config.host}_${config.port}_${config.database}`;
    return this.connections.get(configKey);
  }

  getAllConnections(): Map<string, DatabaseConnection> {
    return this.connections;
  }

  clearConnections(): void {
    this.connections.clear();
  }
}

// Create singleton instance
let dbServiceInstance: DatabaseService | null = null;

export const dbService = (() => {
  if (!dbServiceInstance) {
    dbServiceInstance = new DatabaseService();
  }
  return dbServiceInstance;
})();

// Legacy function for backward compatibility
export async function getPool(): Promise<mysql.Pool> {
  const defaultConfig = dbService.getDefaultConfig();
  if (!defaultConfig || defaultConfig.type !== 'mysql') {
    throw new Error('MySQL is not configured as default database');
  }
  
  const connection = await dbService.connect(defaultConfig);
  return connection.connection;
}
