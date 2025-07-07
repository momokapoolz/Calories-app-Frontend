"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DeleteAccountDialogProps {
  onDelete: () => Promise<void>
  loading?: boolean
  error?: string | null
  userEmail?: string
}

export function DeleteAccountDialog({ onDelete, loading = false, error, userEmail }: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const requiredText = "DELETE MY ACCOUNT"

  const handleInitialClick = () => {
    setConfirmationText("")
    setOpen(true)
  }

  const handleProceedToConfirmation = () => {
    if (confirmationText === requiredText) {
      setOpen(false)
      setConfirmOpen(true)
    }
  }

  const handleFinalDelete = async () => {
    try {
      await onDelete()
      setConfirmOpen(false)
      setOpen(false)
      setConfirmationText("")
    } catch (error) {
      // Error is handled by parent component
    }
  }

  const isConfirmationValid = confirmationText === requiredText

  return (
    <>
      {/* Delete Account Card */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600">
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-red-800">Delete Account</h4>
              <p className="text-sm text-red-600 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={handleInitialClick}
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Trash2 className="mr-2 h-4 w-4" />
              Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Initial Warning Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account - Warning
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>This action will permanently delete your account and all associated data including:</p>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Your profile information</li>
                <li>All meal logs and food entries</li>
                <li>Nutrition tracking history</li>
                <li>Exercise records</li>
                <li>All personal settings</li>
              </ul>
              <p className="font-medium text-red-600 mt-3">
                This action cannot be undone and your data cannot be recovered.
              </p>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="confirmation">
                To confirm, type <span className="font-mono font-bold">{requiredText}</span> below:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={requiredText}
                className={`mt-2 ${!isConfirmationValid && confirmationText ? "border-red-500" : ""}`}
              />
            </div>

            {userEmail && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You are about to delete the account for: <strong>{userEmail}</strong>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleProceedToConfirmation}
              disabled={!isConfirmationValid}
              className="w-full sm:w-auto"
            >
              I Understand, Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Final Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure? This is your last chance to cancel.
              
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-medium">Once you confirm:</p>
                <ul className="text-red-700 text-sm mt-1 space-y-1">
                  <li>• Your account will be immediately deleted</li>
                  <li>• You will be logged out</li>
                  <li>• All your data will be permanently removed</li>
                  <li>• You cannot recover your account or data</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 