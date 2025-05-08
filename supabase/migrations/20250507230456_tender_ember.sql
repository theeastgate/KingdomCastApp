/*
  # Update Users Table RLS Policies

  1. Changes
    - Update the INSERT policy for user registration to handle both authenticated and public roles
    - Ensure policy checks for matching ID and email with JWT claims

  2. Security
    - Policy ensures users can only create their own profile
    - Maintains data integrity by validating JWT claims
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;

-- Create new insert policy with updated conditions
CREATE POLICY "Enable insert for registration"
ON public.users
FOR INSERT
TO public
WITH CHECK (
  -- Ensure the email matches the JWT claim
  (email = (auth.jwt() ->> 'email'::text))
  -- Ensure the ID matches the authenticated user's ID
  AND (id = auth.uid())
);