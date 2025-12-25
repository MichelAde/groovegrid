-- GrooveGrid: Pre-Flight Schema Fixes
-- Run this ONCE in Supabase SQL Editor BEFORE loading data
-- This fixes all schema issues to match the application requirements

-- ==============================================
-- Fix 1: Add sort_order to pass_types
-- ==============================================
ALTER TABLE pass_types 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing records to have sort_order
UPDATE pass_types 
SET sort_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY organization_id ORDER BY price ASC) as row_num
  FROM pass_types
) AS subquery
WHERE pass_types.id = subquery.id;

-- ==============================================
-- Fix 2: Allow NULL credits in class_packages
-- ==============================================
ALTER TABLE class_packages 
ALTER COLUMN credits DROP NOT NULL;

-- ==============================================
-- Success Summary
-- ==============================================
SELECT 
  '✅ Schema fixes applied successfully!' AS status,
  'You can now run load-mikilele-data.sql' AS next_step;

-- Verify changes
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('pass_types', 'class_packages')
  AND column_name IN ('sort_order', 'credits')
ORDER BY table_name, column_name;

