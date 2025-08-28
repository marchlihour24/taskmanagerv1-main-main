import { Suspense } from "react"
import NextDynamic from "next/dynamic"

// Avoid SSR for the client component to prevent prerender CSR bailout warnings
const ResetPasswordClient = NextDynamic(() => import("./reset-password-client"), {
  ssr: false,
})

// Ensure this route is treated as dynamic and not statically prerendered
export const dynamic = "force-dynamic"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <ResetPasswordClient />
    </Suspense>
  )
}
