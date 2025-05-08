/*
  # Fix users table INSERT policy

  1. Changes
    - Drop existing INSERT policy that has incorrect conditions
    - Create new INSERT policy that allows registration
    - Policy allows insertion when:
      - The email matches the authenticated user's email
      - The user ID matches the authenticated user's ID
      
  2. Security
    - Ensures users can only create their own profile
    - Maintains data integrity by linking auth and profile records
    - Prevents unauthorized profile creation
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;

-- Create new INSERT policy with correct conditions
CREATE POLICY "Enable insert for registration" ON public.users
  FOR INSERT
  TO public
  WITH CHECK (
    -- Ensure the email matches the authenticated user's email
    email = auth.jwt()->>'email'
    -- Ensure the ID matches the authenticated user's ID
    AND id = auth.uid()
  );