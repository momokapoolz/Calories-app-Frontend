import { NextResponse } from 'next/server';

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
      url: `${API_URL}/auth/logout`,
      auth: authHeader ? 'Bearer token present' : 'No auth token',
      cookies: cookieHeader ? 'Cookies present' : 'No cookies'
    });
    
    // Forward the request to the actual API
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Only include Authorization if it's not empty
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        // Only include Cookie if it's not empty
        ...(cookieHeader ? { 'Cookie': cookieHeader } : {})
      },
      // Include credentials for cookie-based auth
      credentials: 'include'
    });
    
    // Create the response with proper error handling
    let responseData;
    let responseStatus = response.status;
    
    try {
      responseData = await response.json();
      console.log('[Logout] API Response:', responseStatus, responseData);
    } catch (parseError) {
      console.error('[Logout] Failed to parse response:', parseError);
      responseData = { message: 'Logged out but received invalid response' };
    }
    
    const nextResponse = NextResponse.json(responseData, { status: responseStatus });
    
    // Clear any auth cookies
    nextResponse.headers.append('Set-Cookie', 'jwt-id=; Path=/; Max-Age=0; HttpOnly');
    nextResponse.headers.append('Set-Cookie', 'refresh-id=; Path=/; Max-Age=0; HttpOnly');
    
    return nextResponse;
  } catch (error) {
    console.error('Logout API error:', error);
    
    // Create error response but still clear cookies
    const errorResponse = NextResponse.json(
      { message: 'Logout failed', error: (error as Error).message },
      { status: 500 }
    );
    
    // Clear cookies even if API call fails
    errorResponse.headers.append('Set-Cookie', 'jwt-id=; Path=/; Max-Age=0; HttpOnly');
    errorResponse.headers.append('Set-Cookie', 'refresh-id=; Path=/; Max-Age=0; HttpOnly');
    
    return errorResponse;
  }
} 