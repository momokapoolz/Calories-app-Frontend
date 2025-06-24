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
  
  // Forward the same Authorization header to the backend
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(authorization && { 'Authorization': authorization })
  };
}

/**
 * Get nutrition summary for a specific date
 * GET /api/nutrition/date/[date]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    console.log('Get nutrition by date API route called, Date:', date);
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }
    
    // Parse the date to ensure it's valid
    try {
      // Create date object in UTC to avoid timezone issues
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(Date.UTC(year, month - 1, day));
      
      // Check if the date is valid by comparing components
      const isValidDate = 
        dateObj.getUTCFullYear() === year && 
        dateObj.getUTCMonth() === month - 1 && 
        dateObj.getUTCDate() === day;
      
      if (!isValidDate) {
        console.warn(`Invalid date components: ${date} → year: ${year}, month: ${month}, day: ${day}`);
      } else {
        console.log(`Valid date: ${date} → ${dateObj.toISOString()}`);
      }
    } catch (err) {
      console.warn(`Error parsing date: ${date}`, err);
    }
    
    const headers = getAuthFromRequest(request);
    console.log('Making request to backend with headers:', {
      ...headers,
      'Authorization': headers.Authorization ? 'Bearer token ID present' : 'No authorization'
    });
    
    // Get query parameters
    const url = new URL(request.url);
    const timestamp = url.searchParams.get('_t');
    
    // Forward the request to the backend API
    const apiUrl = `${API_URL}/nutrition/date/${date}`;
    console.log(`Forwarding request to: ${apiUrl}${timestamp ? ' with timestamp' : ''}`);
    console.log(`Date parameter details: 
      - Original date: ${date}
      - Year: ${date.substring(0, 4)}
      - Month: ${date.substring(5, 7)}
      - Day: ${date.substring(8, 10)}
      - Current server time: ${new Date().toISOString()}
    `);
    
    const response = await axios.get(apiUrl, {
      headers,
    });
    
    console.log('Get nutrition by date response status:', response.status);
    console.log('Get nutrition by date response data summary:', {
      userId: response.data?.user_id,
      dateRange: response.data?.date_range,
      totalCalories: response.data?.total_calories,
      mealCount: response.data?.MealBreakdown?.length || 0
    });
    
    // Create the response with the data
    const nextResponse = NextResponse.json(response.data, { status: response.status });
    
    // Add cache control headers to prevent browser caching
    // This ensures that different users always get their own data
    nextResponse.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');
    
    return nextResponse;
  } catch (error: any) {
    console.error('Get nutrition by date API error:', error);
    
    if (error.response) {
      // Log more details about the error
      console.error('API error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      return NextResponse.json(
        error.response.data || { error: 'API server error' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 