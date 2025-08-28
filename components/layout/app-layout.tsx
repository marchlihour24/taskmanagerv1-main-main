"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RealtimeNotifications } from "@/components/realtime/realtime-notifications"
import { UserPresence } from "@/components/realtime/user-presence"
import { TaskForm } from "@/components/tasks/task-form"
import { usePermissions } from "@/hooks/use-permissions"
import { LogOut, Plus, Calendar, List, Home, Shield, Wifi } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AppLayoutProps {
  user: { name: string; role: "guest" | "user" }
  onSignOut: () => void
  children: React.ReactNode
}

export function AppLayout({ user, onSignOut, children }: AppLayoutProps) {
  const pathname = usePathname()
  const permissions = usePermissions(user?.role)

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900 hover:text-gray-700 cursor-pointer">
                Task Manager
              </h1>
            </Link>
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
            <Button variant="outline" size="sm" onClick={onSignOut}>
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
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${
                    isActive("/") ? "bg-[#F6CEB9] text-gray-900" : ""
                  }`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              
              <Link href="/tasklist">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    isActive("/tasklist") ? "bg-[#F6CEB9] text-gray-900" : ""
                  }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  Task List
                </Button>
              </Link>
              
              {permissions.canAccessCalendar && (
                <Link href="/calendarview">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive("/calendarview") ? "bg-[#F6CEB9] text-gray-900" : ""
                    }`}
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
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
