export interface Food {
  id?: number
  name: string
  serving_size_gram: number
  calories: number
  protein: number
  carbs: number
  fat: number
  source: string
  user_id?: number
}

export interface CreateFood {
  name: string
  serving_size_gram: number
  calories: number
  protein: number
  carbs: number
  fat: number
  source: string
}

export interface UpdateFood extends CreateFood {
  id: number
} 