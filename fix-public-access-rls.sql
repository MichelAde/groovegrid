-- FINAL FIX: Make passes visible on public pages
-- This fixes RLS policies to allow public read access

-- Step 1: Check current data
SELECT 
  'Current pass_types' AS info,
  id,
  name,
  organization_id,
  is_active,
  price
FROM pass_types
ORDER BY price;

-- Step 2: Drop and recreate RLS policies for pass_types
ALTER TABLE pass_types DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Pass types are publicly readable" ON pass_types;
DROP POLICY IF EXISTS "Organization members can manage pass types" ON pass_types;

-- Re-enable RLS
ALTER TABLE pass_types ENABLE ROW LEVEL SECURITY;

-- Step 3: Create PUBLIC READ policy (this is the key!)
CREATE POLICY "Public can view active pass types"
ON pass_types FOR SELECT
USING (is_active = true);

-- Step 4: Create ADMIN policies
CREATE POLICY "Organization members can view their pass types"
ON pass_types FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can insert pass types"
ON pass_types FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Organization members can update pass types"
ON pass_types FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Organization members can delete pass types"
ON pass_types FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

-- Step 5: Do the same for courses (for classes page)
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Courses are publicly readable" ON courses;
DROP POLICY IF EXISTS "Organization members can manage courses" ON courses;

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published courses"
ON courses FOR SELECT
USING (status = 'published');

CREATE POLICY "Organization members can view their courses"
ON courses FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can manage courses"
ON courses FOR ALL
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

-- Step 6: Fix organization table for public access (needed for joins)
ALTER TABLE organization DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public organizations are viewable by everyone" ON organization;
DROP POLICY IF EXISTS "Organization members can view their organization" ON organization;

ALTER TABLE organization ENABLE ROW LEVEL SECURITY;

-- Allow public to view active organizations
CREATE POLICY "Public can view active organizations"
ON organization FOR SELECT
USING (is_active = true);

CREATE POLICY "Organization members can view their organization"
ON organization FOR SELECT
USING (
  id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization owners can update"
ON organization FOR UPDATE
USING (
  id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- Step 7: Verify the fix
SELECT 
  '✅ Verification - Public should see these passes:' AS status,
  name,
  price,
  is_active
FROM pass_types
WHERE is_active = true
ORDER BY price;

SELECT 
  '✅ Verification - Public should see these courses:' AS status,
  title,
  level,
  price,
  status
FROM courses
WHERE status = 'published'
ORDER BY start_date;

SELECT '🎉 RLS policies updated! Refresh http://localhost:3000/passes and /classes' AS result;


