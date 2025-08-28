"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
// ...existing code...

export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  assignedTo: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  tags: string[]
}

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskStatus: (id: string) => void
  getTasksByStatus: (status: Task["status"]) => Task[]
  getTasksByAssignee: (assignee: string) => Task[]
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  // ...existing code...

  useEffect(() => {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem("task-manager-tasks")
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }))
      setTasks(parsedTasks)
    } else {
      // Initialize with sample tasks
      const sampleTasks: Task[] = [
        {
          id: "1",
          title: "Setup project repository",
          description: "Initialize the project repository with proper structure and documentation",
          status: "completed",
          priority: "high",
          assignedTo: "admin@example.com",
          createdBy: "admin@example.com",
          createdAt: new Date(Date.now() - 86400000 * 2),
          updatedAt: new Date(Date.now() - 86400000 * 1),
          dueDate: new Date(Date.now() + 86400000 * 3),
          tags: ["setup", "documentation"],
        },
        {
          id: "2",
          title: "Design user interface mockups",
          description: "Create wireframes and mockups for the main application interface",
          status: "in-progress",
          priority: "medium",
          assignedTo: "manager@example.com",
          createdBy: "admin@example.com",
          createdAt: new Date(Date.now() - 86400000 * 1),
          updatedAt: new Date(Date.now() - 3600000 * 2),
          dueDate: new Date(Date.now() + 86400000 * 5),
          tags: ["design", "ui/ux"],
        },
        {
          id: "3",
          title: "Implement authentication system",
          description: "Build secure login and registration functionality with role-based access",
          status: "todo",
          priority: "high",
          assignedTo: "user@example.com",
          createdBy: "manager@example.com",
          createdAt: new Date(Date.now() - 3600000 * 12),
          updatedAt: new Date(Date.now() - 3600000 * 12),
          dueDate: new Date(Date.now() + 86400000 * 7),
          tags: ["backend", "security"],
        },
      ]
      setTasks(sampleTasks)
      localStorage.setItem("task-manager-tasks", JSON.stringify(sampleTasks))
    }
    setLoading(false)
  }, [])

  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem("task-manager-tasks", JSON.stringify(updatedTasks))
  }

  const createTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    saveTasks(updatedTasks)

  // ...existing code...
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task))
    setTasks(updatedTasks)
    saveTasks(updatedTasks)

    const updatedTask = updatedTasks.find((t) => t.id === id)
  // ...existing code...
  }

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id)
    setTasks(updatedTasks)
    saveTasks(updatedTasks)

  // ...existing code...
  }

  const toggleTaskStatus = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    let newStatus: Task["status"]
    if (task.status === "todo") newStatus = "in-progress"
    else if (task.status === "in-progress") newStatus = "completed"
    else newStatus = "todo"

    updateTask(id, { status: newStatus })
  }

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  const getTasksByAssignee = (assignee: string) => {
    return tasks.filter((task) => task.assignedTo === assignee)
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        getTasksByStatus,
        getTasksByAssignee,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}
