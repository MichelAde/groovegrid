-- Diagnostic: Check Why Passes Aren't Showing
-- Run this in Supabase SQL Editor to diagnose the issue

-- Step 1: Check your user and organization
SELECT 
  'Your User ID' AS check_type,
  id AS value,
  email
FROM auth.users 
WHERE email = 'michel.adedokun@outlook.com';

-- Step 2: Check organization memberships
SELECT 
  'Your Organization Memberships' AS check_type,
  om.organization_id,
  om.role,
  o.name AS org_name
FROM organization_members om
JOIN organization o ON o.id = om.organization_id
WHERE om.user_id IN (SELECT id FROM auth.users WHERE email = 'michel.adedokun@outlook.com');

-- Step 3: Check pass_types and their organization
SELECT 
  'Pass Types in Database' AS check_type,
  pt.name,
  pt.organization_id,
  o.name AS org_name,
  pt.sort_order
FROM pass_types pt
JOIN organization o ON o.id = pt.organization_id
ORDER BY pt.sort_order;

-- Step 4: Check if organization IDs match
SELECT 
  CASE 
    WHEN om.organization_id = pt.organization_id THEN '✅ MATCH - Passes should show!'
    ELSE '❌ MISMATCH - This is the problem!'
  END AS status,
  'User Org ID: ' || om.organization_id AS user_org,
  'Pass Org ID: ' || pt.organization_id AS pass_org
FROM organization_members om
CROSS JOIN (SELECT DISTINCT organization_id FROM pass_types LIMIT 1) pt
WHERE om.user_id IN (SELECT id FROM auth.users WHERE email = 'michel.adedokun@outlook.com')
LIMIT 1;

-- Step 5: Quick Fix - If mismatch, update passes to your organization
-- UNCOMMENT THESE LINES IF STEP 4 SHOWS MISMATCH:

-- UPDATE pass_types 
-- SET organization_id = (
--   SELECT organization_id 
--   FROM organization_members 
--   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'michel.adedokun@outlook.com')
--   LIMIT 1
-- )
-- WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';

-- SELECT '✅ Pass types updated to your organization!' AS result;

