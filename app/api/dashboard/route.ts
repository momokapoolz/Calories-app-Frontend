import axios from "axios";
import { NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
  try {
    //get the query parameters from the request
    const searchParams  = request.nextUrl.searchParams;

    const date = searchParams.get("date");

    //get tokens from the request headers
    const accessToken = request.headers.get("authorization");

    //build backend URL
    const backendUrl = `http://localhost:8080/api/v1/dashboard${date ? `?date=${date}` : ''}`;

    //make a GET request to the backend
    const respone = await axios.get(backendUrl, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(accessToken ? { Authorization: accessToken } : {})
      }
    });

    //get data from backend
    const data = respone.data;
    console.log('Dashboard data received from backend');

    //return the data as a NextResponse to the client
    return NextResponse.json(data)
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