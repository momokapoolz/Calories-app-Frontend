import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { foodId: string } }
) {
  try {
    const { foodId } = params
    
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate foodId
    const foodIdNum = parseInt(foodId)
    if (isNaN(foodIdNum)) {
      return NextResponse.json(
        { error: 'Invalid food ID' },
        { status: 400 }
      )
    }

    // Make request to the actual backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/api/v1/meal-log-items/food/${foodId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch meal log items' }))
      return NextResponse.json(
        errorData,
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in meal log items by food ID API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meal log items' },
      { status: 500 }
    )
  }
} 