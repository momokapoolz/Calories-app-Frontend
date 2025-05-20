import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Check authentication status
 */
export async function GET(request: Request) {
  try {
    // Get cookie header from the request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await fetch(`${API_URL}/auth/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': cookieHeader,
      },
    });
    
    // Get response data
    const data = await response.json();
    
    // Forward the response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Auth status API error:', error);
    return NextResponse.json(
      { message: 'Auth server error', error: (error as Error).message },
      { status: 500 }
    );
  }
} 