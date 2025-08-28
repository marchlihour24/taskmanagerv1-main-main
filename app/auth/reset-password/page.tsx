import { Suspense } from "react"
import ResetPasswordClient from "./reset-password-client"

// Ensure this route is treated as dynamic and not statically prerendered
export const dynamic = "force-dynamic"

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading…
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  )
}
