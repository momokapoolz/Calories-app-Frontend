import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    const { meal_log_id, food_id, quantity, quantity_grams } = body
    
    if (!meal_log_id || !food_id || quantity === undefined || quantity_grams === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: meal_log_id, food_id, quantity, quantity_grams' },
        { status: 400 }
      )
    }

    // Make request to the actual backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const response = await axios.post(`${backendUrl}/api/v1/meal-log-items`, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    })

    const data = response.data
    return NextResponse.json(data, { status: 201 })

  } catch (error: any) {
    console.error('Error in meal log items API route:', error)
    
    // If backend error (axios error with response), pass it through
    if (error.response) {
      const errorData = error.response.data || { error: 'Failed to create meal log item' }
      return NextResponse.json(
        errorData,
        { status: error.response.status }
      )
    }
    
    // If other error (network, timeout, etc.)
    return NextResponse.json(
      { error: 'Failed to create meal log item' },
      { status: 500 }
    )
  }
} 