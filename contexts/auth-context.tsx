"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from '@/lib/api-client'
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
      // Get the access token from localStorage
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setUser(null)
        return      }

      // Use fetch for Next.js API routes (avoids baseURL conflicts)
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      } else {
        setUser(null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    } catch (error) {
      console.error('Error checking auth status:', getErrorMessage(error))
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setIsLoading(false)
    }
  }

  // Only run effect on client side
  useEffect(() => {
    setMounted(true)
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
    router.push("/")
  }

  const logout = async () => {
    try {
      // Use fetch for Next.js API routes (avoids baseURL conflicts)
      const token = localStorage.getItem('accessToken')
      console.log('Attempting logout with token:', token ? 'Token present' : 'No token')
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
      })
      
      console.log('Logout response status:', response.status)
      
      // Don't throw error if logout API fails - we still want to logout locally
      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`Logout API returned ${response.status}: ${errorText}, but continuing with local logout`)
      } else {
        console.log('Logout API call successful')
      }
    } catch (error) {
      console.warn('Logout API call failed, but continuing with local logout:', getErrorMessage(error))
      // Continue with logout even if API call fails
    } finally {
      // Always perform local logout regardless of API response
      console.log('Performing local logout cleanup')
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
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