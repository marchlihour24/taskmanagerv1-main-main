"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<string>("")
  const [isError, setIsError] = useState(false)

  // On mount, ensure the URL contains a recovery token and a valid session can be established
  useEffect(() => {
    const init = async () => {
      try {
        // For Supabase password recovery, the URL contains a hash with access_token and type=recovery
        // supabase-js picks this up automatically on client when instantiated.
        // We just verify there's a session so updateUser can succeed.
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          setIsError(true)
          setMessage("Recovery link is invalid or expired. Please request a new one.")
        }
      } catch (e) {
        setIsError(true)
        setMessage("Unable to verify recovery link. Please try again.")
      } finally {
        setIsChecking(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsError(false)
    setMessage("")

    if (!password || password.length < 8) {
      setIsError(true)
      setMessage("Password must be at least 8 characters long.")
      return
    }
    if (password !== confirmPassword) {
      setIsError(true)
      setMessage("Passwords do not match.")
      return
    }

    setIsUpdating(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setIsError(true)
        setMessage(error.message || "Failed to update password.")
        return
      }
      setIsError(false)
      setMessage("Password updated successfully. Redirecting to sign in…")
      // Small delay for UX then redirect to sign-in
      setTimeout(() => router.push("/auth/login"), 1200)
    } catch (err: any) {
      setIsError(true)
      setMessage(err?.message || "Something went wrong. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
          <CardDescription className="text-gray-600">
            {isChecking ? "Validating your recovery link…" : "Enter and confirm your new password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <Label htmlFor="password" className="block text-sm mb-1">New password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isChecking || isUpdating}
                className="w-full px-4 py-3 rounded-md bg-gray-100 focus:outline-none"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="block text-sm mb-1">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isChecking || isUpdating}
                className="w-full px-4 py-3 rounded-md bg-gray-100 focus:outline-none"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-[#BB5624] text-white font-semibold rounded-md" disabled={isChecking || isUpdating}>
              {isUpdating ? "Updating…" : "Update Password"}
            </Button>
            {message && (
              <div className={`mt-2 text-center text-sm ${isError ? "text-red-600" : "text-green-600"}`}>
                {message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
