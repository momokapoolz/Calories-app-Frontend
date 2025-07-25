import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Get authentication headers from incoming request
 * The frontend sends the UUID token ID in the Authorization header
 * Format: Bearer {token_id}
 */
function getAuthFromRequest(request: Request) {
  const authorization = request.headers.get('Authorization') || '';
  
  if (!authorization) {
    console.warn('No Authorization header found in request');
  } else {
    // Log only part of the token ID for security
    const tokenParts = authorization.split(' ');
    if (tokenParts.length === 2) {
      const tokenType = tokenParts[0]; // Should be "Bearer"
      const tokenId = tokenParts[1];   // This is the UUID token ID
      console.log(`Authorization header found: ${tokenType} ${tokenId.substring(0, 8)}...`);
    } else {
      console.warn('Authorization header has invalid format');
    }
  }
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(authorization && { 'Authorization': authorization })
  };
}

/**
 * Get meal logs by user and date
 * GET /api/meal-logs/user/date/[date]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    console.log('Get meal logs by date API route called, Date:', date);
    
    const headers = getAuthFromRequest(request);
    console.log('Making request to backend with headers:', {
      ...headers,
      'Authorization': headers.Authorization ? 'Bearer token ID present' : 'No authorization'
    });
    
    // Add timestamp to prevent caching issues
    const url = new URL(request.url);
    const timestamp = url.searchParams.get('_t') || new Date().getTime();
    
    // Forward the request to the backend API
    const apiUrl = `${API_URL}/meal-logs/user/date/${date}`;
    console.log(`Forwarding request to: ${apiUrl}`);
    
    const response = await axios.get(apiUrl, {
      headers,
      params: {
        _t: timestamp // Add timestamp to prevent caching
      }
    });
    
    console.log('Get meal logs by date response status:', response.status);
    console.log('Get meal logs by date response data:', {
      dataLength: Array.isArray(response.data) ? response.data.length : 'Not an array',
      firstItem: Array.isArray(response.data) && response.data.length > 0 ? 
        { id: response.data[0].id, meal_type: response.data[0].meal_type } : 'No items'
    });
    
    // Create the response with the data
    const nextResponse = NextResponse.json(response.data, { status: response.status });
    
    // Add cache control headers to prevent browser caching
    nextResponse.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');
    
    return nextResponse;
  } catch (error: any) {
    console.error('Get meal logs by date API error:', error);
    
    if (error.response) {
      // Log more details about the error
      console.error('API error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
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