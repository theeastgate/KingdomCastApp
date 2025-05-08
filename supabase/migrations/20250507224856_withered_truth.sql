/*
  # Fix authentication and database alignment

  1. Changes
    - Drop existing table and recreate with correct column names
    - Set up proper foreign key relationship with auth.users
    - Add appropriate indexes
    - Configure correct RLS policies for registration flow

  2. Security
    - Enable RLS
    - Add policies for registration and user management
    - Ensure proper access control
*/

-- First drop existing policies
DROP POLICY IF EXISTS "Enable registration" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Recreate the users table with correct column names
DROP TABLE IF EXISTS public.users;

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  firstname text NOT NULL,
  lastname text NOT NULL,
  churchId text NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  avatarUrl text,
  createdAt timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_churchId ON public.users(churchId);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies that handle both registration and normal operation
CREATE POLICY "Enable registration and self-management"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (
    -- Allow registration when the ID matches the authenticated user
    (auth.uid() = id) OR
    -- Allow registration for new users during signup
    (auth.uid() IS NULL AND 
     EXISTS (
       SELECT 1 
       FROM auth.users 
       WHERE auth.users.id = users.id
     ))
  );

CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);