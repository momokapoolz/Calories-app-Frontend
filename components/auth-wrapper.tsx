"use client"

import React from "react"
import { AuthProvider } from "@/contexts/auth-context"

interface AuthWrapperProps {
  children: React.ReactNode
}

/**
 * Client-side only wrapper for AuthProvider to prevent SSR hydration issues
 */
export function AuthWrapper({ children }: AuthWrapperProps) {
  const [mounted, setMounted] = React.useState(false)

  // Only show the UI after the component has mounted on the client
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Always render with AuthProvider to avoid "useAuth must be used within an AuthProvider" error
  // But use different initialization based on mounting state
  return (
    <AuthProvider skipInitialization={!mounted}>
      {children}
    </AuthProvider>
  )
} 