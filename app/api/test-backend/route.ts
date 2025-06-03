import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Test backend connectivity
 */
export async function GET() {
  try {
    console.log('Testing backend connectivity to:', API_URL);
    
    const response = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: {
        'Accept': 'application/json',
      },
      timeout: 5000,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Backend is reachable',
      status: response.status,
    });
    
  } catch (error: any) {
    console.error('Backend test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Backend connectivity test failed',
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    }, { status: 200 }); // Return 200 but with error details
  }
}
