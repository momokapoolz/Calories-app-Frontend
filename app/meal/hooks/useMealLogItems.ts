import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { 
  MealLogItemResponse, 
  CreateMealLogItemRequest, 
  UpdateMealLogItemRequest,
  AddItemsToMealLogRequest,
  SuccessMessage
} from '../types'
import { mealLogItemService } from '../services/mealLogItemService'
import { getErrorMessage } from '@/lib/utils'

export const useMealLogItems = () => {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<MealLogItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create a new meal log item
  const createMealLogItem = useCallback(async (data: CreateMealLogItemRequest): Promise<MealLogItemResponse> => {
    try {
      setLoading(true)
      setError(null)
      const newItem = await mealLogItemService.createMealLogItem(data)
      setItems(prev => [...prev, newItem])
      return newItem
    } catch (err) {
      const errorMessage = `Failed to create meal log item: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('Error creating meal log item:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get meal log item by ID
  const getMealLogItemById = useCallback(async (id: number): Promise<MealLogItemResponse> => {
    try {
      setLoading(true)
      setError(null)
      const item = await mealLogItemService.getMealLogItemById(id)
      return item
    } catch (err) {
      const errorMessage = `Failed to fetch meal log item: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('Error fetching meal log item by ID:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get meal log items by meal log ID
  const getMealLogItemsByMealLogId = useCallback(async (mealLogId: number): Promise<MealLogItemResponse[]> => {
    try {
      setLoading(true)
      setError(null)
      const fetchedItems = await mealLogItemService.getMealLogItemsByMealLogId(mealLogId)
      setItems(fetchedItems)
      return fetchedItems
    } catch (err) {
      const errorMessage = `Failed to fetch meal log items: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('Error fetching meal log items by meal log ID:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get meal log items by food ID
  const getMealLogItemsByFoodId = useCallback(async (foodId: number): Promise<MealLogItemResponse[]> => {
    try {
      setLoading(true)
      setError(null)
      const fetchedItems = await mealLogItemService.getMealLogItemsByFoodId(foodId)
      setItems(fetchedItems)
      return fetchedItems
    } catch (err) {
      const errorMessage = `Failed to fetch meal log items by food: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('Error fetching meal log items by food ID:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update a meal log item
  const updateMealLogItem = useCallback(async (id: number, data: UpdateMealLogItemRequest): Promise<MealLogItemResponse> => {
    try {
      setLoading(true)
      setError(null)
      const updatedItem = await mealLogItemService.updateMealLogItem(id, data)
      
      // Update the item in the local state
      setItems(prev =>
        prev.map(item => (item.id === id ? updatedItem : item))
      )
      
      return updatedItem
    } catch (err) {
      const errorMessage = `Failed to update meal log item: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('Error updating meal log item:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete a meal log item
  const deleteMealLogItem = useCallback(async (id: number): Promise<SuccessMessage> => {
    try {
      setLoading(true)
      setError(null)
      const result = await mealLogItemService.deleteMealLogItem(id)
      
      // Remove the item from the local state
      setItems(prev => prev.filter(item => item.id !== id))
      
      return result
    } catch (err) {
      const errorMessage = `Failed to delete meal log item: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('Error deleting meal log item:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete meal log items by meal log ID
  const deleteMealLogItemsByMealLogId = useCallback(async (mealLogId: number): Promise<SuccessMessage> => {
    try {
      setLoading(true)
      setError(null)
      const result = await mealLogItemService.deleteMealLogItemsByMealLogId(mealLogId)
      
      // Remove all items for this meal log from the local state
      setItems(prev => prev.filter(item => item.meal_log_id !== mealLogId))
      
      return result
    } catch (err) {
      const errorMessage = `Failed to delete meal log items: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('Error deleting meal log items by meal log ID:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Add Items to Meal Log
  const addItemsToMealLog = useCallback(async (mealLogId: number, data: AddItemsToMealLogRequest): Promise<MealLogItemResponse[]> => {
    try {
      setLoading(true)
      setError(null)
      const newItems = await mealLogItemService.addItemsToMealLog(mealLogId, data)
      
      // Add the new items to the local state
      setItems(prev => [...prev, ...newItems])
      
      return newItems
    } catch (err) {
      const errorMessage = `Failed to add items to meal log: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('Error adding items to meal log:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Clear items
  const clearItems = useCallback(() => {
    setItems([])
  }, [])

  // Helper function to get items for a specific meal log
  const getItemsForMealLog = useCallback((mealLogId: number) => {
    return items.filter(item => item.meal_log_id === mealLogId)
  }, [items])

  // Helper function to get items for a specific food
  const getItemsForFood = useCallback((foodId: number) => {
    return items.filter(item => item.food_id === foodId)
  }, [items])

  // Helper function to calculate total quantity for a meal log
  const getTotalQuantityForMealLog = useCallback((mealLogId: number) => {
    const mealLogItems = getItemsForMealLog(mealLogId)
    return mealLogItems.reduce((total, item) => total + item.quantity_grams, 0)
  }, [getItemsForMealLog])

  return {
    // State
    items,
    loading,
    error,
    isAuthenticated,

    // CRUD operations
    createMealLogItem,
    getMealLogItemById,
    getMealLogItemsByMealLogId,
    getMealLogItemsByFoodId,
    updateMealLogItem,
    deleteMealLogItem,
    deleteMealLogItemsByMealLogId,
    addItemsToMealLog,

    // Helper functions
    clearError,
    clearItems,
    getItemsForMealLog,
    getItemsForFood,
    getTotalQuantityForMealLog,
  }
} 