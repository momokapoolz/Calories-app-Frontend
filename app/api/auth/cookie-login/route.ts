import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Handle cookie-based login requests through server component
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forward the request to the actual API using axios
    const response = await axios.post(`${API_URL}/auth/login`, body, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Create the response
    const nextResponse = NextResponse.json(response.data, { status: response.status });
    
    // Forward cookies to the client if they exist in the response
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      setCookieHeader.forEach(cookie => {
        nextResponse.headers.append('Set-Cookie', cookie);
      });
    }
    
    return nextResponse;
  } catch (error: any) {
    console.error('Cookie login API error:', error);
    
    // Handle axios error responses
    if (error.response) {
      return NextResponse.json(
        error.response.data || { message: 'API server error' },
        { status: error.response.status }
      );
    }
      return NextResponse.json(
      { message: 'API server error', error: error.message },
      { status: 500 }
    );
  }
}