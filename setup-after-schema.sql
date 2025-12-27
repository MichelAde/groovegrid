-- ========================================
-- GROOVEGRID: COMPLETE DATABASE SETUP
-- Run this AFTER supabase-schema.sql
-- ========================================

-- PART 1: Create Mikilele Events organization
INSERT INTO organization (
  id,
  name,
  subdomain,
  email,
  phone,
  city,
  province,
  country,
  is_active
) VALUES (
  'e110e5e0-c320-4c84-a155-ebf567f7585a',
  'Mikilele Events',
  'mikilele',
  'contact@mikileleevents.com',
  '+1 (613) 716-0036',
  'Ottawa',
  'Ontario',
  'Canada',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active;

-- PART 2: Fix RLS policies for public access

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

-- Organization (needed for joins)
DROP POLICY IF EXISTS "Organizations are publicly readable" ON organization;
CREATE POLICY "Organizations are publicly readable"
  ON organization FOR SELECT
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

-- PART 4: Verify and report status
DO $$
DECLARE
  org_count INT;
  event_count INT;
  pass_count INT;
  course_count INT;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organization WHERE id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  SELECT COUNT(*) INTO event_count FROM events WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  SELECT COUNT(*) INTO pass_count FROM pass_types WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  SELECT COUNT(*) INTO course_count FROM courses WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE SETUP COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Organization: % row(s)', org_count;
  RAISE NOTICE 'Events: % row(s)', event_count;
  RAISE NOTICE 'Pass Types: % row(s)', pass_count;
  RAISE NOTICE 'Courses: % row(s)', course_count;
  RAISE NOTICE '';
  
  IF event_count = 0 THEN
    RAISE NOTICE '⚠️  No events found';
    RAISE NOTICE '→ NEXT STEP: Run load-mikilele-data.sql to add sample data';
  ELSE
    RAISE NOTICE '✅ Events loaded successfully';
    RAISE NOTICE '→ NEXT STEP: Test the application';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Portal tables: Created';
  RAISE NOTICE 'RLS policies: Applied';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;











-- GROOVEGRID: COMPLETE DATABASE SETUP
-- Run this AFTER supabase-schema.sql
-- ========================================

-- PART 1: Create Mikilele Events organization
INSERT INTO organization (
  id,
  name,
  subdomain,
  email,
  phone,
  city,
  province,
  country,
  is_active
) VALUES (
  'e110e5e0-c320-4c84-a155-ebf567f7585a',
  'Mikilele Events',
  'mikilele',
  'contact@mikileleevents.com',
  '+1 (613) 716-0036',
  'Ottawa',
  'Ontario',
  'Canada',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active;

-- PART 2: Fix RLS policies for public access

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

-- Organization (needed for joins)
DROP POLICY IF EXISTS "Organizations are publicly readable" ON organization;
CREATE POLICY "Organizations are publicly readable"
  ON organization FOR SELECT
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

-- PART 4: Verify and report status
DO $$
DECLARE
  org_count INT;
  event_count INT;
  pass_count INT;
  course_count INT;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organization WHERE id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  SELECT COUNT(*) INTO event_count FROM events WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  SELECT COUNT(*) INTO pass_count FROM pass_types WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  SELECT COUNT(*) INTO course_count FROM courses WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE SETUP COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Organization: % row(s)', org_count;
  RAISE NOTICE 'Events: % row(s)', event_count;
  RAISE NOTICE 'Pass Types: % row(s)', pass_count;
  RAISE NOTICE 'Courses: % row(s)', course_count;
  RAISE NOTICE '';
  
  IF event_count = 0 THEN
    RAISE NOTICE '⚠️  No events found';
    RAISE NOTICE '→ NEXT STEP: Run load-mikilele-data.sql to add sample data';
  ELSE
    RAISE NOTICE '✅ Events loaded successfully';
    RAISE NOTICE '→ NEXT STEP: Test the application';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Portal tables: Created';
  RAISE NOTICE 'RLS policies: Applied';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;













