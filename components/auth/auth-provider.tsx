"use client"

import type React from "react"
import { createContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export type Role = "user" | "guest"

interface User {
  id: string
  email: string
  name: string
  role: Role
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string, role?: Role) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("task-manager-user")
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {
      // ignore parse errors
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) throw authError

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser?.id)
      .single()

    if (profile) {
      setUser({
        id: authUser!.id,
        email: authUser!.email!,
        name: profile.name,
        role: profile.role
      })
    }
    localStorage.setItem("task-manager-user", JSON.stringify({
      id: authUser!.id,
      email: authUser!.email!,
      name: profile.name,
      role: profile.role
    }))
  }

  const register = async (email: string, password: string, name: string, role: Role = 'guest') => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    // Create user profile with role
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser!.id,
        email,
        name,
        role
      })

    if (profileError) throw profileError

    setUser({
      id: authUser!.id,
      email,
      name,
      role
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}