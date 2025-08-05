import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MealLog, CreateMealLog, MealNutritionCalculation, AddItemsToMealLogRequest, MealLogItemResponse } from '../types'
import { getErrorMessage } from '@/lib/utils'
import { mealLogService } from '../services/mealLogService'

export const useMealLogs = () => {
  const { isAuthenticated, user } = useAuth()
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)



  // Clear all data when user changes
  const clearData = () => {
    setMealLogs([])
    setError(null)
    setLoading(true)
  }

  // Detect user changes and clear data
  useEffect(() => {
    if (user?.id !== currentUserId) {
      console.log('useMealLogs: User changed from', currentUserId, 'to', user?.id, '- clearing data')
      clearData()
      setCurrentUserId(user?.id || null)
    }
  }, [user?.id, currentUserId])

  // Get all meal logs for the authenticated user
  const fetchMealLogs = async () => {
    try {
      setLoading(true)
      const mealLogs = await mealLogService.getMealLogsByUser()
      setMealLogs(mealLogs)
      setError(null)
    } catch (err) {
      setError('Failed to fetch meal logs')
      console.error('Error fetching meal logs:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get meal logs for a specific date
  const fetchMealLogsByDate = async (date: string) => {
    try {
      setLoading(true)
      const mealLogs = await mealLogService.getMealLogsByUserAndDate(date)
      setMealLogs(mealLogs)
      setError(null)
    } catch (err) {
      setError('Failed to fetch meal logs for the selected date')
      console.error('Error fetching meal logs by date:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get meal logs for a date range
  const fetchMealLogsByDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true)
      const mealLogs = await mealLogService.getMealLogsByUserAndDateRange({ startDate, endDate })
      setMealLogs(mealLogs)
      setError(null)
    } catch (err) {
      setError('Failed to fetch meal logs for the selected date range')
      console.error('Error fetching meal logs by date range:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get a specific meal log by ID
  const fetchMealLogById = async (id: number): Promise<MealLog | null> => {
    try {
      const mealLog = await mealLogService.getMealLogById(id)
      return mealLog
    } catch (err) {
      console.error('Error fetching meal log by ID:', err)
      throw err
    }
  }

  // Create a new meal log
  const addMealLog = async (data: CreateMealLog): Promise<MealLog> => {
    try {
      setLoading(true)
      const response = await mealLogService.createMealLog(data)
      
      // The API returns { meal_log: {...}, items: [...] }
      // We need to combine them into a single MealLog object
      const newMealLog: MealLog = {
        ...response.meal_log,
        items: response.items || []
      }
      
      setMealLogs(prev => [...prev, newMealLog])
      setError(null)
      return newMealLog
    } catch (err) {
      const errorMessage = `Failed to create meal log: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('Error creating meal log:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update an existing meal log
  const updateMealLog = async (id: number, data: CreateMealLog): Promise<MealLog> => {
    console.log('🔧 updateMealLog called with:', { id, data });
    
    try {
      setLoading(true)
      
      // Use the service to update the meal log
      const updatedMeal = await mealLogService.updateMealLog(id, data);
      console.log('✅ Updated meal fetched:', updatedMeal);
      
      // Update the meal log in the local state
      setMealLogs(prev =>
        prev.map(log => (log.id === id ? updatedMeal : log))
      )
      setError(null)
      return updatedMeal
    } catch (err) {
      const errorMessage = `Failed to update meal log: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('❌ Error updating meal log:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete a meal log
  const deleteMealLog = async (id: number): Promise<void> => {
    try {
      setLoading(true)
      await mealLogService.deleteMealLog(id)
      
      // Remove the meal log from the local state
      setMealLogs(prev => prev.filter(log => log.id !== id))
      setError(null)
    } catch (err) {
      const errorMessage = `Failed to delete meal log: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('Error deleting meal log:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get nutrition calculation for a specific meal
  const fetchMealNutrition = async (mealLogId: number): Promise<MealNutritionCalculation> => {
    try {
      const nutrition = await mealLogService.getMealNutritionCalculation(mealLogId)
      return nutrition
    } catch (err) {
      console.error('Error fetching meal nutrition:', err)
      throw err
    }
  }

  // Add items to an existing meal log
  const addItemsToMealLog = async (mealLogId: number, data: AddItemsToMealLogRequest): Promise<MealLogItemResponse[]> => {
    try {
      const items = await mealLogService.addItemsToMealLog(mealLogId, data)
      return items
    } catch (err) {
      console.error('Error adding items to meal log:', err)
      throw err
    }
  }

  // Helper function to format date for API calls (YYYY-MM-DD)
  const formatDateForAPI = (date: Date): string => {
    return mealLogService.formatDateForAPI(date)
  }

  // Load meal logs when component mounts or authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchMealLogs()
    }
  }, [isAuthenticated])

  return {
    mealLogs,
    loading,
    error,
    addMealLog,
    updateMealLog,
    deleteMealLog,
    fetchMealLogs,
    fetchMealLogsByDate,
    fetchMealLogsByDateRange,
    fetchMealLogById,
    fetchMealNutrition,
    addItemsToMealLog,
    formatDateForAPI,
    clearError: () => setError(null),
    clearData,
    refreshMealLogs: fetchMealLogs
  }
} 