-- TASKS TABLE QUERIES
-- Use these queries to explore your tasks table

-- 1. View the complete tasks table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tasks'
ORDER BY ordinal_position;

-- 2. View all tasks with user information
SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.tags,
    t.created_at,
    t.updated_at,
    creator.name as created_by_name,
    creator.email as created_by_email,
    creator.role as created_by_role,
    assignee.name as assigned_to_name,
    assignee.email as assigned_to_email,
    assignee.role as assigned_to_role
FROM public.tasks t
LEFT JOIN public.users creator ON t.created_by = creator.id
LEFT JOIN public.users assignee ON t.assigned_to = assignee.id
ORDER BY t.created_at DESC;

-- 3. View tasks grouped by status
SELECT 
    status,
    COUNT(*) as task_count,
    ARRAY_AGG(title) as task_titles
FROM public.tasks
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'todo' THEN 1 
        WHEN 'in-progress' THEN 2 
        WHEN 'completed' THEN 3 
    END;

-- 4. View tasks grouped by priority
SELECT 
    priority,
    COUNT(*) as task_count,
    ARRAY_AGG(title) as task_titles
FROM public.tasks
GROUP BY priority
ORDER BY 
    CASE priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
    END;

-- 5. View overdue tasks
SELECT 
    t.id,
    t.title,
    t.status,
    t.priority,
    t.due_date,
    u.name as assigned_to_name,
    u.email as assigned_to_email
FROM public.tasks t
LEFT JOIN public.users u ON t.assigned_to = u.id
WHERE t.due_date < NOW() 
AND t.status != 'completed'
ORDER BY t.due_date ASC;

-- 6. View tasks by user role (to see what guests vs users can access)
SELECT 
    u.role,
    COUNT(t.id) as tasks_created,
    COUNT(CASE WHEN t.assigned_to = u.id THEN 1 END) as tasks_assigned
FROM public.users u
LEFT JOIN public.tasks t ON t.created_by = u.id OR t.assigned_to = u.id
GROUP BY u.role, u.id, u.name, u.email
ORDER BY u.role;

-- 7. Simple view of all tasks (basic info)
SELECT 
    id,
    title,
    status,
    priority,
    due_date,
    created_at
FROM public.tasks
ORDER BY created_at DESC;
