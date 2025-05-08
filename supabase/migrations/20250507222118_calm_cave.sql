/*
  # Fix churchId column name

  1. Changes
    - Rename column 'churchid' to 'churchId' in users table to match the expected casing
    
  2. Notes
    - This fixes the case-sensitivity issue causing the PGRST204 error
    - The column already exists but with different casing
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'churchid'
  ) THEN
    ALTER TABLE users RENAME COLUMN churchid TO "churchId";
  END IF;
END $$;