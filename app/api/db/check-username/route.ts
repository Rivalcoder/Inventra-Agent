import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { username, clusterUrl, database, dbType, skipCloudCheck } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Missing required fields: username' },
        { status: 400 }
      );
    }

    // For local signup (e.g., MySQL/PostgreSQL) or explicit bypass, do basic validation only
    const host = (clusterUrl || '').toString();
    const isAtlasLike = host.includes('mongodb.net') || host.startsWith('mongodb+srv://');
    const isLocalOrBypass = skipCloudCheck === true || (dbType && dbType !== 'mongodb') || (dbType === 'mongodb' && !isAtlasLike);
    if (isLocalOrBypass) {
      if (username.length < 3) {
        return NextResponse.json({ available: false, message: 'Username must be at least 3 characters long' });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json({ available: false, message: 'Username can only contain letters, numbers, and underscores' });
      }
      return NextResponse.json({ available: true, message: 'Username is available (local)' });
    }

    // Cloud path requires clusterUrl and database
    if (!clusterUrl || !database) {
      return NextResponse.json(
        { error: 'Missing required fields: clusterUrl, database' },
        { status: 400 }
      );
    }

    // Use environment variables for MongoDB Atlas connection
    const atlasUsername = process.env.DB_USERNAME; // inventra
    const atlasPassword = process.env.DB_PASSWORD; // inventra2006
    const atlasClusterUrl = process.env.DB_HOST || clusterUrl; // cluster0.jxiaye0.mongodb.net
    const atlasDatabase = process.env.MONGODB_DATABASE || database; // ai_inventory

    if (!atlasUsername || !atlasPassword) {
      console.error('Missing MongoDB Atlas credentials:', {
        hasUsername: !!atlasUsername,
        hasPassword: !!atlasPassword,
        envKeys: Object.keys(process.env).filter(key => key.includes('MONGODB'))
      });
      return NextResponse.json(
        { 
          available: false,
          message: 'MongoDB Atlas credentials not configured. Please set DB_USERNAME and DB_PASSWORD in your environment variables.'
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

      // Check if username exists in users collection
      const existingUser = await db.collection('users').findOne({ 
        $or: [
          { username: username },
          { email: username }
        ]
      });

      if (existingUser) {
        return NextResponse.json({
          available: false,
          message: 'Username already exists in the cluster'
        });
      }

      // Check if username is valid (basic validation)
      if (username.length < 3) {
        return NextResponse.json({
          available: false,
          message: 'Username must be at least 3 characters long'
        });
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json({
          available: false,
          message: 'Username can only contain letters, numbers, and underscores'
        });
      }

      return NextResponse.json({
        available: true,
        message: 'Username is available'
      });

    } finally {
      await client.close();
    }

  } catch (error) {
    console.error('Username check error:', error);
    
    return NextResponse.json(
      { 
        available: false,
        message: error instanceof Error ? error.message : 'Failed to check username availability'
      },
      { status: 500 }
    );
  }
}
