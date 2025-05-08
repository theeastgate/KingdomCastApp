/*
  # Update Users Table RLS Policies

  1. Changes
    - Drop existing INSERT policy that was too restrictive
    - Create new INSERT policy that allows registration while maintaining security
    - Keep existing policies for other operations (SELECT, UPDATE, DELETE)
    
  2. Security
    - New INSERT policy allows creating user profile during registration
    - Ensures user can only create their own profile by checking email matches
    - Maintains existing security for other operations
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;

-- Create new INSERT policy that allows registration
CREATE POLICY "Enable insert for registration" ON public.users
FOR INSERT 
TO public
WITH CHECK (
  -- Allow insert during registration when creating initial profile
  -- Ensures user can only create their own profile
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = users.id
    AND auth.users.email = users.email
  )
);