/*
  # Fix registration flow and database schema
  
  1. Changes
    - Drop existing table and policies
    - Recreate users table with snake_case columns
    - Set up proper RLS policies for registration
    
  2. Security
    - Enable RLS
    - Add policies for insert during registration
    - Add policies for authenticated users to manage their profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;
DROP POLICY IF EXISTS "Enable read access to own profile" ON public.users;
DROP POLICY IF EXISTS "Enable update access to own profile" ON public.users;
DROP POLICY IF EXISTS "Enable delete access to own profile" ON public.users;

-- Recreate the users table with correct structure
DROP TABLE IF EXISTS public.users;

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  church_id text NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_church_id ON public.users(church_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable insert for registration"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (
    -- Allow insert when the email matches the JWT claim
    email = (auth.jwt() ->> 'email'::text)
    -- And the ID matches the authenticated user's ID
    AND id = auth.uid()
  );

CREATE POLICY "Enable read access to own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update access to own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete access to own profile"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);