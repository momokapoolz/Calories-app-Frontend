export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snacks"

export interface MealLogItem {
  id: number
  meal_log_id: number
  food_id: number
  food_name: string
  quantity: number
  quantity_grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface MealLog {
  id: number
  user_id: number
  created_at: string
  meal_type: MealType
  items: MealLogItem[]
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
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

export interface UpdateMealLog extends CreateMealLog {
  id: number
} 