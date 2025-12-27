-- ==========================================
-- EMERGENCY FIX - RLS BLOCKING WEBHOOK
-- ==========================================
-- The webhook is being blocked from inserting into order_items
-- This happens because RLS policies are too restrictive
-- ==========================================

-- ==========================================
-- OPTION 1: DISABLE RLS ON order_items (SIMPLEST)
-- ==========================================
-- This is the fastest fix - disable RLS entirely on order_items
-- The webhook can insert, and we filter by email in the app

ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- OPTION 2: IF YOU WANT TO KEEP RLS ENABLED
-- ==========================================
-- If you prefer to keep RLS, uncomment the lines below
-- and comment out the DISABLE line above

-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- -- Drop all existing policies
-- DROP POLICY IF EXISTS "Users can view order items" ON order_items;
-- DROP POLICY IF EXISTS "Service role can manage order items" ON order_items;

-- -- Allow anyone to view (we filter in app)
-- CREATE POLICY "Allow all reads"
--   ON order_items FOR SELECT
--   USING (true);

-- -- Allow service role to INSERT (this is the key!)
-- CREATE POLICY "Service role can insert"
--   ON order_items FOR INSERT
--   WITH CHECK (true);  -- No restrictions on insert

-- -- Allow service role to UPDATE and DELETE
-- CREATE POLICY "Service role can update"
--   ON order_items FOR UPDATE
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Service role can delete"
--   ON order_items FOR DELETE
--   USING (true);

-- ==========================================
-- FIX OTHER TABLES TOO
-- ==========================================

-- user_passes - allow inserts
ALTER TABLE user_passes DISABLE ROW LEVEL SECURITY;

-- course_enrollments - allow inserts
ALTER TABLE course_enrollments DISABLE ROW LEVEL SECURITY;

-- package_enrollments - allow inserts (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'package_enrollments') THEN
    ALTER TABLE package_enrollments DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ==========================================
-- VERIFY RLS IS DISABLED
-- ==========================================

SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename IN ('order_items', 'user_passes', 'course_enrollments', 'package_enrollments')
  AND schemaname = 'public'
ORDER BY tablename;

-- All should show "false" for RLS Enabled

-- ==========================================
-- TEST AFTER RUNNING THIS
-- ==========================================
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Try purchasing a pass again
-- 3. Should work now!
-- 4. Check /portal/passes - should show your pass











-- EMERGENCY FIX - RLS BLOCKING WEBHOOK
-- ==========================================
-- The webhook is being blocked from inserting into order_items
-- This happens because RLS policies are too restrictive
-- ==========================================

-- ==========================================
-- OPTION 1: DISABLE RLS ON order_items (SIMPLEST)
-- ==========================================
-- This is the fastest fix - disable RLS entirely on order_items
-- The webhook can insert, and we filter by email in the app

ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- OPTION 2: IF YOU WANT TO KEEP RLS ENABLED
-- ==========================================
-- If you prefer to keep RLS, uncomment the lines below
-- and comment out the DISABLE line above

-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- -- Drop all existing policies
-- DROP POLICY IF EXISTS "Users can view order items" ON order_items;
-- DROP POLICY IF EXISTS "Service role can manage order items" ON order_items;

-- -- Allow anyone to view (we filter in app)
-- CREATE POLICY "Allow all reads"
--   ON order_items FOR SELECT
--   USING (true);

-- -- Allow service role to INSERT (this is the key!)
-- CREATE POLICY "Service role can insert"
--   ON order_items FOR INSERT
--   WITH CHECK (true);  -- No restrictions on insert

-- -- Allow service role to UPDATE and DELETE
-- CREATE POLICY "Service role can update"
--   ON order_items FOR UPDATE
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Service role can delete"
--   ON order_items FOR DELETE
--   USING (true);

-- ==========================================
-- FIX OTHER TABLES TOO
-- ==========================================

-- user_passes - allow inserts
ALTER TABLE user_passes DISABLE ROW LEVEL SECURITY;

-- course_enrollments - allow inserts
ALTER TABLE course_enrollments DISABLE ROW LEVEL SECURITY;

-- package_enrollments - allow inserts (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'package_enrollments') THEN
    ALTER TABLE package_enrollments DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ==========================================
-- VERIFY RLS IS DISABLED
-- ==========================================

SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename IN ('order_items', 'user_passes', 'course_enrollments', 'package_enrollments')
  AND schemaname = 'public'
ORDER BY tablename;

-- All should show "false" for RLS Enabled

-- ==========================================
-- TEST AFTER RUNNING THIS
-- ==========================================
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Try purchasing a pass again
-- 3. Should work now!
-- 4. Check /portal/passes - should show your pass












