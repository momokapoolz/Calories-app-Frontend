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
    const response = await axios.get(`${API_URL}/meal-logs/user/date/${date}`, {
      headers,
    });
    
    console.log('Get meal logs by date response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Get meal logs by date API error:', error);
    
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