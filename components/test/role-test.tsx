"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function RoleTest() {
  const [tasks, setTasks] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [testMessage, setTestMessage] = useState<string>('')

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setCurrentUser(userData)
      }
    }
    getCurrentUser()
  }, [])

  // Test functions
  const testCreateTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: `Test Task by ${currentUser?.role || 'unknown'}`,
          description: `Created at ${new Date().toISOString()}`
        })
        .select()
        .single()

      if (error) throw error
      setTestMessage(`Task created successfully: ${data.title}`)
      await loadTasks()
    } catch (error: any) {
      setTestMessage(`Error creating task: ${error.message}`)
    }
  }

  const testEditTask = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: `Edited by ${currentUser?.role || 'unknown'} at ${new Date().toISOString()}`
        })
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error
      setTestMessage(`Task edited successfully: ${data.title}`)
      await loadTasks()
    } catch (error: any) {
      setTestMessage(`Error editing task: ${error.message}`)
    }
  }

  const testDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      setTestMessage('Task deleted successfully')
      await loadTasks()
    } catch (error: any) {
      setTestMessage(`Error deleting task: ${error.message}`)
    }
  }

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setTestMessage(`Error loading tasks: ${error.message}`)
      return
    }
    setTasks(data || [])
  }

  useEffect(() => {
    loadTasks()
  }, [])

  if (!currentUser) {
    return <div>Please log in to test roles</div>
  }

  return (
    <div className="space-y-4 p-4">
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-2">Current User</h2>
        <p>Role: {currentUser.role}</p>
        <p>Email: {currentUser.email}</p>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-2">Test Actions</h2>
        <div className="space-y-2">
          <Button onClick={testCreateTask}>Create Test Task</Button>
          <p className="text-sm text-gray-500">{testMessage}</p>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-2">Tasks List</h2>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="border p-2 rounded">
              <p>{task.title}</p>
              <p className="text-sm text-gray-500">Created by: {task.created_by}</p>
              <div className="space-x-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testEditTask(task.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => testDeleteTask(task.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
