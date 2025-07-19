import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

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
    const response = await axios.post(`${backendUrl}/api/v1/meal-logs/${id}/items`, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    })

    const data = response.data
    return NextResponse.json(data, { status: 201 })

  } catch (error: any) {
    console.error('Error in add items to meal log API route:', error)
    
    // If backend error (axios error with response), pass it through
    if (error.response) {
      const errorData = error.response.data || { error: 'Failed to add items to meal log' }
      return NextResponse.json(
        errorData,
        { status: error.response.status }
      )
    }
    
    // If other error (network, timeout, etc.)
    return NextResponse.json(
      { error: 'Failed to add items to meal log' },
      { status: 500 }
    )
  }
} 