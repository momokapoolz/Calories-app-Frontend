"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AlertCircle, CalendarDays, ChevronDown, Filter, Plus, Search, Utensils, Calendar, RefreshCw } from "lucide-react"
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
import { DailyNutritionDisplay } from "./components/DailyNutritionDisplay"
import { useMealLogs } from "./hooks/useMealLogs"
import { useDailyNutrition } from "./hooks/useDailyNutrition"
import { useMultipleMealNutrition } from "./hooks/useMealNutrition"
import { useMealLogItems } from "./hooks/useMealLogItems"
import { useFood } from "@/app/food/hooks/useFood"
import { MealLog, MealType, CreateMealLog } from "./types"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const

export default function MealPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [viewMode, setViewMode] = useState<"single" | "range">("single")
  const [searchTerm, setSearchTerm] = useState("")
  const [nutritionRefreshKey, setNutritionRefreshKey] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
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
    clearData,
    refreshMealLogs
  } = useMealLogs()

  const { foods } = useFood()

  const {
    getMealLogItemsByMealLogId,
    loading: itemsLoading,
    error: itemsError,
    clearError: clearItemsError
  } = useMealLogItems()

  // State to store meal items for each meal log
  const [mealItemsMap, setMealItemsMap] = useState<Record<number, any[]>>({})
  const [loadingItemsForMeals, setLoadingItemsForMeals] = useState<Record<number, boolean>>({})

  const { 
    nutritionData,
    loading: nutritionLoading,
    error: nutritionError,
    fetchNutritionByDate,
    formatDateForAPI: formatNutritionDate,
    clearError: clearNutritionError,
    clearAllData: clearNutritionData
  } = useDailyNutrition()

  // Get meal log IDs for nutrition fetching - memoized to prevent infinite loops
  const mealLogIds = useMemo(() => {
    return mealLogs?.map(meal => meal.id) || []
  }, [mealLogs])
  
  // Fetch nutrition data for all meals
  const { nutritionMap, loading: nutritionLoading2, getNutritionForMeal } = useMultipleMealNutrition(mealLogIds)

  const formattedDate = format(selectedDate, "PPP")

  // Reset state when user changes
  useEffect(() => {
    if (user?.id !== currentUserId) {
      console.log('MealPage: User changed from', currentUserId, 'to', user?.id, '- resetting page state')
      setSelectedDate(new Date()) // Reset to today
      setDateRange(undefined)
      setViewMode("single")
      setSearchTerm("")
      setNutritionRefreshKey(0) // Reset nutrition refresh
      setCurrentUserId(user?.id || null)
      setMealItemsMap({}) // Reset meal items
      setLoadingItemsForMeals({})
    }
  }, [user?.id, currentUserId])

  // Function to fetch food items for a specific meal
  const fetchMealItems = async (mealLogId: number) => {
    if (mealItemsMap[mealLogId] || loadingItemsForMeals[mealLogId]) {
      return // Already have items or already loading
    }

    try {
      setLoadingItemsForMeals(prev => ({ ...prev, [mealLogId]: true }))
      const items = await getMealLogItemsByMealLogId(mealLogId)
      
      setMealItemsMap(prev => ({
        ...prev,
        [mealLogId]: items
      }))
      
      console.log(`Fetched ${items.length} items for meal log ${mealLogId}:`, items)
    } catch (error) {
      console.error(`Error fetching items for meal log ${mealLogId}:`, error)
    } finally {
      setLoadingItemsForMeals(prev => ({ ...prev, [mealLogId]: false }))
    }
  }

  // Function to fetch food items for all current meals
  const fetchAllMealItems = async () => {
    if (!mealLogs || mealLogs.length === 0) return

    console.log(`Fetching food items for ${mealLogs.length} meals...`)
    
    // Fetch items for all meals in parallel
    const fetchPromises = mealLogs.map(meal => fetchMealItems(meal.id))
    await Promise.allSettled(fetchPromises)
  }

  // Fetch meal items when meals are loaded or changed
  useEffect(() => {
    if (mealLogs && mealLogs.length > 0) {
      fetchAllMealItems()
    }
  }, [mealLogs])

  // Filter meals based on current view mode and selected date(s)
  const filteredMeals = mealLogs.filter((meal: MealLog) => {
    if (!meal.created_at) return false;
    
    // Parse the meal date and normalize to date-only string for comparison
    const mealDate = new Date(meal.created_at);
    const mealDateString = formatDateForAPI(mealDate); // Convert to YYYY-MM-DD format
    
    if (viewMode === "single") {
      const selectedDateString = formatDateForAPI(selectedDate);
      const matches = mealDateString === selectedDateString;
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[MealFilter] Comparing dates:', {
          mealId: meal.id,
          mealType: meal.meal_type,
          mealCreatedAt: meal.created_at,
          mealDateString,
          selectedDateString,
          matches
        });
      }
      
      return matches;
    } else if (viewMode === "range" && dateRange?.from && dateRange?.to) {
      // For range filtering, use the date objects directly but normalize them
      const mealDateNormalized = new Date(mealDateString + 'T00:00:00.000Z');
      const fromDateNormalized = new Date(formatDateForAPI(dateRange.from) + 'T00:00:00.000Z');
      const toDateNormalized = new Date(formatDateForAPI(dateRange.to) + 'T23:59:59.999Z');
      
      return mealDateNormalized >= fromDateNormalized && mealDateNormalized <= toDateNormalized;
    }
    
    return true;
  })

  // Apply search filter if there's a search term
  const searchFilteredMeals = searchTerm 
    ? filteredMeals.filter(meal => 
        meal.items?.some(item => 
          item.food_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : filteredMeals

  // Debug logging and fallback mechanism
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[MealPage] Debug State:', {
        selectedDate: formatDateForAPI(selectedDate),
        totalMealLogs: mealLogs.length,
        filteredMeals: filteredMeals.length,
        searchFilteredMeals: searchFilteredMeals.length,
        hasNutritionData: !!nutritionData,
        nutritionMealCount: nutritionData?.MealBreakdown?.length || 0,
        viewMode
      });

      // If we have nutrition data (indicating meals exist) but no filtered meals, log the issue
      if (nutritionData && nutritionData.MealBreakdown && nutritionData.MealBreakdown.length > 0 && filteredMeals.length === 0) {
        console.warn('[MealPage] FILTERING ISSUE DETECTED:', {
          nutritionDataIndicatesMeals: nutritionData.MealBreakdown.length,
          mealLogsCount: mealLogs.length,
          filteredMealsCount: filteredMeals.length,
          suggestion: 'Meals exist (nutrition data proves it) but filtering is removing them'
        });
        
        // Log first few meal logs for debugging
        if (mealLogs.length > 0) {
          console.log('[MealPage] First few meal logs:', mealLogs.slice(0, 3).map(meal => ({
            id: meal.id,
            meal_type: meal.meal_type,
            created_at: meal.created_at,
            created_at_formatted: formatDateForAPI(new Date(meal.created_at))
          })));
        }
      }
    }
  }, [selectedDate, mealLogs, filteredMeals, searchFilteredMeals, nutritionData, viewMode]);

  // Fallback mechanism: if we have nutrition data but no filtered meals, show all meals for the user to see
  const finalMealsToShow = useMemo(() => {
    // If we have nutrition data indicating meals exist, but filtering resulted in no meals
    const hasNutritionWithMeals = nutritionData && nutritionData.MealBreakdown && nutritionData.MealBreakdown.length > 0;
    const hasNoFilteredMeals = filteredMeals.length === 0;
    const hasActualMealLogs = mealLogs.length > 0;
    
    if (hasNutritionWithMeals && hasNoFilteredMeals && hasActualMealLogs && viewMode === "single") {
      console.warn('[MealPage] USING FALLBACK: Showing all meals due to filtering issue');
      return searchTerm 
        ? mealLogs.filter(meal => 
            meal.items?.some(item => 
              item.food_name?.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
        : mealLogs;
    }
    
    return searchFilteredMeals;
  }, [searchFilteredMeals, nutritionData, filteredMeals, mealLogs, viewMode, searchTerm]);

  // Handle date selection for single date view
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setViewMode("single")
      const dateString = formatDateForAPI(date)
      
      // Log date selection for debugging
      console.log(`Date selected: ${dateString} for user: ${user?.email || 'unknown'}`)
      console.log(`[DateDebug] Selected date details:`, {
        originalDate: date.toISOString(),
        localDateString: date.toLocaleDateString(),
        formattedForAPI: dateString,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
      
      // First fetch meal logs for the selected date
      fetchMealLogsByDate(dateString)
      
      // Then fetch nutrition data for the selected date
      // Increment the nutrition refresh key to ensure the DailyNutritionDisplay component re-fetches data
      setNutritionRefreshKey(prev => prev + 1)
      
      // Also directly fetch nutrition data to ensure it's loaded
      fetchNutritionByDate(dateString)
        .then(data => {
          if (data) {
            console.log(`Successfully fetched nutrition data for ${dateString}:`, {
              userId: data.user_id,
              totalCalories: data.total_calories,
              mealCount: data.MealBreakdown?.length || 0
            })
          } else {
            console.log(`No nutrition data found for ${dateString}`)
          }
        })
        .catch(err => {
          console.error(`Error fetching nutrition data for ${dateString}:`, err)
        })
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

  // Helper function to refresh data for current date
  const refreshCurrentDateData = async () => {
    const dateString = formatDateForAPI(selectedDate)
    console.log(`[RefreshData] Refreshing data for ${dateString}`)
    
    try {
      // Clear meal items cache to force fresh fetch
      setMealItemsMap({})
      setLoadingItemsForMeals({})
      
      // Refresh meal logs
      await fetchMealLogsByDate(dateString)
      
      // Refresh nutrition data  
      setNutritionRefreshKey(prev => prev + 1)
      await fetchNutritionByDate(dateString)
      
      console.log(`[RefreshData] Successfully refreshed data for ${dateString}`)
      
      toast({
        title: "Data Refreshed",
        description: `Updated meal and nutrition data for ${format(selectedDate, "MMM dd, yyyy")}`,
      })
    } catch (error) {
      console.error(`[RefreshData] Error refreshing data:`, error)
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle meal creation with toast notification
  const handleAddMealLog = async (data: CreateMealLog): Promise<void> => {
    try {
      const result = await addMealLog(data)
      
      // Clear meal items cache to force fresh fetch of items for the new meal
      setMealItemsMap(prev => ({ ...prev, [result.id]: [] }))
      
      // Only refresh nutrition if we're in single date view
      if (viewMode === "single") {
        // Small delay to ensure backend processing completes
        setTimeout(() => {
          setNutritionRefreshKey(prev => prev + 1)
          // Fetch items for the new meal
          if (result.id) {
            fetchMealItems(result.id)
          }
        }, 300)
      }
      toast({
        title: "Success",
        description: "Meal log created successfully",
      })
    } catch (error) {
      console.error('Error adding meal log:', error)
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
      
      // Clear meal items cache for this meal to force fresh fetch
      setMealItemsMap(prev => {
        const newMap = { ...prev }
        delete newMap[id]
        return newMap
      })
      
      // Only refresh nutrition if we're in single date view
      if (viewMode === "single") {
        setTimeout(() => {
          setNutritionRefreshKey(prev => prev + 1)
          // Fetch fresh items for the updated meal
          fetchMealItems(id)
        }, 300)
      }
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
        
        // Remove meal items from cache since meal is deleted
        setMealItemsMap(prev => {
          const newMap = { ...prev }
          delete newMap[id]
          return newMap
        })
        setLoadingItemsForMeals(prev => {
          const newMap = { ...prev }
          delete newMap[id]
          return newMap
        })
        
        // Only refresh nutrition if we're in single date view
        if (viewMode === "single") {
          setTimeout(() => {
            setNutritionRefreshKey(prev => prev + 1)
          }, 300)
        }
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

  // NOTE: We don't auto-refresh nutrition on every date change to prevent excessive API requests.
  // The DailyNutritionDisplay component handles its own data fetching when the date prop changes.
  // We only refresh nutrition when meals are added/updated/deleted on the current date.

  // Calculate total nutrition for filtered meals (fallback for range view)  
  const totalNutrition = useMemo(() => {
    return finalMealsToShow.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.total_calories || 0),
        protein: acc.protein + (meal.total_protein || 0),
        carbs: acc.carbs + (meal.total_carbs || 0),
        fat: acc.fat + (meal.total_fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }, [finalMealsToShow])

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
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="outline" size="sm" onClick={clearError}>
                      Dismiss
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {nutritionError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
                  <span>{nutritionError}</span>
                  <Button variant="ghost" size="sm" onClick={clearNutritionError}>
                    ×
                  </Button>
                </div>
              )}

              

              {/* Daily Nutrition Display */}
              {viewMode === "single" && (
                <DailyNutritionDisplay 
                  date={selectedDate} 
                  autoFetch={true}
                  showChart={true}
                  refreshKey={nutritionRefreshKey}
                />
              )}

              {/* Range view - simple nutrition summary */}
              {viewMode === "range" && finalMealsToShow.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Range Nutrition Summary</CardTitle>
                    <CardDescription>
                      Total nutrition for selected period ({format(dateRange?.from || new Date(), "MMM dd")} - {format(dateRange?.to || new Date(), "MMM dd")})
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
              <Tabs defaultValue={MEAL_TYPES[0].toLowerCase()}>
                <TabsList>
                  {MEAL_TYPES.map((type) => (
                    <TabsTrigger key={type} value={type.toLowerCase()}>
                      {type}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {MEAL_TYPES.map((type) => (
                  <TabsContent key={type} value={type.toLowerCase()} className="mt-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{type}</CardTitle>
                            <CardDescription>
                              Meals logged for {type.toLowerCase()} 
                              {viewMode === "single" ? ` on ${formattedDate}` : " in selected period"}
                            </CardDescription>
                          </div>
                          {viewMode === "single" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={refreshCurrentDateData}
                              disabled={loading || nutritionLoading2}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {loading || nutritionLoading2 ? (
                          <div className="text-center py-8 space-y-4">
                            <div className="mx-auto w-8 h-8 animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
                            <p className="text-muted-foreground">
                              {loading ? "Loading meals..." : "Loading nutrition data..."}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {finalMealsToShow
                              .filter((meal: MealLog) => meal.meal_type === type)
                              .map((meal: MealLog) => {
                                // Get nutrition data for this specific meal
                                const nutrition = getNutritionForMeal(meal.id);
                                
                                return (
                                  <div
                                    key={meal.id}
                                    className="flex flex-col gap-4 p-6 border rounded-lg bg-card hover:shadow-md transition-shadow"
                                  >
                                    {/* Header with timestamp and actions */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex flex-col">
                                        <h3 className="font-semibold text-lg">
                                          {meal.meal_type}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          {format(new Date(meal.created_at), "MMM dd, yyyy 'at' h:mm a")}
                                        </p>
                                      </div>
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

                                    {/* Quick nutrition overview */}
                                    <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
                                      <div className="text-center">
                                        <div className="text-lg font-bold text-blue-600">
                                          {nutrition.loading ? "..." : (nutrition.calories || meal.total_calories || 0)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Calories</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-lg font-bold text-green-600">
                                          {nutrition.loading ? "..." : `${nutrition.protein || meal.total_protein || 0}g`}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Protein</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-lg font-bold text-orange-600">
                                          {nutrition.loading ? "..." : `${nutrition.carbs || meal.total_carbs || 0}g`}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Carbs</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-lg font-bold text-purple-600">
                                          {nutrition.loading ? "..." : `${nutrition.fat || meal.total_fat || 0}g`}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Fat</div>
                                      </div>
                                    </div>
                                    
                                    {/* Food items list */}
                                    <div className="space-y-2">
                                      {(() => {
                                        const mealItems = mealItemsMap[meal.id] || []
                                        const isLoadingItems = loadingItemsForMeals[meal.id] || false
                                        const itemCount = mealItems.length
                                        
                                        return (
                                          <>
                                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                                              Food Items ({itemCount})
                                              {isLoadingItems && (
                                                <span className="ml-2 text-xs animate-pulse">Loading...</span>
                                              )}
                                            </h4>
                                            
                                            {isLoadingItems ? (
                                              <div className="text-center py-4">
                                                <div className="mx-auto w-4 h-4 animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
                                                <p className="text-xs text-muted-foreground mt-2">Loading food items...</p>
                                              </div>
                                            ) : mealItems.length > 0 ? (
                                              <div className="space-y-2">
                                                {mealItems.map(item => (
                                                  <div
                                                    key={item.id}
                                                    className="flex items-center justify-between p-2 bg-background rounded border"
                                                  >
                                                    <div className="flex flex-col">
                                                      <span className="font-medium">
                                                        {item.food_name || 
                                                         foods.find(f => f.id === item.food_id)?.name || 
                                                         `Food ID: ${item.food_id}`}
                                                      </span>
                                                      <span className="text-xs text-muted-foreground">
                                                        Quantity: {item.quantity} • Weight: {item.quantity_grams}g
                                                      </span>
                                                    </div>
                                                    {item.calories && (
                                                      <span className="text-sm font-medium text-blue-600">
                                                        {item.calories} kcal
                                                      </span>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-center py-4 text-muted-foreground text-sm">
                                                No food items recorded for this meal
                                              </div>
                                            )}
                                          </>
                                        )
                                      })()}
                                    </div>

                                    {/* Show loading state for nutrition */}
                                    {nutrition.loading && (
                                      <div className="text-center py-2">
                                        <span className="text-sm text-muted-foreground">
                                          Loading detailed nutrition data...
                                        </span>
                                      </div>
                                    )}

                                    {/* Show nutrition error if any */}
                                    {nutrition.error && (
                                      <div className="text-center py-2">
                                        <span className="text-sm text-red-500">
                                          Error loading nutrition: {nutrition.error}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            
                            {/* Empty state */}
                            {(() => {
                              const mealsForType = finalMealsToShow.filter((meal: MealLog) => meal.meal_type === type);
                              const totalMealsCount = finalMealsToShow.length;
                              const allMealTypes = [...new Set(finalMealsToShow.map(m => m.meal_type))];
                              
                              // Log debug information for empty states
                              if (mealsForType.length === 0 && totalMealsCount > 0) {
                                console.log(`No ${type} meals found, but ${totalMealsCount} total meals exist for ${formattedDate}. Available meal types:`, allMealTypes);
                              } else if (mealsForType.length === 0 && totalMealsCount === 0) {
                                console.log(`No meals at all found for ${formattedDate}. Selected date:`, selectedDate.toISOString().split('T')[0]);
                              }
                              
                              return mealsForType.length === 0 && (
                                <div className="text-center py-8 space-y-4">
                                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                    <Utensils className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-lg mb-2">
                                      {searchTerm 
                                        ? `No ${type.toLowerCase()} meals found for "${searchTerm}"`
                                        : `No ${type.toLowerCase()} meals logged`
                                      }
                                    </h3>
                                    <p className="text-muted-foreground mb-2">
                                      {viewMode === "single" 
                                        ? `on ${formattedDate}`
                                        : "in the selected period"
                                      }
                                    </p>
                                    {/* Debug information in development */}
                                    {process.env.NODE_ENV === 'development' && (
                                      <div className="text-xs text-muted-foreground mb-4 p-2 bg-muted rounded">
                                        <p>Debug: Total meals loaded: {totalMealsCount}</p>
                                        <p>Available meal types: {allMealTypes.join(', ') || 'None'}</p>
                                        <p>Date: {selectedDate.toISOString().split('T')[0]}</p>
                                      </div>
                                    )}
                                  </div>
                                  <MealForm
                                    onSubmit={(data: CreateMealLog) => handleAddMealLog({ ...data, meal_type: type as MealType })}
                                    className="mt-4"
                                    buttonText={`Add ${type} Meal`}
                                  />
                                </div>
                              );
                            })()}
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