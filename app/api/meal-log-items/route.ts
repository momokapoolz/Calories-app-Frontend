import { NextRequest, NextResponse } from 'next/server'

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
    const response = await fetch(`${backendUrl}/api/v1/meal-log-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create meal log item' }))
      return NextResponse.json(
        errorData,
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Error in meal log items API route:', error)
    return NextResponse.json(
      { error: 'Failed to create meal log item' },
      { status: 500 }
    )
  }
} 