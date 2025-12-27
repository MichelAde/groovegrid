-- ========================================
-- GROOVEGRID: FIX ALL OUTSTANDING ISSUES
-- Run this in Supabase SQL Editor
-- ========================================

-- PART 1: Verify organization exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM organizations 
    WHERE id = 'e110e5e0-c320-4c84-a155-ebf567f7585a'
  ) THEN
    RAISE NOTICE 'Creating organization...';
    INSERT INTO organizations (
      id, name, email, website, phone, city, province, country, is_active
    ) VALUES (
      'e110e5e0-c320-4c84-a155-ebf567f7585a',
      'Mikilele Events',
      'contact@mikileleevents.com',
      'https://mikileleevents.com',
      '+1 (613) 716-0036',
      'Ottawa',
      'Ontario',
      'Canada',
      true
    );
  ELSE
    RAISE NOTICE 'Organization already exists';
  END IF;
END $$;

-- PART 2: Fix RLS policies for public access
-- Drop and recreate RLS policies to ensure public can view published content

-- Events
DROP POLICY IF EXISTS "Events are publicly readable" ON events;
CREATE POLICY "Events are publicly readable"
  ON events FOR SELECT
  USING (status = 'published');

-- Ticket Types
DROP POLICY IF EXISTS "Ticket types are publicly readable" ON ticket_types;
CREATE POLICY "Ticket types are publicly readable"
  ON ticket_types FOR SELECT
  USING (is_active = true);

-- Pass Types
DROP POLICY IF EXISTS "Pass types are publicly readable" ON pass_types;
CREATE POLICY "Pass types are publicly readable"
  ON pass_types FOR SELECT
  USING (is_active = true);

-- Courses
DROP POLICY IF EXISTS "Courses are publicly readable" ON courses;
CREATE POLICY "Courses are publicly readable"
  ON courses FOR SELECT
  USING (status = 'published');

-- Class Packages
DROP POLICY IF EXISTS "Class packages are publicly readable" ON class_packages;
CREATE POLICY "Class packages are publicly readable"
  ON class_packages FOR SELECT
  USING (is_active = true);

-- Organizations (needed for joins)
DROP POLICY IF EXISTS "Organizations are publicly readable" ON organizations;
CREATE POLICY "Organizations are publicly readable"
  ON organizations FOR SELECT
  USING (is_active = true);

