-- Add missing sort_order column to pass_types table
-- Run this in Supabase SQL Editor BEFORE running load-mikilele-data.sql

-- Add sort_order column if it doesn't exist
ALTER TABLE pass_types 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing records to have sort_order based on price (ascending)
UPDATE pass_types 
SET sort_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY organization_id ORDER BY price ASC) as row_num
  FROM pass_types
) AS subquery
WHERE pass_types.id = subquery.id;

-- Success message
SELECT 'sort_order column added successfully!' AS status;

