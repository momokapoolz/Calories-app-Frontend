import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function GET(request: NextRequest) {
  try {
    //get data from query params
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");

    //get token from request header
    const token = request.headers.get("authorization");

    //build backend url
    const backendUrl = `http://localhost:8080/api/v1/dashboard${date ? `?date=${date}` : ''}`;
    console.log(`Proxying request to: ${backendUrl}`);

    //make request to backend
    const response = await axios.get(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': token } : {})
      }
    });

    //get data from backend
    const data = response.data;
    console.log('Dashboard data received from backend');

    //return data to frontend
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in dashboard API route:', error);
    
    //if backend error (axios error with response), pass it through
    if (error.response) {
      console.error(`Backend returned error: ${error.response.status}`);
      return NextResponse.json(
        { error: `Failed to fetch dashboard data: ${error.response.statusText}` },
        { status: error.response.status }
      );
    }
    
    //if other error (network, timeout, etc.)
    return NextResponse.json(
      { error: `Failed to fetch dashboard data: ${error.message}` },
      { status: 500 }
    );
  }
}