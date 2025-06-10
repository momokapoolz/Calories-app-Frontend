import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Get user profile information
 */
export async function GET(request: Request) {
  try {
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }    // Call the backend profile endpoint
    const response = await axios.get(`${API_URL}/profile`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
    });
    
    // Return the profile data from the backend
    return NextResponse.json(response.data, { status: 200 });
    
  } catch (error: any) {
    console.error('Profile API error:', error);
    
    // Handle axios error responses
    if (error.response) {
      return NextResponse.json(
        error.response.data || { error: 'Backend error' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
