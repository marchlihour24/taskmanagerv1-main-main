"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTasks, type Task } from "./task-provider"
import { TaskForm } from "./task-form"
import { usePermissions } from "@/hooks/use-permissions"
// ...existing code...
import { Plus, Edit, Trash2, Calendar, User, Tag, GripVertical } from "lucide-react"

interface DraggedTask {
  task: Task
  sourceColumn: Task["status"]
}

export function KanbanBoard({ userRole = "guest" }: { userRole?: string }) {
  const { tasks, updateTask, deleteTask } = useTasks()
  // Get permissions for the current user
  const permissions = usePermissions(userRole)
  const user = { email: "demo@example.com" }
  const [draggedTask, setDraggedTask] = useState<DraggedTask | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<Task["status"] | null>(null)

  const columns: { status: Task["status"]; title: string; color: string }[] = [
    { status: "todo", title: "To Do", color: "bg-[#F6CEB9] border-gray-200" },
    { status: "in-progress", title: "In Progress", color: "bg-[#F6CEB9] border-blue-200" },
    { status: "completed", title: "Completed", color: "bg-[#F6CEB9] border-green-200" },
  ]

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask({ task, sourceColumn: task.status })
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML)
    e.currentTarget.style.opacity = "0.5"
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = "1"
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: Task["status"]) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (draggedTask && draggedTask.task.status !== targetStatus) {
      updateTask(draggedTask.task.id, { status: targetStatus })
    }

    setDraggedTask(null)
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const canEditTask = (task: Task) => {
    return permissions.canEditAllTasks || task.createdBy === user?.email
  }

  const canDeleteTask = (task: Task) => {
    return permissions.canDeleteAllTasks || task.createdBy === user?.email
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const isOverdue = (task: Task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"
  }

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Kanban Board</h3>
          <p className="text-sm text-gray-600">Drag tasks between columns to update their status</p>
        </div>
        <TaskForm
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          }
        />
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.status)
          const isDragOver = dragOverColumn === column.status

          return (
            <div
              key={column.status}
              className={`min-h-[600px] rounded-lg border-2 transition-all duration-200 ${
                column.color
              } ${isDragOver ? "border-blue-400 bg-blue-100" : ""}`}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Column Header */}
              <div className="p-4 border-b bg-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{column.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>
              </div>

              {/* Column Content */}
              <div className="p-4 space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-sm">No tasks in {column.title.toLowerCase()}</div>
                    <div className="text-xs mt-1">Drag tasks here to update status</div>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={`cursor-move hover:shadow-lg transition-all duration-200 ${
                        isOverdue(task) ? "border-red-300 bg-red-50" : "bg-white"
                      } ${draggedTask?.task.id === task.id ? "opacity-50" : ""}`}
                    >
                      <CardContent className="p-4">
                        {/* Task Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1">
                            <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <h5 className="font-semibold text-sm leading-tight">{task.title}</h5>
                          </div>
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs ml-2">
                            {task.priority}
                          </Badge>
                        </div>

                        {/* Task Description */}
                        {task.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                        )}

                        {/* Task Meta */}
                        <div className="space-y-2">
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span className={isOverdue(task) ? "text-red-600 font-medium" : ""}>
                                {formatDate(task.dueDate)}
                                {isOverdue(task) && " (Overdue)"}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            <span>{task.assignedTo.split("@")[0]}</span>
                          </div>

                          {task.tags.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Tag className="h-3 w-3" />
                              <div className="flex flex-wrap gap-1">
                                {task.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                                {task.tags.length > 2 && (
                                  <span className="text-xs text-gray-400">+{task.tags.length - 2}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Task Actions */}
                        <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t">
                          {canEditTask(task) && (
                            <TaskForm
                              task={task}
                              trigger={
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              }
                            />
                          )}
                          {canDeleteTask(task) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => deleteTask(task.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Board Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{getTasksByStatus("todo").length}</div>
              <div className="text-sm text-gray-600">To Do</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{getTasksByStatus("in-progress").length}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getTasksByStatus("completed").length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
