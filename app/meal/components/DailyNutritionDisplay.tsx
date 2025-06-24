'use client'

import React, { useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Loader2, Calendar, RefreshCw, TrendingUp, Info, User, Shield } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useDailyNutrition } from '../hooks/useDailyNutrition'
import { DailyNutritionChart } from '@/components/daily-nutrition-chart'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/auth-context'

interface DailyNutritionDisplayProps {
  date: Date
  autoFetch?: boolean
  showChart?: boolean
  refreshKey?: number // Add refresh key to trigger data reload
}

export const DailyNutritionDisplay: React.FC<DailyNutritionDisplayProps> = ({
  date,
  autoFetch = true,
  showChart = true,
  refreshKey = 0
}) => {
  const { user } = useAuth()
  const {
    nutritionData,
    loading,
    error,
    fetchNutritionByDate,
    formatDateForAPI,
    clearError,
    clearNutritionData
  } = useDailyNutrition()

  // Memoize the date string to prevent unnecessary re-renders
  const dateString = useMemo(() => formatDateForAPI(date), [date, formatDateForAPI])

  // Auto-fetch nutrition data when component mounts, date changes, refreshKey changes, or user changes
  useEffect(() => {
    if (autoFetch && dateString && user?.id) {
      // Log when fetching nutrition data
      console.log(`DailyNutritionDisplay: Fetching data for date: ${dateString}, user: ${user?.email || 'unknown'}, refreshKey: ${refreshKey}`)
      fetchNutritionByDate(dateString)
    }
  }, [dateString, autoFetch, refreshKey, fetchNutritionByDate, user?.id, user?.email])

  // Manual fetch function - memoized to prevent re-creation
  const handleRefreshNutrition = useMemo(() => () => {
    if (dateString && user?.id) {
      console.log(`DailyNutritionDisplay: Manual refresh for date: ${dateString}, user: ${user?.email || 'unknown'}`)
      fetchNutritionByDate(dateString)
    }
  }, [dateString, fetchNutritionByDate, user?.id, user?.email])

  // Format date for display
  const formattedDate = format(date, 'MMMM d, yyyy')

  // Helper function to format date for API calls (YYYY-MM-DD) - local version for debugging
  // This ensures consistent date formatting regardless of timezone
  const formatDateLocal = (date: Date): string => {
    // Use UTC date components to avoid timezone issues
    const year = date.getUTCFullYear();
    // Add 1 to month because getUTCMonth() returns 0-11
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading daily nutrition for {user?.email}...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefreshNutrition}>
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  // Check if we have nutritionData but no meals (empty day for this user)
  const hasNoMeals = nutritionData && (!nutritionData.MealBreakdown || nutritionData.MealBreakdown.length === 0)
  
  if (!nutritionData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Nutrition Data</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load nutrition data for {formattedDate}
            </p>
            <Button onClick={handleRefreshNutrition}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Verify the nutrition data belongs to the current user
  const isCurrentUserData = nutritionData.user_id === user?.id
  if (!isCurrentUserData) {
    console.warn(`Nutrition data user ID (${nutritionData.user_id}) doesn't match current user ID (${user?.id})`)
  }
  
  // Log detailed nutrition data for debugging
  console.log('Nutrition data details:', {
    userId: nutritionData.user_id,
    date: nutritionData.date_range,
    totalCalories: nutritionData.total_calories,
    hasMealBreakdown: !!nutritionData.MealBreakdown,
    mealBreakdownLength: nutritionData.MealBreakdown?.length || 0,
    mealBreakdownData: nutritionData.MealBreakdown
  })

  if (hasNoMeals) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Meals Logged</h3>
              <p className="text-muted-foreground mb-4">
                You haven't logged any meals for {formattedDate} yet.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first meal to see nutrition calculations!
              </p>
              <Button onClick={handleRefreshNutrition} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              {/* Add debug button in development mode */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-medium text-amber-600 mb-2">Debug Information</p>
                  <div className="text-xs text-left bg-amber-50 p-2 rounded overflow-auto max-h-40">
                    <p><strong>User ID:</strong> {user?.id}</p>
                    <p><strong>Nutrition Data User ID:</strong> {nutritionData.user_id}</p>
                    <p><strong>Date:</strong> {nutritionData.date_range}</p>
                    <p><strong>Component Date Prop:</strong> {formatDateLocal(date)}</p>
                    <p><strong>Component Date String:</strong> {dateString}</p>
                    <p><strong>Date Object:</strong> {date.toISOString()}</p>
                    <p><strong>Has MealBreakdown Array:</strong> {nutritionData.MealBreakdown ? 'Yes' : 'No'}</p>
                    <p><strong>MealBreakdown Length:</strong> {nutritionData.MealBreakdown?.length || 0}</p>
                    {nutritionData.MealBreakdown && nutritionData.MealBreakdown.length > 0 && (
                      <div>
                        <p><strong>First Meal:</strong></p>
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(nutritionData.MealBreakdown[0], null, 2)}
                        </pre>
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        // Force display of nutrition data even without meals
                        console.log('Forcing display of nutrition data');
                        // This is just a debug function - in a real fix we would modify the component logic
                        alert('Full nutrition data: ' + JSON.stringify(nutritionData, null, 2).substring(0, 500) + '...');
                      }}
                    >
                      Force Show Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Privacy Information Card */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Privacy & Data Security</span>
              </div>
              <p className="text-sm">
                <strong>Why you might not see data:</strong> For security reasons, you can only view your own meal data and nutrition calculations. 
                If another user logged meals on this date, you won't see their data - this is intentional to protect privacy.
              </p>
              <p className="text-sm">
                <strong>Current user:</strong> {user?.email || 'Not logged in'} (ID: {user?.id || 'unknown'})
                {process.env.NODE_ENV === 'development' && (
                  <span className="block mt-1 text-xs text-gray-500">
                    Token ID: {localStorage.getItem('accessToken')?.substring(0, 8)}...
                    <br/>
                    <em>Note: The app uses UUID token IDs for authentication, not full JWT tokens</em>
                  </span>
                )}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Get macronutrients from the first breakdown entry
  const macros = nutritionData.MacroNutrientBreakDown?.[0] || {
    energy: 0,
    protein: 0,
    total_lipid_fe: 0,
    carbohydrate: 0,
    fiber: 0,
    cholesteroid: 0,
    vitamin_a: 0,
    vitamin_b: 0,
    calcium: 0,
    iron: 0
  }

  // Calculate totals from meal breakdown
  const mealTotals = nutritionData.MealBreakdown?.reduce((acc, meal) => ({
    protein: acc.protein + meal.protein,
    carbohydrate: acc.carbohydrate + meal.carbohydrate,
    fat: acc.fat + meal.fat,
    food_count: acc.food_count + meal.food_count
  }), { protein: 0, carbohydrate: 0, fat: 0, food_count: 0 }) || { protein: 0, carbohydrate: 0, fat: 0, food_count: 0 }

  return (
    <div className="space-y-6">
      {/* Summary Card with Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Nutrition Summary
            </div>
            <Button variant="outline" size="sm" onClick={handleRefreshNutrition}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>{formattedDate}</span>
            <div className="flex gap-2">
              <Badge variant="outline">{nutritionData.MealBreakdown?.length || 0} meals</Badge>
              <Badge variant="outline">{mealTotals.food_count} foods</Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nutrition Chart */}
            {showChart && (
              <div className="h-64">
                <DailyNutritionChart
                  protein={macros.protein || 0}
                  carbs={macros.carbohydrate || 0}
                  fat={macros.total_lipid_fe || 0}
                  totalCalories={nutritionData.total_calories || 0}
                />
              </div>
            )}
            
            {/* Main Nutrition Stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.round(nutritionData.total_calories || 0)}
                  </div>
                  <div className="text-sm text-orange-600/80">Calories</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(macros.protein || 0)}g
                  </div>
                  <div className="text-sm text-blue-600/80">Protein</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(macros.carbohydrate || 0)}g
                  </div>
                  <div className="text-sm text-green-600/80">Carbs</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(macros.total_lipid_fe || 0)}g
                  </div>
                  <div className="text-sm text-purple-600/80">Fat</div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-700">
                  {Math.round(macros.fiber || 0)}g Fiber
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Macronutrients */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Macronutrients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Energy:</span>
                <span className="font-medium">{(macros.energy || 0).toFixed(1)} kcal</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Protein:</span>
                <span className="font-medium">{(macros.protein || 0).toFixed(1)} g</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Carbohydrates:</span>
                <span className="font-medium">{(macros.carbohydrate || 0).toFixed(1)} g</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Total Fat:</span>
                <span className="font-medium">{(macros.total_lipid_fe || 0).toFixed(1)} g</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Fiber:</span>
                <span className="font-medium">{(macros.fiber || 0).toFixed(1)} g</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Cholesterol:</span>
                <span className="font-medium">{(macros.cholesteroid || 0).toFixed(1)} mg</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Vitamin A:</span>
                <span className="font-medium">{(macros.vitamin_a || 0).toFixed(1)} µg</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Vitamin B:</span>
                <span className="font-medium">{(macros.vitamin_b || 0).toFixed(1)} mg</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Calcium:</span>
                <span className="font-medium">{(macros.calcium || 0).toFixed(1)} mg</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>Iron:</span>
                <span className="font-medium">{(macros.iron || 0).toFixed(1)} mg</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Micronutrients */}
      {nutritionData.MicroNutrientBreakDown && nutritionData.MicroNutrientBreakDown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Micronutrients</CardTitle>
            <CardDescription>
              Detailed breakdown of vitamins and minerals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nutritionData.MicroNutrientBreakDown.map((nutrient) => (
                <div 
                  key={nutrient.nutrient_id} 
                  className="flex justify-between items-center p-3 bg-muted rounded-lg"
                >
                  <span className="text-sm font-medium">{nutrient.nutrient_name}:</span>
                  <span className="text-sm">
                    {(nutrient.amount || 0).toFixed(2)} {nutrient.unit || ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meal Breakdown */}
      {nutritionData.MealBreakdown && nutritionData.MealBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Meal Breakdown</CardTitle>
            <CardDescription>
              Nutrition breakdown by individual meals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nutritionData.MealBreakdown.map((meal) => (
                <div key={meal.meal_log_id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-lg capitalize">{meal.meal_type}</h4>
                    <Badge variant="secondary">{meal.food_count} foods</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">
                        {Math.round(meal.calories)}
                      </div>
                      <div className="text-xs text-orange-600/80">Calories</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {meal.protein.toFixed(1)}g
                      </div>
                      <div className="text-xs text-blue-600/80">Protein</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {meal.carbohydrate.toFixed(1)}g
                      </div>
                      <div className="text-xs text-green-600/80">Carbs</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {meal.fat.toFixed(1)}g
                      </div>
                      <div className="text-xs text-purple-600/80">Fat</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{(nutritionData.total_calories || 0).toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Total Calories</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{(mealTotals.protein || 0).toFixed(1)}g</div>
              <div className="text-sm text-muted-foreground">Total Protein</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{(mealTotals.carbohydrate || 0).toFixed(1)}g</div>
              <div className="text-sm text-muted-foreground">Total Carbs</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{(mealTotals.fat || 0).toFixed(1)}g</div>
              <div className="text-sm text-muted-foreground">Total Fat</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{nutritionData.MealBreakdown?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Meals Logged</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{mealTotals.food_count}</div>
              <div className="text-sm text-muted-foreground">Food Items</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{(macros.fiber || 0).toFixed(1)}g</div>
              <div className="text-sm text-muted-foreground">Total Fiber</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {Math.round(((macros.protein || 0) * 4 + (macros.carbohydrate || 0) * 4 + (macros.total_lipid_fe || 0) * 9))}
              </div>
              <div className="text-sm text-muted-foreground">Calculated Cals</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 