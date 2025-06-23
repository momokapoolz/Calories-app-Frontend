import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MealLog, CreateMealLog } from '../types'
import api from '@/lib/api-client'
import { getErrorMessage } from '@/lib/utils'

export const useMealLogs = () => {
  const { isAuthenticated } = useAuth()
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get all meal logs for the authenticated user
  const fetchMealLogs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/meal-logs/user')
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
      const response = await api.get(`/meal-logs/user/date/${date}`)
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
      const response = await api.get('/meal-logs/user/date-range', {
        params: { startDate, endDate }
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
      const response = await api.get(`/meal-logs/${id}`)
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
      const response = await api.post('/meal-logs', data)
      
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
      const response = await api.put(`/meal-logs/${id}`, data)
      
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
      await api.delete(`/meal-logs/${id}`)
      
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
    return date.toISOString().split('T')[0]
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
    // Core CRUD operations
    fetchMealLogs,
    fetchMealLogsByDate,
    fetchMealLogsByDateRange,
    fetchMealLogById,
    addMealLog,
    updateMealLog,
    deleteMealLog,
    // Helper functions
    formatDateForAPI,
    // Utility functions
    clearError: () => setError(null),
    refreshMealLogs: fetchMealLogs
  }
} 