export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'guest'
export type TaskStatus = 'todo' | 'in-progress' | 'completed'  
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: TaskStatus
          priority: TaskPriority
          assigned_to: string | null
          created_by: string
          created_at: string
          updated_at: string
          due_date: string | null
          tags: string[]
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          assigned_to?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          due_date?: string | null
          tags?: string[]
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          assigned_to?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          due_date?: string | null
          tags?: string[]
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: UserRole
      }
    }
    Enums: {
      user_role: UserRole
      task_status: TaskStatus
      task_priority: TaskPriority
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
