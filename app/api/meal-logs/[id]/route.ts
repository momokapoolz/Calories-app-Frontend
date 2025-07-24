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
    
    console.log('Original request body:', JSON.stringify(body, null, 2));
    
    // Filter only the fields that should be updated
    // Exclude system fields like created_at, user_id, id to prevent corruption
    const updateData: any = {};
    
    // Only include meal_type if it exists and is a string
    if (body.meal_type && typeof body.meal_type === 'string') {
      updateData.meal_type = body.meal_type;
    }
    
    // Only include items if it exists and is an array
    if (body.items && Array.isArray(body.items)) {
      updateData.items = body.items;
    }
    
    console.log('Filtered update data:', JSON.stringify(updateData, null, 2));
    
    // Ensure we're not sending any other fields
    if (Object.keys(updateData).length === 0) {
      console.error('No valid fields to update');
      return NextResponse.json(
        { message: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    const headers = getAuthFromRequest(request);
    console.log('Making request to backend:', `${API_URL}/meal-logs/${id}`);
    const response = await axios.put(`${API_URL}/meal-logs/${id}`, updateData, {
      headers,
    });
    
    console.log('Update meal log response status:', response.status);
    console.log('Backend response:', JSON.stringify(response.data, null, 2));
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Update meal log API error:', error);
    
    if (error.response) {
      console.error('Backend error response:', JSON.stringify(error.response.data, null, 2));
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