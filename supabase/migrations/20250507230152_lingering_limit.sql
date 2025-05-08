/*
  # Fix users table schema and policies

  1. Changes
    - Use snake_case for column names to match PostgreSQL conventions
    - Drop existing policies and recreate table
    - Add proper indexes and foreign key constraints
    - Enable RLS with appropriate policies

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Registration (public)
      - Profile read (authenticated)
      - Profile update (authenticated)
      - Profile deletion (authenticated)
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
    -- During registration, ensure email and id match the authenticated user
    (email = (auth.jwt() ->> 'email'::text)) AND
    (id = auth.uid())
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