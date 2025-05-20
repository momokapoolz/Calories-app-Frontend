import { NextResponse } from 'next/server';

/**
 * Special fallback route to clear all user sessions without requiring backend API
 * This is useful as a failsafe when the main logout fails
 */
export async function POST() {
  try {
    console.log('[Clear Session] Clearing all session data');
    
    // Create response to clear cookies
    const response = NextResponse.json(
      { message: 'Session cleared successfully' },
      { status: 200 }
    );
    
    // Clear all authentication cookies
    response.headers.append('Set-Cookie', 'jwt-id=; Path=/; Max-Age=0; HttpOnly');
    response.headers.append('Set-Cookie', 'refresh-id=; Path=/; Max-Age=0; HttpOnly');
    
    return response;
  } catch (error) {
    console.error('[Clear Session] Error:', error);
    
    // Create error response but still clear cookies
    const errorResponse = NextResponse.json(
      { message: 'Failed to clear session', error: (error as Error).message },
      { status: 500 }
    );
    
    // Clear cookies even on error
    errorResponse.headers.append('Set-Cookie', 'jwt-id=; Path=/; Max-Age=0; HttpOnly');
    errorResponse.headers.append('Set-Cookie', 'refresh-id=; Path=/; Max-Age=0; HttpOnly');
    
    return errorResponse;
  }
} 