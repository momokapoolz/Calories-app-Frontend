import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Handle logout requests
 */
export async function POST(request: Request) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization') || '';
    
    // Get cookie header from the request for cookie-based auth
    const cookieHeader = request.headers.get('cookie') || '';
    
    console.log('[Logout] Sending request to API with:', {
      url: `${API_URL}/logout`,
      auth: authHeader ? 'Bearer token present' : 'No auth token',
      cookies: cookieHeader ? 'Cookies present' : 'No cookies'
    });

    // Prepare headers for axios request
    const headers: any = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    
    // Forward the request to the actual API using axios
    const response = await axios.post(`${API_URL}/logout`, {}, {
      headers,
      withCredentials: true, // Include credentials for cookie-based auth
    });
    
    console.log('[Logout] API Response:', response.status, response.data);
    
    const nextResponse = NextResponse.json(response.data, { status: response.status });    
    // Clear any auth cookies
    nextResponse.headers.append('Set-Cookie', 'jwt-id=; Path=/; Max-Age=0; HttpOnly');
    nextResponse.headers.append('Set-Cookie', 'refresh-id=; Path=/; Max-Age=0; HttpOnly');
    
    return nextResponse;
  } catch (error: any) {
    console.error('Logout API error:', error);
    
    // Handle axios error responses
    let errorResponse;
    if (error.response) {
      errorResponse = NextResponse.json(
        error.response.data || { message: 'Logout failed' },
        { status: error.response.status }
      );
    } else {
      errorResponse = NextResponse.json(
        { message: 'Logout failed', error: error.message },
        { status: 500 }
      );
    }
    
    // Clear cookies even if API call fails
    errorResponse.headers.append('Set-Cookie', 'jwt-id=; Path=/; Max-Age=0; HttpOnly');
    errorResponse.headers.append('Set-Cookie', 'refresh-id=; Path=/; Max-Age=0; HttpOnly');
    
    return errorResponse;
  }
}