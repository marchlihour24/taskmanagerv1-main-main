"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTasks, type Task } from "@/components/tasks/task-provider"
import { TaskForm } from "@/components/tasks/task-form"
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Plus } from "lucide-react"

type CalendarView = "month" | "week" | "day"

export function CalendarView() {
  const { tasks } = useTasks()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>("month")

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)

    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    }

    setCurrentDate(newDate)
  }

  const getDateTitle = () => {
    const options: Intl.DateTimeFormatOptions =
      view === "month"
        ? { year: "numeric", month: "long" }
        : view === "week"
          ? { year: "numeric", month: "short", day: "numeric" }
          : { year: "numeric", month: "long", day: "numeric", weekday: "long" }

    return currentDate.toLocaleDateString("en-US", options)
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDay = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }

    return days
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }

    return days
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-l-green-500"
      case "in-progress":
        return "bg-blue-50 border-l-blue-500"
      default:
        return "bg-gray-50 border-l-gray-400"
    }
  }

  const renderMonthView = () => {
    const days = getCalendarDays()
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
      <div className="bg-white rounded-lg border">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center font-medium text-gray-500 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayTasks = getTasksForDate(day)
            const isCurrentMonthDay = isCurrentMonth(day)
            const isTodayDay = isToday(day)

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                  !isCurrentMonthDay ? "bg-gray-50" : ""
                } ${isTodayDay ? "bg-blue-50" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-2 ${
                    !isCurrentMonthDay ? "text-gray-400" : isTodayDay ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {day.getDate()}
                </div>

                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded border-l-2 ${getStatusColor(task.status)} cursor-pointer hover:shadow-sm transition-shadow`}
                      title={task.description}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className={`text-xs px-1 py-0 ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">+{dayTasks.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const days = getWeekDays()
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    return (
      <div className="bg-white rounded-lg border">
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayTasks = getTasksForDate(day)
            const isTodayDay = isToday(day)

            return (
              <div key={index} className={`min-h-[400px] border-r last:border-r-0 ${isTodayDay ? "bg-blue-50" : ""}`}>
                <div
                  className={`p-3 border-b font-medium ${isTodayDay ? "bg-blue-100 text-blue-800" : "text-gray-900"}`}
                >
                  <div className="text-sm">{weekDays[index]}</div>
                  <div className="text-lg">{day.getDate()}</div>
                </div>

                <div className="p-2 space-y-2">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-2 rounded border-l-2 ${getStatusColor(task.status)} cursor-pointer hover:shadow-sm transition-shadow`}
                    >
                      <div className="font-medium text-sm mb-1">{task.title}</div>
                      <div className="text-xs text-gray-600 mb-2">{task.description}</div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          {task.assignedTo.split("@")[0]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate)
    const isTodayDay = isToday(currentDate)

    return (
      <div className="space-y-4">
        <Card className={isTodayDay ? "border-blue-200 bg-blue-50" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tasks for {getDateTitle()}</span>
              <TaskForm
                trigger={
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                }
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No tasks scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-l-4 ${getStatusColor(task.status)} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                        <p className="text-gray-600 mb-3">{task.description}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {task.assignedTo}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {task.status}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority} priority
                          </Badge>
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <TaskForm
                        task={task}
                        trigger={
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">{getDateTitle()}</h2>
              <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Select value={view} onValueChange={(value: CalendarView) => setView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Content */}
      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}

      {/* Calendar Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks This Month</p>
                <p className="text-2xl font-bold">
                  {
                    tasks.filter((task) => {
                      if (!task.dueDate) return false
                      const taskDate = new Date(task.dueDate)
                      return (
                        taskDate.getMonth() === currentDate.getMonth() &&
                        taskDate.getFullYear() === currentDate.getFullYear()
                      )
                    }).length
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600">
                  {
                    tasks.filter((task) => {
                      if (!task.dueDate || task.status === "completed") return false
                      return new Date(task.dueDate) < new Date()
                    }).length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due This Week</p>
                <p className="text-2xl font-bold text-orange-600">
                  {
                    tasks.filter((task) => {
                      if (!task.dueDate) return false
                      const taskDate = new Date(task.dueDate)
                      const weekStart = new Date()
                      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
                      const weekEnd = new Date(weekStart)
                      weekEnd.setDate(weekStart.getDate() + 6)
                      return taskDate >= weekStart && taskDate <= weekEnd
                    }).length
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
