"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { CalendarDays, Utensils, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export function MainNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Utensils className="h-6 w-6 text-green-600" />
          <h1 className="text-xl font-bold">NutriTrack</h1>
        </div>        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className={`text-sm font-medium ${pathname === "/" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/food" 
            className={`text-sm font-medium ${pathname === "/food" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Food
          </Link>
          <Link 
            href="/meal" 
            className={`text-sm font-medium ${pathname.startsWith("/meal") ? "text-foreground" : "text-muted-foreground"}`}
          >
            Meal
          </Link>
          <Link 
            href="/reports" 
            className={`text-sm font-medium ${pathname === "/reports" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Reports
          </Link>
          <Link 
            href="/settings" 
            className={`text-sm font-medium ${pathname === "/settings" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Settings
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CalendarDays className="mr-2 h-4 w-4" />
            Today
          </Button>          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {user && <span className="text-sm font-medium">{user.name}</span>}
              <Button variant="ghost" size="icon" className="rounded-full">
                <img
                  src="/placeholder.svg?height=32&width=32"
                  alt="Avatar"
                  className="rounded-full"
                  height={32}
                  width={32}
                />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => router.push("/register")}>
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}