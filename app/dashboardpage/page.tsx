"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, List, Home, BarChart3, Activity, Zap } from "lucide-react"

type UserSummary = { name: string; role: "guest" | "user" }

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserSummary | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    )
  }

  if (!user) return null

  const welcomeTitle = user.role === "guest" ? `Welcome, Demo Guest` : `Welcome, Demo User`

  // Small helper for consistent card headers
  const DashboardCardHeader = ({
    icon,
    title,
    description,
  }: {
    icon: ReactNode
    title: string
    description?: string
  }) => (
    <CardHeader className="pb-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-md bg-[#F6EAE5] text-[#BB5624] flex items-center justify-center ring-1 ring-[#EED9D1]">
          {icon}
        </div>
        <div>
          <CardTitle className="text-base md:text-lg leading-tight">{title}</CardTitle>
          {description && (
            <CardDescription className="mt-1 text-sm">{description}</CardDescription>
          )}
        </div>
      </div>
    </CardHeader>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut()
                router.replace("/")
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{welcomeTitle}</h2>
          <p className="text-gray-600">Choose where you'd like to go or get an overview of your tasks.</p>
        </div>
        {/* Four-card, consistent 2x2 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task List */}
          <Link href="/tasklist" className="block">
            <Card className="hover:shadow-md transition-all cursor-pointer">
              <DashboardCardHeader
                icon={<List className="h-4 w-4" />}
                title="Task List"
                description="View and manage all your tasks"
              />
              <CardContent>
                <Button className="w-full bg-[#BB5624] hover:bg-[#A04A1F] text-white">Go to Task List</Button>
              </CardContent>
            </Card>
          </Link>

          {/* Quick Stats */}
          <Card className="hover:shadow-md transition-all">
            <DashboardCardHeader
              icon={<BarChart3 className="h-4 w-4" />}
              title="Quick Stats"
              description="Overview of your task progress"
            />
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <span className="font-semibold text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">8</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-semibold text-blue-600">3</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-orange-600">1</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="hover:shadow-md transition-all">
            <DashboardCardHeader
              icon={<Activity className="h-4 w-4" />}
              title="Recent Activity"
              description="Your latest task updates"
            />
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50 border border-gray-100">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-800">Completed "Review project proposal"</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50 border border-gray-100">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-800">Started "Update documentation"</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50 border border-gray-100">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                  <span className="text-sm text-gray-800">Created "Team meeting prep"</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="hover:shadow-md transition-all">
            <DashboardCardHeader
              icon={<Zap className="h-4 w-4" />}
              title="Quick Actions"
              description="Common tasks you can perform"
            />
            <CardContent className="space-y-3">
              <Link href="/dashboardsidebar">
                <Button variant="outline" className="w-full justify-start hover:bg-[#F6EAE5] hover:text-[#BB5624]">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/calendarview">
                <Button variant="outline" className="w-full justify-start hover:bg-[#F6EAE5] hover:text-[#BB5624]">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar View
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}