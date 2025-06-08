import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { foodId: string } }
) {
  try {
    // Get the food ID from the URL params
    const { foodId } = params;
    
    // Get the token from the request headers
    const token = request.headers.get('authorization');
    
    // Build the backend URL
    const backendUrl = `http://localhost:8080/api/v1/food-nutrients/food/${foodId}`;
    console.log(`Proxying request to: ${backendUrl}`);
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': token } : {})
      }
    });
    
    // If the backend returns an error, pass it through
    if (!response.ok) {
      console.error(`Backend returned error: ${response.status}`);
      return NextResponse.json(
        { error: `Failed to fetch food nutrients: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the data from the backend
    const data = await response.json();
    console.log(`Food nutrients received for food ID ${foodId}`);
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error in food nutrients API route for food ID ${params.foodId}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch food nutrients: ${error.message}` },
      { status: 500 }
    );
  }
} 