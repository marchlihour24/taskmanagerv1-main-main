"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// ...existing code...
import { Bell, X, CheckCircle, Clock, Trash2, User } from "lucide-react"

interface Notification {
  id: string
  type: "task-created" | "task-updated" | "task-deleted" | "user-joined"
  title: string
  message: string
  timestamp: Date
  read: boolean
  user?: {
    name: string
    email: string
  }
}

export function RealtimeNotifications() {
  // Stub: user logic removed
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Simulate receiving notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const notificationTypes = [
          {
            type: "task-created" as const,
            title: "New Task Created",
            message: "A new task has been assigned to the project",
            user: { name: "John Doe", email: "john@example.com" },
          },
          {
            type: "task-updated" as const,
            title: "Task Updated",
            message: "Task status changed to In Progress",
            user: { name: "Jane Smith", email: "jane@example.com" },
          },
          {
            type: "user-joined" as const,
            title: "User Online",
            message: "A user just joined the workspace",
            user: { name: "Mike Johnson", email: "mike@example.com" },
          },
        ]

        const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]

        const newNotification: Notification = {
          id: Date.now().toString(),
          ...randomNotification,
          timestamp: new Date(),
          read: false,
        }

        setNotifications((prev) => [newNotification, ...prev.slice(0, 9)])
      }
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "task-created":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "task-updated":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "task-deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "user-joined":
        return <User className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden z-50 shadow-lg">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          {notification.user && (
                            <p className="text-xs text-gray-500 mt-1">by {notification.user.name}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{formatTime(notification.timestamp)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotification(notification.id)
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
