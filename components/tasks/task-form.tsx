"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useTasks } from "./task-provider"
// ...existing code...
import { Plus, X } from "lucide-react"

interface TaskFormProps {
  trigger?: React.ReactNode
  task?: any
  onClose?: () => void
}

export function TaskForm({ trigger, task, onClose }: TaskFormProps) {
  const { createTask, updateTask } = useTasks()
  // TODO: Replace with actual user fetching logic
  const user = { email: "demo@example.com" }
  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<string[]>(task?.tags || [])
  const [newTag, setNewTag] = useState("")

  const isEditing = !!task

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const taskData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: (formData.get("status") as any) || "todo",
      priority: (formData.get("priority") as any) || "medium",
      assignedTo: formData.get("assignedTo") as string,
      createdBy: user?.email || "",
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : undefined,
      tags,
    }

    if (isEditing) {
      updateTask(task.id, taskData)
    } else {
      createTask(taskData)
    }

    setOpen(false)
    onClose?.()
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={task?.title}
                placeholder="Enter task title"
                required
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={task?.description}
                placeholder="Describe the task in detail"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={task?.status || "todo"}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue={task?.priority || "medium"}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                name="assignedTo"
                type="email"
                defaultValue={task?.assignedTo}
                placeholder="user@example.com"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={task?.dueDate ? task.dueDate.toISOString().split("T")[0] : ""}
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label>Tags</Label>
              <div className="flex gap-2 mt-1 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update Task" : "Create Task"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
