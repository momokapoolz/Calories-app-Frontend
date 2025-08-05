import { DailyNutritionSummary } from '../types'

class DailyNutritionService {
  private baseUrl = '/api/nutrition'

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
   * Get daily nutrition summary for a specific date
   * GET /api/nutrition/date/{date}
   * @param date - Date in YYYY-MM-DD format
   */
  async getDailyNutrition(date: string): Promise<DailyNutritionSummary> {
    try {
      const response = await fetch(`${this.baseUrl}/date/${date}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          // Add timestamp to prevent caching issues when switching between users
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching daily nutrition:', error)
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
}

// Export a singleton instance
export const dailyNutritionService = new DailyNutritionService()
export default dailyNutritionService
