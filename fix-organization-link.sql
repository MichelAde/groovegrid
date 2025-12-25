-- Quick Fix: Link All Mikilele Data to Your Actual Organization
-- Run this in Supabase SQL Editor if passes/events aren't showing

-- This happens when the hardcoded organization ID in load-mikilele-data.sql 
-- doesn't match your actual organization created during signup

-- Step 1: Get your actual organization ID
DO $$
DECLARE
  user_org_id UUID;
  mikilele_org_id UUID := 'e110e5e0-c320-4c84-a155-ebf567f7585a';
BEGIN
  -- Get the organization ID for the logged-in user
  SELECT organization_id INTO user_org_id
  FROM organization_members
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'michel.adedokun@outlook.com')
  LIMIT 1;

  -- Show what we're doing
  RAISE NOTICE 'Your organization ID: %', user_org_id;
  RAISE NOTICE 'Mikilele data organization ID: %', mikilele_org_id;

  -- Update all Mikilele data to use your organization
  IF user_org_id IS NOT NULL AND user_org_id != mikilele_org_id THEN
    -- Update pass types
    UPDATE pass_types 
    SET organization_id = user_org_id 
    WHERE organization_id = mikilele_org_id;
    RAISE NOTICE '✅ Updated % pass types', (SELECT COUNT(*) FROM pass_types WHERE organization_id = user_org_id);

    -- Update events
    UPDATE events 
    SET organization_id = user_org_id 
    WHERE organization_id = mikilele_org_id;
    RAISE NOTICE '✅ Updated % events', (SELECT COUNT(*) FROM events WHERE organization_id = user_org_id);

    -- Update courses
    UPDATE courses 
    SET organization_id = user_org_id 
    WHERE organization_id = mikilele_org_id;
    RAISE NOTICE '✅ Updated % courses', (SELECT COUNT(*) FROM courses WHERE organization_id = user_org_id);

    -- Update class packages
    UPDATE class_packages 
    SET organization_id = user_org_id 
    WHERE organization_id = mikilele_org_id;
    RAISE NOTICE '✅ Updated % class packages', (SELECT COUNT(*) FROM class_packages WHERE organization_id = user_org_id);

    -- Delete the old organization if it exists
    DELETE FROM organization WHERE id = mikilele_org_id AND id != user_org_id;
    
    RAISE NOTICE '✅ All Mikilele data now linked to your organization!';
  ELSE
    RAISE NOTICE 'ℹ️  Organization IDs already match or user not found';
  END IF;
END $$;

-- Verify the fix
SELECT 
  'Pass Types' AS item_type,
  COUNT(*) AS count,
  organization_id
FROM pass_types 
GROUP BY organization_id
UNION ALL
SELECT 
  'Events' AS item_type,
  COUNT(*) AS count,
  organization_id
FROM events 
GROUP BY organization_id
UNION ALL
SELECT 
  'Courses' AS item_type,
  COUNT(*) AS count,
  organization_id
FROM courses 
GROUP BY organization_id
UNION ALL
SELECT 
  'Class Packages' AS item_type,
  COUNT(*) AS count,
  organization_id
FROM class_packages 
GROUP BY organization_id;

SELECT '🎉 Done! Refresh your admin pages and data should appear!' AS status;

