"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth-service"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if the user is authenticated
    const authStatus = isAuthenticated()
    
    if (!authStatus) {
      // Redirect to login if not authenticated
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-600"></div>
      </div>
    )
  }

  // Render children if authenticated
  return <>{children}</>
}