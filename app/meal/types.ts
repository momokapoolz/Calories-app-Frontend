export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snacks"

export interface MealLogItem {
  id: number
  meal_log_id: number
  food_id: number
  food_name?: string
  quantity: number
  quantity_grams: number
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}

export interface MealLog {
  id: number
  user_id: number
  created_at: string
  meal_type: MealType
  items?: MealLogItem[]
  total_calories?: number
  total_protein?: number
  total_carbs?: number
  total_fat?: number
}

export interface CreateMealLogItem {
  food_id: number
  quantity: number
  quantity_grams: number
}

export interface CreateMealLog {
  meal_type: MealType
  items: CreateMealLogItem[]
}

// API Response types to match the backend specification
export interface CreateMealLogResponse {
  meal_log: {
    id: number
    user_id: number
    created_at: string
    meal_type: MealType
  }
  items: MealLogItem[]
}

export interface MealLogApiError {
  error: string
}

// For date-based filtering
export interface DateRangeParams {
  startDate: string // YYYY-MM-DD format
  endDate: string   // YYYY-MM-DD format
}

// Food item for search/selection (used in components)
export interface Food {
  id: number
  name: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  brand?: string
  category?: string
} 