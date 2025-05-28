/**
 * Network debug utilities
 */
import axios from 'axios';

// Check if we're running on the client side
const isClient = typeof window !== 'undefined';

/**
 * Log network error details to help diagnose issues
 */
export function logNetworkError(error: any, context: string = 'API Request'): void {
  console.error(`[${context}] Network Error:`, error);
  
  if (!isClient) {
    console.error('Error occurred during server-side rendering');
    return;
  }
  
  // Log request details if available
  if (error.config) {
    console.error('Request URL:', error.config.url);
    console.error('Request Method:', error.config.method);
    console.error('Request Headers:', error.config.headers);
    
    // Don't log sensitive data like passwords
    const safeData = { ...error.config.data };
    if (safeData.password) {
      safeData.password = '[REDACTED]';
    }
    console.error('Request Data:', safeData);
  }
  
  // Log response details if available
  if (error.response) {
    console.error('Response Status:', error.response.status);
    console.error('Response Headers:', error.response.headers);
    console.error('Response Data:', error.response.data);
  }
  
  // Log if request was made but no response received
  if (error.request) {
    console.error('No response received from server');
  }
  
  // Log browser network status
  if (navigator.onLine) {
    console.error('Browser reports online status: Connected');
  } else {
    console.error('Browser reports online status: Disconnected');
  }
  
  // Log CORS details
  if (error.message?.includes('CORS')) {
    console.error('CORS issue detected. Check server CORS configuration.');
  }
}

/**
 * Check if the API server is reachable
 */
export async function checkApiHealth(apiUrl: string): Promise<boolean> {
  if (!isClient) {
    return false;
  }
  
  try {
    const response = await axios.get(`${apiUrl}/health`, {
      timeout: 5000,
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

/**
 * Log environment details to help diagnose issues
 */
export function logEnvironmentInfo(): void {
  if (!isClient) {
    console.log('Environment: Server-side');
    return;
  }
  
  console.log('Environment: Client-side');
  console.log('User Agent:', navigator.userAgent);
  console.log('Online Status:', navigator.onLine);
  console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
} 