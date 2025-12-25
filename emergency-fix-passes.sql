-- Emergency Fix: Link Passes to Your Organization
-- This is a simpler version - run this NOW in Supabase SQL Editor

-- First, let's see what we have
SELECT 
  'Pass Types Count' AS info,
  COUNT(*) AS total,
  organization_id
FROM pass_types
GROUP BY organization_id;

SELECT 
  'Your Organization' AS info,
  om.organization_id,
  o.name
FROM organization_members om
JOIN organization o ON o.id = om.organization_id
WHERE om.user_id = (SELECT id FROM auth.users WHERE email = 'michel.adedokun@outlook.com')
LIMIT 1;

-- Now fix it - Update ALL pass types to YOUR organization
UPDATE pass_types
SET organization_id = (
  SELECT om.organization_id
  FROM organization_members om
  WHERE om.user_id = (SELECT id FROM auth.users WHERE email = 'michel.adedokun@outlook.com')
  LIMIT 1
);

-- Verify the fix
SELECT 
  '✅ AFTER FIX - Pass Types' AS status,
  COUNT(*) AS count,
  organization_id
FROM pass_types
GROUP BY organization_id;

-- Show the passes
SELECT 
  '✅ Your Passes' AS info,
  name,
  price,
  credits_total,
  validity_days,
  sort_order
FROM pass_types
ORDER BY sort_order;

SELECT '🎉 Done! Now refresh http://localhost:3000/admin/passes' AS next_step;


