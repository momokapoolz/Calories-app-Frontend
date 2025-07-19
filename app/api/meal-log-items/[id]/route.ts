import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(
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

    // Validate ID
    const itemId = parseInt(id)
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid meal log item ID' },
        { status: 400 }
      )
    }

    // Make request to the actual backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const response = await axios.get(`${backendUrl}/api/v1/meal-log-items/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    })

    const data = response.data
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Error in meal log item GET API route:', error)
    
    // If backend error (axios error with response), pass it through
    if (error.response) {
      const errorData = error.response.data || { error: 'Meal log item not found' }
      return NextResponse.json(
        errorData,
        { status: error.response.status }
      )
    }
    
    // If other error (network, timeout, etc.)
    return NextResponse.json(
      { error: 'Failed to fetch meal log item' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    // Validate ID
    const itemId = parseInt(id)
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid meal log item ID' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Make request to the actual backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const response = await axios.put(`${backendUrl}/api/v1/meal-log-items/${id}`, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    })

    const data = response.data
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Error in meal log item PUT API route:', error)
    
    // If backend error (axios error with response), pass it through
    if (error.response) {
      const errorData = error.response.data || { error: 'Failed to update meal log item' }
      return NextResponse.json(
        errorData,
        { status: error.response.status }
      )
    }
    
    // If other error (network, timeout, etc.)
    return NextResponse.json(
      { error: 'Failed to update meal log item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Validate ID
    const itemId = parseInt(id)
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid meal log item ID' },
        { status: 400 }
      )
    }

    // Make request to the actual backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const response = await axios.delete(`${backendUrl}/api/v1/meal-log-items/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    })

    const data = response.data
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Error in meal log item DELETE API route:', error)
    
    // If backend error (axios error with response), pass it through
    if (error.response) {
      const errorData = error.response.data || { error: 'Failed to delete meal log item' }
      return NextResponse.json(
        errorData,
        { status: error.response.status }
      )
    }
    
    // If other error (network, timeout, etc.)
    return NextResponse.json(
      { error: 'Failed to delete meal log item' },
      { status: 500 }
    )
  }
} 