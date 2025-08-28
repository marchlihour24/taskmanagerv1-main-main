"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
// ...existing code...
import { TaskProvider } from "@/components/tasks/task-provider"
import { TaskList } from "@/components/tasks/task-list"
import { TaskForm } from "@/components/tasks/task-form"
import { CalendarView } from "@/components/calendar/calendar-view"

import { RealtimeNotifications } from "@/components/realtime/realtime-notifications"
import { UserPresence } from "@/components/realtime/user-presence"
import { LogOut, Plus, Calendar, List, Users, Shield, Wifi, Home } from "lucide-react"
import Link from "next/link"

function DashboardContent({ user, onSignOut }: { user: { name: string, role?: string } | null, onSignOut: () => void }) {
  // Get permissions based on user role
  const permissions = usePermissions(user?.role)
  const [activeView, setActiveView] = useState<"list" | "calendar">("list")
  const logout = onSignOut

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            <Badge variant={user?.role === "user" ? "default" : "outline"}>
              <Shield className="h-3 w-3 mr-1" />
              {user?.role}
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <Wifi className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <RealtimeNotifications />
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
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
              <Link href="/tasklist">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeView === "list" ? "bg-[#F6CEB9] text-gray-900" : ""}`}
                >
                  <List className="h-4 w-4 mr-2" />
                  Task List
                </Button>
              </Link>
              {permissions.canAccessCalendar && (
                <Link href="/calendarview">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${activeView === "calendar" ? "bg-[#F6CEB9] text-gray-900" : ""}`}
                  >
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {activeView === "list" ? "All Tasks" : "Calendar View"}
              </h2>
              <p className="text-gray-600">
                {activeView === "list"
                  ? "Manage and track your tasks efficiently with real-time updates"
                  : "View your tasks in a calendar format with live sync"}
              </p>
            </div>

            {activeView === "list" && <TaskList userRole={user?.role} />}
            {activeView === "calendar" && permissions.canAccessCalendar && <CalendarView />}
          </div>
        </main>
      </div>
    </div>
  )
}

export function TaskDashboard({ user, onSignOut }: { user: { name: string, role?: string } | null, onSignOut: () => void }) {
  return (
    <TaskProvider>
      <DashboardContent user={user} onSignOut={onSignOut} />
    </TaskProvider>
  )
}