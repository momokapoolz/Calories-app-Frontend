import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Get authentication headers from incoming request
 */
function getAuthFromRequest(request: Request) {
  const authorization = request.headers.get('Authorization') || '';
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(authorization && { 'Authorization': authorization })
  };
}

/**
 * Create a new meal log
 * POST /api/meal-logs
 */
export async function POST(request: Request) {
  try {
    console.log('Create meal log API route called');
    const body = await request.json();
    
    console.log('Attempting to create meal log at:', `${API_URL}/meal-logs`);
    
    const headers = getAuthFromRequest(request);
    const response = await axios.post(`${API_URL}/meal-logs`, body, {
      headers,
    });
    
    console.log('Create meal log response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Create meal log API error:', error);
    
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

/**
 * Get meal logs by user
 * GET /api/meal-logs
 */
export async function GET(request: Request) {
  try {
    console.log('Get meal logs by user API route called');
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let endpoint = `${API_URL}/meal-logs/user`;
    
    // If both startDate and endDate are provided, use date range endpoint
    if (startDate && endDate) {
      endpoint = `${API_URL}/meal-logs/user/date-range?startDate=${startDate}&endDate=${endDate}`;
      console.log('Using date range endpoint:', endpoint);
    }
    
    console.log('Attempting to get meal logs at:', endpoint);
    
    const headers = getAuthFromRequest(request);
    const response = await axios.get(endpoint, {
      headers,
    });
    
    console.log('Get meal logs response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Get meal logs API error:', error);
    
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