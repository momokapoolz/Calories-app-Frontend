import { NextRequest, NextResponse } from 'next/server';
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
 * Get all foods
 * GET /api/foods
 */
export async function GET(request: Request) {
  try {
    console.log('Get all foods API route called');
    
    const headers = getAuthFromRequest(request);
    const response = await axios.get(`${API_URL}/foods/`, {
      headers,
    });
    
    console.log('Get all foods response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Get all foods API error:', error);
    
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

/**
 * Create a new food
 * POST /api/foods
 */
export async function POST(request: Request) {
  try {
    console.log('Create food API route called');
    const body = await request.json();
    
    const headers = getAuthFromRequest(request);
    const response = await axios.post(`${API_URL}/foods/`, body, {
      headers,
    });
    
    console.log('Create food response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Create food API error:', error);
    
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