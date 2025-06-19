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
 * Get meal log by ID
 * GET /api/meal-logs/[id]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Get meal log by ID API route called, ID:', id);
    
    const headers = getAuthFromRequest(request);
    const response = await axios.get(`${API_URL}/meal-logs/${id}`, {
      headers,
    });
    
    console.log('Get meal log by ID response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Get meal log by ID API error:', error);
    
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
 * Update meal log by ID
 * PUT /api/meal-logs/[id]
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Update meal log API route called, ID:', id);
    const body = await request.json();
    
    const headers = getAuthFromRequest(request);
    const response = await axios.put(`${API_URL}/meal-logs/${id}`, body, {
      headers,
    });
    
    console.log('Update meal log response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Update meal log API error:', error);
    
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
 * Delete meal log by ID
 * DELETE /api/meal-logs/[id]
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Delete meal log API route called, ID:', id);
    
    const headers = getAuthFromRequest(request);
    const response = await axios.delete(`${API_URL}/meal-logs/${id}`, {
      headers,
    });
    
    console.log('Delete meal log response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Delete meal log API error:', error);
    
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