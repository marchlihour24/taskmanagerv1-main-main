"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// ...existing code...
import { Users, Circle } from "lucide-react"

interface OnlineUser {
  id: string
  name: string
  email: string
  status: "online" | "away" | "busy"
  lastSeen?: Date
}

export function UserPresence() {
  // Stub user logic
  const user = { id: "1", name: "You", email: "you@example.com" }
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])

  useEffect(() => {
    // Simulate online users
    const mockUsers: OnlineUser[] = [
      {
        id: user?.id || "1",
        name: user?.name || "You",
        email: user?.email || "you@example.com",
        status: "online",
      },
      {
        id: "2",
        name: "John Doe",
        email: "john@example.com",
        status: "online",
      },
      {
        id: "3",
        name: "Jane Smith",
        email: "jane@example.com",
        status: "away",
      },
      {
        id: "4",
        name: "Mike Johnson",
        email: "mike@example.com",
        status: "busy",
      },
    ]

    setOnlineUsers(mockUsers)

    // Simulate status changes
    const interval = setInterval(() => {
      setOnlineUsers((prev) =>
        prev.map((u) => {
          if (u.id === user?.id) return u // Don't change current user status
          const statuses: OnlineUser["status"][] = ["online", "away", "busy"]
          return {
            ...u,
            status: Math.random() > 0.8 ? statuses[Math.floor(Math.random() * statuses.length)] : u.status,
          }
        }),
      )
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: OnlineUser["status"]) => {
    switch (status) {
      case "online":
        return "text-green-500"
      case "away":
        return "text-yellow-500"
      case "busy":
        return "text-red-500"
      default:
        return "text-gray-400"
    }
  }

  const getStatusBadge = (status: OnlineUser["status"]) => {
    switch (status) {
      case "online":
        return "default"
      case "away":
        return "secondary"
      case "busy":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card className="w-full bg-white border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Users className="h-4 w-4" />
          Online Users ({onlineUsers.filter((u) => u.status === "online").length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {onlineUsers.map((onlineUser) => (
          <div key={onlineUser.id} className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{getInitials(onlineUser.name)}</AvatarFallback>
              </Avatar>
              <Circle
                className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current ${getStatusColor(onlineUser.status)}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {onlineUser.name}
                {onlineUser.id === user?.id && " (You)"}
              </p>
              <p className="text-xs text-gray-500 truncate">{onlineUser.email}</p>
            </div>
            <Badge variant={getStatusBadge(onlineUser.status)} className="text-xs">
              {onlineUser.status}
            </Badge>
          </div>
        ))}

        {onlineUsers.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No one else is online</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
