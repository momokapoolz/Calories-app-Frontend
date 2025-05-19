/**
 * Authentication service for handling API calls and token management
 */

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

// Base API URL - replace with your actual API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Register a new user
 */
export async function registerUser(data: RegisterData): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Registration failed');
  }

  // Store authentication data
  if (result.data?.tokens) {
    localStorage.setItem('accessToken', result.data.tokens.access_token_id.toString());
    localStorage.setItem('refreshToken', result.data.tokens.refresh_token_id.toString());
    localStorage.setItem('user', JSON.stringify(result.data.user));
  }

  return result;
}

/**
 * Login with token-based authentication
 */
export async function loginWithToken(data: LoginData): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Login failed');
  }

  // Store authentication data
  if (result.data?.tokens) {
    localStorage.setItem('accessToken', result.data.tokens.access_token_id.toString());
    localStorage.setItem('refreshToken', result.data.tokens.refresh_token_id.toString());
    localStorage.setItem('user', JSON.stringify(result.data.user));
  }

  return result;
}

/**
 * Login with cookie-based authentication
 */
export async function loginWithCookie(data: LoginData): Promise<CookieLoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include', // Important for cookies
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Login failed');
  }

  return result;
}

/**
 * Refresh the access token using the refresh token
 */
export async function refreshToken(): Promise<CookieLoginResponse> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // Important for cookies
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Token refresh failed');
  }

  return result;
}

/**
 * Logout the user
 */
export async function logout(): Promise<{ message: string }> {
  // Get the access token from localStorage
  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include', // Important for cookies
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Logout failed');
  }

  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  return result;
}

/**
 * Get the current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const userJson = localStorage.getItem('user');
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
  if (typeof window === 'undefined') {
    return false;
  }
  
  return !!localStorage.getItem('accessToken') || document.cookie.includes('jwt-id');
}