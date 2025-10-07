import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Use environment variables for MongoDB Atlas connection
    const atlasUsername = process.env.DB_USERNAME;
    const atlasPassword = process.env.DB_PASSWORD;
    const atlasClusterUrl = process.env.DB_HOST;
    const atlasDatabase = process.env.MONGODB_DATABASE || 'ai_inventory';

    if (!atlasUsername || !atlasPassword || !atlasClusterUrl) {
      console.error('Missing MongoDB Atlas credentials');
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

      // Find user by email or username
      const user = await db.collection('users').findOne({ 
        $or: [
          { email: email },
          { username: email }
        ]
      });

      if (!user) {
        return NextResponse.json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify password (in production, use proper password hashing)
      if (user.password !== password) {
        return NextResponse.json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Update last login
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date().toISOString() } }
      );

      // Return user data with userId for collection access
      const userData = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: new Date().toISOString(),
        databaseConfig: user.databaseConfig
      };

      return NextResponse.json({
        success: true,
        user: userData
      });

    } finally {
      await client.close();
    }

  } catch (error) {
    console.error('MongoDB signin error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Authentication failed. Please try again.'
      },
      { status: 500 }
    );
  }
}
