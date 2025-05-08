/*
  # Fix churchId column casing

  1. Changes
    - Rename 'churchid' column to 'churchId' in users table to match the expected casing
    
  2. Notes
    - This fixes the case sensitivity issue causing the 400 error
    - Uses a safe column rename operation
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