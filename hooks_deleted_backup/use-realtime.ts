"use client"

import { useEffect, useRef } from "react"
import { getPusherInstance } from "@/lib/pusher"
import { useAuth } from "./use-auth"
import type { Task } from "@/components/tasks/task-provider"

export interface RealtimeEvent {
  type:
    | "client-task-created"
    | "client-task-updated"
    | "client-task-deleted"
    | "client-user-joined"
    | "client-user-left"
  data: any
  user: {
    id: string
    name: string
    email: string
  }
  timestamp: Date
}

export function useRealtime(
  onTaskCreated?: (task: Task) => void,
  onTaskUpdated?: (task: Task) => void,
  onTaskDeleted?: (taskId: string) => void,
  onUserPresence?: (users: any[]) => void,
) {
  const { user } = useAuth()
  const pusherRef = useRef<any>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!user) return

    // Initialize Pusher
    pusherRef.current = getPusherInstance()
    channelRef.current = pusherRef.current.subscribe("task-manager")

    // Bind to task events
    if (onTaskCreated) {
      channelRef.current.bind("client-task-created", (data: any) => {
        onTaskCreated(data.task)
      })
    }

    if (onTaskUpdated) {
      channelRef.current.bind("client-task-updated", (data: any) => {
        onTaskUpdated(data.task)
      })
    }

    if (onTaskDeleted) {
      channelRef.current.bind("client-task-deleted", (data: any) => {
        onTaskDeleted(data.taskId)
      })
    }

    if (onUserPresence) {
      channelRef.current.bind("client-user-joined", (data: any) => {
        onUserPresence(data.users)
      })

      channelRef.current.bind("client-user-left", (data: any) => {
        onUserPresence(data.users)
      })
    }

    // Simulate user joining
    setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.trigger("client-user-joined", {
          users: [
            { id: user.id, name: user.name, email: user.email, status: "online" },
            { id: "2", name: "Johnny Dang", email: "johnnydang@example.com", status: "online" },
            { id: "3", name: "Jane Smith", email: "jane@example.com", status: "away" },
          ],
        })
      }
    }, 2000)

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind("client-task-created")
        channelRef.current.unbind("client-task-updated")
        channelRef.current.unbind("client-task-deleted")
        channelRef.current.unbind("client-user-joined")
        channelRef.current.unbind("client-user-left")
        pusherRef.current.unsubscribe("task-manager")
      }
    }
  }, [user, onTaskCreated, onTaskUpdated, onTaskDeleted, onUserPresence])

  const broadcastTaskCreated = (task: Task) => {
    if (channelRef.current) {
      // In a real implementation, this would be sent to your backend
      setTimeout(() => {
        channelRef.current.trigger("client-task-created", {
          task,
          user: { id: user?.id, name: user?.name, email: user?.email },
          timestamp: new Date(),
        })
      }, 100)
    }
  }

  const broadcastTaskUpdated = (task: Task) => {
    if (channelRef.current) {
      setTimeout(() => {
        channelRef.current.trigger("client-task-updated", {
          task,
          user: { id: user?.id, name: user?.name, email: user?.email },
          timestamp: new Date(),
        })
      }, 100)
    }
  }

  const broadcastTaskDeleted = (taskId: string) => {
    if (channelRef.current) {
      setTimeout(() => {
        channelRef.current.trigger("client-task-deleted", {
          taskId,
          user: { id: user?.id, name: user?.name, email: user?.email },
          timestamp: new Date(),
        })
      }, 100)
    }
  }

  return {
    broadcastTaskCreated,
    broadcastTaskUpdated,
    broadcastTaskDeleted,
  }
}
