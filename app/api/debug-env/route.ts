import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      // MongoDB Atlas public variables
      NEXT_PUBLIC_MONGODB_CLUSTER_URL: process.env.NEXT_PUBLIC_MONGODB_CLUSTER_URL,
      NEXT_PUBLIC_MONGODB_DATABASE: process.env.NEXT_PUBLIC_MONGODB_DATABASE,
      
      // MongoDB Atlas private variables (using your env var names)
      DB_USERNAME: process.env.DB_USERNAME ? '***SET***' : 'NOT SET',
      DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : 'NOT SET',
      DB_HOST: process.env.DB_HOST,
      MONGODB_DATABASE: process.env.MONGODB_DATABASE,
      MONGODB_URI: process.env.MONGODB_URI ? '***SET***' : 'NOT SET',
      
      // All MongoDB related environment variables
      allMongoEnvVars: Object.keys(process.env).filter(key => key.includes('MONGODB')),
      
      // All environment variables (first 20)
      allEnvVars: Object.keys(process.env).slice(0, 20)
    };

    return NextResponse.json({
      success: true,
      message: 'Environment variables debug info',
      data: envVars
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}