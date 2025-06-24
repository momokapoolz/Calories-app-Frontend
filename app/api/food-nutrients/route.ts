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
 * Create a new food nutrient
 * POST /api/food-nutrients
 */
export async function POST(request: Request) {
  try {
    console.log('Create food nutrient API route called');
    const body = await request.json();
    
    const headers = getAuthFromRequest(request);
    const response = await axios.post(`${API_URL}/food-nutrients/`, body, {
      headers,
    });
    
    console.log('Create food nutrient response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Create food nutrient API error:', error);
    
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