import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, database, includeDummyData = true } = await request.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let finalUsername = (username || '').toString().trim();
    let finalEmail = (email || '').toString().trim();

    // Infer email if not provided: use username when it looks like an email, or password if it looks like an email
    if (!finalEmail) {
      if (emailRegex.test(finalUsername)) {
        finalEmail = finalUsername;
        // If username was actually an email, derive a username from the local part
        const local = finalUsername.split('@')[0];
        if (local) {
          finalUsername = local;
        }
      } else if (emailRegex.test((password || '').toString())) {
        finalEmail = (password as string).toString();
      }
    }

    const missing: string[] = [];
    if (!finalUsername) missing.push('username');
    if (!finalEmail) missing.push('email');
    if (!password) missing.push('password');
    if (!database) missing.push('database');
    if (missing.length) {
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Use environment variables for MongoDB Atlas connection
    const atlasUsername = process.env.DB_USERNAME; // inventra
    const atlasPassword = process.env.DB_PASSWORD; // inventra2006
    const atlasClusterUrl = process.env.DB_HOST; // cluster0.jxiaye0.mongodb.net
    const atlasDatabase = process.env.MONGODB_DATABASE || database; // ai_inventory

    if (!atlasUsername || !atlasPassword || !atlasClusterUrl) {
      console.error('Missing MongoDB Atlas credentials:', {
        hasUsername: !!atlasUsername,
        hasPassword: !!atlasPassword,
        hasClusterUrl: !!atlasClusterUrl,
        envKeys: Object.keys(process.env).filter(key => key.includes('MONGODB'))
      });
      return NextResponse.json(
        {
          success: false,
          message: 'MongoDB Atlas credentials not configured. Please set DB_USERNAME, DB_PASSWORD, and DB_HOST in your environment variables.'
        },
        { status: 500 }
      );
    }

    // Connect to MongoDB Atlas
    const uri = `mongodb+srv://${atlasUsername}:${atlasPassword}@${atlasClusterUrl}/${atlasDatabase}?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db(atlasDatabase);

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ 
        $or: [
          { username: finalUsername },
          { email: finalEmail }
        ]
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: 'User already exists in the cluster'
          },
          { status: 409 }
        );
      }

      // Create new user in the cluster
      const userId = `user_${finalUsername}_${Date.now()}`; // Unique user ID
      const newUser = {
        userId: userId,
        username: finalUsername,
        email: finalEmail,
        password: password, // In production, hash this password
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        data: {
          settings: {}
        },
        databaseConfig: {
          type: 'mongodb',
          host: atlasClusterUrl,
          port: 27017,
          username: username,
          password: password,
          database: database,
          userId: userId, // Add userId to config
          options: {
            ssl: true,
            connectionLimit: 50,
            charset: 'utf8',
          }
        }
      };

      await db.collection('users').insertOne(newUser);

      // Global users collection index only (single-document-per-user model)
      await db.collection('users').createIndex({ username: 1 }, { unique: true });
      await db.collection('users').createIndex({ userId: 1 }, { unique: true });

      // Insert dummy data if requested
      if (includeDummyData) {
        console.log('Inserting dummy data for new user...');
        
        // Sample products with userId
        const sampleProducts = [
          {
            id: '1',
            userId: userId,
            name: 'Laptop Pro',
            description: 'High-performance laptop for professionals',
            category: 'Electronics',
            price: 1299.99,
            stock: 25,
            minStock: 5,
            supplier: 'TechCorp',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            userId: userId,
            name: 'Wireless Mouse',
            description: 'Ergonomic wireless mouse with precision tracking',
            category: 'Accessories',
            price: 29.99,
            stock: 50,
            minStock: 10,
            supplier: 'AccessoryHub',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            userId: userId,
            name: 'USB-C Dock',
            description: 'Multi-port USB-C docking station',
            category: 'Accessories',
            price: 89.99,
            stock: 15,
            minStock: 3,
            supplier: 'ConnectPro',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '4',
            userId: userId,
            name: '4K Monitor',
            description: '27-inch 4K UHD monitor with HDR',
            category: 'Electronics',
            price: 399.99,
            stock: 12,
            minStock: 2,
            supplier: 'DisplayMax',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '5',
            userId: userId,
            name: 'Mechanical Keyboard',
            description: 'RGB mechanical keyboard with blue switches',
            category: 'Accessories',
            price: 149.99,
            stock: 20,
            minStock: 5,
            supplier: 'KeyMaster',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        // Sample sales data
        const sampleSales = [
          {
            id: '1',
            productId: '1',
            productName: 'Laptop Pro',
            quantity: 2,
            price: 1299.99,
            total: 2599.98,
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            saleDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '2',
            productId: '2',
            productName: 'Wireless Mouse',
            quantity: 5,
            price: 29.99,
            total: 149.95,
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            saleDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            createdAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: '3',
            productId: '3',
            productName: 'USB-C Dock',
            quantity: 1,
            price: 89.99,
            total: 89.99,
            customerName: 'Bob Johnson',
            customerEmail: 'bob@example.com',
            saleDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            createdAt: new Date(Date.now() - 259200000).toISOString()
          }
        ];

        // Sample settings (to be stored inside users.data.settings)
        const sampleSettings = [
          {
            setting_key: 'currency',
            value: 'USD',
            type: 'string',
            description: 'Default currency for the application',
            isEncrypted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            setting_key: 'low_stock_threshold',
            value: '10',
            type: 'number',
            description: 'Default low stock threshold',
            isEncrypted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            setting_key: 'company_name',
            value: 'AI Inventory System',
            type: 'string',
            description: 'Company name for reports and invoices',
            isEncrypted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        try {
          // Store settings inside the user document (single JSON per user)
          const settingsMap: Record<string, any> = {};
          for (const setting of sampleSettings) {
            settingsMap[setting.setting_key] = {
              ...setting,
              id: setting.setting_key
            };
          }
          await db.collection('users').updateOne(
            { userId },
            { $set: { 'data.settings': settingsMap } }
          );

          // Store products and sales arrays inside user document as single JSON per user
          await db.collection('users').updateOne(
            { userId },
            {
              $set: {
                'data.products': sampleProducts,
                'data.sales': sampleSales.map(s => ({ ...s, userId }))
              }
            }
          );

          console.log(`Dummy data inserted successfully for user: ${userId}`);
        } catch (error) {
          console.error('Error inserting dummy data:', error);
          // Don't fail the user creation if dummy data insertion fails
        }
      }

      return NextResponse.json({
        success: true,
        message: includeDummyData 
          ? 'User created successfully in the cluster with sample data' 
          : 'User created successfully in the cluster',
        clusterUrl: atlasClusterUrl,
        database: atlasDatabase,
        userId: userId,
        model: 'single-document-per-user'
      });

    } finally {
      await client.close();
    }

  } catch (error) {
    console.error('Cluster creation error:', error);

    let status = 500;
    let message = 'Failed to create user in cluster';
    if (error instanceof Error) {
      message = error.message;
      // Basic mapping for common Mongo/validation errors
      if (message.toLowerCase().includes('e11000') || message.toLowerCase().includes('duplicate')) {
        status = 409;
        message = 'Duplicate user detected. Please choose a different username or email.';
      }
    }

    return NextResponse.json(
      {
        success: false,
        message
      },
      { status }
    );
  }
}
