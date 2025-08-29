"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { supabase } from "@/lib/supabase"

// Ensure this page is not statically prerendered since it relies on search params
export const dynamic = "force-dynamic"

export default function LoginPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (isMounted && data.user) {
          router.replace("/dashboardpage")
          return
        }
      } finally {
        if (isMounted) setChecking(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
