"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UpdateProfileData, UserProfile } from "@/lib/profile-service"

interface ProfileEditFormProps {
  profile: UserProfile
  onSave: (data: UpdateProfileData) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function ProfileEditForm({ profile, onSave, loading = false, error }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<UpdateProfileData>({
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
    goal: profile.goal,
    activity_level: profile.activity_level
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      errors.name = "Name is required"
    }

    if (!formData.age || formData.age < 1 || formData.age > 150) {
      errors.age = "Age must be between 1 and 150"
    }

    if (!formData.weight || formData.weight < 1 || formData.weight > 1000) {
      errors.weight = "Weight must be between 1 and 1000 kg"
    }

    if (!formData.height || formData.height < 1 || formData.height > 300) {
      errors.height = "Height must be between 1 and 300 cm"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSave(formData)
    } catch (error) {
      // Error handling is done by the parent component
    }
  }

  const handleInputChange = (field: keyof UpdateProfileData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Edit Profile
        </CardTitle>
        <CardDescription>
          Update your personal information and fitness goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className={validationErrors.name ? "border-red-500" : ""}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ""}
                onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 0)}
                placeholder="Enter your age"
                min="1"
                max="150"
                className={validationErrors.age ? "border-red-500" : ""}
              />
              {validationErrors.age && (
                <p className="text-sm text-red-500">{validationErrors.age}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight || ""}
                onChange={(e) => handleInputChange("weight", parseFloat(e.target.value) || 0)}
                placeholder="Enter your weight"
                min="1"
                max="1000"
                className={validationErrors.weight ? "border-red-500" : ""}
              />
              {validationErrors.weight && (
                <p className="text-sm text-red-500">{validationErrors.weight}</p>
              )}
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm) *</Label>
              <Input
                id="height"
                type="number"
                value={formData.height || ""}
                onChange={(e) => handleInputChange("height", parseFloat(e.target.value) || 0)}
                placeholder="Enter your height"
                min="1"
                max="300"
                className={validationErrors.height ? "border-red-500" : ""}
              />
              {validationErrors.height && (
                <p className="text-sm text-red-500">{validationErrors.height}</p>
              )}
            </div>

            {/* Goal */}
            <div className="space-y-2">
              <Label htmlFor="goal">Primary Goal</Label>
              <Select
                value={formData.goal || ""}
                onValueChange={(value) => handleInputChange("goal", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                  <SelectItem value="Weight Gain">Weight Gain</SelectItem>
                  <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Endurance">Endurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Level */}
            <div className="space-y-2">
              <Label htmlFor="activity_level">Activity Level</Label>
              <Select
                value={formData.activity_level || ""}
                onValueChange={(value) => handleInputChange("activity_level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low (Sedentary)</SelectItem>
                  <SelectItem value="Moderate">Moderate (Light exercise)</SelectItem>
                  <SelectItem value="High">High (Regular exercise)</SelectItem>
                  <SelectItem value="Very High">Very High (Intense exercise)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 