import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Check authentication status
 */
export async function GET(request: Request) {
  try {
    // Get cookie header from the request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const response = await axios.get(`${API_URL}/auth/status`, {
      headers: {
        'Accept': 'application/json',
        'Cookie': cookieHeader,
      },
    });
    
    // Forward the response
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Auth status API error:', error);
    
    // Handle axios error responses
    if (error.response) {
      return NextResponse.json(
        error.response.data || { message: 'Auth server error' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { message: 'Auth server error', error: error.message },
      { status: 500 }
    );
  }
}