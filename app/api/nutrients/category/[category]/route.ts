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
 * Get nutrients by category
 * GET /api/nutrients/category/[category]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;
    console.log('Get nutrients by category API route called, Category:', category);
    
    const headers = getAuthFromRequest(request);
    const response = await axios.get(`${API_URL}/nutrients/category/${category}/`, {
      headers,
    });
    
    console.log('Get nutrients by category response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Get nutrients by category API error:', error);
    
    if (error.response) {
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