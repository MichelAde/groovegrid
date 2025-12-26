-- ==========================================
-- CRITICAL FIX - Remove NOT NULL Constraints
-- ==========================================
-- The webhook cannot populate user_id because it doesn't have
-- access to auth.users. We need to allow NULL for user_id
-- and match purchases by email in the order table instead.
-- ==========================================

-- ==========================================
-- 1. MAKE user_id NULLABLE IN user_passes
-- ==========================================

-- Drop the NOT NULL constraint on user_id
ALTER TABLE user_passes ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 2. MAKE user_id NULLABLE IN enrollments
-- ==========================================

-- Drop the NOT NULL constraint on user_id
ALTER TABLE enrollments ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 3. MAKE user_id NULLABLE IN student_packages (if exists)
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'student_packages') THEN
    ALTER TABLE student_packages ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- ==========================================
-- 4. REFRESH POSTGREST SCHEMA CACHE
-- ==========================================

NOTIFY pgrst, 'reload schema';

-- ==========================================
-- 5. VERIFY CONSTRAINTS
-- ==========================================

-- Check if user_id is nullable now
SELECT 
  table_name,
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('user_passes', 'enrollments', 'student_packages')
  AND column_name = 'user_id'
ORDER BY table_name;

-- Should show "YES" for is_nullable

-- ==========================================
-- SUCCESS!
-- ==========================================
-- After running this:
-- 1. Webhook can insert passes with user_id = NULL
-- 2. Portal will match by email in orders table
-- 3. Pass purchases will work
-- 4. We'll add proper RLS back later (see security plan below)

