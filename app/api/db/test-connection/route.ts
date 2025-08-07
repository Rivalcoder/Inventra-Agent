import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/services/db';
import { DatabaseConfig } from '@/lib/types/database';

export async function POST(request: NextRequest) {
  try {
    // Check for user's database configuration in headers
    const userConfig = request.headers.get('x-user-db-config');
    if (!userConfig) {
      return NextResponse.json(
        { error: 'Authentication required. No database configuration provided.' },
        { status: 401 }
      );
    }

    const config: DatabaseConfig = await request.json();

    // Validate required fields
    if (!config.type || !config.host || !config.port || !config.database) {
      return NextResponse.json(
        { error: 'Missing required database configuration fields' },
        { status: 400 }
      );
    }

    // Test the connection
    const isConnected = await dbService.testConnection(config);

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: `Successfully connected to ${config.type.toUpperCase()} database`,
        database: {
          type: config.type,
          host: config.host,
          port: config.port,
          database: config.database
        }
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to connect to ${config.type.toUpperCase()} database` 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Database connection test error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown database connection error' 
      },
      { status: 500 }
    );
  }
}
