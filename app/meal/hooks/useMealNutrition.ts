import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MealNutritionCalculation } from '../types'
import { mealLogService } from '../services/mealLogService'

export interface MealNutritionSummary {
  mealLogId: number
  protein: number
  carbs: number
  fat: number
  calories: number
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch nutrition data for a specific meal
 */
export function useMealNutrition(mealLogId: number) {
  const [nutrition, setNutrition] = useState<MealNutritionCalculation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mealLogId) return

    const fetchNutrition = async () => {
      try {
        setLoading(true)
        setError(null)
        const nutritionData = await mealLogService.getMealNutritionCalculation(mealLogId)
        setNutrition(nutritionData)
      } catch (err) {
        console.error('Error fetching meal nutrition:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch nutrition data')
      } finally {
        setLoading(false)
      }
    }

    fetchNutrition()
  }, [mealLogId])

  // Extract macro nutrients from the API response
  const macros = nutrition?.MacroNutrientBreakDown?.[0]
  
  return {
    nutrition,
    loading,
    error,
    // Simplified nutrition summary for easy use in components
    summary: {
      mealLogId,
      protein: macros?.protein || 0,
      carbs: macros?.carbohydrate || 0,
      fat: macros?.total_lipid_fe || 0,
      calories: nutrition?.total_calories || 0,
      loading,
      error
    } as MealNutritionSummary
  }
}

/**
 * Hook to fetch nutrition data for multiple meals
 */
export function useMultipleMealNutrition(mealLogIds: number[]) {
  const [nutritionMap, setNutritionMap] = useState<Map<number, MealNutritionSummary>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create a stable string representation of the IDs to prevent unnecessary re-renders
  const mealLogIdsString = useMemo(() => {
    const sortedIds = [...mealLogIds].sort((a, b) => a - b)
    return sortedIds.join(',')
  }, [mealLogIds])

  useEffect(() => {
    if (!mealLogIds.length) {
      // If no meal IDs, clear the map and return
      if (nutritionMap.size > 0) {
        setNutritionMap(new Map())
      }
      return
    }

    const fetchAllNutrition = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch nutrition data for all meals in parallel
        const nutritionPromises = mealLogIds.map(async (mealLogId) => {
          try {
            const nutritionData = await mealLogService.getMealNutritionCalculation(mealLogId)
            const macros = nutritionData?.MacroNutrientBreakDown?.[0]
            
            return {
              mealLogId,
              protein: macros?.protein || 0,
              carbs: macros?.carbohydrate || 0,
              fat: macros?.total_lipid_fe || 0,
              calories: nutritionData?.total_calories || 0,
              loading: false,
              error: null
            } as MealNutritionSummary
          } catch (err) {
            console.error(`Error fetching nutrition for meal ${mealLogId}:`, err)
            return {
              mealLogId,
              protein: 0,
              carbs: 0,
              fat: 0,
              calories: 0,
              loading: false,
              error: err instanceof Error ? err.message : 'Failed to fetch nutrition data'
            } as MealNutritionSummary
          }
        })

        const nutritionResults = await Promise.all(nutritionPromises)
        
        // Create a map for easy lookup
        const newNutritionMap = new Map<number, MealNutritionSummary>()
        nutritionResults.forEach(result => {
          newNutritionMap.set(result.mealLogId, result)
        })
        
        setNutritionMap(newNutritionMap)
      } catch (err) {
        console.error('Error fetching multiple meal nutrition:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch nutrition data')
      } finally {
        setLoading(false)
      }
    }

    fetchAllNutrition()
  }, [mealLogIdsString, mealLogIds])

  return {
    nutritionMap,
    loading,
    error,
    // Helper function to get nutrition for a specific meal
    getNutritionForMeal: (mealLogId: number): MealNutritionSummary => {
      return nutritionMap.get(mealLogId) || {
        mealLogId,
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0,
        loading: false,
        error: null
      }
    }
  }
}

/**
 * Legacy hook for backwards compatibility - provides more detailed meal nutrition functionality
 */
export const useMealNutritionData = () => {
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
    getMicronutrient
  }
} 