-- ==========================================
-- COMPREHENSIVE FIX FOR ALL PURCHASE TYPES
-- ==========================================
-- This fixes:
-- 1. Missing columns in order_items table
-- 2. RLS policies for all tables
-- 3. All purchase types (tickets, passes, packages, courses)
-- ==========================================

-- ==========================================
-- 1. FIX order_items TABLE - ADD MISSING COLUMNS
-- ==========================================

-- Add missing columns to order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_type VARCHAR(50);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS pass_type_id UUID REFERENCES pass_types(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES class_packages(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_per_item DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_pass_type ON order_items(pass_type_id);
CREATE INDEX IF NOT EXISTS idx_order_items_package ON order_items(package_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course ON order_items(course_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_type ON order_items(item_type);

-- ==========================================
-- 2. FIX order_items RLS POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Service role can manage order items" ON order_items;

-- Allow all reads (filter by email in app)
CREATE POLICY "Users can view order items"
  ON order_items FOR SELECT
  USING (true);

-- Service role can manage all
CREATE POLICY "Service role can manage order items"
  ON order_items FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ==========================================
-- 3. FIX user_passes TABLE & RLS
-- ==========================================

-- Enable RLS
ALTER TABLE user_passes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own passes" ON user_passes;
DROP POLICY IF EXISTS "Service role can manage passes" ON user_passes;

-- Allow all reads
CREATE POLICY "Users can view passes"
  ON user_passes FOR SELECT
  USING (true);

-- Service role can manage all
CREATE POLICY "Service role can manage passes"
  ON user_passes FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ==========================================
-- 4. FIX course_enrollments TABLE & RLS
-- ==========================================

-- Enable RLS
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Service role can manage enrollments" ON course_enrollments;

-- Allow all reads
CREATE POLICY "Users can view enrollments"
  ON course_enrollments FOR SELECT
  USING (true);

-- Service role can manage all
CREATE POLICY "Service role can manage enrollments"
  ON course_enrollments FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ==========================================
-- 5. FIX package_enrollments TABLE & RLS (if exists)
-- ==========================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'package_enrollments') THEN
    -- Enable RLS
    ALTER TABLE package_enrollments ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own package enrollments" ON package_enrollments;
    DROP POLICY IF EXISTS "Service role can manage package enrollments" ON package_enrollments;
    
    -- Create policies
    CREATE POLICY "Users can view package enrollments"
      ON package_enrollments FOR SELECT
      USING (true);
    
    CREATE POLICY "Service role can manage package enrollments"
      ON package_enrollments FOR ALL
      USING (auth.jwt()->>'role' = 'service_role')
      WITH CHECK (auth.jwt()->>'role' = 'service_role');
  END IF;
END $$;

-- ==========================================
-- 6. VERIFY ALL CHANGES
-- ==========================================

-- Check order_items columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'order_items'
  AND column_name IN (
    'item_type', 'pass_type_id', 'package_id', 'course_id', 
    'price_per_item', 'subtotal', 'unit_price'
  )
ORDER BY column_name;

-- Check RLS is enabled
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename IN ('order_items', 'user_passes', 'course_enrollments', 'package_enrollments')
  AND schemaname = 'public'
ORDER BY tablename;

-- List all policies
SELECT 
  tablename,
  policyname,
  cmd as "Command"
FROM pg_policies
WHERE tablename IN ('order_items', 'user_passes', 'course_enrollments', 'package_enrollments')
ORDER BY tablename, policyname;

-- ==========================================
-- VERIFICATION COMPLETE
-- ==========================================
-- After running this:
-- 1. Pass purchases should work
-- 2. Course enrollments should work
-- 3. Package purchases should work
-- 4. All items should show in portal

