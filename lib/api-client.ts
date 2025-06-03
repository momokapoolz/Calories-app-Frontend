import axios, { AxiosError, AxiosResponse } from 'axios';

// Base API URL - should be configured based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Check if we're running on the client side
const isClient = typeof window !== 'undefined';

// Create a dummy axios instance for server-side
const dummyApi = {
  get: () => Promise.reject(new Error('API calls not available during SSR')),
  post: () => Promise.reject(new Error('API calls not available during SSR')),
  put: () => Promise.reject(new Error('API calls not available during SSR')),
  delete: () => Promise.reject(new Error('API calls not available during SSR')),
  patch: () => Promise.reject(new Error('API calls not available during SSR')),
  request: () => Promise.reject(new Error('API calls not available during SSR')),
};

// Only create real axios instance on client side
const axiosInstance = isClient
  ? axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true, // Re-enable since backend supports CORS with credentials
      timeout: 10000,
    })
  : null;

// Only add interceptors on the client side
if (isClient && axiosInstance) {
  // Request interceptor - add auth token if available
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      // Only add Authorization header if token exists and is not empty
      if (token && token.trim() !== '' && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      // Handle different status codes
      if (error.response?.status === 401) {
        // Clear local storage on auth errors
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } else if (error.response?.status === 400) {
        // Log 400 errors for debugging
        console.error('400 Bad Request:', {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          response: error.response?.data,
        });
      }
      
      return Promise.reject(error);
    }
  );
}

// Export the correct API client based on environment
const api = isClient && axiosInstance ? axiosInstance : dummyApi;
export default api; 