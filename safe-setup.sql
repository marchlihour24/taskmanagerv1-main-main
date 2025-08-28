-- COMPLETE SAFE SETUP - Role-based access control for Task Manager
-- Run this script to set up complete structure safely

-- 1. Create users table if it doesn't exist (with proper role validation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'users') THEN
        CREATE TABLE public.users (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('user', 'guest')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END
$$;

-- 2. Add missing columns to tasks table if they don't exist
DO $$
BEGIN
    -- Add priority column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'priority') THEN
        ALTER TABLE public.tasks ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
    END IF;
    
    -- Add tags column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'tags') THEN
        ALTER TABLE public.tasks ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add updated_at column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'updated_at') THEN
        ALTER TABLE public.tasks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END
$$;

-- 3. Enable RLS (safe to run multiple times)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 2. Create basic policies for users table (with existence check)
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
END
$$;

-- 3. Create basic policies for tasks table (with existence check)
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

-- 6. Create helper function and triggers
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE((SELECT role FROM public.users WHERE id = user_id), 'guest');
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

-- Create triggers for automatic timestamp updates
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

SELECT 'Complete safe setup completed - Role-based access control is ready!' as result;
