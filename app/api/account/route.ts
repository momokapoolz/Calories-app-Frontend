import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    // Get the token from the request headers
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    console.log('Delete account request received');
    
    // Build the backend URL
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/account`;
    console.log(`Proxying DELETE request to: ${backendUrl}`);
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token
      }
    });
    
    // Get the response data
    const data = await response.json();
    
    // If the backend returns an error, pass it through
    if (!response.ok) {
      console.error(`Backend returned error: ${response.status}`, data);
      return NextResponse.json(
        data || { error: `Failed to delete account: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    console.log('Account deleted successfully');
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in account deletion API route:', error);
    return NextResponse.json(
      { error: `Failed to delete account: ${error.message}` },
      { status: 500 }
    );
  }
} 