'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Loader2, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useMealLogItems } from '../hooks/useMealLogItems'
import { FoodSearch } from './FoodSearch'
import { CreateMealLogItemRequest, UpdateMealLogItemRequest, MealLogItemResponse } from '../types'
import { Food } from '@/app/food/types'

interface MealLogItemFormProps {
  mealLogId: number
  item?: MealLogItemResponse
  mode: 'create' | 'edit'
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export const MealLogItemForm: React.FC<MealLogItemFormProps> = ({
  mealLogId,
  item,
  mode,
  onSuccess,
  trigger
}) => {
  const [open, setOpen] = useState(false)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState('')
  const [quantityGrams, setQuantityGrams] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { toast } = useToast()
  const {
    createMealLogItem,
    updateMealLogItem,
    loading,
    error,
    clearError
  } = useMealLogItems()

  // Initialize form with existing item data if editing
  useEffect(() => {
    if (mode === 'edit' && item) {
      setQuantity(item.quantity.toString())
      setQuantityGrams(item.quantity_grams.toString())
      // Note: We'd need to fetch food details if we want to show the food name
    }
  }, [mode, item])

  // Clear form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedFood(null)
      setQuantity('')
      setQuantityGrams('')
      setFormError(null)
      clearError()
    }
  }, [open, clearError])

  const validateForm = (): boolean => {
    if (mode === 'create' && !selectedFood) {
      setFormError('Please select a food item')
      return false
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setFormError('Please enter a valid quantity')
      return false
    }

    if (!quantityGrams || parseFloat(quantityGrams) <= 0) {
      setFormError('Please enter a valid quantity in grams')
      return false
    }

    setFormError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (mode === 'create') {
        const data: CreateMealLogItemRequest = {
          meal_log_id: mealLogId,
          food_id: selectedFood!.id,
          quantity: parseFloat(quantity),
          quantity_grams: parseFloat(quantityGrams)
        }
        
        await createMealLogItem(data)
        toast({
          title: "Success",
          description: "Meal log item created successfully"
        })
      } else if (mode === 'edit' && item) {
        const data: UpdateMealLogItemRequest = {
          quantity: parseFloat(quantity),
          quantity_grams: parseFloat(quantityGrams)
        }
        
        await updateMealLogItem(item.id, data)
        toast({
          title: "Success",
          description: "Meal log item updated successfully"
        })
      }

      setOpen(false)
      onSuccess?.()
    } catch (err) {
      toast({
        title: "Error",
        description: mode === 'create' ? "Failed to create meal log item" : "Failed to update meal log item",
        variant: "destructive"
      })
    }
  }

  const defaultTrigger = mode === 'create' ? (
    <Button size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Add Item
    </Button>
  ) : (
    <Button variant="outline" size="sm">
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Item to Meal' : 'Edit Meal Item'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new food item to this meal log.' 
              : 'Update the quantity information for this item.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Food Selection (only for create mode) */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="food">Food Item *</Label>
              <FoodSearch
                onFoodSelect={setSelectedFood}
                placeholder="Search for a food item..."
              />
              {selectedFood && (
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-sm font-medium">{selectedFood.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedFood.calories_per_100g} kcal per 100g
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              step="0.1"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity (e.g., 1, 2.5)"
              required
            />
          </div>

          {/* Quantity in Grams */}
          <div className="space-y-2">
            <Label htmlFor="quantityGrams">Quantity (grams) *</Label>
            <Input
              id="quantityGrams"
              type="number"
              step="0.1"
              min="0"
              value={quantityGrams}
              onChange={(e) => setQuantityGrams(e.target.value)}
              placeholder="Enter quantity in grams"
              required
            />
          </div>

          {/* Error Display */}
          {(formError || error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formError || error}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Add Item' : 'Update Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 