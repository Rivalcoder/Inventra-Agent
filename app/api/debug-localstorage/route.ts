import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // This endpoint can't access localStorage directly since it's server-side
    // But we can check what the client is sending in headers
    const userConfig = request.headers.get('x-user-db-config');
    
    let parsedConfig = null;
    if (userConfig) {
      try {
        parsedConfig = JSON.parse(userConfig);
      } catch (error) {
        console.error('Error parsing user config:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'LocalStorage debug info',
      data: {
        hasUserConfig: !!userConfig,
        userConfig: parsedConfig,
        rawUserConfig: userConfig,
        allHeaders: Object.fromEntries(request.headers.entries())
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
