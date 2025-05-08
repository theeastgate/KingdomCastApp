-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable registration and self-management" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Recreate the users table with correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  firstname text NOT NULL,
  lastname text NOT NULL,
  churchId text NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  avatarUrl text,
  createdAt timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_churchId ON public.users(churchId);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a more permissive policy for registration
CREATE POLICY "Enable registration and profile management"
  ON public.users
  FOR ALL  -- This allows INSERT, SELECT, UPDATE, DELETE
  TO authenticated
  USING (
    -- Users can access their own data
    auth.uid() = id
  )
  WITH CHECK (
    -- Users can only modify their own data
    auth.uid() = id
  );

-- Allow public registration
CREATE POLICY "Enable public registration"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (
    -- During registration, either:
    -- 1. The user is authenticated and creating their own profile
    -- 2. The user is not authenticated (signing up) and the ID exists in auth.users
    (auth.uid() = id) OR
    (auth.uid() IS NULL AND 
     EXISTS (
       SELECT 1 
       FROM auth.users 
       WHERE auth.users.id = users.id
     ))
  );