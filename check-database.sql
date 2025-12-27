-- ========================================
-- GROOVEGRID: QUICK DATABASE CHECK
-- Run this first to see what exists
-- ========================================

-- Check if main tables exist
DO $$
DECLARE
  org_exists BOOLEAN;
  events_exists BOOLEAN;
  passes_exists BOOLEAN;
BEGIN
  -- Check for organization table (singular)
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'organization'
  ) INTO org_exists;
  
  -- Check for organizations table (plural)
  IF NOT org_exists THEN
    SELECT EXISTS (
      SELECT FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'organizations'
    ) INTO org_exists;
  END IF;
  
  -- Check for events
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'events'
  ) INTO events_exists;
  
  -- Check for pass_types
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'pass_types'
  ) INTO passes_exists;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE STATUS CHECK';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'organization table exists: %', org_exists;
  RAISE NOTICE 'events table exists: %', events_exists;
  RAISE NOTICE 'pass_types table exists: %', passes_exists;
  RAISE NOTICE '';
  
  IF NOT org_exists THEN
    RAISE NOTICE '❌ SCHEMA NOT SETUP - Need to run supabase-schema.sql first!';
  ELSIF NOT events_exists THEN
    RAISE NOTICE '⚠️  Partial setup - some tables missing';
  ELSE
    RAISE NOTICE '✅ Schema is setup - ready to load data';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- List all GrooveGrid tables
SELECT 
  tablename,
  schemaname
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'organization', 'organizations', 'events', 'courses', 
    'pass_types', 'class_packages', 'ticket_types',
    'user_passes', 'course_enrollments', 'orders', 'order_items'
  )
ORDER BY tablename;











-- GROOVEGRID: QUICK DATABASE CHECK
-- Run this first to see what exists
-- ========================================

-- Check if main tables exist
DO $$
DECLARE
  org_exists BOOLEAN;
  events_exists BOOLEAN;
  passes_exists BOOLEAN;
BEGIN
  -- Check for organization table (singular)
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'organization'
  ) INTO org_exists;
  
  -- Check for organizations table (plural)
  IF NOT org_exists THEN
    SELECT EXISTS (
      SELECT FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'organizations'
    ) INTO org_exists;
  END IF;
  
  -- Check for events
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'events'
  ) INTO events_exists;
  
  -- Check for pass_types
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'pass_types'
  ) INTO passes_exists;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE STATUS CHECK';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'organization table exists: %', org_exists;
  RAISE NOTICE 'events table exists: %', events_exists;
  RAISE NOTICE 'pass_types table exists: %', passes_exists;
  RAISE NOTICE '';
  
  IF NOT org_exists THEN
    RAISE NOTICE '❌ SCHEMA NOT SETUP - Need to run supabase-schema.sql first!';
  ELSIF NOT events_exists THEN
    RAISE NOTICE '⚠️  Partial setup - some tables missing';
  ELSE
    RAISE NOTICE '✅ Schema is setup - ready to load data';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- List all GrooveGrid tables
SELECT 
  tablename,
  schemaname
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'organization', 'organizations', 'events', 'courses', 
    'pass_types', 'class_packages', 'ticket_types',
    'user_passes', 'course_enrollments', 'orders', 'order_items'
  )
ORDER BY tablename;












