'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { MealCaloriesChart } from './components/MealCaloriesChart'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { MainNav } from '@/components/main-nav'

// Types for dashboard data
interface FoodItemSummary {
  id: number
  food_id: number
  food_name: string
  quantity: number
  quantity_grams: number
  calories: number
}

interface MealLogSummary {
  id: number
  meal_type: string
  created_at: string
  total_calories: number
  food_items: FoodItemSummary[]
}

interface Macronutrients {
  protein: number
  carbohydrate: number
  fat: number
}

interface DashboardData {
  date: string
  total_calories: number
  number_of_meals: number
  meal_logs: MealLogSummary[]
  total_macronutrients: Macronutrients
}

export default function AnalyticsPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const fetchDashboardData = async (date: Date) => {
    if (!isAuthenticated) {
      setError('You must be logged in to view analytics')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const dateString = format(date, 'yyyy-MM-dd')
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        throw new Error('No access token found')
      }
      
      const response = await fetch(`/api/dashboard?date=${dateString}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication expired. Please log in again.')
          router.push('/login')
          return
        }
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (isAuthenticated) {
      fetchDashboardData(selectedDate)
    }
  }, [selectedDate, isAuthenticated, authLoading, router])

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <MainNav />
          <main className="flex-1">
            <div className="container py-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Visualize your daily nutrition data and meal patterns
          </p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : dashboardData ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Calories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.total_calories.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground">kcal</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Number of Meals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.number_of_meals}</div>
                <p className="text-xs text-muted-foreground">meals logged</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg per Meal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.number_of_meals > 0 
                    ? (dashboardData.total_calories / dashboardData.number_of_meals).toFixed(0)
                    : 0
                  }
                </div>
                <p className="text-xs text-muted-foreground">kcal/meal</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Meal Calories Distribution</CardTitle>
              <CardDescription>
                Calories consumed by meal type on {format(selectedDate, "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MealCaloriesChart data={dashboardData.meal_logs} loading={loading} />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No data available for the selected date</p>
          </CardContent>
        </Card>
      )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 