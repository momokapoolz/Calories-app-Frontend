import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Check authentication status by calling the backend profile endpoint
 */
export async function GET(request: Request) {
  try {
    // Get both cookie and authorization headers
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization') || '';
    
    // Prepare headers for the backend request
    const headers: any = {
      'Accept': 'application/json',
    };
    
    // Add authorization header if present (JWT token)
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Add cookie header if present (for cookie-based auth)
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;    }    // Call the backend profile endpoint instead of auth/status
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers,
    });
    
    // Transform backend response to match frontend expectations
    const backendData = response.data;
    const userData = {
      id: backendData.user_id || backendData.id,
      name: backendData.name || backendData.email?.split('@')[0] || 'User',
      email: backendData.email
    };
    
    // Return in the format the frontend expects
    return NextResponse.json({
      authenticated: true,
      user: userData
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Auth status API error:', error);
    
    // Handle axios error responses
    if (error.response) {
      // If 401, return not authenticated
      if (error.response.status === 401) {
        return NextResponse.json({
          authenticated: false,
          message: 'Not authenticated'
        }, { status: 200 }); // Return 200 but with authenticated: false
      }
      
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