// Backend API Food type (basic food information)
export interface Food {
  id?: number
  name: string
  serving_size_gram: number
  source: string
  image_url?: string
}

// Frontend Food type with calculated nutrition (from food-nutrients)
export interface FoodWithNutrition extends Food {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  nutrients?: FoodNutrient[]
}

export interface CreateFood {
  name: string
  serving_size_gram: number
  source: string
  image_url?: string
}

export interface UpdateFood extends CreateFood {
  id: number
}

// Nutrient types
export interface Nutrient {
  id: number
  name: string
  category: string
}

// Food-Nutrient relationship
export interface FoodNutrient {
  id?: number
  food_id: number
  nutrient_id: number
  amount_per_100g: number
  nutrient?: Nutrient
}

export interface CreateFoodNutrient {
  food_id: number
  nutrient_id: number
  amount_per_100g: number
}

// Common nutrition categories for display
export enum NutrientCategory {
  MACRONUTRIENTS = "Macronutrients",
  VITAMINS = "Vitamins", 
  MINERALS = "Minerals",
  OTHER = "Other"
}

// Common nutrient names for easy access
export enum CommonNutrients {
  CALORIES = "Calories",
  PROTEIN = "Protein", 
  CARBOHYDRATES = "Carbohydrates",
  FAT = "Fat",
  FIBER = "Fiber",
  SUGAR = "Sugar",
  SODIUM = "Sodium"
}