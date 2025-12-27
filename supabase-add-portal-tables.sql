-- Add missing tables for Portal functionality
-- Safe version: Drops and recreates tables if they exist with errors

-- Drop existing tables if they have errors
DROP TABLE IF EXISTS user_passes CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;

-- Table: user_passes (for tracking user pass purchases)
CREATE TABLE user_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pass_type_id UUID NOT NULL REFERENCES pass_types(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  credits_remaining INTEGER NOT NULL,
  credits_total INTEGER NOT NULL,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: course_enrollments (for tracking course enrollments)
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  status VARCHAR(50) DEFAULT 'active',
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  completion_date TIMESTAMPTZ,
  progress INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_passes_user_id ON user_passes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passes_pass_type_id ON user_passes(pass_type_id);
CREATE INDEX IF NOT EXISTS idx_user_passes_org_id ON user_passes(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_passes_active ON user_passes(is_active);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_org_id ON course_enrollments(organization_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);

-- RLS Policies for user_passes
ALTER TABLE user_passes ENABLE ROW LEVEL SECURITY;

-- Users can view their own passes
CREATE POLICY "Users can view their own passes"
ON user_passes FOR SELECT
USING (auth.uid() = user_id);

-- Organization members can view passes for their organization
CREATE POLICY "Organization members can view organization passes"
ON user_passes FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- System can insert passes (via API)
CREATE POLICY "System can insert passes"
ON user_passes FOR INSERT
WITH CHECK (true);

-- Users can update their own passes
CREATE POLICY "Users can update their own passes"
ON user_passes FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for course_enrollments
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments"
ON course_enrollments FOR SELECT
USING (auth.uid() = user_id);

-- Organization members can view enrollments for their organization
CREATE POLICY "Organization members can view organization enrollments"
ON course_enrollments FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- System can insert enrollments (via API)
CREATE POLICY "System can insert enrollments"
ON course_enrollments FOR INSERT
WITH CHECK (true);

-- Users and org members can update enrollments
CREATE POLICY "Users and org members can update enrollments"
ON course_enrollments FOR UPDATE
USING (
  auth.uid() = user_id OR
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Verification
SELECT '✅ user_passes table created' AS status;
SELECT '✅ course_enrollments table created' AS status;
SELECT '✅ RLS policies applied' AS status;
SELECT '🎉 Portal tables ready!' AS result;



-- Drop existing tables if they have errors
DROP TABLE IF EXISTS user_passes CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;

-- Table: user_passes (for tracking user pass purchases)
CREATE TABLE user_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pass_type_id UUID NOT NULL REFERENCES pass_types(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  credits_remaining INTEGER NOT NULL,
  credits_total INTEGER NOT NULL,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: course_enrollments (for tracking course enrollments)
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  status VARCHAR(50) DEFAULT 'active',
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  completion_date TIMESTAMPTZ,
  progress INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_passes_user_id ON user_passes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passes_pass_type_id ON user_passes(pass_type_id);
CREATE INDEX IF NOT EXISTS idx_user_passes_org_id ON user_passes(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_passes_active ON user_passes(is_active);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_org_id ON course_enrollments(organization_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);

-- RLS Policies for user_passes
ALTER TABLE user_passes ENABLE ROW LEVEL SECURITY;

-- Users can view their own passes
CREATE POLICY "Users can view their own passes"
ON user_passes FOR SELECT
USING (auth.uid() = user_id);

-- Organization members can view passes for their organization
CREATE POLICY "Organization members can view organization passes"
ON user_passes FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- System can insert passes (via API)
CREATE POLICY "System can insert passes"
ON user_passes FOR INSERT
WITH CHECK (true);

-- Users can update their own passes
CREATE POLICY "Users can update their own passes"
ON user_passes FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for course_enrollments
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments"
ON course_enrollments FOR SELECT
USING (auth.uid() = user_id);

-- Organization members can view enrollments for their organization
CREATE POLICY "Organization members can view organization enrollments"
ON course_enrollments FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- System can insert enrollments (via API)
CREATE POLICY "System can insert enrollments"
ON course_enrollments FOR INSERT
WITH CHECK (true);

-- Users and org members can update enrollments
CREATE POLICY "Users and org members can update enrollments"
ON course_enrollments FOR UPDATE
USING (
  auth.uid() = user_id OR
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Verification
SELECT '✅ user_passes table created' AS status;
SELECT '✅ course_enrollments table created' AS status;
SELECT '✅ RLS policies applied' AS status;
SELECT '🎉 Portal tables ready!' AS result;

