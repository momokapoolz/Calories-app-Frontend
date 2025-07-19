"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Mail, User, Weight, Ruler, Target, Activity, Edit, Lock, AlertTriangle } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { MainNav } from "@/components/main-nav"
import { ProfileEditForm } from "@/components/profile-edit-form"
import { PasswordChangeForm } from "@/components/password-change-form"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  deleteAccount,
  UserProfile,
  UpdateProfileData,
  ChangePasswordData
} from "@/lib/profile-service"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const profileData = await getUserProfile()
        setProfile(profileData)
      } catch (err: any) {
        console.error('Error fetching profile:', err)
        setError(err.message || 'Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleUpdateProfile = async (data: UpdateProfileData) => {
    try {
      setUpdateLoading(true)
      setUpdateError(null)
      const updatedProfile = await updateUserProfile(data)
      setProfile(updatedProfile)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setUpdateError(err.message || 'Failed to update profile')
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleChangePassword = async (data: ChangePasswordData) => {
    try {
      setPasswordLoading(true)
      setPasswordError(null)
      await changePassword(data)
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      })
    } catch (err: any) {
      console.error('Error changing password:', err)
      setPasswordError(err.message || 'Failed to change password')
      toast({
        title: "Password Change Failed",
        description: err.message || "Failed to change password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true)
      setDeleteError(null)
      await deleteAccount()
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      })
      // Redirect to home page after deletion
      router.push('/')
    } catch (err: any) {
      console.error('Error deleting account:', err)
      setDeleteError(err.message || 'Failed to delete account')
      toast({
        title: "Account Deletion Failed",
        description: err.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

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
              <h1 className="text-3xl font-bold">Profile Management</h1>
              <p className="text-muted-foreground">View and manage your personal information, security settings, and account</p>
            </div>

            <Tabs defaultValue="view" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="view" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  View Profile
                </TabsTrigger>
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Account
                </TabsTrigger>
              </TabsList>

              {/* View Profile Tab */}
              <TabsContent value="view" className="space-y-6">
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
              </TabsContent>

              {/* Edit Profile Tab */}
              <TabsContent value="edit" className="space-y-6">
                <ProfileEditForm
                  profile={profile}
                  onSave={handleUpdateProfile}
                  loading={updateLoading}
                  error={updateError}
                />
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <PasswordChangeForm
                  onSave={handleChangePassword}
                  loading={passwordLoading}
                  error={passwordError}
                />
              </TabsContent>

              {/* Account Management Tab */}
              <TabsContent value="account" className="space-y-6">
                <DeleteAccountDialog
                  onDelete={handleDeleteAccount}
                  loading={deleteLoading}
                  error={deleteError}
                  userEmail={profile.email}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 