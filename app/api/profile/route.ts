import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the token from the request headers
    const token = request.headers.get('authorization');
    
    // Build the backend URL
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/profile`;
    console.log(`Proxying GET request to: ${backendUrl}`);
    
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
        { error: `Failed to fetch profile data: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the data from the backend
    const data = await response.json();
    console.log('Profile data received from backend');
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in profile GET API route:', error);
    return NextResponse.json(
      { error: `Failed to fetch profile data: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the token from the request headers
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    console.log('Update profile request body:', body);
    
    // Build the backend URL
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/profile`;
    console.log(`Proxying PUT request to: ${backendUrl}`);
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    });
    
    // Get the response data
    const data = await response.json();
    
    // If the backend returns an error, pass it through
    if (!response.ok) {
      console.error(`Backend returned error: ${response.status}`, data);
      return NextResponse.json(
        data || { error: `Failed to update profile: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    console.log('Profile updated successfully');
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in profile PUT API route:', error);
    return NextResponse.json(
      { error: `Failed to update profile: ${error.message}` },
      { status: 500 }
    );
  }
} 