-- ==========================================
-- ULTIMATE FIX - ADD MISSING COLUMNS & REFRESH CACHE
-- ==========================================
-- This fixes ALL missing column errors by:
-- 1. Adding missing columns to all tables
-- 2. Refreshing PostgREST schema cache
-- 3. Disabling RLS
-- ==========================================

-- ==========================================
-- 1. FIX order_items TABLE
-- ==========================================

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_type VARCHAR(50);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS pass_type_id UUID REFERENCES pass_types(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES class_packages(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_per_item DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_pass_type ON order_items(pass_type_id);
CREATE INDEX IF NOT EXISTS idx_order_items_package ON order_items(package_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course ON order_items(course_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_type ON order_items(item_type);

-- ==========================================
-- 2. FIX user_passes TABLE
-- ==========================================

-- Make sure all columns exist
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS credits_total INTEGER;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS credits_remaining INTEGER;

-- CRITICAL: Allow NULL for user_id (webhook cannot populate this)
ALTER TABLE user_passes ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 3. FIX enrollments TABLE
-- ==========================================

-- Add missing order_id column
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);

-- Make sure other columns exist
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- CRITICAL: Allow NULL for user_id (webhook cannot populate this)
ALTER TABLE enrollments ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 4. DISABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_passes DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. REFRESH POSTGREST SCHEMA CACHE
-- ==========================================

-- This forces Supabase to reload the schema
NOTIFY pgrst, 'reload schema';

-- ==========================================
-- 6. VERIFY ALL COLUMNS EXIST
-- ==========================================

-- Check order_items columns
SELECT 
  'order_items' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'order_items'
  AND column_name IN ('item_type', 'pass_type_id', 'course_id', 'package_id', 'price_per_item', 'subtotal')
ORDER BY column_name;

-- Check user_passes columns
SELECT 
  'user_passes' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'user_passes'
  AND column_name IN ('order_id', 'expiry_date', 'is_active', 'credits_total', 'credits_remaining')
ORDER BY column_name;

-- Check enrollments columns
SELECT 
  'enrollments' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'enrollments'
  AND column_name IN ('order_id', 'user_id', 'course_id', 'enrollment_date', 'status')
ORDER BY column_name;

-- Check RLS is disabled
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled (should be false)"
FROM pg_tables 
WHERE tablename IN ('order_items', 'user_passes', 'enrollments', 'orders')
  AND schemaname = 'public'
ORDER BY tablename;

-- ==========================================
-- VERIFICATION COMPLETE
-- ==========================================
-- After running this:
-- 1. All columns should exist
-- 2. Schema cache should be refreshed
-- 3. RLS should be disabled
-- 4. Pass purchases should work
-- 5. Course enrollments should work


-- ==========================================
-- This fixes ALL missing column errors by:
-- 1. Adding missing columns to all tables
-- 2. Refreshing PostgREST schema cache
-- 3. Disabling RLS
-- ==========================================

-- ==========================================
-- 1. FIX order_items TABLE
-- ==========================================

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_type VARCHAR(50);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS pass_type_id UUID REFERENCES pass_types(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES class_packages(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_per_item DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_pass_type ON order_items(pass_type_id);
CREATE INDEX IF NOT EXISTS idx_order_items_package ON order_items(package_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course ON order_items(course_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_type ON order_items(item_type);

-- ==========================================
-- 2. FIX user_passes TABLE
-- ==========================================

-- Make sure all columns exist
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS credits_total INTEGER;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS credits_remaining INTEGER;

-- CRITICAL: Allow NULL for user_id (webhook cannot populate this)
ALTER TABLE user_passes ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 3. FIX enrollments TABLE
-- ==========================================

-- Add missing order_id column
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);

-- Make sure other columns exist
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- CRITICAL: Allow NULL for user_id (webhook cannot populate this)
ALTER TABLE enrollments ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 4. DISABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_passes DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. REFRESH POSTGREST SCHEMA CACHE
-- ==========================================

-- This forces Supabase to reload the schema
NOTIFY pgrst, 'reload schema';

-- ==========================================
-- 6. VERIFY ALL COLUMNS EXIST
-- ==========================================

-- Check order_items columns
SELECT 
  'order_items' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'order_items'
  AND column_name IN ('item_type', 'pass_type_id', 'course_id', 'package_id', 'price_per_item', 'subtotal')
ORDER BY column_name;

-- Check user_passes columns
SELECT 
  'user_passes' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'user_passes'
  AND column_name IN ('order_id', 'expiry_date', 'is_active', 'credits_total', 'credits_remaining')
ORDER BY column_name;

-- Check enrollments columns
SELECT 
  'enrollments' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'enrollments'
  AND column_name IN ('order_id', 'user_id', 'course_id', 'enrollment_date', 'status')
ORDER BY column_name;

-- Check RLS is disabled
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled (should be false)"
FROM pg_tables 
WHERE tablename IN ('order_items', 'user_passes', 'enrollments', 'orders')
  AND schemaname = 'public'
ORDER BY tablename;

-- ==========================================
-- VERIFICATION COMPLETE
-- ==========================================
-- After running this:
-- 1. All columns should exist
-- 2. Schema cache should be refreshed
-- 3. RLS should be disabled
-- 4. Pass purchases should work
-- 5. Course enrollments should work


-- ==========================================
-- This fixes ALL missing column errors by:
-- 1. Adding missing columns to all tables
-- 2. Refreshing PostgREST schema cache
-- 3. Disabling RLS
-- ==========================================

-- ==========================================
-- 1. FIX order_items TABLE
-- ==========================================

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_type VARCHAR(50);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS pass_type_id UUID REFERENCES pass_types(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES class_packages(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_per_item DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_pass_type ON order_items(pass_type_id);
CREATE INDEX IF NOT EXISTS idx_order_items_package ON order_items(package_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course ON order_items(course_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_type ON order_items(item_type);

-- ==========================================
-- 2. FIX user_passes TABLE
-- ==========================================

-- Make sure all columns exist
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS credits_total INTEGER;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS credits_remaining INTEGER;

-- CRITICAL: Allow NULL for user_id (webhook cannot populate this)
ALTER TABLE user_passes ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 3. FIX enrollments TABLE
-- ==========================================

-- Add missing order_id column
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);

-- Make sure other columns exist
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- CRITICAL: Allow NULL for user_id (webhook cannot populate this)
ALTER TABLE enrollments ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 4. DISABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_passes DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. REFRESH POSTGREST SCHEMA CACHE
-- ==========================================

-- This forces Supabase to reload the schema
NOTIFY pgrst, 'reload schema';

-- ==========================================
-- 6. VERIFY ALL COLUMNS EXIST
-- ==========================================

-- Check order_items columns
SELECT 
  'order_items' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'order_items'
  AND column_name IN ('item_type', 'pass_type_id', 'course_id', 'package_id', 'price_per_item', 'subtotal')
ORDER BY column_name;

-- Check user_passes columns
SELECT 
  'user_passes' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'user_passes'
  AND column_name IN ('order_id', 'expiry_date', 'is_active', 'credits_total', 'credits_remaining')
ORDER BY column_name;

-- Check enrollments columns
SELECT 
  'enrollments' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'enrollments'
  AND column_name IN ('order_id', 'user_id', 'course_id', 'enrollment_date', 'status')
ORDER BY column_name;

-- Check RLS is disabled
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled (should be false)"
FROM pg_tables 
WHERE tablename IN ('order_items', 'user_passes', 'enrollments', 'orders')
  AND schemaname = 'public'
ORDER BY tablename;

-- ==========================================
-- VERIFICATION COMPLETE
-- ==========================================
-- After running this:
-- 1. All columns should exist
-- 2. Schema cache should be refreshed
-- 3. RLS should be disabled
-- 4. Pass purchases should work
-- 5. Course enrollments should work


-- ==========================================
-- This fixes ALL missing column errors by:
-- 1. Adding missing columns to all tables
-- 2. Refreshing PostgREST schema cache
-- 3. Disabling RLS
-- ==========================================

-- ==========================================
-- 1. FIX order_items TABLE
-- ==========================================

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_type VARCHAR(50);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS pass_type_id UUID REFERENCES pass_types(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES class_packages(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_per_item DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_pass_type ON order_items(pass_type_id);
CREATE INDEX IF NOT EXISTS idx_order_items_package ON order_items(package_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course ON order_items(course_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_type ON order_items(item_type);

-- ==========================================
-- 2. FIX user_passes TABLE
-- ==========================================

-- Make sure all columns exist
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS credits_total INTEGER;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS credits_remaining INTEGER;

-- CRITICAL: Allow NULL for user_id (webhook cannot populate this)
ALTER TABLE user_passes ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 3. FIX enrollments TABLE
-- ==========================================

-- Add missing order_id column
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);

-- Make sure other columns exist
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- CRITICAL: Allow NULL for user_id (webhook cannot populate this)
ALTER TABLE enrollments ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 4. DISABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_passes DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. REFRESH POSTGREST SCHEMA CACHE
-- ==========================================

-- This forces Supabase to reload the schema
NOTIFY pgrst, 'reload schema';

-- ==========================================
-- 6. VERIFY ALL COLUMNS EXIST
-- ==========================================

-- Check order_items columns
SELECT 
  'order_items' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'order_items'
  AND column_name IN ('item_type', 'pass_type_id', 'course_id', 'package_id', 'price_per_item', 'subtotal')
ORDER BY column_name;

-- Check user_passes columns
SELECT 
  'user_passes' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'user_passes'
  AND column_name IN ('order_id', 'expiry_date', 'is_active', 'credits_total', 'credits_remaining')
ORDER BY column_name;

-- Check enrollments columns
SELECT 
  'enrollments' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'enrollments'
  AND column_name IN ('order_id', 'user_id', 'course_id', 'enrollment_date', 'status')
ORDER BY column_name;

-- Check RLS is disabled
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled (should be false)"
FROM pg_tables 
WHERE tablename IN ('order_items', 'user_passes', 'enrollments', 'orders')
  AND schemaname = 'public'
ORDER BY tablename;

-- ==========================================
-- VERIFICATION COMPLETE
-- ==========================================
-- After running this:
-- 1. All columns should exist
-- 2. Schema cache should be refreshed
-- 3. RLS should be disabled
-- 4. Pass purchases should work
-- 5. Course enrollments should work


-- ==========================================
-- This fixes ALL missing column errors by:
-- 1. Adding missing columns to all tables
-- 2. Refreshing PostgREST schema cache
-- 3. Disabling RLS
-- ==========================================

-- ==========================================
-- 1. FIX order_items TABLE
-- ==========================================

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_type VARCHAR(50);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS pass_type_id UUID REFERENCES pass_types(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES class_packages(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_per_item DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_pass_type ON order_items(pass_type_id);
CREATE INDEX IF NOT EXISTS idx_order_items_package ON order_items(package_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course ON order_items(course_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_type ON order_items(item_type);

-- ==========================================
-- 2. FIX user_passes TABLE
-- ==========================================

-- Make sure all columns exist
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS credits_total INTEGER;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS credits_remaining INTEGER;

-- CRITICAL: Allow NULL for user_id (webhook cannot populate this)
ALTER TABLE user_passes ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 3. FIX enrollments TABLE
-- ==========================================

-- Add missing order_id column
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);

-- Make sure other columns exist
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- CRITICAL: Allow NULL for user_id (webhook cannot populate this)
ALTER TABLE enrollments ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 4. DISABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_passes DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. REFRESH POSTGREST SCHEMA CACHE
-- ==========================================

-- This forces Supabase to reload the schema
NOTIFY pgrst, 'reload schema';

-- ==========================================
-- 6. VERIFY ALL COLUMNS EXIST
-- ==========================================

-- Check order_items columns
SELECT 
  'order_items' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'order_items'
  AND column_name IN ('item_type', 'pass_type_id', 'course_id', 'package_id', 'price_per_item', 'subtotal')
ORDER BY column_name;

-- Check user_passes columns
SELECT 
  'user_passes' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'user_passes'
  AND column_name IN ('order_id', 'expiry_date', 'is_active', 'credits_total', 'credits_remaining')
ORDER BY column_name;

-- Check enrollments columns
SELECT 
  'enrollments' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'enrollments'
  AND column_name IN ('order_id', 'user_id', 'course_id', 'enrollment_date', 'status')
ORDER BY column_name;

-- Check RLS is disabled
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled (should be false)"
FROM pg_tables 
WHERE tablename IN ('order_items', 'user_passes', 'enrollments', 'orders')
  AND schemaname = 'public'
ORDER BY tablename;

-- ==========================================
-- VERIFICATION COMPLETE
-- ==========================================
-- After running this:
-- 1. All columns should exist
-- 2. Schema cache should be refreshed
-- 3. RLS should be disabled
-- 4. Pass purchases should work
-- 5. Course enrollments should work


-- ==========================================
-- This fixes ALL missing column errors by:
-- 1. Adding missing columns to all tables
-- 2. Refreshing PostgREST schema cache
-- 3. Disabling RLS
-- ==========================================

-- ==========================================
-- 1. FIX order_items TABLE
-- ==========================================

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_type VARCHAR(50);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS pass_type_id UUID REFERENCES pass_types(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES class_packages(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_per_item DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_pass_type ON order_items(pass_type_id);
CREATE INDEX IF NOT EXISTS idx_order_items_package ON order_items(package_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course ON order_items(course_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_type ON order_items(item_type);

-- ==========================================
-- 2. FIX user_passes TABLE
-- ==========================================

-- Make sure all columns exist
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS credits_total INTEGER;
ALTER TABLE user_passes ADD COLUMN IF NOT EXISTS credits_remaining INTEGER;

-- CRITICAL: Allow NULL for user_id (webhook cannot populate this)
ALTER TABLE user_passes ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 3. FIX enrollments TABLE
-- ==========================================

-- Add missing order_id column
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);

-- Make sure other columns exist
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- CRITICAL: Allow NULL for user_id (webhook cannot populate this)
ALTER TABLE enrollments ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 4. DISABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_passes DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. REFRESH POSTGREST SCHEMA CACHE
-- ==========================================

-- This forces Supabase to reload the schema
NOTIFY pgrst, 'reload schema';

-- ==========================================
-- 6. VERIFY ALL COLUMNS EXIST
-- ==========================================

-- Check order_items columns
SELECT 
  'order_items' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'order_items'
  AND column_name IN ('item_type', 'pass_type_id', 'course_id', 'package_id', 'price_per_item', 'subtotal')
ORDER BY column_name;

-- Check user_passes columns
SELECT 
  'user_passes' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'user_passes'
  AND column_name IN ('order_id', 'expiry_date', 'is_active', 'credits_total', 'credits_remaining')
ORDER BY column_name;

-- Check enrollments columns
SELECT 
  'enrollments' as table_name,
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'enrollments'
  AND column_name IN ('order_id', 'user_id', 'course_id', 'enrollment_date', 'status')
ORDER BY column_name;

-- Check RLS is disabled
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled (should be false)"
FROM pg_tables 
WHERE tablename IN ('order_items', 'user_passes', 'enrollments', 'orders')
  AND schemaname = 'public'
ORDER BY tablename;

-- ==========================================
-- VERIFICATION COMPLETE
-- ==========================================
-- After running this:
-- 1. All columns should exist
-- 2. Schema cache should be refreshed
-- 3. RLS should be disabled
-- 4. Pass purchases should work
-- 5. Course enrollments should work

