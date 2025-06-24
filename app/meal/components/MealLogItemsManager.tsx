'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Trash2, AlertCircle, RefreshCw, Plus, Calculator } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useMealLogItems } from '../hooks/useMealLogItems'
import { MealLogItemForm } from './MealLogItemForm'
import { MealNutritionDisplay } from './MealNutritionDisplay'
import { MealLogItemResponse } from '../types'
import { useFood } from '@/app/food/hooks/useFood'

interface MealLogItemsManagerProps {
  mealLogId: number
  showNutrition?: boolean
  autoLoad?: boolean
}

export const MealLogItemsManager: React.FC<MealLogItemsManagerProps> = ({
  mealLogId,
  showNutrition = true,
  autoLoad = true
}) => {
  const [showNutritionCalculation, setShowNutritionCalculation] = useState(false)
  const { toast } = useToast()
  const { foods } = useFood()

  const {
    items,
    loading,
    error,
    getMealLogItemsByMealLogId,
    deleteMealLogItem,
    deleteMealLogItemsByMealLogId,
    clearError,
    getItemsForMealLog,
    getTotalQuantityForMealLog
  } = useMealLogItems()

  // Load items when component mounts or mealLogId changes
  useEffect(() => {
    if (autoLoad && mealLogId) {
      handleRefreshItems()
    }
  }, [mealLogId, autoLoad])

  const handleRefreshItems = async () => {
    try {
      await getMealLogItemsByMealLogId(mealLogId)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load meal items",
        variant: "destructive"
      })
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      await deleteMealLogItem(itemId)
      toast({
        title: "Success",
        description: "Item deleted successfully"
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAllItems = async () => {
    if (!window.confirm('Are you sure you want to delete ALL items from this meal? This action cannot be undone.')) {
      return
    }

    try {
      await deleteMealLogItemsByMealLogId(mealLogId)
      toast({
        title: "Success",
        description: "All items deleted successfully"
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete all items",
        variant: "destructive"
      })
    }
  }

  const mealLogItems = getItemsForMealLog(mealLogId)
  const totalQuantity = getTotalQuantityForMealLog(mealLogId)

  // Helper function to get food name
  const getFoodName = (foodId: number): string => {
    const food = foods.find(f => f.id === foodId)
    return food?.name || `Food ID: ${foodId}`
  }

  // Helper function to get food details for calculation
  const getFoodDetails = (foodId: number) => {
    return foods.find(f => f.id === foodId)
  }

  // Calculate estimated calories for display
  const calculateEstimatedCalories = (item: MealLogItemResponse): number => {
    const food = getFoodDetails(item.food_id)
    if (!food) return 0
    return (food.calories_per_100g * item.quantity_grams) / 100
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Meal Items
                <Badge variant="secondary">{mealLogItems.length} items</Badge>
              </CardTitle>
              <CardDescription>
                Manage food items in this meal log
                {totalQuantity > 0 && ` • Total: ${totalQuantity.toFixed(1)}g`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshItems}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <MealLogItemForm
                mealLogId={mealLogId}
                mode="create"
                onSuccess={handleRefreshItems}
              />
            </div>
          </div>
        </CardHeader>

        {/* Error Display */}
        {error && (
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={clearError}>
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}

        {/* Items List */}
        <CardContent>
          {loading && mealLogItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading items...
            </div>
          ) : mealLogItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No items in this meal yet</p>
              <MealLogItemForm
                mealLogId={mealLogId}
                mode="create"
                onSuccess={handleRefreshItems}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {mealLogItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{getFoodName(item.food_id)}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Qty: {item.quantity}</span>
                          <span>Weight: {item.quantity_grams}g</span>
                          <span>Est. Calories: ~{calculateEstimatedCalories(item).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MealLogItemForm
                      mealLogId={mealLogId}
                      item={item}
                      mode="edit"
                      onSuccess={handleRefreshItems}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Bulk Actions */}
              {mealLogItems.length > 1 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-muted-foreground">
                      {mealLogItems.length} items • {totalQuantity.toFixed(1)}g total
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteAllItems}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutrition Calculation */}
      {showNutrition && mealLogItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Nutrition Analysis
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNutritionCalculation(!showNutritionCalculation)}
              >
                {showNutritionCalculation ? 'Hide' : 'Show'} Details
              </Button>
            </div>
          </CardHeader>
          {showNutritionCalculation && (
            <CardContent>
              <MealNutritionDisplay 
                mealLogId={mealLogId}
                autoFetch={showNutritionCalculation}
              />
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
} 