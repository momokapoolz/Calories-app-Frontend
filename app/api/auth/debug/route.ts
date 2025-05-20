import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Debug route to check server environment and connection status
 * This should only be enabled in development environments
 */
export async function GET(request: Request) {
  // Make sure this is only available in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug route not available in production' },
      { status: 403 }
    );
  }
  
  try {
    // Try to connect to the API server
    const healthCheckUrl = `${API_URL}/health`;
    console.log(`Attempting to connect to API at ${healthCheckUrl}`);
    
    let apiStatus = 'unknown';
    let apiResponse = null;
    
    try {
      const apiCheck = await fetch(healthCheckUrl, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        // Set a short timeout
        signal: AbortSignal.timeout(5000),
      });
      
      apiStatus = apiCheck.ok ? 'online' : 'error';
      apiResponse = await apiCheck.text();
    } catch (error) {
      apiStatus = 'offline';
      apiResponse = (error as Error).message;
    }
    
    // Return debug information
    return NextResponse.json({
      serverEnvironment: {
        nodeEnv: process.env.NODE_ENV,
        apiUrl: API_URL,
        nextVersion: process.env.NEXT_RUNTIME || 'unknown',
      },
      apiConnection: {
        status: apiStatus,
        response: apiResponse,
      },
      requestInfo: {
        cookies: request.headers.get('cookie') || 'none',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { 
        message: 'Error in debug endpoint', 
        error: (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
} 