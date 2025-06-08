"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from 'axios'
import { getErrorMessage } from '@/lib/utils'

interface User {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: async () => {},
})

export interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  
  // Check auth status on mount and after window focus
  const checkAuth = async () => {
    try {
      setIsLoading(true)
      
      // Get the access token from localStorage
      const token = localStorage.getItem('accessToken')
      const userStr = localStorage.getItem('user')
      
      console.log('=== AUTH CHECK START ===')
      console.log('Token present:', !!token)
      console.log('Stored user:', userStr)
      console.log('Token value (first 20 chars):', token?.substring(0, 20))
      
      if (!token) {
        console.log('No token found, setting user to null')
        setUser(null)
        setIsLoading(false)
        return
      }
      
      // First, try to restore user from localStorage if available
      if (userStr) {
        try {
          const storedUser = JSON.parse(userStr)
          console.log('Restoring user from localStorage:', storedUser)
          setUser(storedUser)
          
          // Verify with backend in background, but don't wait for it to complete
          // This allows the user to stay logged in even if backend is temporarily unavailable
          console.log('Starting background token verification...')
          verifyTokenWithBackend(token).catch(error => {
            console.log('Background verification failed, but user remains logged in from localStorage')
          })
          
          setIsLoading(false)
          return
        } catch (e) {
          console.log('Failed to parse stored user, removing from localStorage')
          localStorage.removeItem('user')
        }
      }

      // If no stored user, verify with backend
      console.log('No stored user found, verifying with backend...')
      await verifyTokenWithBackend(token)
      
    } catch (error: any) {
      console.error('=== AUTH CHECK ERROR ===')
      console.error('Error details:', getErrorMessage(error))
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }
  
  const verifyTokenWithBackend = async (token: string) => {
    try {
      console.log('Verifying token with backend...')
      console.log('Token to verify:', token?.substring(0, 20) + '...')     
      console.log('Making direct request to backend:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/profile`)
      
      // Call backend directly with axios since api-client might be causing issues
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      })

      console.log('Auth profile response status:', response.status)
      console.log('Auth profile response data:', response.data)

      // Backend returns user info directly, not wrapped in authenticated field
      if (response.data && (response.data.user_id || response.data.id || response.data.email)) {
        // Transform backend response to match our User interface
        const userData = {
          id: response.data.user_id || response.data.id,
          name: response.data.name || response.data.email?.split('@')[0] || 'User',
          email: response.data.email
        }
        console.log('User authenticated, setting user data:', userData)
        setUser(userData)
        // Store user data for next time
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        console.log('User not authenticated according to server')
        setUser(null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
      console.log('=== BACKEND VERIFICATION END ===')
    } catch (error: any) {
      console.error('=== BACKEND VERIFICATION ERROR ===')
      console.error('Full error object:', error)
      console.error('Error message:', error?.message || 'No message')
      console.error('Error name:', error?.name || 'No name')
      console.error('Error stack:', error?.stack || 'No stack')
      console.error('Backend verification failed:', {
        message: error?.message || 'Unknown error',
        status: error?.response?.status || 'No status',
        data: error?.response?.data || 'No response data',
        url: error?.config?.url || 'No URL',
        headers: error?.config?.headers || 'No headers',
        timeout: error?.code === 'ECONNABORTED' ? 'Request timed out' : 'No timeout',
        networkError: error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED' ? 'Network connectivity issue' : 'Not a network error'
      })
      
      // If it's a 401 error, clear the auth state
      if (error?.response?.status === 401) {
        console.log('401 error - clearing auth state')
        setUser(null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      } else if (error?.response?.status === 404) {
        // 404 error - endpoint doesn't exist yet, keep user authenticated if we have stored user
        console.log('404 error - endpoint not found, keeping user authenticated if possible')
        
        // If we have userStr, try to restore it
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const storedUser = JSON.parse(userStr);
            setUser(storedUser);
            console.log('Restored user from localStorage after 404:', storedUser);
          } catch (e) {
            console.log('Failed to parse stored user during 404 error');
          }
        }
      } else if (error?.code === 'ECONNABORTED' || error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
        // Network errors - keep user authenticated but log the issue
        console.log('Network error - keeping user authenticated despite backend error')
        
        // If we have userStr, try to restore it
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const storedUser = JSON.parse(userStr);
            setUser(storedUser);
          } catch (e) {
            console.log('Failed to parse stored user during network error');
          }
        }
      } else {
        // For other errors, also keep user authenticated - might be temporary
        console.log('Other error - keeping user authenticated despite backend error')
        
        // If we have userStr, try to restore it
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const storedUser = JSON.parse(userStr);
            setUser(storedUser);
          } catch (e) {
            console.log('Failed to parse stored user during other error');
          }
        }
      }
    }
  }

  // Only run effect on client side
  useEffect(() => {
    setMounted(true)
    
    // Check if we have a token in localStorage immediately
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      
      // If we have both token and user data, set the user immediately to prevent flicker
      if (token && userStr) {
        try {
          const storedUser = JSON.parse(userStr);
          setUser(storedUser);
        } catch (e) {
          console.log('Failed to parse stored user on initial mount');
        }
      }
    }
    
    // Then run the full auth check
    checkAuth()
    
    // Add window focus event listener
    const handleFocus = () => {
      checkAuth()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])
  
  const login = (userData: User) => {
    setUser(userData)
    // Also store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData))
    router.push("/")
  }
  
  const logout = async () => {
    try {
      console.log('Attempting logout')
      
      // Use axios directly to call the backend logout endpoint
      const token = localStorage.getItem('accessToken')
      if (token) {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          timeout: 5000
        })
      }
      
      console.log('Logout API call successful')
    } catch (error) {
      console.warn('Logout API call failed, but continuing with local logout:', getErrorMessage(error))
      // Continue with logout even if API call fails
    } finally {
      // Always perform local logout regardless of API response
      console.log('Performing local logout cleanup')
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      router.push("/login")
    }
  }

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}