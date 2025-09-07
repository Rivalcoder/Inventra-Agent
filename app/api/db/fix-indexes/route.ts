import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, CreateIndexesOptions } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Use environment variables for MongoDB Atlas connection
    const atlasUsername = process.env.DB_USERNAME;
    const atlasPassword = process.env.DB_PASSWORD;
    const atlasClusterUrl = process.env.DB_HOST;
    const atlasDatabase = process.env.MONGODB_DATABASE || 'ai_inventory';

    if (!atlasUsername || !atlasPassword || !atlasClusterUrl) {
      return NextResponse.json(
        { 
          success: false,
          message: 'MongoDB Atlas credentials not configured'
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

      const results = [];

      // Define the proper indexes for each collection
      const collectionIndexes: Record<string, Array<{ keys: Record<string, 1 | -1>; options?: CreateIndexesOptions & { name?: string; unique?: boolean } }>> = {
        products: [
          { keys: { userId: 1, name: 1 }, options: { unique: true, name: 'userId_name_unique' } }
        ],
        sales: [
          { keys: { userId: 1, productId: 1 }, options: { name: 'userId_productId' } },
          { keys: { userId: 1, date: -1 }, options: { name: 'userId_date_desc' } }
        ],
        settings: [
          { keys: { userId: 1, setting_key: 1 }, options: { unique: true, name: 'userId_setting_key_unique' } }
        ],
        customers: [
          { keys: { userId: 1, email: 1 }, options: { unique: true, name: 'userId_email_unique' } }
        ],
        suppliers: [
          { keys: { userId: 1, name: 1 }, options: { unique: true, name: 'userId_name_unique' } }
        ],
        categories: [
          { keys: { userId: 1, name: 1 }, options: { unique: true, name: 'userId_name_unique' } }
        ],
        users: [
          { keys: { username: 1 }, options: { unique: true, name: 'username_unique' } },
          { keys: { userId: 1 }, options: { unique: true, name: 'userId_unique' } }
        ]
      };

      // Fix indexes for each collection
      for (const [collectionName, indexes] of Object.entries(collectionIndexes)) {
        const collection = db.collection(collectionName);
        
        // Get existing indexes
        const existingIndexes = await collection.indexes();
        
        // Drop problematic indexes (those without userId for unique constraints)
        for (const index of existingIndexes) {
          const indexName = index.name;
          const indexKey = index.key;
          
          // Skip the default _id index
          if (indexName === '_id_') {
            continue;
          }
          
          // If the index has no name for some reason, skip it (TypeScript safety)
          if (!indexName) {
            continue;
          }

          // Check if this is a unique index that doesn't include userId
          if (index.unique && !indexKey.userId) {
            try {
              await collection.dropIndex(indexName);
              results.push(`Dropped problematic index: ${indexName} from ${collectionName}`);
            } catch (error: any) {
              results.push(`Error dropping index ${indexName} from ${collectionName}: ${error.message}`);
            }
          }
        }
        
        // Create new indexes with proper user isolation
        for (const indexDef of indexes) {
          const { keys, options } = indexDef;
          const indexOptions: CreateIndexesOptions = options ?? {};
          const indexName = (options?.name as string) || Object.keys(keys).map(k => `${k}_${(keys as any)[k]}`).join('_');
          
          try {
            await collection.createIndex(keys as any, indexOptions);
            results.push(`Created index: ${indexName} for ${collectionName}`);
          } catch (error: any) {
            if (error.code === 85) {
              results.push(`Index already exists: ${indexName} for ${collectionName}`);
            } else {
              results.push(`Error creating index ${indexName} for ${collectionName}: ${error.message}`);
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Indexes fixed successfully',
        results: results
      });

    } finally {
      await client.close();
    }

  } catch (error) {
    console.error('Index fix error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fix indexes',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
