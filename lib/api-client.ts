import axios, { AxiosError, AxiosResponse } from 'axios';

// Use Next.js API routes instead of calling backend directly
const API_URL = '/api';

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
      // Remove withCredentials since we're using Next.js API routes
      timeout: 10000,
    })
  : null;

// Only add interceptors on the client side
if (isClient && axiosInstance) {
  // Request interceptor - add auth token if available
  axiosInstance.interceptors.request.use(
    (config) => {
      // Get the access token UUID from localStorage
      const tokenId = localStorage.getItem('accessToken');
      
      // Only add Authorization header if token ID exists and is not empty
      if (tokenId && tokenId.trim() !== '' && config.headers) {
        // The API routes will forward the token to the backend
        // Format: Bearer {token_id}
        config.headers.Authorization = `Bearer ${tokenId}`;
        
        // Add a debug header to track token usage (remove in production)
        if (process.env.NODE_ENV === 'development') {
          config.headers['X-Debug-Token-Type'] = 'UUID';
        }
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
      // Get the current URL to determine if we're on a login/register page
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
      
      // Handle different status codes
      if (error.response?.status === 401) {
        console.error('401 Unauthorized error:', {
          url: error.config?.url,
          method: error.config?.method
        });
        
        // Only clear storage and redirect if not already on an auth page
        // This prevents redirect loops and allows login/register pages to handle their own errors
        if (!isAuthPage && !error.config?.url?.includes('/login') && !error.config?.url?.includes('/register')) {
          console.log('Clearing auth state due to 401 error');
          // Clear local storage on auth errors
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Don't redirect automatically - let the components handle redirection
          // This prevents issues with React rendering lifecycle
        }
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