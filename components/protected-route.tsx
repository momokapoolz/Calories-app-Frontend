"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if not loading and definitely not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('Protected route: Not authenticated, redirecting to login')
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Check for token in localStorage directly as a fallback
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Double-check localStorage directly as a fallback
      const token = localStorage.getItem('accessToken')
      const userStr = localStorage.getItem('user')
      
      if (token && userStr) {
        console.log('Protected route: Found token in localStorage but not in context, not redirecting')
        // We have a token but the context doesn't know about it
        // Don't redirect, let the auth context handle it in its own useEffect
        return
      }
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we verify your session</p>
        </div>
      </div>
    )
  }

  // If we have a user or we're still checking, render the children
  if (isAuthenticated || user) {
    return <>{children}</>
  }

  // Otherwise render nothing while redirecting
  return null
}