"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, ChevronRight, PieChart, Plus, Utensils, Weight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DailyNutritionChart } from "@/components/daily-nutrition-chart"
import { MealEntry } from "@/components/meal-entry"
import { RecentExercises } from "@/components/recent-exercises"
import { ProtectedRoute } from "@/components/protected-route"
import { MainNav } from "@/components/main-nav"
import { format } from "date-fns"

// Define types for the dashboard data
interface FoodItem {
  id: number
  food_id: number
  food_name: string
  quantity: number
  quantity_grams: number
  calories: number
}

interface MealLog {
  id: number
  meal_type: string
  created_at: string
  total_calories: number
  food_items: FoodItem[]
}

interface DashboardData {
  date: string
  total_calories: number
  number_of_meals: number
  meal_logs: MealLog[]
  total_macronutrients: {
    protein: number
    carbohydrate: number
    fat: number
  }
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Define target values for macros (these could come from user settings in the future)
  const targetCalories = 2000
  const targetProtein = 150
  const targetCarbs = 250
  const targetFat = 65

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // Get today's date in YYYY-MM-DD format
        const today = format(new Date(), 'yyyy-MM-dd')
        
        // Fetch dashboard data from API
        const token = localStorage.getItem('accessToken');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:8080/api/v1/dashboard/?date=${today}`, {
          method: 'GET', // Explicitly set method, good practice
          headers: headers,
          // credentials: 'include', // Keep this if your app also uses cookies for other things or as a fallback
        })
        
        if (response.status === 404) {
          // If endpoint doesn't exist yet, use empty data structure
          console.log("Dashboard API endpoint not found (404), using empty data")
          setDashboardData({
            date: today,
            total_calories: 0,
            number_of_meals: 0,
            meal_logs: [],
            total_macronutrients: {
              protein: 0,
              carbohydrate: 0,
              fat: 0
            }
          })
        } else if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`)
        } else {
          const data = await response.json()
          setDashboardData(data)
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])
  
  // Calculate percentages for progress bars
  const caloriePercentage = dashboardData ? Math.round((dashboardData.total_calories / targetCalories) * 100) : 0
  const proteinPercentage = dashboardData ? Math.round((dashboardData.total_macronutrients?.protein || 0) / targetProtein * 100) : 0
  const carbsPercentage = dashboardData ? Math.round((dashboardData.total_macronutrients?.carbohydrate || 0) / targetCarbs * 100) : 0
  const fatPercentage = dashboardData ? Math.round((dashboardData.total_macronutrients?.fat || 0) / targetFat * 100) : 0

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="container py-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Daily Summary</CardTitle>
                  <CardDescription>Your nutrition intake for today</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Food
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading dashboard data...</div>
                ) : error ? (
                  <div className="text-center text-red-500 py-4">{error}</div>
                ) : (
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">Calories</div>
                          <div className="text-sm text-muted-foreground">
                            {dashboardData?.total_calories || 0} / {targetCalories} kcal
                          </div>
                        </div>
                        <div className="text-sm font-medium">{caloriePercentage}%</div>
                      </div>
                      <Progress value={caloriePercentage} className="h-2" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Protein</div>
                          <div className="text-sm text-muted-foreground">
                            {dashboardData?.total_macronutrients?.protein || 0}g / {targetProtein}g
                          </div>
                        </div>
                        <Progress value={proteinPercentage} className="h-2 bg-blue-500" />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Carbs</div>
                          <div className="text-sm text-muted-foreground">
                            {dashboardData?.total_macronutrients?.carbohydrate || 0}g / {targetCarbs}g
                          </div>
                        </div>
                        <Progress value={carbsPercentage} className="h-2 bg-yellow-500" />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Fat</div>
                          <div className="text-sm text-muted-foreground">
                            {dashboardData?.total_macronutrients?.fat || 0}g / {targetFat}g
                          </div>
                        </div>
                        <Progress value={fatPercentage} className="h-2 bg-red-500" />
                      </div>
                    </div>
                    <div className="h-[200px] w-full">
                      <DailyNutritionChart 
                        protein={dashboardData?.total_macronutrients?.protein || 0}
                        carbs={dashboardData?.total_macronutrients?.carbohydrate || 0}
                        fat={dashboardData?.total_macronutrients?.fat || 0}
                        totalCalories={dashboardData?.total_calories || 0}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics</CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Weight className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Weight</p>
                      <p className="text-sm text-muted-foreground">165 lbs</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <PieChart className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Body Fat</p>
                      <p className="text-sm text-muted-foreground">18%</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Link href="/metrics" className="flex items-center text-sm text-green-600 hover:underline">
                    View all metrics
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Today's Meals</CardTitle>
                  <CardDescription>Your food intake for today</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Meal
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading meals...</div>
                ) : error ? (
                  <div className="text-center text-red-500 py-4">{error}</div>
                ) : dashboardData?.meal_logs && dashboardData.meal_logs.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.meal_logs.map((meal) => {
                      // Calculate macros for this meal (API doesn't provide per-meal macros)
                      // In a real implementation, you might want to add this to the API
                      const mealTime = new Date(meal.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      
                      return (
                        <MealEntry
                          key={meal.id}
                          title={meal.meal_type}
                          time={mealTime}
                          calories={meal.total_calories}
                          protein={0} // Not provided in API response per meal
                          carbs={0}   // Not provided in API response per meal
                          fat={0}     // Not provided in API response per meal
                          items={meal.food_items.map(item => ({
                            name: item.food_name,
                            calories: item.calories
                          }))}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No meals logged for today. Click "Add Meal" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Exercise</CardTitle>
                <CardDescription>Your activity for the week</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentExercises />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}