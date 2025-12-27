-- ========================================
-- GROOVEGRID - COMPREHENSIVE RLS SECURITY
-- ========================================
-- This script implements enterprise-grade Row Level Security
-- Run this in Supabase SQL Editor after all purchases work correctly

-- ========================================
-- PART 1: DROP EXISTING POLICIES
-- ========================================
-- Clean slate - remove all existing policies to avoid conflicts

-- Organization policies
DROP POLICY IF EXISTS "Events are publicly readable" ON events;
DROP POLICY IF EXISTS "Ticket types are publicly readable" ON ticket_types;
DROP POLICY IF EXISTS "Pass types are publicly readable" ON pass_types;
DROP POLICY IF EXISTS "Courses are publicly readable" ON courses;
DROP POLICY IF EXISTS "Class packages are publicly readable" ON class_packages;
DROP POLICY IF EXISTS "Organizations are publicly readable" ON organization;

-- User data policies
DROP POLICY IF EXISTS "Users can read their own orders" ON orders;
DROP POLICY IF EXISTS "Users can read their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can read their own passes" ON user_passes;
DROP POLICY IF EXISTS "Users can update their own passes" ON user_passes;
DROP POLICY IF EXISTS "Users can read their own packages" ON student_packages;
DROP POLICY IF EXISTS "Users can update their own packages" ON student_packages;
DROP POLICY IF EXISTS "Users can read their own enrollments" ON enrollments;

-- Organization member policies
DROP POLICY IF EXISTS "Users can view their organizations" ON organization;
DROP POLICY IF EXISTS "Owners can update organizations" ON organization;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organization;
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Service role can manage memberships" ON organization_members;
DROP POLICY IF EXISTS "Organization members can manage events" ON events;
DROP POLICY IF EXISTS "Organization members can manage ticket types" ON ticket_types;
DROP POLICY IF EXISTS "Organization members can manage courses" ON courses;
DROP POLICY IF EXISTS "Organization members can manage packages" ON class_packages;
DROP POLICY IF EXISTS "Organization members can manage pass types" ON pass_types;
DROP POLICY IF EXISTS "Organization members can view their orders" ON orders;
DROP POLICY IF EXISTS "Organization members can manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Organization members can manage segments" ON audience_segments;
DROP POLICY IF EXISTS "Organization members can view campaign sequences" ON campaign_sequences;
DROP POLICY IF EXISTS "Organization members can view campaign sends" ON campaign_sends;

-- Additional cleanup
DROP POLICY IF EXISTS "Users view own orders by email" ON orders;
DROP POLICY IF EXISTS "Users view own order items" ON order_items;
DROP POLICY IF EXISTS "Users view own tickets" ON tickets;
DROP POLICY IF EXISTS "Users update own tickets" ON tickets;
DROP POLICY IF EXISTS "Users view own passes" ON user_passes;
DROP POLICY IF EXISTS "Users update own passes" ON user_passes;
DROP POLICY IF EXISTS "Users view own packages" ON student_packages;
DROP POLICY IF EXISTS "Users update own packages" ON student_packages;
DROP POLICY IF EXISTS "Users view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Service role full access - orders" ON orders;
DROP POLICY IF EXISTS "Service role full access - order_items" ON order_items;
DROP POLICY IF EXISTS "Service role full access - tickets" ON tickets;
DROP POLICY IF EXISTS "Service role full access - user_passes" ON user_passes;
DROP POLICY IF EXISTS "Service role full access - enrollments" ON enrollments;
DROP POLICY IF EXISTS "Service role full access - organization_members" ON organization_members;
DROP POLICY IF EXISTS "Public can view active organizations" ON organization;
DROP POLICY IF EXISTS "Public can view published events" ON events;
DROP POLICY IF EXISTS "Public can view active ticket types" ON ticket_types;
DROP POLICY IF EXISTS "Public can view active pass types" ON pass_types;
DROP POLICY IF EXISTS "Public can view published courses" ON courses;
DROP POLICY IF EXISTS "Public can view active packages" ON class_packages;
DROP POLICY IF EXISTS "Members view their organizations" ON organization;
DROP POLICY IF EXISTS "Owners update organizations" ON organization;
DROP POLICY IF EXISTS "Authenticated create organizations" ON organization;
DROP POLICY IF EXISTS "Members manage events" ON events;
DROP POLICY IF EXISTS "Members manage ticket types" ON ticket_types;
DROP POLICY IF EXISTS "Members manage courses" ON courses;
DROP POLICY IF EXISTS "Members manage packages" ON class_packages;
DROP POLICY IF EXISTS "Members manage pass types" ON pass_types;
DROP POLICY IF EXISTS "Members view organization orders" ON orders;
DROP POLICY IF EXISTS "Members manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Members manage segments" ON audience_segments;
DROP POLICY IF EXISTS "Members view campaign sequences" ON campaign_sequences;
DROP POLICY IF EXISTS "Members view campaign sends" ON campaign_sends;

