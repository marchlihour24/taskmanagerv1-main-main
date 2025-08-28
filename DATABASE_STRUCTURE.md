# Tasks Table Database Structure

## Table Overview

### Tasks Table Structure
```sql
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',           -- 'todo', 'in-progress', 'completed'
    priority task_priority NOT NULL DEFAULT 'medium',     -- 'low', 'medium', 'high'
    assigned_to UUID REFERENCES public.users(id),         -- Who the task is assigned to
    created_by UUID NOT NULL REFERENCES public.users(id), -- Who created the task
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,                    -- Optional deadline
    tags TEXT[] DEFAULT '{}'                              -- Array of tags
);
```

### Users Table Structure
```sql
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'guest',              -- 'user' or 'guest'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Relationships

### 1. Tasks ↔ Users Relationships

```
users                          tasks
+------------------+          +------------------+
| id (UUID)        |◄─────────| created_by       |  (required - who created the task)
| email            |          |                  |
| name             |          |                  |
| role             |          |                  |
+------------------+          |                  |
        ▲                     |                  |
        │                     |                  |
        └─────────────────────| assigned_to      |  (optional - who the task is assigned to)
                              +------------------+
```

### 2. Role-Based Permissions

#### **User Role** (Full Access)
- ✅ **View**: All tasks
- ✅ **Create**: New tasks  
- ✅ **Edit**: Any task
- ✅ **Delete**: Any task
- ✅ **Assign**: Tasks to anyone

#### **Guest Role** (Limited Access)
- ✅ **View**: All tasks
- ✅ **Create**: New tasks
- ✅ **Edit**: Only tasks they created (`created_by = their_user_id`)
- ✅ **Delete**: Only tasks they created (`created_by = their_user_id`)
- ❌ **Cannot edit/delete**: Tasks created by others

## Field Descriptions

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | UUID | Unique task identifier | Primary key, auto-generated |
| `title` | TEXT | Task title/name | Required, not null |
| `description` | TEXT | Detailed task description | Optional, can be null |
| `status` | ENUM | Current task status | One of: 'todo', 'in-progress', 'completed' |
| `priority` | ENUM | Task priority level | One of: 'low', 'medium', 'high' |
| `assigned_to` | UUID | User assigned to task | Foreign key to users.id, optional |
| `created_by` | UUID | User who created task | Foreign key to users.id, required |
| `created_at` | TIMESTAMP | When task was created | Auto-set to current time |
| `updated_at` | TIMESTAMP | When task was last modified | Auto-updated on changes |
| `due_date` | TIMESTAMP | Task deadline | Optional |
| `tags` | TEXT[] | Array of task tags | Default empty array |

## Database Security (RLS Policies)

### Row Level Security Policies Applied:

1. **SELECT (View Tasks)**
   - All authenticated users can view all tasks

2. **INSERT (Create Tasks)**  
   - Only authenticated users can create tasks
   - `created_by` must match the authenticated user's ID

3. **UPDATE (Edit Tasks)**
   - **Users**: Can edit any task
   - **Guests**: Can only edit tasks where `created_by = auth.uid()`

4. **DELETE (Remove Tasks)**
   - **Users**: Can delete any task  
   - **Guests**: Can only delete tasks where `created_by = auth.uid()`

## Example Queries

### View all tasks with creator and assignee info:
```sql
SELECT 
    t.title,
    t.status,
    t.priority,
    creator.name as created_by,
    assignee.name as assigned_to,
    t.due_date
FROM tasks t
LEFT JOIN users creator ON t.created_by = creator.id
LEFT JOIN users assignee ON t.assigned_to = assignee.id;
```

### Get tasks for a specific user (as creator or assignee):
```sql
SELECT * FROM tasks 
WHERE created_by = 'user-uuid-here' 
   OR assigned_to = 'user-uuid-here';
```

### Count tasks by status:
```sql
SELECT status, COUNT(*) as count 
FROM tasks 
GROUP BY status;
```

## Setup Instructions

1. **Run the complete setup script**: Execute `complete-setup.sql` in your Supabase SQL editor
2. **Verify table creation**: Use `view-tasks-queries.sql` to explore the data
3. **Test permissions**: Create users with different roles and test the access controls

The tasks table connects to **both user and guest roles** through the `users` table relationship, with different permission levels based on the user's role.
