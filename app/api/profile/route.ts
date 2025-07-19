import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    // Get the token from the request headers
    const token = request.headers.get('authorization');
    
    // Build the backend URL
          const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/profile`;
    console.log(`Proxying request to: ${backendUrl}`);
    
    // Make the request to the backend
    const response = await axios.get(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': token } : {})
      }
    });
    
    // Get the data from the backend
    const data = response.data;
    console.log('Profile data received from backend');
    
    // Return the data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in profile API route:', error);
    
    // If backend error (axios error with response), pass it through
    if (error.response) {
      console.error(`Backend returned error: ${error.response.status}`);
      return NextResponse.json(
        { error: `Failed to fetch profile data: ${error.response.statusText}` },
        { status: error.response.status }
      );
    }
    
    // If other error (network, timeout, etc.)
    return NextResponse.json(
      { error: `Failed to fetch profile data: ${error.message}` },
      { status: 500 }
    );
  }
} 