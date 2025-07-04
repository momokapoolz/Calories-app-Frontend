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

// Nutrition calculation types to match API response
export interface MacroNutrientBreakDown {
  energy: number
  protein: number
  total_lipid_fe: number
  carbohydrate: number
  fiber: number
  cholesteroid: number
  vitamin_a: number
  vitamin_b: number
  calcium: number
  iron: number
}

export interface MicroNutrientBreakDown {
  nutrient_id: number
  nutrient_name: string
  amount: number
  unit: string
}

export interface MealNutritionCalculation {
  meal_log_id: number
  user_id: number
  meal_type: string
  date: string
  total_calories: number
  food_count: number
  MacroNutrientBreakDown: MacroNutrientBreakDown[]
  MicroNutrientBreakDown: MicroNutrientBreakDown[]
}

// Meal Log Item specific types for individual item management
export interface CreateMealLogItemRequest {
  meal_log_id: number
  food_id: number
  quantity: number
  quantity_grams: number
}

export interface UpdateMealLogItemRequest {
  meal_log_id?: number
  food_id?: number
  quantity?: number
  quantity_grams?: number
}

export interface MealLogItemResponse {
  id: number
  meal_log_id: number
  food_id: number
  quantity: number
  quantity_grams: number
  created_at?: string
  updated_at?: string
}

// For adding items to existing meal log
export interface AddItemsToMealLogRequest {
  items: CreateMealLogItem[]
}

// Success message responses
export interface SuccessMessage {
  message: string
}

// Meal breakdown for daily nutrition
export interface MealBreakdown {
  meal_log_id: number
  meal_type: string
  date: string
  calories: number
  protein: number
  carbohydrate: number
  fat: number
  food_count: number
}

// Daily Nutrition Summary types (updated to match actual API response)
export interface DailyNutritionSummary {
  user_id: number
  date_range: string // YYYY-MM-DD format for single date
  total_calories: number
  MacroNutrientBreakDown: MacroNutrientBreakDown[]
  MicroNutrientBreakDown: MicroNutrientBreakDown[]
  MealBreakdown: MealBreakdown[]
} 