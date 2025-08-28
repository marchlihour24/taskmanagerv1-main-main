"use client"

import { TaskProvider } from "@/components/tasks/task-provider"
import { TaskList } from "@/components/tasks/task-list"
import { TaskForm } from "@/components/tasks/task-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RealtimeNotifications } from "@/components/realtime/realtime-notifications"
import { UserPresence } from "@/components/realtime/user-presence"
import { usePermissions } from "@/hooks/use-permissions"
import { LogOut, Plus, Calendar, List, Home, Shield, Wifi } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function DashboardsidebarPage() {
  const [user, setUser] = useState<{ name: string; role: "guest" | "user" } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const permissions = usePermissions(user?.role)

  useEffect(() => {
    let active = true
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth?.user) {
        router.replace("/")
        return
      }
      const { data, error } = await supabase
        .from("user")
        .select("full_name, role")
        .eq("auth_id", auth.user.id)
        .single()

      const name = data?.full_name || "Demo User"
      const role = (data?.role === "guest" || data?.role === "user") ? data.role : "user"
      if (error) console.warn("Profile fetch error:", error)
      if (active) {
        setUser({ name, role })
        setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    router.push("/")
    return null
  }

  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
              <Badge variant={user?.role === "user" ? "default" : "outline"}>
                <Shield className="h-3 w-3 mr-1" />
                {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <RealtimeNotifications />
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-sidebar border-r border-gray-200 min-h-[calc(100vh-73px)]">
            <div className="p-6 space-y-4">
              {permissions.canCreateTasks && (
                <TaskForm
                  trigger={
                    <Button className="w-full bg-[#BB5624] justify-start" size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      New Task
                    </Button>
                  }
                />
              )}

              <nav className="space-y-2">
                <Link href="/dashboardsidebar">
                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-[#F6CEB9] text-gray-900"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                <Link href="/tasklist">
                  <Button variant="ghost" className="w-full justify-start">
                    <List className="h-4 w-4 mr-2" />
                    Task List
                  </Button>
                </Link>

                {permissions.canAccessCalendar && (
                  <Link href="/calendarview">
                    <Button variant="ghost" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Calendar View
                    </Button>
                  </Link>
                )}
              </nav>

              <div className="mt-8">
                <UserPresence />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">All Tasks</h2>
                <p className="text-gray-600">
                  Manage and track your tasks efficiently with real-time updates
                </p>
              </div>

              <TaskList userRole={user?.role} />
            </div>
          </main>
        </div>
      </div>
    </TaskProvider>
  )
}