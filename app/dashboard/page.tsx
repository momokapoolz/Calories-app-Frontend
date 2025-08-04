"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ProtectedRoute } from "@/components/protected-route"
import { MainNav } from "@/components/main-nav"
import { useDailyNutrition } from "@/app/meal/hooks/useDailyNutrition"
import { useWeeklyNutrition } from "@/app/meal/hooks/useWeeklyNutrition"
import { WeeklyCalorieTrendChart } from "@/components/weekly-calorie-trend-chart"
import { MacroBreakdownChart } from "@/components/macro-breakdown-chart"
import { useAuth } from "@/contexts/auth-context"

export default function Dashboard() {
  const { user } = useAuth()

  // Set nutritional targets based on user's goal
  let targetCalories: number = 2200
  let targetProtein: number = 165
  let targetCarbs: number = 275
  let targetFat: number = 73

  if (user?.goal === "Weight Loss") {
    targetCalories = 1800
    targetProtein = 140
    targetCarbs = 180
    targetFat = 60
  } else if (user?.goal === "Muscle Gain") {
    targetCalories = 2800
    targetProtein = 200
    targetCarbs = 350
    targetFat = 90
  }


  // Get today's date for fetching nutrition data
  const [todayString, setTodayString] = useState('')

  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    setTodayString(`${year}-${month}-${day}`)
  }, [])

  // Fetch today's nutrition data
  const {
    nutritionData: todayNutrition,
    loading: nutritionLoading,
    error: nutritionError,
    fetchNutritionByDate
  } = useDailyNutrition()

  // Fetch weekly nutrition data for the trend chart
  const {
    weeklyData,
    loading: weeklyLoading,
    error: weeklyError,
    getTodaysNutrition
  } = useWeeklyNutrition()

  // Fetch today's nutrition data when date is available
  useEffect(() => {
    if (todayString) {
      fetchNutritionByDate(todayString)
    }
  }, [todayString, fetchNutritionByDate])

  // Extract today's macro data
  const todayMacros = todayNutrition?.MacroNutrientBreakDown?.[0] || {}
  const currentCalories = todayNutrition?.total_calories || 0
  const currentProtein = (todayMacros as any)?.protein || 0
  const currentCarbs = (todayMacros as any)?.carbohydrate || 0
  const currentFat = (todayMacros as any)?.total_lipid_fe || 0

  // Calculate percentages for progress bars
  const caloriePercentage = Math.min(Math.round((currentCalories / targetCalories) * 100), 100)
  const proteinPercentage = Math.min(Math.round((currentProtein / targetProtein) * 100), 100)
  const carbsPercentage = Math.min(Math.round((currentCarbs / targetCarbs) * 100), 100)
  const fatPercentage = Math.min(Math.round((currentFat / targetFat) * 100), 100)

  // Calculate remaining amounts
  const caloriesRemaining = Math.max(targetCalories - currentCalories, 0)

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container py-6">
            <div className="space-y-6">
              {/* Top Row - 4 Metric Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Calories Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Calories</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {nutritionLoading ? "..." : currentCalories.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {targetCalories.toLocaleString()} goal
                    </p>
                    <div className="mt-3">
                      <Progress value={caloriePercentage} className="h-2" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {caloriesRemaining} calories remaining
                    </p>
                  </CardContent>
                </Card>

                {/* Protein Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Protein</CardTitle>
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {nutritionLoading ? "..." : Math.round(currentProtein)}g
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {targetProtein}g goal
                    </p>
                    <div className="mt-3">
                      <Progress
                        value={proteinPercentage}
                        className="h-2"
                        style={{
                          backgroundColor: 'rgb(239 246 255)',
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Carbohydrates Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Carbohydrates</CardTitle>
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {nutritionLoading ? "..." : Math.round(currentCarbs)}g
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {targetCarbs}g goal
                    </p>
                    <div className="mt-3">
                      <Progress
                        value={carbsPercentage}
                        className="h-2"
                        style={{
                          backgroundColor: 'rgb(240 253 244)',
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Fats Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fats</CardTitle>
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {nutritionLoading ? "..." : Math.round(currentFat)}g
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {targetFat}g goal
                    </p>
                    <div className="mt-3">
                      <Progress
                        value={fatPercentage}
                        className="h-2"
                        style={{
                          backgroundColor: 'rgb(255 247 237)',
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row - 2 Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Weekly Calorie Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Calorie Trend</CardTitle>
                    <CardDescription>
                      Your daily calorie intake over the past week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <WeeklyCalorieTrendChart
                        data={weeklyData}
                        loading={weeklyLoading}
                      />
                    </div>
                    {weeklyError && (
                      <p className="text-sm text-red-500 mt-2">
                        Error loading weekly data: {weeklyError}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Today's Macro Breakdown Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Macro Breakdown</CardTitle>
                    <CardDescription>
                      Distribution of macronutrients by calories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <MacroBreakdownChart
                        protein={currentProtein}
                        carbs={currentCarbs}
                        fat={currentFat}
                        loading={nutritionLoading}
                      />
                    </div>
                    {nutritionError && (
                      <p className="text-sm text-red-500 mt-2">
                        Error loading nutrition data: {nutritionError}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4 justify-center">
                <Link href="/meal">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold">Log a Meal</div>
                        <div className="text-sm text-muted-foreground">Track your nutrition</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/food">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold">Browse Foods</div>
                        <div className="text-sm text-muted-foreground">Explore food database</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}