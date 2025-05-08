/*
  # Fix Users Table RLS Policies

  1. Changes
    - Update RLS policies for the users table to allow proper registration
    - Add policy for unauthenticated users to insert their own data during signup
    - Maintain existing policies for authenticated users

  2. Security
    - Keep RLS enabled
    - Ensure users can only access their own data
    - Allow new user registration
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Allow new users to insert their own data during registration
CREATE POLICY "Enable registration" ON public.users
FOR INSERT TO public
WITH CHECK (
  -- During registration, auth.uid() will be the same as the id being inserted
  auth.uid() = id OR 
  -- Also allow registration for new users (auth.uid() is null during signup)
  (auth.uid() IS NULL AND EXISTS (
    SELECT 1 FROM auth.users WHERE auth.users.id = users.id
  ))
);

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);