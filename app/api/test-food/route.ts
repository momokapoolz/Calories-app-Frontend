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
    
    // Try multiple endpoint variations
    const endpoints = [
      `${API_URL}/foods`,
      `${API_URL.replace('/api/v1', '')}/api/v1/foods`,
      `${API_URL.replace('/api/v1', '')}/foods`,
      `${API_URL.replace('/api/v1', '')}/api/foods`,
      `${API_URL.replace('/api/v1', '')}/v1/foods`,
      `${API_URL}/food`
    ];
    
    console.log('Testing the following endpoints:', endpoints);
    
    for (const endpoint of endpoints) {
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
      }
    }
    
    // If we get here, all endpoints failed
    return NextResponse.json({
      success: false,
      error: 'All API endpoints failed'
    }, { status: 500 });
    
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