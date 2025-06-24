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
 * Get food by ID
 * GET /api/foods/[id]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Get food by ID API route called, ID:', id);
    
    const headers = getAuthFromRequest(request);
    const response = await axios.get(`${API_URL}/foods/${id}/`, {
      headers,
    });
    
    console.log('Get food by ID response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Get food by ID API error:', error);
    
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
 * Update food by ID
 * PUT /api/foods/[id]
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Update food API route called, ID:', id);
    const body = await request.json();
    
    const headers = getAuthFromRequest(request);
    const response = await axios.put(`${API_URL}/foods/${id}/`, body, {
      headers,
    });
    
    console.log('Update food response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Update food API error:', error);
    
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
 * Delete food by ID
 * DELETE /api/foods/[id]
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Delete food API route called, ID:', id);
    
    const headers = getAuthFromRequest(request);
    const response = await axios.delete(`${API_URL}/foods/${id}/`, {
      headers,
    });
    
    console.log('Delete food response status:', response.status);
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Delete food API error:', error);
    
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