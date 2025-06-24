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
 * Update food nutrient by ID
 * PUT /api/food-nutrients/[id]
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Update food nutrient API route called, ID:', id);
    const body = await request.json();
    
    const headers = getAuthFromRequest(request);
    const response = await axios.put(`${API_URL}/food-nutrients/${id}/`, body, {
      headers,
    });
    
    console.log('Update food nutrient response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Update food nutrient API error:', error);
    
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
 * Delete food nutrient by ID
 * DELETE /api/food-nutrients/[id]
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Delete food nutrient API route called, ID:', id);
    
    const headers = getAuthFromRequest(request);
    const response = await axios.delete(`${API_URL}/food-nutrients/${id}/`, {
      headers,
    });
    
    console.log('Delete food nutrient response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Delete food nutrient API error:', error);
    
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