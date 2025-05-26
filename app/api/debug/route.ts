import { NextResponse } from 'next/server';

// Your backend base URL is http://localhost:8080/api/v1
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface ConnectivityInfo {
  status: 'pending' | 'connected' | 'error' | 'failed';
  error: string | null;
  response: {
    status: number;
    statusText: string;
    headers: { [key: string]: string };
    body: string;
  } | null;
}

interface DebugInfo {
  api_url: string;
  environment: {
    NEXT_PUBLIC_API_URL: string;
    NODE_ENV: string | undefined;
  };
  connectivity: ConnectivityInfo;
  timestamp: string;
}

/**
 * Debug endpoint to check API configuration and connectivity
 */
export async function GET(request: Request) {
  console.log('Debug endpoint called at:', new Date().toISOString());
  console.log('API_URL:', API_URL);
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

  const debugInfo: DebugInfo = {
    api_url: API_URL,
    environment: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'not set',
      NODE_ENV: process.env.NODE_ENV,
    },
    connectivity: {
      status: 'pending',
      error: null,
      response: null
    },
    timestamp: new Date().toISOString()
  };

  try {
    // Since we don't have a /health endpoint in the API docs, let's try /login endpoint
    const testUrl = `${API_URL}/login`;
    console.log('Attempting to connect to API:', testUrl);
    
    // Test connection to API
    const testResponse = await fetch(testUrl, {
      method: 'OPTIONS', // Use OPTIONS to avoid actual login attempt
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    console.log('API test response status:', testResponse.status);
    // Consider any response (even 404) as a connection success, since it means the server is reachable
    debugInfo.connectivity.status = testResponse.status !== 0 ? 'connected' : 'error';
    
    try {
      const responseText = await testResponse.text();
      console.log('API test response:', responseText);
      
      debugInfo.connectivity.response = {
        status: testResponse.status,
        statusText: testResponse.statusText,
        headers: Object.fromEntries(testResponse.headers.entries()),
        body: responseText
      };
    } catch (parseError) {
      const error = parseError as Error;
      console.error('Error parsing API response:', error);
      debugInfo.connectivity.error = `Response parsing error: ${error.message}`;
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error connecting to API:', err);
    debugInfo.connectivity.status = 'failed';
    debugInfo.connectivity.error = err.message;
  }

  // Create response with CORS headers
  const response = NextResponse.json(debugInfo);
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
} 