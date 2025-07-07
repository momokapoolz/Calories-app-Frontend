"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Lock, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChangePasswordData } from "@/lib/profile-service"

interface PasswordChangeFormProps {
  onSave: (data: ChangePasswordData) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function PasswordChangeForm({ onSave, loading = false, error }: PasswordChangeFormProps) {
  const [formData, setFormData] = useState<ChangePasswordData>({
    current_password: "",
    new_password: ""
  })

  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.current_password) {
      errors.current_password = "Current password is required"
    }

    if (!formData.new_password) {
      errors.new_password = "New password is required"
    } else if (formData.new_password.length < 6) {
      errors.new_password = "New password must be at least 6 characters"
    }

    if (!confirmPassword) {
      errors.confirm_password = "Please confirm your new password"
    } else if (formData.new_password !== confirmPassword) {
      errors.confirm_password = "Passwords do not match"
    }

    if (formData.current_password === formData.new_password) {
      errors.new_password = "New password must be different from current password"
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
      // Clear the form on success
      setFormData({ current_password: "", new_password: "" })
      setConfirmPassword("")
    } catch (error) {
      // Error handling is done by the parent component
    }
  }

  const handleInputChange = (field: keyof ChangePasswordData | "confirm_password", value: string) => {
    if (field === "confirm_password") {
      setConfirmPassword(value)
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" }
    if (password.length < 6) return { strength: 1, label: "Weak", color: "text-red-500" }
    if (password.length < 8) return { strength: 2, label: "Fair", color: "text-yellow-500" }
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 3, label: "Strong", color: "text-green-500" }
    }
    return { strength: 2, label: "Fair", color: "text-yellow-500" }
  }

  const passwordStrength = getPasswordStrength(formData.new_password)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your account password for better security
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
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password *</Label>
            <div className="relative">
              <Input
                id="current_password"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.current_password}
                onChange={(e) => handleInputChange("current_password", e.target.value)}
                placeholder="Enter your current password"
                className={validationErrors.current_password ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {validationErrors.current_password && (
              <p className="text-sm text-red-500">{validationErrors.current_password}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password *</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showNewPassword ? "text" : "password"}
                value={formData.new_password}
                onChange={(e) => handleInputChange("new_password", e.target.value)}
                placeholder="Enter your new password"
                className={validationErrors.new_password ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {formData.new_password && (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      passwordStrength.strength === 1
                        ? "w-1/3 bg-red-500"
                        : passwordStrength.strength === 2
                        ? "w-2/3 bg-yellow-500"
                        : passwordStrength.strength === 3
                        ? "w-full bg-green-500"
                        : "w-0"
                    }`}
                  />
                </div>
                <span className={`text-sm ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
            {validationErrors.new_password && (
              <p className="text-sm text-red-500">{validationErrors.new_password}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Password should be at least 6 characters long
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password *</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => handleInputChange("confirm_password", e.target.value)}
                placeholder="Confirm your new password"
                className={validationErrors.confirm_password ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {validationErrors.confirm_password && (
              <p className="text-sm text-red-500">{validationErrors.confirm_password}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 