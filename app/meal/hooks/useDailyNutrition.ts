import { useState, useCallback, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { DailyNutritionSummary } from '../types'
import { getErrorMessage } from '@/lib/utils'
import { dailyNutritionService } from '../services/dailyNutritionService'
import { mealLogService } from '../services/mealLogService'

export const useDailyNutrition = () => {
  const { isAuthenticated, user } = useAuth()
  const [nutritionData, setNutritionData] = useState<DailyNutritionSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  
  // Add request tracking to prevent duplicate requests
  const pendingRequests = useRef<Map<string, Promise<any>>>(new Map())

  // Clear all data when user changes
  const clearAllData = useCallback(() => {
    setNutritionData(null)
    setError(null)
    setLoading(false)
    // Clear pending requests when user changes
    pendingRequests.current.clear()
  }, [])

  // Detect user changes and clear data
  useEffect(() => {
    if (user?.id !== currentUserId) {
      console.log('useDailyNutrition: User changed from', currentUserId, 'to', user?.id, '- clearing data')
      clearAllData()
      setCurrentUserId(user?.id || null)
    }
  }, [user?.id, currentUserId, clearAllData])



  // Helper function to format date for API calls (YYYY-MM-DD)
  const formatDateForAPI = useCallback((date: Date): string => {
    return mealLogService.formatDateForAPI(date)
  }, [])

  // Fetch nutrition data for a specific date with request deduplication
  const fetchNutritionByDate = useCallback(async (date: string): Promise<DailyNutritionSummary | null> => {
    if (!isAuthenticated) {
      setError('Authentication required')
      return null
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      setError('Invalid date format. Use YYYY-MM-DD')
      return null
    }

    // Check if there's already a pending request for this date
    const requestKey = `nutrition-${date}-${user?.id || 'unknown'}`
    if (pendingRequests.current.has(requestKey)) {
      console.log('useDailyNutrition: Request already pending for date:', date)
      return pendingRequests.current.get(requestKey)
    }

    const requestPromise = (async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log(`Fetching nutrition data for date: ${date} and user: ${user?.email || 'unknown'}`)
        
        const data = await dailyNutritionService.getDailyNutrition(date)
        
        console.log(`Nutrition data received for date: ${date}`, {
          hasData: !!data,
          userId: data?.user_id || 'unknown',
          totalCalories: data?.total_calories || 0,
          mealCount: data?.MealBreakdown?.length || 0
        })
        
        setNutritionData(data)
        return data
      } catch (err: any) {
        let errorMessage = `Failed to fetch nutrition data: ${getErrorMessage(err)}`
        
        // Handle specific error cases
        if (err.response?.status === 401) {
          errorMessage = 'Authentication required. Please log in again.'
        } else if (err.response?.status === 403) {
          errorMessage = 'Access denied. You can only view your own nutrition data.'
        } else if (err.response?.status === 404) {
          errorMessage = 'No nutrition data found for this date.'
        }
        
        setError(errorMessage)
        // Only log actual errors, not normal 404s
        if (err.response?.status !== 404) {
          console.error('Error fetching nutrition data:', err)
        }
        return null
      } finally {
        setLoading(false)
        // Remove the request from pending requests
        pendingRequests.current.delete(requestKey)
      }
    })()

    // Store the promise to prevent duplicate requests
    pendingRequests.current.set(requestKey, requestPromise)
    return requestPromise
  }, [isAuthenticated, user])

  // Get today's nutrition data
  const fetchTodaysNutrition = useCallback(async (): Promise<DailyNutritionSummary | null> => {
    const today = new Date()
    const todayString = formatDateForAPI(today)
    return fetchNutritionByDate(todayString)
  }, [fetchNutritionByDate, formatDateForAPI])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Clear nutrition data
  const clearNutritionData = useCallback(() => {
    setNutritionData(null)
  }, [])

  return {
    nutritionData,
    loading,
    error,
    fetchNutritionByDate,
    fetchTodaysNutrition,
    formatDateForAPI,
    clearError,
    clearNutritionData,
    clearAllData
  }
} 