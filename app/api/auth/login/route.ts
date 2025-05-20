import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Handle login requests through server component to avoid client-side network issues
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forward the request to the actual API
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Get response data
    const data = await response.json();
    
    // Forward the response back to the client
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: 'API server error', error: (error as Error).message },
      { status: 500 }
    );
  }
} 