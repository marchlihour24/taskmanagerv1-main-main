"use client"

// ...existing code...
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  // Stub: No toasts available since useToast is deleted
  return (
    <ToastProvider>
      {/* No toasts to display */}
      <ToastViewport />
    </ToastProvider>
  )
}
