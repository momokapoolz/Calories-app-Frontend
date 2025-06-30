import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate meal log ID
    const mealLogId = parseInt(id)
    if (isNaN(mealLogId)) {
      return NextResponse.json(
        { error: 'Invalid meal log ID' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    const { items } = body
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.food_id || item.quantity === undefined || item.quantity_grams === undefined) {
        return NextResponse.json(
          { error: 'Each item must have food_id, quantity, and quantity_grams' },
          { status: 400 }
        )
      }
    }

    // Make request to the actual backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/api/v1/meal-logs/${id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to add items to meal log' }))
      return NextResponse.json(
        errorData,
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Error in add items to meal log API route:', error)
    return NextResponse.json(
      { error: 'Failed to add items to meal log' },
      { status: 500 }
    )
  }
} 