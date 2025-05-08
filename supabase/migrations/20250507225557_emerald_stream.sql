/*
  # Fix Users Table RLS Policies

  1. Changes
    - Drop existing INSERT policy that's not working correctly
    - Create new INSERT policy that properly handles user registration
    - Ensure policies allow users to manage their own profiles

  2. Security
    - Enable RLS on users table (if not already enabled)
    - Add policy for user registration
    - Maintain existing policies for other operations
*/

-- First ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop the existing INSERT policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Enable insert for registration" ON users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new INSERT policy for registration
CREATE POLICY "Enable insert for registration"
ON users
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = id
);

-- Ensure other necessary policies exist
DO $$ 
BEGIN
  -- Policy for reading own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Enable read access to own profile'
  ) THEN
    CREATE POLICY "Enable read access to own profile"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Policy for updating own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Enable update access to own profile'
  ) THEN
    CREATE POLICY "Enable update access to own profile"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Policy for deleting own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Enable delete access to own profile'
  ) THEN
    CREATE POLICY "Enable delete access to own profile"
      ON users
      FOR DELETE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;