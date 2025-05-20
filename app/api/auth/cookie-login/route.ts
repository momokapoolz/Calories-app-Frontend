import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Handle cookie-based login requests through server component
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forward the request to the actual API
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Get response data
    const data = await response.json();
    
    // Extract cookies from the response
    const responseCookies = response.headers.getSetCookie();
    
    // Create the response
    const nextResponse = NextResponse.json(data, { status: response.status });
    
    // Forward cookies to the client
    responseCookies.forEach(cookie => {
      const [name, ...rest] = cookie.split('=');
      const value = rest.join('=');
      
      // Extract cookie value and attributes
      const cookieParts = value.split(';');
      const cookieValue = cookieParts[0];
      
      // Set cookie in the response headers directly
      nextResponse.headers.append('Set-Cookie', `${name}=${value}`);
    });
    
    return nextResponse;
  } catch (error) {
    console.error('Cookie login API error:', error);
    return NextResponse.json(
      { message: 'API server error', error: (error as Error).message },
      { status: 500 }
    );
  }
} 