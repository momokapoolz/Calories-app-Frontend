import { NextRequest, NextResponse } from 'next/server';

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
    
    // Validate required fields
    if (!body.current_password || !body.new_password) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }
    
    console.log('Change password request received');
    
    // Build the backend URL
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/password`;
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
        data || { error: `Failed to change password: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    console.log('Password changed successfully');
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in password change API route:', error);
    return NextResponse.json(
      { error: `Failed to change password: ${error.message}` },
      { status: 500 }
    );
  }
} 