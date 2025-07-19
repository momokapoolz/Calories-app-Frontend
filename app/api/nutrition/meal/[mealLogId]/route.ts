import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mealLogId: string }> }
) {
  try {
    const { mealLogId } = await params
    
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate mealLogId
    const mealLogIdNum = parseInt(mealLogId)
    if (isNaN(mealLogIdNum)) {
      return NextResponse.json(
        { error: 'Invalid meal log ID format' },
        { status: 400 }
      )
    }

    // Make request to the actual backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const response = await axios.get(`${backendUrl}/api/v1/nutrition/meal/${mealLogId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    })

    const nutritionData = response.data
    return NextResponse.json(nutritionData)

  } catch (error: any) {
    console.error('Error in nutrition calculation API route:', error)
    
    // If backend error (axios error with response), pass it through
    if (error.response) {
      const errorData = error.response.data || { error: 'Failed to calculate meal nutrition' }
      return NextResponse.json(
        errorData,
        { status: error.response.status }
      )
    }
    
    // If other error (network, timeout, etc.)
    return NextResponse.json(
      { error: 'Failed to calculate meal nutrition' },
      { status: 500 }
    )
  }
} 