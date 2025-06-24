import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MealNutritionCalculation } from '../types'

// Create an instance of the meal log service
class MealLogService {
  private baseUrl = '/api/meal-logs'

  private getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getMealNutritionCalculation(mealLogId: number): Promise<MealNutritionCalculation> {
    try {
      const response = await fetch(`/api/nutrition/meal/${mealLogId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching meal nutrition calculation:', error)
      throw error
    }
  }
}

const mealLogService = new MealLogService()

export const useMealNutrition = () => {
  const { isAuthenticated } = useAuth()
  const [nutritionData, setNutritionData] = useState<MealNutritionCalculation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get nutrition calculation for a specific meal
  const fetchMealNutrition = useCallback(async (mealLogId: number) => {
    if (!isAuthenticated) {
      setError('User not authenticated')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const nutrition = await mealLogService.getMealNutritionCalculation(mealLogId)
      setNutritionData(nutrition)
      return nutrition
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch meal nutrition'
      setError(errorMessage)
      console.error('Error fetching meal nutrition:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Clear nutrition data
  const clearNutritionData = useCallback(() => {
    setNutritionData(null)
    setError(null)
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Helper function to calculate total macros from the breakdown
  const getTotalMacros = useCallback(() => {
    if (!nutritionData?.MacroNutrientBreakDown?.length) return null
    
    const macros = nutritionData.MacroNutrientBreakDown[0]
    return {
      calories: macros.energy,
      protein: macros.protein,
      carbohydrates: macros.carbohydrate,
      fat: macros.total_lipid_fe,
      fiber: macros.fiber
    }
  }, [nutritionData])

  // Helper function to get specific micronutrient by name
  const getMicronutrient = useCallback((nutrientName: string) => {
    return nutritionData?.MicroNutrientBreakDown?.find(
      nutrient => nutrient.nutrient_name.toLowerCase() === nutrientName.toLowerCase()
    )
  }, [nutritionData])

  return {
    // State
    nutritionData,
    loading,
    error,
    
    // Actions
    fetchMealNutrition,
    clearNutritionData,
    clearError,
    
    // Helpers
    getTotalMacros,
    getMicronutrient,
    
    // Computed values
    isAuthenticated
  }
} 