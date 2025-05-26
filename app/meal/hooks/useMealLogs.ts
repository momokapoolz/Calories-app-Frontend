import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MealLog, CreateMealLog, UpdateMealLog } from '../types'
import { api } from '@/lib/api'

export const useMealLogs = () => {
  const { token } = useAuth()
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMealLogs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/meal-logs/user', {
        headers: { Authorization: `Bearer ${token}` }
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

  const fetchMealLogsByDate = async (date: string) => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/meal-logs/user/date/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
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

  const addMealLog = async (data: CreateMealLog) => {
    try {
      setLoading(true)
      const response = await api.post('/api/v1/meal-logs', data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMealLogs(prev => [...prev, response.data.meal_log])
      setError(null)
      return response.data.meal_log
    } catch (err) {
      setError('Failed to create meal log')
      console.error('Error creating meal log:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateMealLog = async (id: number, data: UpdateMealLog) => {
    try {
      setLoading(true)
      const response = await api.put(`/api/v1/meal-logs/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMealLogs(prev =>
        prev.map(log => (log.id === id ? response.data : log))
      )
      setError(null)
      return response.data
    } catch (err) {
      setError('Failed to update meal log')
      console.error('Error updating meal log:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteMealLog = async (id: number) => {
    try {
      setLoading(true)
      await api.delete(`/api/v1/meal-logs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMealLogs(prev => prev.filter(log => log.id !== id))
      setError(null)
    } catch (err) {
      setError('Failed to delete meal log')
      console.error('Error deleting meal log:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const addItemsToMealLog = async (mealLogId: number, items: CreateMealLog['items']) => {
    try {
      setLoading(true)
      const response = await api.post(`/api/v1/meal-logs/${mealLogId}/items`, { items }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMealLogs(prev =>
        prev.map(log =>
          log.id === mealLogId
            ? { ...log, items: [...log.items, ...response.data] }
            : log
        )
      )
      setError(null)
      return response.data
    } catch (err) {
      setError('Failed to add items to meal log')
      console.error('Error adding items to meal log:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchMealLogs()
    }
  }, [token])

  return {
    mealLogs,
    loading,
    error,
    fetchMealLogs,
    fetchMealLogsByDate,
    addMealLog,
    updateMealLog,
    deleteMealLog,
    addItemsToMealLog,
  }
} 