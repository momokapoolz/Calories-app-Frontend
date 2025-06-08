import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the date from the query params
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    
    // Get the token from the request headers
    const token = request.headers.get('authorization');
    
    // Build the backend URL
    const backendUrl = `http://localhost:8080/api/v1/dashboard${date ? `?date=${date}` : ''}`;
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
        { error: `Failed to fetch dashboard data: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the data from the backend
    const data = await response.json();
    console.log('Dashboard data received from backend');
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in dashboard API route:', error);
    return NextResponse.json(
      { error: `Failed to fetch dashboard data: ${error.message}` },
      { status: 500 }
    );
  }
} 