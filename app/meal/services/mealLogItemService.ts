import { 
  MealLogItemResponse, 
  CreateMealLogItemRequest, 
  UpdateMealLogItemRequest,
  SuccessMessage,
  CreateMealLogItem,
  AddItemsToMealLogRequest
} from '../types'

class MealLogItemService {
  private baseUrl = '/api/meal-log-items'

  /**
   * Get authentication headers
   */
  private getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Create a new meal log item
   * POST /api/v1/meal-log-items
   */
  async createMealLogItem(data: CreateMealLogItemRequest): Promise<MealLogItemResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating meal log item:', error)
      throw error
    }
  }

  /**
   * Get meal log item by ID
   * GET /api/v1/meal-log-items/{id}
   */
  async getMealLogItemById(id: number): Promise<MealLogItemResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching meal log item by ID:', error)
      throw error
    }
  }

  /**
   * Get meal log items by meal log ID
   * GET /api/v1/meal-log-items/meal-log/{mealLogId}
   */
  async getMealLogItemsByMealLogId(mealLogId: number): Promise<MealLogItemResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/meal-log/${mealLogId}`, {
        headers: this.getAuthHeaders(),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching meal log items by meal log ID:', error)
      throw error
    }
  }

  /**
   * Get meal log items by food ID
   * GET /api/v1/meal-log-items/food/{foodId}
   */
  async getMealLogItemsByFoodId(foodId: number): Promise<MealLogItemResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/food/${foodId}`, {
        headers: this.getAuthHeaders(),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching meal log items by food ID:', error)
      throw error
    }
  }

  /**
   * Update a meal log item
   * PUT /api/v1/meal-log-items/{id}
   */
  async updateMealLogItem(id: number, data: UpdateMealLogItemRequest): Promise<MealLogItemResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating meal log item:', error)
      throw error
    }
  }

  /**
   * Delete a meal log item
   * DELETE /api/v1/meal-log-items/{id}
   */
  async deleteMealLogItem(id: number): Promise<SuccessMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting meal log item:', error)
      throw error
    }
  }

  /**
   * Delete meal log items by meal log ID
   * DELETE /api/v1/meal-log-items/meal-log/{mealLogId}
   */
  async deleteMealLogItemsByMealLogId(mealLogId: number): Promise<SuccessMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/meal-log/${mealLogId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting meal log items by meal log ID:', error)
      throw error
    }
  }

  /**
   * Add Items to Meal Log
   * POST /api/v1/meal-logs/{id}/items
   */
  async addItemsToMealLog(mealLogId: number, data: AddItemsToMealLogRequest): Promise<MealLogItemResponse[]> {
    try {
      const response = await fetch(`/api/meal-logs/${mealLogId}/items`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error adding items to meal log:', error)
      throw error
    }
  }
}

// Export a singleton instance
export const mealLogItemService = new MealLogItemService()
export default mealLogItemService 