-- ========================================
-- PART 2: ENABLE RLS ON ALL TABLES
-- ========================================

ALTER TABLE organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pass_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PART 3: SERVICE ROLE BYPASS (CRITICAL!)
-- ========================================
-- Service role (webhook) must be able to bypass RLS to insert data

CREATE POLICY "Service role full access - orders" ON orders
  FOR ALL 
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Service role full access - order_items" ON order_items
  FOR ALL 
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Service role full access - tickets" ON tickets
  FOR ALL 
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Service role full access - user_passes" ON user_passes
  FOR ALL 
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Service role full access - enrollments" ON enrollments
  FOR ALL 
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Service role full access - organization_members" ON organization_members
  FOR ALL 
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- ========================================
-- PART 4: PUBLIC READ POLICIES
-- ========================================
-- Anyone (including anonymous users) can browse public content

-- Organizations
CREATE POLICY "Public can view active organizations" ON organization
  FOR SELECT 
  USING (is_active = true);

-- Events
CREATE POLICY "Public can view published events" ON events
  FOR SELECT 
  USING (status = 'published');

-- Ticket Types
CREATE POLICY "Public can view active ticket types" ON ticket_types
  FOR SELECT 
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = ticket_types.event_id 
      AND events.status = 'published'
    )
  );

-- Pass Types
CREATE POLICY "Public can view active pass types" ON pass_types
  FOR SELECT 
  USING (is_active = true);

-- Courses
CREATE POLICY "Public can view published courses" ON courses
  FOR SELECT 
  USING (status = 'published');

-- Class Packages
CREATE POLICY "Public can view active packages" ON class_packages
  FOR SELECT 
  USING (is_active = true);

-- ========================================
-- PART 5: USER DATA ACCESS POLICIES
-- ========================================
-- Users can view and manage their own purchases and data

-- Orders - Users can view orders matching their email
CREATE POLICY "Users view own orders by email" ON orders
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL
    AND buyer_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Order Items - Users can view items from their orders
CREATE POLICY "Users view own order items" ON order_items
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Tickets - Users can view and update their tickets
CREATE POLICY "Users view own tickets" ON tickets
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = tickets.order_id
      AND orders.buyer_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users update own tickets" ON tickets
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = tickets.order_id
      AND orders.buyer_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- User Passes - Users can view and use their passes
CREATE POLICY "Users view own passes" ON user_passes
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = user_passes.order_id
        AND orders.buyer_email = (
          SELECT email FROM auth.users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users update own passes" ON user_passes
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = user_passes.order_id
        AND orders.buyer_email = (
          SELECT email FROM auth.users WHERE id = auth.uid()
        )
      )
    )
  );

-- Student Packages
CREATE POLICY "Users view own packages" ON student_packages
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = student_packages.order_id
        AND orders.buyer_email = (
          SELECT email FROM auth.users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users update own packages" ON student_packages
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = student_packages.order_id
        AND orders.buyer_email = (
          SELECT email FROM auth.users WHERE id = auth.uid()
        )
      )
    )
  );

-- Enrollments
CREATE POLICY "Users view own enrollments" ON enrollments
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = enrollments.order_id
        AND orders.buyer_email = (
          SELECT email FROM auth.users WHERE id = auth.uid()
        )
      )
    )
  );

-- ========================================
-- PART 6: ORGANIZATION ADMIN POLICIES
-- ========================================
-- Organization members can manage their organization's content

-- Organization Members can view their memberships
CREATE POLICY "Users view own memberships" ON organization_members
  FOR SELECT 
  USING (user_id = auth.uid());

