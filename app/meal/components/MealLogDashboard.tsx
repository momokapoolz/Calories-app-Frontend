"use client"

import { useState, useEffect } from "react"
import { CalendarDays, TrendingUp, BarChart3, Clock, Utensils, Target } from "lucide-react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useMealLogs } from "../hooks/useMealLogs"
import { MealType } from "../types"

interface MealLogDashboardProps {
  className?: string
}

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const

const MEAL_TYPE_COLORS = {
  Breakfast: "bg-orange-100 text-orange-800",
  Lunch: "bg-green-100 text-green-800", 
  Dinner: "bg-blue-100 text-blue-800",
  Snacks: "bg-purple-100 text-purple-800",
}

const NUTRITION_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65
}

export function MealLogDashboard({ className }: MealLogDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today")
  const { toast } = useToast()
  
  const {
    mealLogs,
    loading,
    error,
    getTodaysMeals,
    getLastWeekMeals,
    getLastMonthMeals,
    getTotalNutrition,
    getMealsByType,
    getMealsByDate,
    smartRefresh,
    clearError
  } = useMealLogs()

  // Load data based on selected period
  useEffect(() => {
    const loadData = async () => {
      try {
        switch (selectedPeriod) {
          case "today":
            await getTodaysMeals()
            break
          case "week":
            await getLastWeekMeals()
            break
          case "month":
            await getLastMonthMeals()
            break
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load meal data",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [selectedPeriod])

  const totalNutrition = getTotalNutrition()
  const mealsByType = getMealsByType()
  const mealsByDate = getMealsByDate()

  // Calculate nutrition progress percentages
  const nutritionProgress = {
    calories: Math.min((totalNutrition.calories / NUTRITION_TARGETS.calories) * 100, 100),
    protein: Math.min((totalNutrition.protein / NUTRITION_TARGETS.protein) * 100, 100),
    carbs: Math.min((totalNutrition.carbs / NUTRITION_TARGETS.carbs) * 100, 100),
    fat: Math.min((totalNutrition.fat / NUTRITION_TARGETS.fat) * 100, 100),
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "today":
        return format(new Date(), "MMMM d, yyyy")
      case "week":
        const weekStart = startOfWeek(new Date())
        const weekEnd = endOfWeek(new Date())
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
      case "month":
        return format(new Date(), "MMMM yyyy")
    }
  }

  const getMealCount = () => {
    return Object.values(mealsByType).reduce((total, meals) => total + meals.length, 0)
  }

  return (
    <div className={className}>
      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            ×
          </Button>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Meal Dashboard</h2>
          <p className="text-muted-foreground">{getPeriodLabel()}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("today")}
          >
            Today
          </Button>
          <Button
            variant={selectedPeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("week")}
          >
            This Week
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("month")}
          >
            This Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={smartRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-lg">Loading meal data...</div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
                  <Utensils className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getMealCount()}</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedPeriod === "today" ? "today" : `this ${selectedPeriod}`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calories</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(totalNutrition.calories)}</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedPeriod === "today" ? `Target: ${NUTRITION_TARGETS.calories}` : "Total consumed"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Protein</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(totalNutrition.protein)}g</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedPeriod === "today" ? `Target: ${NUTRITION_TARGETS.protein}g` : "Total consumed"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Days Logged</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(mealsByDate).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Unique days with meals
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Meal Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Meals by Type</CardTitle>
                <CardDescription>Breakdown of your meals by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {MEAL_TYPES.map((type) => {
                    const meals = mealsByType[type] || []
                    return (
                      <div key={type} className="text-center">
                        <Badge className={MEAL_TYPE_COLORS[type]}>
                          {type}
                        </Badge>
                        <div className="text-2xl font-bold mt-2">{meals.length}</div>
                        <div className="text-sm text-muted-foreground">meals</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Progress</CardTitle>
                <CardDescription>
                  {selectedPeriod === "today" 
                    ? "Your daily nutrition goals" 
                    : `Total nutrition for this ${selectedPeriod}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Calories</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(totalNutrition.calories)} / {NUTRITION_TARGETS.calories}
                      </span>
                    </div>
                    <Progress value={nutritionProgress.calories} className="w-full" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Protein</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(totalNutrition.protein)}g / {NUTRITION_TARGETS.protein}g
                      </span>
                    </div>
                    <Progress value={nutritionProgress.protein} className="w-full" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Carbohydrates</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(totalNutrition.carbs)}g / {NUTRITION_TARGETS.carbs}g
                      </span>
                    </div>
                    <Progress value={nutritionProgress.carbs} className="w-full" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Fat</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(totalNutrition.fat)}g / {NUTRITION_TARGETS.fat}g
                      </span>
                    </div>
                    <Progress value={nutritionProgress.fat} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals" className="space-y-6">
            {MEAL_TYPES.map((type) => {
              const meals = mealsByType[type] || []
              if (meals.length === 0) return null

              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className={MEAL_TYPE_COLORS[type]}>
                        {type}
                      </Badge>
                      <span className="text-lg">{meals.length} meals</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {meals.map((meal) => (
                        <div key={meal.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-medium">
                              {format(new Date(meal.created_at), "MMM d, h:mm a")}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {meal.total_calories && `${Math.round(meal.total_calories)} cal`}
                            </div>
                          </div>
                          <div className="space-y-1">
                            {meal.items?.map((item) => (
                              <div key={item.id} className="text-sm text-muted-foreground">
                                {item.food_name || `Food ID: ${item.food_id}`} - {item.quantity_grams}g
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Breakdown</CardTitle>
                <CardDescription>Meals logged by date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mealsByDate)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([date, meals]) => (
                      <div key={date} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{format(new Date(date), "EEEE, MMMM d")}</div>
                          <div className="text-sm text-muted-foreground">
                            {meals.length} meals • {Math.round(meals.reduce((sum, m) => sum + (m.total_calories || 0), 0))} calories
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {MEAL_TYPES.map((type) => {
                            const count = meals.filter(m => m.meal_type === type).length
                            return count > 0 ? (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type}: {count}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 