# Supabase Setup Guide for Role-Based Task Manager

## Step 1: Run the SQL Setup Script

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** 
3. Copy and paste the content from `supabase-setup.sql` 
4. Click **Run** to execute the script

This will create:
- ✅ Custom types (`user_role`, `task_status`, `task_priority`)
- ✅ `users` table with role field
- ✅ `tasks` table with proper structure
- ✅ Row Level Security (RLS) policies
- ✅ Proper role-based access control

## Step 2: Verify Tables Creation

Go to **Table Editor** and verify you have:

### Users Table
- `id` (UUID, Primary Key)
- `email` (Text, Unique)
- `name` (Text)
- `role` (Enum: 'user' | 'guest')
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Tasks Table  
- `id` (UUID, Primary Key)
- `title` (Text)
- `description` (Text, nullable)
- `status` (Enum: 'todo' | 'in-progress' | 'completed')
- `priority` (Enum: 'low' | 'medium' | 'high')
- `assigned_to` (UUID, Foreign Key to users)
- `created_by` (UUID, Foreign Key to users)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `due_date` (Timestamp, nullable)
- `tags` (Text Array)

## Step 3: Verify RLS Policies

Go to **Authentication** → **Policies** and verify these policies exist:

### Users Table Policies:
- ✅ "Users can view their own profile" (SELECT)
- ✅ "Users can update their own profile" (UPDATE)
- ✅ "Enable insert for authenticated users only" (INSERT)

### Tasks Table Policies:
- ✅ "All authenticated users can view all tasks" (SELECT)
- ✅ "All authenticated users can create tasks" (INSERT)
- ✅ "Role-based task editing" (UPDATE)
- ✅ "Role-based task deletion" (DELETE)

## Step 4: Create Test Users

### Option A: Through Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Create users manually
3. Then add corresponding entries in the `users` table

### Option B: Through Your App
1. Use the registration functionality in your app
2. Make sure the auth provider creates entries in both `auth.users` and `public.users`

## Step 5: Test Role-Based Access

### Guest User Should:
- ✅ View all tasks
- ✅ Create new tasks
- ✅ Edit only their own tasks
- ❌ Edit other users' tasks
- ❌ Delete other users' tasks
- ✅ Access calendar view

### Regular User Should:
- ✅ View all tasks
- ✅ Create new tasks
- ✅ Edit all tasks
- ✅ Delete all tasks
- ✅ Access calendar view

## Step 6: Update Environment Variables

Make sure your `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### If you don't see guest role in policies:
1. Check that the `users` table was created properly
2. Verify RLS is enabled on both tables
3. Make sure the role enum type was created
4. Check that the policies reference the correct role field

### If tasks don't respect role permissions:
1. Verify the user has a role assigned in the `users` table
2. Check that the RLS policies are active
3. Test with actual authenticated users (not just local storage data)

### If you see "This table is empty":
1. Create some test data after setting up users
2. Make sure the foreign key relationships are correct
3. Verify the user IDs match between `auth.users` and `public.users`