-- Users can view organizations they belong to
CREATE POLICY "Members view their organizations" ON organization
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization.id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Only owners can update organizations
CREATE POLICY "Owners update organizations" ON organization
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role = 'owner'
    )
  );

-- Authenticated users can create organizations (for signup)
CREATE POLICY "Authenticated create organizations" ON organization
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Organization members can manage events
CREATE POLICY "Members manage events" ON events
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = events.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization members can manage ticket types
CREATE POLICY "Members manage ticket types" ON ticket_types
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM events
      JOIN organization_members ON organization_members.organization_id = events.organization_id
      WHERE events.id = ticket_types.event_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization members can manage courses
CREATE POLICY "Members manage courses" ON courses
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = courses.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization members can manage class packages
CREATE POLICY "Members manage packages" ON class_packages
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = class_packages.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization members can manage pass types
CREATE POLICY "Members manage pass types" ON pass_types
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = pass_types.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization members can view orders for their events
CREATE POLICY "Members view organization orders" ON orders
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL
    AND (
      -- Orders for events they manage
      EXISTS (
        SELECT 1 FROM events
        JOIN organization_members ON organization_members.organization_id = events.organization_id
        WHERE events.id = orders.event_id
        AND organization_members.user_id = auth.uid()
      )
      OR
      -- Orders for their organization (pass/course purchases)
      EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id = orders.organization_id
        AND organization_members.user_id = auth.uid()
      )
    )
  );

-- Organization members can manage campaigns
CREATE POLICY "Members manage campaigns" ON campaigns
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = campaigns.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization members can manage audience segments
CREATE POLICY "Members manage segments" ON audience_segments
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = audience_segments.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization members can view campaign sequences
CREATE POLICY "Members view campaign sequences" ON campaign_sequences
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM campaigns
      JOIN organization_members ON organization_members.organization_id = campaigns.organization_id
      WHERE campaigns.id = campaign_sequences.campaign_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization members can view campaign sends
CREATE POLICY "Members view campaign sends" ON campaign_sends
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM campaigns
      JOIN organization_members ON organization_members.organization_id = campaigns.organization_id
      WHERE campaigns.id = campaign_sends.campaign_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- ========================================
-- PART 7: GRANTS & PERMISSIONS
-- ========================================

GRANT ALL ON organization TO authenticated, anon;
GRANT ALL ON organization_members TO authenticated;
GRANT ALL ON events TO authenticated, anon;
GRANT ALL ON ticket_types TO authenticated, anon;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT ALL ON tickets TO authenticated;
GRANT ALL ON pass_types TO authenticated, anon;
GRANT ALL ON user_passes TO authenticated;
GRANT ALL ON courses TO authenticated, anon;
GRANT ALL ON class_packages TO authenticated, anon;
GRANT ALL ON student_packages TO authenticated;
GRANT ALL ON enrollments TO authenticated;
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaign_sequences TO authenticated;
GRANT ALL ON audience_segments TO authenticated;
GRANT ALL ON campaign_sends TO authenticated;

-- ========================================
-- PART 8: REFRESH SCHEMA CACHE
-- ========================================

NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify RLS is working correctly

/*
-- 1. Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. List all policies
SELECT tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 3. Test as authenticated user (replace with your test email)
SET request.jwt.claims = '{"sub": "test-user-id", "email": "test@example.com", "role": "authenticated"}';

-- Try to view orders (should only see own orders)
SELECT * FROM orders WHERE buyer_email = 'test@example.com';

-- 4. Test service role can insert
SET request.jwt.claims = '{"role": "service_role"}';

-- Try to insert order (should succeed)
INSERT INTO orders (buyer_email, buyer_name, total, status) 
VALUES ('webhook-test@example.com', 'Webhook Test', 100.00, 'completed');

-- 5. Reset
RESET request.jwt.claims;
*/

-- ========================================
-- ROLLBACK PLAN (If Something Goes Wrong)
-- ========================================
-- If you need to temporarily disable RLS:

/*
-- Disable RLS on problematic tables
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_passes DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;

-- Or drop all policies and start over
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END$$;
*/

-- ========================================
-- DONE! 
-- ========================================
-- Your database now has enterprise-grade security with:
-- ✅ Service role bypass for webhooks
-- ✅ Public read access for browsing
-- ✅ Email-based user data access
-- ✅ Organization member management
-- ✅ Proper isolation between tenants

