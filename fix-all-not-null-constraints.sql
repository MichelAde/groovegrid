-- ==========================================
-- FINAL FIX - Remove ALL NOT NULL Constraints
-- ==========================================
-- The webhook cannot populate user_id or organization_id reliably
-- We'll match by email in orders table instead
-- ==========================================

-- ==========================================
-- 1. MAKE user_id NULLABLE
-- ==========================================

ALTER TABLE user_passes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE enrollments ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 2. MAKE organization_id NULLABLE
-- ==========================================

-- user_passes
ALTER TABLE user_passes ALTER COLUMN organization_id DROP NOT NULL;

-- enrollments (if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'enrollments' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE enrollments ALTER COLUMN organization_id DROP NOT NULL;
  END IF;
END $$;

-- ==========================================
-- 3. REFRESH POSTGREST SCHEMA CACHE
-- ==========================================

NOTIFY pgrst, 'reload schema';

-- ==========================================
-- 4. VERIFY ALL NULLABLE
-- ==========================================

SELECT 
  table_name,
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('user_passes', 'enrollments')
  AND column_name IN ('user_id', 'organization_id')
ORDER BY table_name, column_name;

-- All should show "YES" for is_nullable

-- ==========================================
-- SUCCESS!
-- ==========================================
-- After running this, webhook can insert with NULL values
-- Portal matches purchases by email in orders table

