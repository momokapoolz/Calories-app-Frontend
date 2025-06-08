import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the token from the request headers
    const token = request.headers.get('authorization');
    
    // Build the backend URL
    const backendUrl = 'http://localhost:8080/api/v1/foods';
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
        { error: `Failed to fetch foods data: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the data from the backend
    const data = await response.json();
    console.log(`Foods data received from backend: ${data.length} items`);
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in foods API route:', error);
    return NextResponse.json(
      { error: `Failed to fetch foods data: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the token from the request headers
    const token = request.headers.get('authorization');
    
    // Get the request body
    const body = await request.json();
    
    // Build the backend URL
    const backendUrl = 'http://localhost:8080/api/v1/foods';
    console.log(`Proxying POST request to: ${backendUrl}`);
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': token } : {})
      },
      body: JSON.stringify(body)
    });
    
    // If the backend returns an error, pass it through
    if (!response.ok) {
      console.error(`Backend returned error: ${response.status}`);
      return NextResponse.json(
        { error: `Failed to create food: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the data from the backend
    const data = await response.json();
    console.log('Food created successfully');
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in foods API route (POST):', error);
    return NextResponse.json(
      { error: `Failed to create food: ${error.message}` },
      { status: 500 }
    );
  }
} 