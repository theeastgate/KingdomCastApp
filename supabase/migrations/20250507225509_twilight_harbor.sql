/*
  # Fix users table RLS policies

  1. Changes
    - Drop existing policies that are causing permission issues
    - Add new policies that properly handle:
      - User registration (INSERT)
      - Profile management (SELECT, UPDATE)
      - Account deletion (DELETE)
  
  2. Security
    - Enable RLS (already enabled)
    - Add specific policies for each operation type
    - Ensure users can only manage their own data
    - Allow new user registration
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable public registration" ON public.users;
DROP POLICY IF EXISTS "Enable registration and profile management" ON public.users;

-- Create new specific policies
CREATE POLICY "Enable insert for registration" ON public.users
  FOR INSERT 
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access to own profile" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update access to own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete access to own profile" ON public.users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);