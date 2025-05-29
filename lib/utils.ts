import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AxiosError } from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract user-friendly error message from API errors
 */
export function getErrorMessage(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error
  }
  
  if (error?.message) {
    return error.message
  }
  
  // Handle specific status codes
  if (error?.response?.status === 400) {
    return "Invalid request. Please check your input and try again."
  }
  
  if (error?.response?.status === 401) {
    return "Authentication required. Please log in."
  }
  
  if (error?.response?.status === 403) {
    return "Access denied. You don't have permission to perform this action."
  }
  
  if (error?.response?.status === 404) {
    return "Resource not found."
  }
  
  if (error?.response?.status === 500) {
    return "Server error. Please try again later."
  }
  
  return "An unexpected error occurred. Please try again."
}

/**
 * Check if error is a network/connection error
 */
export function isNetworkError(error: any): boolean {
  return !error?.response && (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error'))
}
