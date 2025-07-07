/**
 * Profile service for handling profile-related API calls
 */
import axios from 'axios';

// Check if we're running on the client side
const isClient = typeof window !== 'undefined';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  goal: string;
  activity_level: string;
  role: string;
  created_at: string;
  updated_at?: string;
}

export interface UpdateProfileData {
  name?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  goal?: string;
  activity_level?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Safely get data from localStorage (only on client)
 */
function safeLocalStorageGet(key: string): string | null {
  if (isClient) {
    return localStorage.getItem(key);
  }
  return null;
}

/**
 * Get authentication headers
 */
function getAuthHeaders(): Record<string, string> {
  const token = safeLocalStorageGet('accessToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Handle API errors consistently
 */
function handleApiError(error: any): never {
  if (error.response) {
    const errorData = error.response.data;
    const errorMessage = errorData.message || errorData.error || `Error: ${error.response.status}`;
    throw new Error(errorMessage);
  } else if (error.request) {
    throw new Error('No response received from server. Please check your connection.');
  } else {
    throw new Error(error.message || 'An unknown error occurred');
  }
}

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const response = await fetch('/api/profile', {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data?.status === 'success' && data?.data?.user) {
      return data.data.user;
    } else {
      throw new Error('Invalid profile data received');
    }
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    handleApiError(error);
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: UpdateProfileData): Promise<UserProfile> {
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result?.status === 'success' && result?.data?.user) {
      // Update stored user data if available
      if (isClient && result.data.user) {
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }
      return result.data.user;
    } else {
      throw new Error(result.message || 'Failed to update profile');
    }
  } catch (error: any) {
    console.error('Error updating profile:', error);
    handleApiError(error);
  }
}

/**
 * Change user password
 */
export async function changePassword(data: ChangePasswordData): Promise<void> {
  try {
    const response = await fetch('/api/password', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to change password: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result?.status !== 'success') {
      throw new Error(result.message || 'Failed to change password');
    }
  } catch (error: any) {
    console.error('Error changing password:', error);
    handleApiError(error);
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(): Promise<void> {
  try {
    const response = await fetch('/api/account', {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete account: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result?.status !== 'success') {
      throw new Error(result.message || 'Failed to delete account');
    }
    
    // Clear all stored user data
    if (isClient) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  } catch (error: any) {
    console.error('Error deleting account:', error);
    handleApiError(error);
  }
} 