import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { DailyNutritionSummary } from '../types'
import axios from 'axios'
import { getErrorMessage } from '@/lib/utils'

export interface WeeklyNutritionData {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export const useWeeklyNutrition = () => {
  const { isAuthenticated, user } = useAuth()
  const [weeklyData, setWeeklyData] = useState<WeeklyNutritionData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(() => {
    const tokenId = localStorage.getItem('accessToken')
    
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(tokenId && { 'Authorization': `Bearer ${tokenId}` })
    }
  }, [])

  // Helper function to format date for API calls (YYYY-MM-DD)
  const formatDateForAPI = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }, [])

  // Get date range for the past 7 days
  const getWeekDateRange = useCallback(() => {
    const dates = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push(formatDateForAPI(date))
    }
    
    return dates
  }, [formatDateForAPI])

  // Fetch nutrition data for the past 7 days
  const fetchWeeklyNutrition = useCallback(async (): Promise<WeeklyNutritionData[]> => {
    if (!isAuthenticated) {
      setError('Authentication required')
      return []
    }

    try {
      setLoading(true)
      setError(null)
      
      const dates = getWeekDateRange()
      const headers = getAuthHeaders()
      
      console.log(`Fetching weekly nutrition data for dates:`, dates)
      
      // Fetch nutrition data for each day in parallel
      const promises = dates.map(async (date) => {
        try {
          const response = await axios.get(`/api/nutrition/date/${date}`, {
            headers,
            params: {
              _t: new Date().getTime() // Prevent caching
            }
          })
          
          const data = response.data as DailyNutritionSummary
          
          // Extract macro data from the response
          const macros = data.MacroNutrientBreakDown?.[0] || {}
          
          return {
            date,
            calories: data.total_calories || 0,
            protein: macros.protein || 0,
            carbs: macros.carbohydrate || 0,
            fat: macros.total_lipid_fe || 0
          }
        } catch (err: any) {
          // If no data for a specific day, return zeros
          if (err.response?.status === 404) {
            console.log(`No nutrition data for ${date}`)
            return {
              date,
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0
            }
          }
          throw err
        }
      })
      
      const results = await Promise.all(promises)
      
      console.log(`Weekly nutrition data fetched:`, results)
      setWeeklyData(results)
      return results
      
    } catch (err: any) {
      const errorMessage = `Failed to fetch weekly nutrition data: ${getErrorMessage(err)}`
      setError(errorMessage)
      console.error('Error fetching weekly nutrition:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, getAuthHeaders, getWeekDateRange])

  // Get today's nutrition data
  const getTodaysNutrition = useCallback((): WeeklyNutritionData | null => {
    const today = formatDateForAPI(new Date())
    return weeklyData.find(data => data.date === today) || null
  }, [weeklyData, formatDateForAPI])

  // Get total calories for the week
  const getWeeklyTotal = useCallback(() => {
    return weeklyData.reduce((total, day) => ({
      calories: total.calories + day.calories,
      protein: total.protein + day.protein,
      carbs: total.carbs + day.carbs,
      fat: total.fat + day.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }, [weeklyData])

  // Get weekly average
  const getWeeklyAverage = useCallback(() => {
    const total = getWeeklyTotal()
    const daysWithData = weeklyData.filter(day => day.calories > 0).length || 1
    
    return {
      calories: Math.round(total.calories / daysWithData),
      protein: Math.round(total.protein / daysWithData),
      carbs: Math.round(total.carbs / daysWithData),
      fat: Math.round(total.fat / daysWithData)
    }
  }, [weeklyData, getWeeklyTotal])

  // Format date for display (Mon, Tue, etc.)
  const formatDateForChart = useCallback((dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }, [])

  // Auto-fetch weekly data when component mounts or authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchWeeklyNutrition()
    }
  }, [isAuthenticated, fetchWeeklyNutrition])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    weeklyData,
    loading,
    error,
    fetchWeeklyNutrition,
    getTodaysNutrition,
    getWeeklyTotal,
    getWeeklyAverage,
    formatDateForChart,
    clearError
  }
} 