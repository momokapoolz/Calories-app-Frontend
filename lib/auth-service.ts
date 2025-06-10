/**
 * Authentication service for handling API calls and token management
 */
import api from './api-client';
import axios, { AxiosResponse, AxiosError } from 'axios';

// Check if we're running on the client side
const isClient = typeof window !== 'undefined';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Tokens {
  access_token_id: number;
  refresh_token_id: number;
  expires_in: number;
}

interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: User;
    tokens: Tokens;
  };
}

interface CookieLoginResponse {
  message: string;
  expires_in: number;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  goal: string;
  activity_level: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ErrorResponse {
  status: string;
  message: string;
  error?: string;
}

/**
 * Helper function to handle API responses and errors
 */
function handleApiError(error: any): never {
  if (error.response) {
    // The request was made and the server responded with a status code outside the range of 2xx
    const errorData = error.response.data;
    const errorMessage = errorData.message || errorData.error || `Error: ${error.response.status}`;
    throw new Error(errorMessage);
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'An unknown error occurred');
  }
}

/**
 * Safely store data in localStorage (only on client)
 */
function safeLocalStorage(key: string, value: string): void {
  if (isClient) {
    localStorage.setItem(key, value);
  }
}

/**
 * Safely remove data from localStorage (only on client)
 */
function safeLocalStorageRemove(key: string): void {
  if (isClient) {
    localStorage.removeItem(key);
  }
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
 * Register a new user
 */
export async function registerUser(data: RegisterData): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/register', data);
    
    // Store authentication data
    if (response.data.data?.tokens) {
      safeLocalStorage('accessToken', response.data.data.tokens.access_token_id.toString());
      safeLocalStorage('refreshToken', response.data.data.tokens.refresh_token_id.toString());
      safeLocalStorage('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    return handleApiError(error);
  }
}

/**
 * Login with token-based authentication
 */
export async function loginWithToken(data: LoginData): Promise<LoginResponse> {
  if (!isClient) {
    throw new Error("Cannot login on server side");
  }

  try {
    // Use internal API route instead of direct Axios call to avoid CORS/network issues
    const response = await axios.post('/api/auth/login', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = response.data;
    
    // Store authentication data
    if (result.data?.tokens) {
      safeLocalStorage('accessToken', result.data.tokens.access_token_id.toString());
      safeLocalStorage('refreshToken', result.data.tokens.refresh_token_id.toString());
      safeLocalStorage('user', JSON.stringify(result.data.user));
    }

    return result;
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle axios error responses
    if (error.response) {
      throw new Error(error.response.data?.message || `Error: ${error.response.status}`);
    }
    
    throw error;
  }
}

/**
 * Login with cookie-based authentication
 */
export async function loginWithCookie(data: LoginData): Promise<CookieLoginResponse> {
  if (!isClient) {
    throw new Error("Cannot login on server side");
  }

  try {
    // Use internal API route instead of direct Axios call
    const response = await axios.post('/api/auth/cookie-login', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Cookie login error:', error);
    
    // Handle axios error responses
    if (error.response) {
      throw new Error(error.response.data?.message || `Error: ${error.response.status}`);
    }
    
    throw error;
  }
}
/**
 * Refresh the access token using the refresh token
 */
export async function refreshToken(): Promise<CookieLoginResponse> {
  try {
    const response = await api.post<CookieLoginResponse>('/auth/refresh');
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    return handleApiError(error);
  }
}

/**
 * Logout the user
 */
export async function logout(): Promise<{ message: string }> {
  if (!isClient) {
    throw new Error("Cannot logout on server side");
  }

  try {
    // Get the access token for authorization header
    const token = safeLocalStorageGet('accessToken');
    
    console.log('[Logout] Initiating logout with token:', token ? 'Present' : 'Not found');
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Only add Authorization header if token exists and is not empty
    if (token && token.trim() !== '') {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[Logout] Adding Authorization header'); 
    } else {
      console.log('[Logout] No token available for Authorization header');
    }
    
    // Use internal API route instead of direct Axios call
    const response = await axios.post('/api/auth/logout', {}, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token && token.trim() !== '' ? { 'Authorization': `Bearer ${token}` } : {})      },
      withCredentials: true // Include credentials for cookie-based auth
    });

    // Clear local storage
    safeLocalStorageRemove('accessToken');
    safeLocalStorageRemove('refreshToken');
    safeLocalStorageRemove('user');

    return response.data;
  } catch (error: any) {
    // Still clear storage even if API call fails
    safeLocalStorageRemove('accessToken');
    safeLocalStorageRemove('refreshToken');
    safeLocalStorageRemove('user');
    
    console.error('[Logout] Error:', error);
    
    // Handle axios error responses
    if (error.response) {
      const errorMessage = error.response.data?.message || error.response.data?.error || `Logout error: ${error.response.status}`;
      console.error('[Logout] Error response:', error.response.data);
      throw new Error(errorMessage);
    }
    
    throw error; // Re-throw the error to allow the caller to handle it
  }
}

/**
 * Get the current user from localStorage
 */
export function getCurrentUser(): User | null {
  const userJson = safeLocalStorageGet('user');
  if (!userJson) {
    return null;
  }

  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getCurrentUser() && !!safeLocalStorageGet('accessToken');
}