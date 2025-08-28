-- COMPLETE DATABASE SETUP - Role-based access control for Task Manager
-- Run this script to set up complete structure safely

-- 1. Create custom types first
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'users') THEN
        CREATE TABLE public.users (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role user_role NOT NULL DEFAULT 'guest',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END
$$;

-- 3. Create tasks table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'tasks') THEN
        CREATE TABLE public.tasks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status task_status NOT NULL DEFAULT 'todo',
            priority task_priority NOT NULL DEFAULT 'medium',
            assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
            created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            due_date TIMESTAMP WITH TIME ZONE,
            tags TEXT[] DEFAULT '{}'
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_tasks_status ON public.tasks(status);
        CREATE INDEX idx_tasks_priority ON public.tasks(priority);
        CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
        CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
        CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
    END IF;
END
$$;

-- 4. Add missing columns to existing tables if they don't exist
DO $$
BEGIN
    -- Ensure priority column exists in tasks table
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'priority') THEN
        ALTER TABLE public.tasks ADD COLUMN priority task_priority DEFAULT 'medium';
    END IF;
    
    -- Ensure tags column exists in tasks table
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'tags') THEN
        ALTER TABLE public.tasks ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Ensure updated_at column exists in tasks table
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'updated_at') THEN
        ALTER TABLE public.tasks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Ensure due_date column exists in tasks table
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'due_date') THEN
        ALTER TABLE public.tasks ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
    END IF;
END
$$;

-- 5. Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for users table
DO $$
BEGIN
    -- Users can view their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_own'
    ) THEN
        CREATE POLICY "users_select_own" ON public.users
            FOR SELECT USING (auth.uid() = id);
    END IF;
    
    -- Users can update their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_update_own'
    ) THEN
        CREATE POLICY "users_update_own" ON public.users
            FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    -- Users can insert their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_insert_own'
    ) THEN
        CREATE POLICY "users_insert_own" ON public.users
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    -- Allow authenticated users to view all users (for task assignment)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_all_authenticated'
    ) THEN
        CREATE POLICY "users_select_all_authenticated" ON public.users
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END
$$;

-- 7. Create policies for tasks table
DO $$
BEGIN
    -- All authenticated users can view all tasks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'tasks' AND policyname = 'tasks_select_all'
    ) THEN
        CREATE POLICY "tasks_select_all" ON public.tasks
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    -- Authenticated users can create tasks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'tasks' AND policyname = 'tasks_insert_authenticated'
    ) THEN
        CREATE POLICY "tasks_insert_authenticated" ON public.tasks
            FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
    END IF;
    
    -- Role-based update policy for tasks
    -- Users with 'user' role can update any task
    -- Users with 'guest' role can only update tasks they created
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'tasks' AND policyname = 'tasks_update_role_based'
    ) THEN
        CREATE POLICY "tasks_update_role_based" ON public.tasks
            FOR UPDATE USING (
                auth.role() = 'authenticated' AND (
                    (SELECT role FROM public.users WHERE id = auth.uid()) = 'user'
                    OR
                    ((SELECT role FROM public.users WHERE id = auth.uid()) = 'guest' AND created_by = auth.uid())
                )
            );
    END IF;
    
    -- Role-based delete policy for tasks
    -- Users with 'user' role can delete any task
    -- Users with 'guest' role can only delete tasks they created
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'tasks' AND policyname = 'tasks_delete_role_based'
    ) THEN
        CREATE POLICY "tasks_delete_role_based" ON public.tasks
            FOR DELETE USING (
                auth.role() = 'authenticated' AND (
                    (SELECT role FROM public.users WHERE id = auth.uid()) = 'user'
                    OR
                    ((SELECT role FROM public.users WHERE id = auth.uid()) = 'guest' AND created_by = auth.uid())
                )
            );
    END IF;
END
$$;

-- 8. Create helper functions
-- Handle existing function with different return type
DO $$
BEGIN
    -- Check if function exists with TEXT return type and drop it
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        JOIN pg_type t ON p.prorettype = t.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'get_user_role'
        AND t.typname = 'text'
    ) THEN
        DROP FUNCTION public.get_user_role(UUID);
    END IF;
END $$;

-- Create the function with proper return type
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
BEGIN
    RETURN COALESCE((SELECT role FROM public.users WHERE id = user_id), 'guest'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create triggers for automatic timestamp updates
DO $$
BEGIN
    -- Trigger for users table
    IF NOT EXISTS (
        SELECT FROM information_schema.triggers 
        WHERE trigger_schema = 'public' AND trigger_name = 'handle_users_updated_at'
    ) THEN
        CREATE TRIGGER handle_users_updated_at
            BEFORE UPDATE ON public.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    
    -- Trigger for tasks table
    IF NOT EXISTS (
        SELECT FROM information_schema.triggers 
        WHERE trigger_schema = 'public' AND trigger_name = 'handle_tasks_updated_at'
    ) THEN
        CREATE TRIGGER handle_tasks_updated_at
            BEFORE UPDATE ON public.tasks
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END
$$;

-- 10. Insert sample data (optional - remove if you don't want sample data)
-- First, insert sample users
INSERT INTO public.users (id, email, name, role) VALUES
    ('04741ab-2e84-4197-9879-73d5f55c3d20', 'admin@example.com', 'Admin User', 'user'),
    ('d63a884b-19b4-4ecc-893a-fca6c6ee9376c', 'guest@example.com', 'Guest User', 'guest')
ON CONFLICT (id) DO NOTHING;

-- Then, insert sample tasks
INSERT INTO public.tasks (id, title, description, status, priority, assigned_to, created_by, due_date, tags) VALUES
    (gen_random_uuid(), 'Setup project repository', 'Initialize the project repository with proper structure and documentation', 'completed', 'high', '04741ab-2e84-4197-9879-73d5f55c3d20', '04741ab-2e84-4197-9879-73d5f55c3d20', NOW() + INTERVAL '3 days', ARRAY['setup', 'documentation']),
    (gen_random_uuid(), 'Design user interface mockups', 'Create wireframes and mockups for the main application interface', 'in-progress', 'medium', '04741ab-2e84-4197-9879-73d5f55c3d20', '04741ab-2e84-4197-9879-73d5f55c3d20', NOW() + INTERVAL '5 days', ARRAY['design', 'ui/ux']),
    (gen_random_uuid(), 'Implement authentication system', 'Build secure login and registration functionality with role-based access', 'todo', 'high', 'd63a884b-19b4-4ecc-893a-fca6c6ee9376c', '04741ab-2e84-4197-9879-73d5f55c3d20', NOW() + INTERVAL '7 days', ARRAY['backend', 'security'])
ON CONFLICT (id) DO NOTHING;

SELECT 'Complete database setup completed successfully! 🎉' as result;
