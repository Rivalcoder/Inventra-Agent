import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // This endpoint will help clear corrupted configurations
    // Since we can't directly access localStorage from server-side,
    // we'll return instructions for the client to clear it
    
    return NextResponse.json({
      success: true,
      message: 'Configuration clear instructions',
      instructions: {
        clearLocalStorage: [
          'databaseConfig',
          'default_db_config',
          'userData',
          'isAuthenticated',
          'authMode'
        ],
        redirectTo: '/auth/signup'
      }
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
