import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MealLog, CreateMealLog, MealNutritionCalculation, AddItemsToMealLogRequest, MealLogItemResponse } from '../types'
import axios from 'axios'
import { getErrorMessage } from '@/lib/utils'

export const useMealLogs = () => {
  const { isAuthenticated, user } = useAuth()
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    // Get the access token UUID from localStorage
    const tokenId = localStorage.getItem('accessToken')
    
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // The backend expects the UUID token ID in the Authorization header
      // Format: Bearer {token_id}
      ...(tokenId && { 'Authorization': `Bearer ${tokenId}` })
    }
  }

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
      const response = await axios.get('/api/meal-logs', {
        headers: getAuthHeaders()
      })
      setMealLogs(response.data)
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
      const response = await axios.get(`/api/meal-logs/user/date/${date}`, {
        headers: getAuthHeaders()
      })
      setMealLogs(response.data)
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
      const response = await axios.get(`/api/meal-logs?startDate=${startDate}&endDate=${endDate}`, {
        headers: getAuthHeaders()
      })
      setMealLogs(response.data)
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
      const response = await axios.get(`/api/meal-logs/${id}`, {
        headers: getAuthHeaders()
      })
      return response.data
    } catch (err) {
      console.error('Error fetching meal log by ID:', err)
      throw err
    }
  }

  // Create a new meal log
  const addMealLog = async (data: CreateMealLog): Promise<MealLog> => {
    try {
      setLoading(true)
      const response = await axios.post('/api/meal-logs', data, {
        headers: getAuthHeaders()
      })
      
      // The API returns { meal_log: {...}, items: [...] }
      // We need to combine them into a single MealLog object
      const newMealLog: MealLog = {
        ...response.data.meal_log,
        items: response.data.items || []
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
      const response = await axios.put(`/api/meal-logs/${id}`, data, {
        headers: getAuthHeaders()
      })
      
      // Update the meal log in the local state
      setMealLogs(prev =>
        prev.map(log => (log.id === id ? response.data : log))
      )
      setError(null)
      return response.data
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
      await axios.delete(`/api/meal-logs/${id}`, {
        headers: getAuthHeaders()
      })
      
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
      const response = await axios.get(`/api/nutrition/meal/${mealLogId}`, {
        headers: getAuthHeaders()
      })
      return response.data
    } catch (err) {
      console.error('Error fetching meal nutrition:', err)
      throw err
    }
  }

  // Add items to an existing meal log
  const addItemsToMealLog = async (mealLogId: number, data: AddItemsToMealLogRequest): Promise<MealLogItemResponse[]> => {
    try {
      const response = await axios.post(`/api/meal-logs/${mealLogId}/items`, data, {
        headers: getAuthHeaders()
      })
      return response.data
    } catch (err) {
      console.error('Error adding items to meal log:', err)
      throw err
    }
  }

  // Helper function to format date for API calls (YYYY-MM-DD)
  // This ensures consistent date formatting using local date components
  const formatDateForAPI = (date: Date): string => {
    // Use local date components to preserve the user's intended calendar date
    const year = date.getFullYear();
    // Add 1 to month because getMonth() returns 0-11
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}`;
    console.log(`Formatting date for meal logs: ${date.toISOString()} → ${formattedDate} (local: ${date.toLocaleDateString()})`);
    return formattedDate;
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