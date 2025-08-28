"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTasks, type Task } from "./task-provider"
import { TaskForm } from "./task-form"
import { KanbanBoard } from "./kanban-board"
import { usePermissions } from "@/hooks/use-permissions"
// ...existing code...
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  LayoutGrid,
  List,
  Lock,
} from "lucide-react"

export function TaskList({ userRole = "guest" }: { userRole?: string }) {
  const { tasks, loading, deleteTask, toggleTaskStatus } = useTasks()
  // Get permissions for the current user
  const permissions = usePermissions(userRole)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-600" />
    }
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

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200"
      case "in-progress":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const renderListView = () => (
    <div className="space-y-4">
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No tasks found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        filteredTasks.map((task) => (
          <Card key={task.id} className="transition-all hover:shadow-md bg-white border-2 border-[#F6CEB9]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    {!permissions.canEditAllTasks && <Lock className="h-4 w-4 text-gray-400" />}
                  </div>

                  <p className="text-gray-600 leading-relaxed">{task.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {task.assignedTo}
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {task.dueDate.toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      {task.tags.length} tags
                    </div>
                    <div className="text-xs text-gray-400">Created by: {task.createdBy.split("@")[0]}</div>
                  </div>

                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {permissions.canEditAllTasks && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTaskStatus(task.id)}
                      className="whitespace-nowrap"
                    >
                      {task.status === "completed" ? "Reopen" : "Mark Complete"}
                    </Button>
                  )}
                  {permissions.canEditAllTasks && (
                    <TaskForm
                      task={task}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                  )}
                  {permissions.canDeleteAllTasks && (
                    <Button variant="outline" size="sm" onClick={() => deleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("kanban")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">To Do</p>
                <p className="text-2xl font-bold text-gray-700">{tasks.filter((t) => t.status === "todo").length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.filter((t) => t.status === "in-progress").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter((t) => t.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Content */}
      {viewMode === "list" ? renderListView() : <KanbanBoard userRole={userRole} />}
    </div>
  )
}
