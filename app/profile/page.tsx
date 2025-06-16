"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Mail, User, Weight, Ruler, Target, Activity } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { MainNav } from "@/components/main-nav"
import api from "@/lib/api-client"

interface UserProfile {
  id: number
  name: string
  email: string
  age: number
  gender: string
  weight: number
  height: number
  goal: string
  activity_level: string
  role: string
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await api.get('/profile')
        
        // The API returns data in { status: "success", data: { user: {...} } } format
        if (response.data?.status === 'success' && response.data?.data?.user) {
          setProfile(response.data.data.user)
        } else {
          setError('Invalid profile data received')
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <MainNav />
          <main className="flex-1">
            <div className="container py-6">
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-600"></div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !profile) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <MainNav />
          <main className="flex-1">
            <div className="container py-6">
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-red-600">Error</h2>
                  <p className="text-muted-foreground mt-2">{error || 'Profile not found'}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateBMI = (weight: number, height: number) => {
    // Convert height from cm to meters
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    return bmi.toFixed(1)
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "bg-blue-500" }
    if (bmi < 25) return { category: "Normal", color: "bg-green-500" }
    if (bmi < 30) return { category: "Overweight", color: "bg-yellow-500" }
    return { category: "Obese", color: "bg-red-500" }
  }

  const bmi = parseFloat(calculateBMI(profile.weight, profile.height))
  const bmiInfo = getBMICategory(bmi)

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container py-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">User Profile</h1>
              <p className="text-muted-foreground">View and manage your personal information</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Basic Information */}
              <Card className="col-span-full md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-lg font-semibold">{profile.name}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      <p className="text-lg">{profile.email}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Age</label>
                      <p className="text-lg">{profile.age} years</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Gender</label>
                      <p className="text-lg">{profile.gender}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <Badge variant="secondary">{profile.role}</Badge>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        Member Since
                      </label>
                      <p className="text-lg">{formatDate(profile.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Physical Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Weight className="h-5 w-5" />
                    Physical Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Weight</label>
                      <p className="text-2xl font-bold">{profile.weight} kg</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Ruler className="h-4 w-4" />
                        Height
                      </label>
                      <p className="text-2xl font-bold">{profile.height} cm</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">BMI</label>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{bmi}</p>
                        <Badge className={`${bmiInfo.color} text-white`}>
                          {bmiInfo.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Goals & Activity */}
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Goals & Activity
                  </CardTitle>
                  <CardDescription>Your fitness goals and activity preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Primary Goal</label>
                      <Badge variant="outline" className="text-lg py-2 px-4">
                        {profile.goal}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        Activity Level
                      </label>
                      <Badge variant="outline" className="text-lg py-2 px-4">
                        {profile.activity_level}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 