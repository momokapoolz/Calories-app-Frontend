import { NextRequest, NextResponse } from 'next/server'

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
        { error: 'Invalid meal log ID' },
        { status: 400 }
      )
    }

    // Make request to the actual backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/api/v1/meal-log-items/meal-log/${mealLogId}`, {
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
    console.error('Error in meal log items by meal log ID GET API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meal log items' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
        { error: 'Invalid meal log ID' },
        { status: 400 }
      )
    }

    // Make request to the actual backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/api/v1/meal-log-items/meal-log/${mealLogId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete meal log items' }))
      return NextResponse.json(
        errorData,
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in meal log items by meal log ID DELETE API route:', error)
    return NextResponse.json(
      { error: 'Failed to delete meal log items' },
      { status: 500 }
    )
  }
} 