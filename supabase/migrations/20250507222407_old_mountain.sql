/*
  # Fix column names in users table
  
  1. Changes
    - Rename firstName to firstname
    - Rename lastName to lastname
    
  2. Notes
    - Ensures consistent column naming convention
    - Maintains existing data
*/

DO $$ 
BEGIN
  -- Rename firstName to firstname if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'firstName'
  ) THEN
    ALTER TABLE users RENAME COLUMN "firstName" TO "firstname";
  END IF;

  -- Rename lastName to lastname if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'lastName'
  ) THEN
    ALTER TABLE users RENAME COLUMN "lastName" TO "lastname";
  END IF;
END $$;