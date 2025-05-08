/*
  # Fix Users Table RLS Policy

  1. Changes
    - Drop existing insert policy that's causing the 401 error
    - Create new insert policy that properly allows user registration
    
  2. Security
    - Ensures users can only create their own profile during registration
    - Maintains data integrity by checking email matches JWT claim
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;

-- Create new insert policy with correct conditions
CREATE POLICY "Enable insert for registration" ON public.users
  FOR INSERT
  TO public
  WITH CHECK (
    -- Ensure the email matches the one in the JWT
    email = (auth.jwt() ->> 'email'::text)
    -- Ensure the user can only create their own profile
    AND id = auth.uid()
  );