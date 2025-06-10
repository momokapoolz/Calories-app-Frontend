import { NextResponse } from 'next/server';
import axios from 'axios';

// The API_URL already includes /api/v1, so we need to be careful with paths
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Test the connection to the backend food API
 */
export async function GET(request: Request) {
  try {
    console.log('Testing connection to backend food API');
    console.log('API URL:', API_URL);
    
    // Test the correct endpoint
    const endpoint = `${API_URL}/foods/`;
    
    console.log('Testing endpoint:', endpoint);
    
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      const response = await axios.get(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000
      });
      
      console.log(`Endpoint ${endpoint} succeeded with status ${response.status}`);
      
      return NextResponse.json({
        success: true,
        endpoint,
        data: response.data
      }, { status: 200 });
    } catch (err: any) {
      console.log(`Endpoint ${endpoint} failed:`, err.message);
      
      return NextResponse.json({
        success: false,
        endpoint,
        error: err.message,
        status: err.response?.status || 'Unknown'
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Test API error:', error);
    
    // Handle axios error responses
    if (error.response) {
      return NextResponse.json(
        { success: false, error: error.response.data || 'Backend error' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 