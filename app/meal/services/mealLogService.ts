import { MealLog, CreateMealLog, CreateMealLogResponse, DateRangeParams } from '../types'

class MealLogService {
  private baseUrl = '/api/meal-logs'

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
   * Create a new meal log
   * POST /api/meal-logs
   */
  async createMealLog(data: CreateMealLog): Promise<CreateMealLogResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating meal log:', error)
      throw error
    }
  }

  /**
   * Get meal log by ID
   * GET /api/meal-logs/{id}
   */
  async getMealLogById(id: number): Promise<MealLog> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching meal log by ID:', error)
      throw error
    }
  }

  /**
   * Get meal logs by user ID
   * GET /api/meal-logs/user
   * (user ID is extracted from JWT token)
   */
  async getMealLogsByUser(): Promise<MealLog[]> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        headers: this.getAuthHeaders(),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching meal logs by user:', error)
      throw error
    }
  }

  /**
   * Get meal logs by user ID and date
   * GET /api/meal-logs/user/date/{date}
   * @param date - Date in YYYY-MM-DD format
   */
  async getMealLogsByUserAndDate(date: string): Promise<MealLog[]> {
    try {
      const response = await fetch(`${this.baseUrl}/user/date/${date}`, {
        headers: this.getAuthHeaders(),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching meal logs by user and date:', error)
      throw error
    }
  }

  /**
   * Get meal logs by user ID and date range
   * GET /api/meal-logs?startDate=...&endDate=...
   * @param params - Object containing startDate and endDate in YYYY-MM-DD format
   */
  async getMealLogsByUserAndDateRange(params: DateRangeParams): Promise<MealLog[]> {
    try {
      const url = new URL(this.baseUrl, window.location.origin)
      url.searchParams.set('startDate', params.startDate)
      url.searchParams.set('endDate', params.endDate)
      
      const response = await fetch(url.toString(), {
        headers: this.getAuthHeaders(),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching meal logs by user and date range:', error)
      throw error
    }
  }

  /**
   * Update a meal log
   * PUT /api/meal-logs/{id}
   */
  async updateMealLog(id: number, data: CreateMealLog): Promise<MealLog> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating meal log:', error)
      throw error
    }
  }

  /**
   * Delete a meal log
   * DELETE /api/meal-logs/{id}
   */
  async deleteMealLog(id: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting meal log:', error)
      throw error
    }
  }

  /**
   * Helper function to format Date object to YYYY-MM-DD string
   * @param date - JavaScript Date object
   */
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  /**
   * Helper function to get today's date in YYYY-MM-DD format
   */
  getTodayFormatted(): string {
    return this.formatDateForAPI(new Date())
  }

  /**
   * Helper function to get date range for a specific period
   * @param period - Number of days to go back from today
   */
  getDateRangeForPeriod(period: number): DateRangeParams {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - period)
    
    return {
      startDate: this.formatDateForAPI(startDate),
      endDate: this.formatDateForAPI(today)
    }
  }

  /**
   * Get meal logs for the last week
   */
  async getMealLogsForLastWeek(): Promise<MealLog[]> {
    const dateRange = this.getDateRangeForPeriod(7)
    return this.getMealLogsByUserAndDateRange(dateRange)
  }

  /**
   * Get meal logs for the last month
   */
  async getMealLogsForLastMonth(): Promise<MealLog[]> {
    const dateRange = this.getDateRangeForPeriod(30)
    return this.getMealLogsByUserAndDateRange(dateRange)
  }

  /**
   * Get today's meal logs
   */
  async getTodaysMealLogs(): Promise<MealLog[]> {
    const today = this.getTodayFormatted()
    return this.getMealLogsByUserAndDate(today)
  }

  /**
   * Calculate total nutrition for a set of meal logs
   * @param mealLogs - Array of meal logs
   */
  calculateTotalNutrition(mealLogs: MealLog[]) {
    return mealLogs.reduce(
      (total, meal) => ({
        calories: total.calories + (meal.total_calories || 0),
        protein: total.protein + (meal.total_protein || 0),
        carbs: total.carbs + (meal.total_carbs || 0),
        fat: total.fat + (meal.total_fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  /**
   * Group meal logs by meal type
   * @param mealLogs - Array of meal logs
   */
  groupByMealType(mealLogs: MealLog[]) {
    return mealLogs.reduce((groups, meal) => {
      const mealType = meal.meal_type
      if (!groups[mealType]) {
        groups[mealType] = []
      }
      groups[mealType].push(meal)
      return groups
    }, {} as Record<string, MealLog[]>)
  }

  /**
   * Group meal logs by date
   * @param mealLogs - Array of meal logs
   */
  groupByDate(mealLogs: MealLog[]) {
    return mealLogs.reduce((groups, meal) => {
      const date = this.formatDateForAPI(new Date(meal.created_at))
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(meal)
      return groups
    }, {} as Record<string, MealLog[]>)
  }
}

// Export a singleton instance
export const mealLogService = new MealLogService()
export default mealLogService 