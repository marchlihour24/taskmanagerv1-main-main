"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, List, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

function DashboardOverview({ user }: { user: { name: string; role: "guest" | "user" } }) {
  const welcomeTitle = user.role === "guest" ? `Welcome, Demo Guest` : `Welcome, Demo User`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          <span className="text-sm text-gray-600">Welcome, {user.name}</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{welcomeTitle}</h2>
          <p className="text-gray-600">Choose where you'd like to go or get an overview of your tasks.</p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/tasklist">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5 text-[#BB5624]" />
                  Task List
                </CardTitle>
                <CardDescription>
                  View and manage all your tasks in a detailed list format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#BB5624] hover:bg-[#A04A1F]">
                  Go to Task List
                </Button>
              </CardContent>
            </Card>
          </Link>

          {user.role === "user" && (
            <Link href="/calendarview">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#BB5624]" />
                    Calendar View
                  </CardTitle>
                  <CardDescription>
                    See your tasks organized in a calendar layout with due dates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-[#BB5624] hover:bg-[#A04A1F]">
                    Go to Calendar
                  </Button>
                </CardContent>
              </Card>
            </Link>
          )}

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#BB5624]" />
                Quick Stats
              </CardTitle>
              <CardDescription>
                Overview of your task progress and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Tasks:</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed:</span>
                  <span className="font-semibold text-green-600">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">In Progress:</span>
                  <span className="font-semibold text-blue-600">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending:</span>
                  <span className="font-semibold text-orange-600">1</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity or Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest task updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Completed "Review project proposal"</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Started "Update documentation"</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Created "Team meeting prep"</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/tasklist">
                <Button variant="outline" className="w-full justify-start">
                  <List className="h-4 w-4 mr-2" />
                  View All Tasks
                </Button>
              </Link>
              {user.role === "user" && (
                <Link href="/calendarview">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Check Calendar
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Team Collaboration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [user, setUser] = useState<{ name: string; role: "guest" | "user" } | null>(null)
  const loading = false

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={setUser} />
  }

  return <DashboardOverview user={user} />
}
