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
import { DailyNutritionDisplay } from "./components/DailyNutritionDisplay"
import { useMealLogs } from "./hooks/useMealLogs"
import { useDailyNutrition } from "./hooks/useDailyNutrition"
import { useFood } from "@/app/food/hooks/useFood"
import { MealLog, MealType, CreateMealLog } from "./types"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertCircle, AlertDescription } from "@/components/ui/alert"

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
    nutritionData,
    loading: nutritionLoading,
    error: nutritionError,
    fetchNutritionByDate,
    formatDateForAPI: formatNutritionDate,
    clearError: clearNutritionError,
    clearAllData: clearNutritionData
  } = useDailyNutrition()

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
    }
  }, [user?.id, currentUserId])

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
      const dateString = formatDateForAPI(date)
      
      // Log date selection for debugging
      console.log(`Date selected: ${dateString} for user: ${user?.email || 'unknown'}`)
      
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

  // Handle meal creation with toast notification
  const handleAddMealLog = async (data: CreateMealLog): Promise<void> => {
    try {
      const result = await addMealLog(data)
      
      // Only refresh nutrition if we're in single date view
      if (viewMode === "single") {
        // Small delay to ensure backend processing completes
        setTimeout(() => {
          setNutritionRefreshKey(prev => prev + 1)
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
      // Only refresh nutrition if we're in single date view
      if (viewMode === "single") {
        setTimeout(() => {
          setNutritionRefreshKey(prev => prev + 1)
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

              {/* Debug Information for Development */}
              {process.env.NODE_ENV === 'development' && (
                <Alert>
                  <AlertDescription>
                    <div className="text-xs space-y-1">
                      <div><strong>Debug Info:</strong></div>
                      <div>User ID: {user?.id || 'None'}</div>
                      <div>User Email: {user?.email || 'None'}</div>
                      <div>Meal Logs Count: {mealLogs.length}</div>
                      <div>Selected Date: {formatDateForAPI(selectedDate)}</div>
                      <div>Date Object: {selectedDate.toISOString()}</div>
                      <div>Local Date String: {selectedDate.toLocaleDateString()}</div>
                      <div>Loading: {loading ? 'Yes' : 'No'}</div>
                      <div>Nutrition Loading: {nutritionLoading ? 'Yes' : 'No'}</div>
                      <div>Has Nutrition Data: {nutritionData ? 'Yes' : 'No'}</div>
                      <div>Auth Token ID: {localStorage.getItem('accessToken')?.substring(0, 8) || 'None'}...</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <em>Note: The app uses UUID token IDs for authentication, not full JWT tokens</em>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          clearData()
                          clearNutritionData()
                          const dateString = formatDateForAPI(selectedDate)
                          fetchMealLogsByDate(dateString)
                          fetchNutritionByDate(dateString)
                        }}>
                          Force Refresh All Data
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          console.log('Current state:', {
                            user: user,
                            mealLogs: mealLogs,
                            nutritionData: nutritionData,
                            token: localStorage.getItem('accessToken')?.substring(0, 20)
                          })
                        }}>
                          Log State
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={async () => {
                            try {
                              // Test different date formatting methods
                              const date = selectedDate;
                              
                              // Method 1: Using toISOString (original method)
                              const dateIso = date.toISOString().split('T')[0];
                              
                              // Method 2: Using UTC components (new method)
                              const year = date.getUTCFullYear();
                              const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                              const day = String(date.getUTCDate()).padStart(2, '0');
                              const dateUtc = `${year}-${month}-${day}`;
                              
                              // Method 3: Using local components
                              const yearLocal = date.getFullYear();
                              const monthLocal = String(date.getMonth() + 1).padStart(2, '0');
                              const dayLocal = String(date.getDate()).padStart(2, '0');
                              const dateLocal = `${yearLocal}-${monthLocal}-${dayLocal}`;
                              
                              console.log('Date formatting comparison:', {
                                original: date,
                                iso: dateIso,
                                utc: dateUtc,
                                local: dateLocal,
                                isoTimestamp: date.toISOString(),
                                utcString: date.toUTCString(),
                                localString: date.toString()
                              });
                              
                              alert(`Date Formatting Comparison:
                                Original: ${date}
                                ISO: ${dateIso}
                                UTC: ${dateUtc}
                                Local: ${dateLocal}
                                
                                Current format used: ${formatDateForAPI(date)}
                              `);
                            } catch (err) {
                              console.error('Error testing date formats:', err);
                              alert(`Error: ${err.message}`);
                            }
                          }}
                        >
                          Test Date Formats
                        </Button>
                      </div>
                      
                      {/* Direct API Testing Section */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="font-medium mb-2">Direct API Testing</div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={async () => {
                              try {
                                const dateString = formatDateForAPI(selectedDate);
                                const headers = {
                                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                                  'Content-Type': 'application/json'
                                };
                                
                                console.log(`Testing direct API call to /api/meal-logs/user/date/${dateString}`);
                                const response = await fetch(`/api/meal-logs/user/date/${dateString}?_t=${new Date().getTime()}`, {
                                  headers
                                });
                                
                                const data = await response.json();
                                console.log('Direct meal logs API response:', {
                                  status: response.status,
                                  dataLength: Array.isArray(data) ? data.length : 'Not an array',
                                  data
                                });
                                
                                alert(`Meal Logs API Status: ${response.status}\nFound: ${Array.isArray(data) ? data.length : 'Not an array'} meals`);
                              } catch (err) {
                                console.error('Error testing meal logs API:', err);
                                alert(`Error: ${err.message}`);
                              }
                            }}
                          >
                            Test Meal Logs API
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={async () => {
                              try {
                                const dateString = formatDateForAPI(selectedDate);
                                const headers = {
                                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                                  'Content-Type': 'application/json'
                                };
                                
                                console.log(`Testing direct API call to /api/nutrition/date/${dateString}`);
                                const response = await fetch(`/api/nutrition/date/${dateString}?_t=${new Date().getTime()}`, {
                                  headers
                                });
                                
                                const data = await response.json();
                                console.log('Direct nutrition API response:', {
                                  status: response.status,
                                  userId: data?.user_id,
                                  mealCount: data?.MealBreakdown?.length || 0,
                                  data
                                });
                                
                                alert(`Nutrition API Status: ${response.status}\nUser ID: ${data?.user_id}\nMeal Count: ${data?.MealBreakdown?.length || 0}`);
                              } catch (err) {
                                console.error('Error testing nutrition API:', err);
                                alert(`Error: ${err.message}`);
                              }
                            }}
                          >
                            Test Nutrition API
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
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
              {viewMode === "range" && searchFilteredMeals.length > 0 && (
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