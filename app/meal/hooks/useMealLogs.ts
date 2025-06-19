import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MealLog, CreateMealLog, DateRangeParams } from '../types'
import { mealLogService } from '../services/mealLogService'
import { getErrorMessage } from '@/lib/utils'

export const useMealLogs = () => {
  const { isAuthenticated } = useAuth()
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<{
    type: 'all' | 'date' | 'dateRange'
    params?: string | DateRangeParams
  } | null>(null)

  // Get all meal logs for the authenticated user
  const fetchMealLogs = async () => {
    try {
      setLoading(true)
      const data = await mealLogService.getMealLogsByUser()
      setMealLogs(data)
      setError(null)
      setLastFetch({ type: 'all' })
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
      const data = await mealLogService.getMealLogsByUserAndDate(date)
      setMealLogs(data)
      setError(null)
      setLastFetch({ type: 'date', params: date })
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
      const dateRange = { startDate, endDate }
      const data = await mealLogService.getMealLogsByUserAndDateRange(dateRange)
      setMealLogs(data)
      setError(null)
      setLastFetch({ type: 'dateRange', params: dateRange })
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
      return await mealLogService.getMealLogById(id)
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
    try {
      setLoading(true)
      const updatedMealLog = await mealLogService.updateMealLog(id, data)
      
      // Update the meal log in the local state
      setMealLogs(prev =>
        prev.map(log => (log.id === id ? updatedMealLog : log))
      )
      setError(null)
      return updatedMealLog
    } catch (err) {
      const errorMessage = `Failed to update meal log: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('Error updating meal log:', err)
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

  // Helper function to format date for API calls (YYYY-MM-DD)
  const formatDateForAPI = (date: Date): string => {
    return mealLogService.formatDateForAPI(date)
  }

  // Enhanced convenience methods
  const getTodaysMeals = async () => {
    try {
      setLoading(true)
      const data = await mealLogService.getTodaysMealLogs()
      setMealLogs(data)
      setError(null)
      setLastFetch({ type: 'date', params: mealLogService.getTodayFormatted() })
    } catch (err) {
      setError('Failed to fetch today\'s meals')
      console.error('Error fetching today\'s meals:', err)
    } finally {
      setLoading(false)
    }
  }

  const getLastWeekMeals = async () => {
    try {
      setLoading(true)
      const data = await mealLogService.getMealLogsForLastWeek()
      setMealLogs(data)
      setError(null)
      setLastFetch({ type: 'dateRange', params: mealLogService.getDateRangeForPeriod(7) })
    } catch (err) {
      setError('Failed to fetch last week\'s meals')
      console.error('Error fetching last week\'s meals:', err)
    } finally {
      setLoading(false)
    }
  }

  const getLastMonthMeals = async () => {
    try {
      setLoading(true)
      const data = await mealLogService.getMealLogsForLastMonth()
      setMealLogs(data)
      setError(null)
      setLastFetch({ type: 'dateRange', params: mealLogService.getDateRangeForPeriod(30) })
    } catch (err) {
      setError('Failed to fetch last month\'s meals')
      console.error('Error fetching last month\'s meals:', err)
    } finally {
      setLoading(false)
    }
  }

  // Smart refresh - refetch based on last fetch type
  const smartRefresh = async () => {
    if (!lastFetch) {
      return fetchMealLogs()
    }

    switch (lastFetch.type) {
      case 'date':
        if (typeof lastFetch.params === 'string') {
          return fetchMealLogsByDate(lastFetch.params)
        }
        break
      case 'dateRange':
        if (typeof lastFetch.params === 'object' && lastFetch.params) {
          return fetchMealLogsByDateRange(lastFetch.params.startDate, lastFetch.params.endDate)
        }
        break
      default:
        return fetchMealLogs()
    }
  }

  // Nutrition calculation helpers
  const getTotalNutrition = () => {
    return mealLogService.calculateTotalNutrition(mealLogs)
  }

  const getMealsByType = () => {
    return mealLogService.groupByMealType(mealLogs)
  }

  const getMealsByDate = () => {
    return mealLogService.groupByDate(mealLogs)
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
    lastFetch,
    // Core CRUD operations
    fetchMealLogs,
    fetchMealLogsByDate,
    fetchMealLogsByDateRange,
    fetchMealLogById,
    addMealLog,
    updateMealLog,
    deleteMealLog,
    // Convenience methods
    getTodaysMeals,
    getLastWeekMeals,
    getLastMonthMeals,
    // Refresh methods
    refreshMealLogs: fetchMealLogs,
    smartRefresh,
    // Helper functions
    formatDateForAPI,
    getTotalNutrition,
    getMealsByType,
    getMealsByDate,
    // Utility functions
    clearError: () => setError(null),
  }
} 