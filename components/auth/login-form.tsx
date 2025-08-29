// ...existing code...
"use client"

import { useRouter } from "next/navigation"
import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// ...existing code...
import { CheckCircle, Users, Calendar, Zap } from "lucide-react"

type LoginFormProps = {
  onLogin?: (user: { name: string; role: "guest" | "user" }) => void;
  resetSuccess?: boolean; // display post-reset title/message
};

export function LoginForm({ onLogin, resetSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("guest");
  const [activeTab, setActiveTab] = useState("login");
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");
  const router = useRouter()
  const [showResetTitle, setShowResetTitle] = useState<boolean>(!!resetSuccess)
  // Also detect via window.location once on mount (no useSearchParams to avoid SSR Suspense requirement)
  useEffect(() => {
    if (resetSuccess) {
      setShowResetTitle(true)
      return
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (url.searchParams.get("reset") === "success") {
        setShowResetTitle(true)
      }
    }
  }, [resetSuccess])

  // Real login handler using Supabase
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setWelcomeMessage("");
    try {
      const { signIn } = await import("@/lib/auth");
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await signIn(email, password);
      if (error || !data?.user) {
        console.error("Supabase signIn error:", error); // Log error for debugging
        if (error?.message === 'Invalid login credentials') {
          setWelcomeMessage("Invalid email or password. If you haven't registered yet, please sign up first.");
        } else if (error?.message === 'Email not confirmed') {
          setWelcomeMessage("Please confirm your email address before signing in. Check your inbox for a confirmation link.");
        } else {
          setWelcomeMessage(error?.message || "Login failed. Please check your credentials.");
        }
  setIsLoading(false);
        return;
      }
      // Fetch user role and full name from public.user table
      let userRole: "guest" | "user" = "user";
      let displayName = "Demo User";
      
      try {
        const result = await supabase
          .from("user")  // Using the correct table name from your Supabase setup
          .select("role, full_name")
          .eq("auth_id", data.user.id)
          .single();
          
        if (result.error) {
          console.error("Supabase user fetch error:", result.error);
          // Continue with default values set above
        } else if (result.data) {
          const userData = result.data;
          userRole = (userData.role === "guest" || userData.role === "user") ? userData.role : "user";
          displayName = userData.full_name || "Demo User";
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Continue with default values
      }
      setWelcomeMessage(`Welcome, ${displayName}`);
      if (onLogin) {
        onLogin({ name: displayName, role: userRole });
      }
  // Navigate to dashboard after successful login
  router.push("/dashboardpage")
    } catch (err) {
      console.error("Login error:", err); // Log error for debugging
      setWelcomeMessage("Login failed. Please try again.");
    }
    setIsLoading(false);
  };

  // Real register handler
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setRegisterMessage("");
    setRegisterError("");
    try {
      // Import signUp dynamically to avoid SSR issues
      const { signUp } = await import("@/lib/auth");
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await signUp(email, password);
      if (error || !data?.user) {
        setRegisterError(error?.message || "Registration failed.");
      } else {
        // Insert user profile into public.user table
        const { error: insertError } = await supabase
          .from("user")
          .insert({
            auth_id: data.user.id,
            role: role,
            full_name: fullName,
          });
        if (insertError) {
          setRegisterError(insertError.message || "Failed to save user profile.");
        } else {
          setRegisterMessage("Check your email for confirmation.");
          // Save full name to localStorage for later sign in
          localStorage.setItem(`user_fullname_${email}`, fullName);
          // After registration, call onLogin with guest/user role
          if (onLogin) {
            onLogin({ name: fullName || "Demo Guest", role: role as "guest" | "user" });
          }
          // Optional: navigate to dashboard after registration
          router.push("/dashboardpage")
        }
      }
    } catch (err: any) {
      setRegisterError(err?.message || "Registration failed.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Task
              <span className="text-blue-600 block">manager</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              A task manager helps you stay organized, focused, and motivated by turning big goals into clear, manageable steps you can confidently achieve.
            </p>
            <img src="/bg-homepage-img.jpg" alt="Task Manager Hero" className="w-full h-auto rounded-lg shadow-lg" />
          </div>

          <div className="grid gap-4">

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-gray-700">Role-based access control</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span className="text-gray-700">Calendar view and drag & drop</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-gray-700">Lightning-fast task updates</span>
            </div>
          </div>
        </div>

    {/* Auth Forms */}
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
      <CardTitle className="text-2xl font-bold text-gray-900">{showResetTitle ? "Please log in with your new password" : "Welcome"}</CardTitle>
      <CardDescription className="text-gray-600">{showResetTitle ? "Use the new password you just set to access your account." : "Sign in to your account or create a new one"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="block text-sm mb-1">Your email</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-3 rounded-md bg-gray-100 focus:outline-none"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="block text-sm mb-1">Password</Label>
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      className="w-full px-4 py-3 rounded-md bg-gray-100 focus:outline-none"
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-[#BB5624] text-white font-semibold rounded-md" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "CONTINUE"}
                  </Button>
                  {welcomeMessage && (
                    <div className="mt-4 text-green-600 text-center text-lg font-bold">{welcomeMessage}</div>
                  )}
                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-600">Or </span>
                    <button
                      type="button"
                      className="text-sm text-blue-600 underline cursor-pointer bg-transparent border-none p-0"
                      onClick={() => setActiveTab("register")}
                    >
                      create a new account
                    </button>
                  </div>
                  <div className="text-center mt-2">
                    <button
                      type="button"
                      className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer bg-transparent border-none p-0"
                      onClick={async () => {
                        if (email) {
                          setIsLoading(true);
                          const { supabase } = await import("@/lib/supabase");
                          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
                          const { error } = await supabase.auth.resetPasswordForEmail(email, {
                            redirectTo: `${siteUrl}/auth/reset-password`,
                          });
                          setIsLoading(false);
                          if (error) {
                            setWelcomeMessage("Error sending reset password email. Please try again.");
                          } else {
                            setWelcomeMessage("Password reset email sent. Please check your inbox.");
                          }
                        } else {
                          setWelcomeMessage("Please enter your email address first.");
                        }
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <Label htmlFor="register-name" className="block text-sm mb-1">Full Name</Label>
                    <Input
                      id="register-name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 rounded-md bg-gray-100 focus:outline-none"
                      value={fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-email" className="block text-sm mb-1">Your email</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="w-full px-4 py-3 rounded-md bg-gray-100 focus:outline-none"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password" className="block text-sm mb-1">Password</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 rounded-md bg-gray-100 focus:outline-none"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      name="role"
                      className="h-11 w-full border rounded px-3"
                      value={role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
                      required
                    >
                      <option value="guest">Guest</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full h-12 bg-[#BB5624] text-white font-semibold rounded-md" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                  {registerMessage && (
                    <div className="mt-4 text-green-600 text-center text-sm">{registerMessage}</div>
                  )}
                  {registerError && (
                    <div className="mt-4 text-red-600 text-center text-sm">{registerError}</div>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
// ...existing code...