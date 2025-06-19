"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CalendarDays, ChevronDown, Filter, Plus, Search, Utensils, Calendar, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/protected-route"
import { MainNav } from "@/components/main-nav"
import { MealForm } from "./components/MealForm"
import { MealEditForm } from "./components/MealEditForm"
import { MealLogDashboard } from "./components/MealLogDashboard"
import { useMealLogs } from "./hooks/useMealLogs"
import { useFood } from "@/app/food/hooks/useFood"
import { MealLog, MealType, CreateMealLog } from "./types"

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const

export default function MealPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [viewMode, setViewMode] = useState<"single" | "range">("single")
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const { 
    mealLogs, 
    loading, 
    error, 
    addMealLog, 
    updateMealLog, 
    deleteMealLog,
    fetchMealLogsByDate,
    fetchMealLogsByDateRange,
    formatDateForAPI,
    clearError,
    refreshMealLogs
  } = useMealLogs()

  const { foods } = useFood()

  const formattedDate = format(selectedDate, "PPP")

  // Filter meals based on current view mode and selected date(s)
  const filteredMeals = mealLogs.filter((meal: MealLog) => {
    const mealDate = new Date(meal.created_at)
    
    if (viewMode === "single") {
      return (
        mealDate.getFullYear() === selectedDate.getFullYear() &&
        mealDate.getMonth() === selectedDate.getMonth() &&
        mealDate.getDate() === selectedDate.getDate()
      )
    } else if (viewMode === "range" && dateRange?.from && dateRange?.to) {
      return mealDate >= dateRange.from && mealDate <= dateRange.to
    }
    
    return true
  })

  // Apply search filter if there's a search term
  const searchFilteredMeals = searchTerm 
    ? filteredMeals.filter(meal => 
        meal.items?.some(item => 
          item.food_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : filteredMeals

  // Handle date selection for single date view
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setViewMode("single")
      fetchMealLogsByDate(formatDateForAPI(date))
    }
  }

  // Handle date range selection
  const handleDateRangeSelect = () => {
    if (dateRange?.from && dateRange?.to) {
      setViewMode("range")
      fetchMealLogsByDateRange(
        formatDateForAPI(dateRange.from),
        formatDateForAPI(dateRange.to)
      )
    }
  }

  // Handle meal creation with toast notification
  const handleAddMealLog = async (data: CreateMealLog): Promise<void> => {
    try {
      await addMealLog(data)
      toast({
        title: "Success",
        description: "Meal log created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create meal log",
        variant: "destructive",
      })
    }
  }

  // Handle meal update with toast notification
  const handleUpdateMealLog = async (id: number, data: CreateMealLog): Promise<void> => {
    try {
      await updateMealLog(id, data)
      toast({
        title: "Success",
        description: "Meal log updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update meal log",
        variant: "destructive",
      })
    }
  }

  // Handle meal deletion with confirmation
  const handleDeleteMealLog = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this meal log?")) {
      try {
        await deleteMealLog(id)
        toast({
          title: "Success",
          description: "Meal log deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete meal log",
          variant: "destructive",
        })
      }
    }
  }

  // Calculate total nutrition for filtered meals
  const totalNutrition = searchFilteredMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.total_calories || 0),
      protein: acc.protein + (meal.total_protein || 0),
      carbs: acc.carbs + (meal.total_carbs || 0),
      fat: acc.fat + (meal.total_fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container py-6">
            <div className="flex flex-col gap-6">
              {/* Header with date selector and controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">Meal Planner</h1>
                  
                  {/* Single Date Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {viewMode === "single" ? formattedDate : "Select Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Date Range Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                                                 {viewMode === "range" && dateRange?.from && dateRange?.to
                           ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                           : "Date Range"
                         }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-4 space-y-4">
                        <div>
                          <Label>Select Date Range</Label>
                          <CalendarComponent
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                          />
                        </div>
                        <Button 
                          onClick={handleDateRangeSelect} 
                          disabled={!dateRange?.from || !dateRange?.to}
                          className="w-full"
                        >
                          Apply Date Range
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Refresh button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshMealLogs}
                    disabled={loading}
                  >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search meals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <MealForm onSubmit={handleAddMealLog} />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
                  <span>{error}</span>
                  <Button variant="ghost" size="sm" onClick={clearError}>
                    ×
                  </Button>
                </div>
              )}

              {/* Nutrition Summary Card */}
              {searchFilteredMeals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Nutrition Summary</CardTitle>
                    <CardDescription>
                      Total nutrition for {viewMode === "single" ? formattedDate : "selected period"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{totalNutrition.calories}</div>
                        <div className="text-sm text-muted-foreground">Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{totalNutrition.protein.toFixed(1)}g</div>
                        <div className="text-sm text-muted-foreground">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{totalNutrition.carbs.toFixed(1)}g</div>
                        <div className="text-sm text-muted-foreground">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{totalNutrition.fat.toFixed(1)}g</div>
                        <div className="text-sm text-muted-foreground">Fat</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Meal Tabs */}
              <Tabs defaultValue="dashboard">
                <TabsList>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  {MEAL_TYPES.map((type) => (
                    <TabsTrigger key={type} value={type.toLowerCase()}>
                      {type}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="mt-4">
                  <MealLogDashboard />
                </TabsContent>
                
                {MEAL_TYPES.map((type) => (
                  <TabsContent key={type} value={type.toLowerCase()} className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>{type}</CardTitle>
                        <CardDescription>
                          Meals logged for {type.toLowerCase()} 
                          {viewMode === "single" ? ` on ${formattedDate}` : " in selected period"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="text-center py-4">Loading...</div>
                        ) : (
                          <div className="space-y-4">
                            {searchFilteredMeals
                              .filter((meal: MealLog) => meal.meal_type === type)
                              .map((meal: MealLog) => (
                                <div
                                  key={meal.id}
                                  className="flex flex-col gap-2 p-4 border rounded-lg"
                                >
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-medium">
                                      {format(new Date(meal.created_at), "MMM dd, yyyy 'at' h:mm a")}
                                    </h3>
                                    <div className="flex gap-2">
                                                                              <MealEditForm
                                          meal={meal}
                                          onSubmit={handleUpdateMealLog}
                                        />
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteMealLog(meal.id)}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Meal items */}
                                  <div className="space-y-2">
                                    {meal.items?.map(item => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <span>
                                          {item.food_name || 
                                           foods.find(f => f.id === item.food_id)?.name || 
                                           `Food ID: ${item.food_id}`}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {item.quantity_grams}g
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Nutritional totals */}
                                  {(meal.total_calories || meal.total_protein) && (
                                    <div className="mt-2 pt-2 border-t">
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        {meal.total_calories && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Calories:</span>
                                            <span>{meal.total_calories} kcal</span>
                                          </div>
                                        )}
                                        {meal.total_protein && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Protein:</span>
                                            <span>{meal.total_protein}g</span>
                                          </div>
                                        )}
                                        {meal.total_carbs && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Carbs:</span>
                                            <span>{meal.total_carbs}g</span>
                                          </div>
                                        )}
                                        {meal.total_fat && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Fat:</span>
                                            <span>{meal.total_fat}g</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            
                            {/* Empty state */}
                            {searchFilteredMeals.filter((meal: MealLog) => meal.meal_type === type).length === 0 && (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                  {searchTerm 
                                    ? `No meals found for "${searchTerm}" in ${type.toLowerCase()}`
                                    : `No meals logged for ${type.toLowerCase()}`
                                  }
                                </p>
                                <MealForm
                                  onSubmit={(data: CreateMealLog) => handleAddMealLog({ ...data, meal_type: type as MealType })}
                                  className="mt-4"
                                  buttonText={`Add ${type} Meal`}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 