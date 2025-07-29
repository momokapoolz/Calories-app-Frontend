import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Handle registration requests through server component to avoid client-side network issues
 * POST /api/auth/register
 */
export async function POST(request: Request) {
  try {
    console.log('Register API route called');
    const body = await request.json();
    
    console.log('Attempting registration at:', `${API_URL}/register`);
    
    // Forward the request to the actual API using axios
    const response = await axios.post(`${API_URL}/register`, body, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('Registration response status:', response.status);
    
    // Forward the response back to the client
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Registration API error:', error);
    
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