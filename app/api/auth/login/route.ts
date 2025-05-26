import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Handle login requests through server component to avoid client-side network issues
 */
export async function POST(request: Request) {
  try {
    console.log('Login API route called');
    const body = await request.json();
    
    console.log('Attempting login at:', `${API_URL}/login`);
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
    console.log('Login response status:', response.status);
    
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