-- PART 3: Create portal tables if they don't exist
CREATE TABLE IF NOT EXISTS user_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pass_type_id UUID NOT NULL REFERENCES pass_types(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  package_id UUID REFERENCES class_packages(id) ON DELETE SET NULL,
  enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  classes_attended INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_passes_user_id ON user_passes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passes_active ON user_passes(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(user_id, status);

-- Enable RLS on portal tables
ALTER TABLE user_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS for user_passes: users can only see their own passes
DROP POLICY IF EXISTS "Users can view own passes" ON user_passes;
CREATE POLICY "Users can view own passes"
  ON user_passes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own passes" ON user_passes;
CREATE POLICY "Users can insert own passes"
  ON user_passes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS for course_enrollments: users can only see their own enrollments
DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
CREATE POLICY "Users can view own enrollments"
  ON course_enrollments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own enrollments" ON course_enrollments;
CREATE POLICY "Users can insert own enrollments"
  ON course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PART 4: Verify data counts
DO $$
DECLARE
  org_count INT;
  event_count INT;
  pass_count INT;
  course_count INT;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organizations WHERE id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  SELECT COUNT(*) INTO event_count FROM events WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  SELECT COUNT(*) INTO pass_count FROM pass_types WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  SELECT COUNT(*) INTO course_count FROM courses WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE STATUS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Organization: % row(s)', org_count;
  RAISE NOTICE 'Events: % row(s)', event_count;
  RAISE NOTICE 'Pass Types: % row(s)', pass_count;
  RAISE NOTICE 'Courses: % row(s)', course_count;
  RAISE NOTICE '';
  
  IF org_count = 0 THEN
    RAISE NOTICE '⚠️  Organization not found - created new one';
  END IF;
  
  IF event_count = 0 THEN
    RAISE NOTICE '⚠️  No events found - run load-mikilele-data.sql';
  ELSE
    RAISE NOTICE '✅ Events loaded successfully';
  END IF;
  
  IF pass_count = 0 THEN
    RAISE NOTICE '⚠️  No pass types found - run load-mikilele-data.sql';
  ELSE
    RAISE NOTICE '✅ Pass types loaded successfully';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS POLICIES: Updated';
  RAISE NOTICE 'PORTAL TABLES: Created';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All fixes applied!';
  RAISE NOTICE '';
  
  IF event_count = 0 OR pass_count = 0 THEN
    RAISE NOTICE 'NEXT STEP: Run load-mikilele-data.sql to add events and passes';
  ELSE
    RAISE NOTICE 'NEXT STEP: Test the application at https://groovegrid-seven.vercel.app';
  END IF;
END $$;











-- GROOVEGRID: FIX ALL OUTSTANDING ISSUES
-- Run this in Supabase SQL Editor
-- ========================================

-- PART 1: Verify organization exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM organizations 
    WHERE id = 'e110e5e0-c320-4c84-a155-ebf567f7585a'
  ) THEN
    RAISE NOTICE 'Creating organization...';
    INSERT INTO organizations (
      id, name, email, website, phone, city, province, country, is_active
    ) VALUES (
      'e110e5e0-c320-4c84-a155-ebf567f7585a',
      'Mikilele Events',
      'contact@mikileleevents.com',
      'https://mikileleevents.com',
      '+1 (613) 716-0036',
      'Ottawa',
      'Ontario',
      'Canada',
      true
    );
  ELSE
    RAISE NOTICE 'Organization already exists';
  END IF;
END $$;

-- PART 2: Fix RLS policies for public access
-- Drop and recreate RLS policies to ensure public can view published content

-- Events
DROP POLICY IF EXISTS "Events are publicly readable" ON events;
CREATE POLICY "Events are publicly readable"
  ON events FOR SELECT
  USING (status = 'published');

-- Ticket Types
DROP POLICY IF EXISTS "Ticket types are publicly readable" ON ticket_types;
CREATE POLICY "Ticket types are publicly readable"
  ON ticket_types FOR SELECT
  USING (is_active = true);

-- Pass Types
DROP POLICY IF EXISTS "Pass types are publicly readable" ON pass_types;
CREATE POLICY "Pass types are publicly readable"
  ON pass_types FOR SELECT
  USING (is_active = true);

-- Courses
DROP POLICY IF EXISTS "Courses are publicly readable" ON courses;
CREATE POLICY "Courses are publicly readable"
  ON courses FOR SELECT
  USING (status = 'published');

-- Class Packages
DROP POLICY IF EXISTS "Class packages are publicly readable" ON class_packages;
CREATE POLICY "Class packages are publicly readable"
  ON class_packages FOR SELECT
  USING (is_active = true);

-- Organizations (needed for joins)
DROP POLICY IF EXISTS "Organizations are publicly readable" ON organizations;
CREATE POLICY "Organizations are publicly readable"
  ON organizations FOR SELECT
  USING (is_active = true);

-- PART 3: Create portal tables if they don't exist
CREATE TABLE IF NOT EXISTS user_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pass_type_id UUID NOT NULL REFERENCES pass_types(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  package_id UUID REFERENCES class_packages(id) ON DELETE SET NULL,
  enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  classes_attended INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_passes_user_id ON user_passes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passes_active ON user_passes(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(user_id, status);

-- Enable RLS on portal tables
ALTER TABLE user_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS for user_passes: users can only see their own passes
DROP POLICY IF EXISTS "Users can view own passes" ON user_passes;
CREATE POLICY "Users can view own passes"
  ON user_passes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own passes" ON user_passes;
CREATE POLICY "Users can insert own passes"
  ON user_passes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS for course_enrollments: users can only see their own enrollments
DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
CREATE POLICY "Users can view own enrollments"
  ON course_enrollments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own enrollments" ON course_enrollments;
CREATE POLICY "Users can insert own enrollments"
  ON course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PART 4: Verify data counts
DO $$
DECLARE
  org_count INT;
  event_count INT;
  pass_count INT;
  course_count INT;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organizations WHERE id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  SELECT COUNT(*) INTO event_count FROM events WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  SELECT COUNT(*) INTO pass_count FROM pass_types WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  SELECT COUNT(*) INTO course_count FROM courses WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE STATUS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Organization: % row(s)', org_count;
  RAISE NOTICE 'Events: % row(s)', event_count;
  RAISE NOTICE 'Pass Types: % row(s)', pass_count;
  RAISE NOTICE 'Courses: % row(s)', course_count;
  RAISE NOTICE '';
  
  IF org_count = 0 THEN
    RAISE NOTICE '⚠️  Organization not found - created new one';
  END IF;
  
  IF event_count = 0 THEN
    RAISE NOTICE '⚠️  No events found - run load-mikilele-data.sql';
  ELSE
    RAISE NOTICE '✅ Events loaded successfully';
  END IF;
  
  IF pass_count = 0 THEN
    RAISE NOTICE '⚠️  No pass types found - run load-mikilele-data.sql';
  ELSE
    RAISE NOTICE '✅ Pass types loaded successfully';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS POLICIES: Updated';
  RAISE NOTICE 'PORTAL TABLES: Created';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All fixes applied!';
  RAISE NOTICE '';
  
  IF event_count = 0 OR pass_count = 0 THEN
    RAISE NOTICE 'NEXT STEP: Run load-mikilele-data.sql to add events and passes';
  ELSE
    RAISE NOTICE 'NEXT STEP: Test the application at https://groovegrid-seven.vercel.app';
  END IF;
END $$;













