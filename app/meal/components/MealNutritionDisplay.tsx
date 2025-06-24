'use client'

import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMealNutrition } from '../hooks/useMealNutrition'
import { Button } from '@/components/ui/button'

interface MealNutritionDisplayProps {
  mealLogId: number
  autoFetch?: boolean
}

export const MealNutritionDisplay: React.FC<MealNutritionDisplayProps> = ({
  mealLogId,
  autoFetch = true
}) => {
  const {
    nutritionData,
    loading,
    error,
    fetchMealNutrition,
    clearError
  } = useMealNutrition()

  // Auto-fetch nutrition data when component mounts or mealLogId changes
  useEffect(() => {
    if (autoFetch && mealLogId) {
      fetchMealNutrition(mealLogId)
    }
  }, [mealLogId, autoFetch, fetchMealNutrition])

  // Manual fetch function
  const handleFetchNutrition = () => {
    fetchMealNutrition(mealLogId)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading nutrition calculation...</span>
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
            <Button variant="outline" size="sm" onClick={handleFetchNutrition}>
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (!nutritionData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No nutrition data available</p>
            <Button onClick={handleFetchNutrition}>
              Calculate Nutrition
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const macros = nutritionData.MacroNutrientBreakDown[0]

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Meal Nutrition Summary
            <Badge variant="outline">{nutritionData.meal_type}</Badge>
          </CardTitle>
          <CardDescription>
            {nutritionData.food_count} food items • {nutritionData.date}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(nutritionData.total_calories)}
              </div>
              <div className="text-sm text-muted-foreground">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(macros.protein)}g
              </div>
              <div className="text-sm text-muted-foreground">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(macros.carbohydrate)}g
              </div>
              <div className="text-sm text-muted-foreground">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(macros.total_lipid_fe)}g
              </div>
              <div className="text-sm text-muted-foreground">Fat</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Macronutrients */}
      <Card>
        <CardHeader>
          <CardTitle>Macronutrients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Energy:</span>
                <span className="font-medium">{macros.energy.toFixed(1)} kcal</span>
              </div>
              <div className="flex justify-between">
                <span>Protein:</span>
                <span className="font-medium">{macros.protein.toFixed(1)} g</span>
              </div>
              <div className="flex justify-between">
                <span>Carbohydrates:</span>
                <span className="font-medium">{macros.carbohydrate.toFixed(1)} g</span>
              </div>
              <div className="flex justify-between">
                <span>Total Fat:</span>
                <span className="font-medium">{macros.total_lipid_fe.toFixed(1)} g</span>
              </div>
              <div className="flex justify-between">
                <span>Fiber:</span>
                <span className="font-medium">{macros.fiber.toFixed(1)} g</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Cholesterol:</span>
                <span className="font-medium">{macros.cholesteroid.toFixed(1)} mg</span>
              </div>
              <div className="flex justify-between">
                <span>Vitamin A:</span>
                <span className="font-medium">{macros.vitamin_a.toFixed(1)} µg</span>
              </div>
              <div className="flex justify-between">
                <span>Vitamin B:</span>
                <span className="font-medium">{macros.vitamin_b.toFixed(1)} mg</span>
              </div>
              <div className="flex justify-between">
                <span>Calcium:</span>
                <span className="font-medium">{macros.calcium.toFixed(1)} mg</span>
              </div>
              <div className="flex justify-between">
                <span>Iron:</span>
                <span className="font-medium">{macros.iron.toFixed(1)} mg</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Micronutrients */}
      {nutritionData.MicroNutrientBreakDown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Micronutrients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nutritionData.MicroNutrientBreakDown.map((nutrient) => (
                <div key={nutrient.nutrient_id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">{nutrient.nutrient_name}:</span>
                  <span className="text-sm">
                    {nutrient.amount.toFixed(1)} {nutrient.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={handleFetchNutrition}>
          Refresh Nutrition Data
        </Button>
      </div>
    </div>
  )
} 