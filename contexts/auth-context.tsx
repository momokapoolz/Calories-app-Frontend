"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, isAuthenticated, logout, refreshToken } from "@/lib/auth-service"

// Check if we're running on the client side
const isClient = typeof window !== 'undefined';

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

// Create a default auth context for SSR/initial render
export const defaultAuthValues: AuthContextType = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  logout: async () => {},
  refreshAuth: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthValues);

export interface AuthProviderProps {
  children: React.ReactNode;
  skipInitialization?: boolean;
}

export function AuthProvider({ 
  children,
  skipInitialization = false
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(!skipInitialization)
  const [authStatus, setAuthStatus] = useState(false)
  const router = useRouter()

  // Check auth status - only run on client side
  const checkAuthStatus = async () => {
    try {
      // First check local storage (faster)
      const authenticated = isAuthenticated()
      setAuthStatus(authenticated)

      if (authenticated) {
        // Get current user from localStorage
        const currentUser = getCurrentUser()
        setUser(currentUser)
      }
      
      // Then, if we have a cookie, also check with server
      if (document.cookie.includes('jwt-id')) {
        try {
          const response = await fetch('/api/auth/status');
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
              setAuthStatus(true);
              // Update user if provided in response
              if (data.user) {
                setUser(data.user);
              }
            }
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize auth state - only run if not skipping initialization
  useEffect(() => {
    // Skip if requested (used for SSR)
    if (skipInitialization) {
      return;
    }
    
    // Only run on client side
    if (isClient) {
      checkAuthStatus();
    } else {
      // On server, just mark as not loading to avoid hydration issues
      setIsLoading(false);
    }
  }, [skipInitialization]);

  // Set up token refresh interval - only on client side and if not skipping
  useEffect(() => {
    if (!isClient || !authStatus || skipInitialization) return;

    // Refresh token every 50 minutes (3000000ms)
    const refreshInterval = setInterval(async () => {
      try {
        if (document.cookie.includes('jwt-id')) {
          await refreshToken();
          // Re-check auth status after token refresh
          checkAuthStatus();
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        await handleLogout();
      }
    }, 3000000);

    return () => clearInterval(refreshInterval);
  }, [authStatus, skipInitialization]);

  const handleLogout = async () => {
    try {
      // Set loading state to prevent multiple clicks
      setIsLoading(true);
      
      // Call logout API
      await logout();
      
      // Update state
      setUser(null);
      setAuthStatus(false);
      
      // Use replace instead of push to prevent back button issues
      router.replace('/login');
    } catch (error) {
      console.error('[Auth Context] Logout error:', error);
      
      // Try the fallback method if main logout fails
      try {
        console.log('[Auth Context] Using fallback logout method');
        
        // Call backup clear-session endpoint
        await fetch('/api/auth/clear-session', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (fallbackError) {
        console.error('[Auth Context] Fallback logout also failed:', fallbackError);
      }
      
      // Still update state and redirect even if API call fails
      setUser(null);
      setAuthStatus(false);
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    if (!isClient || skipInitialization) return;
    
    try {
      await checkAuthStatus();
    } catch (error) {
      console.error('Error refreshing auth:', error);
      await handleLogout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: authStatus,
        logout: handleLogout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  // This should never happen now that we're using defaultAuthValues,
  // but keeping the check as a safeguard
  if (context === undefined) {
    console.error('Auth context is undefined. Make sure useAuth is used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}