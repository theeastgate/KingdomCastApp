/*
  # Add churchId column to users table

  1. Changes
    - Add churchId column to users table
    - Make churchId column required
    - Add index on churchId for better query performance

  2. Security
    - No changes to RLS policies needed
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'churchid'
  ) THEN
    ALTER TABLE users ADD COLUMN churchid text NOT NULL;
    CREATE INDEX idx_users_churchid ON users(churchid);
  END IF;
END $$;