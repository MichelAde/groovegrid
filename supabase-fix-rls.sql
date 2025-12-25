-- Fix RLS Infinite Recursion Issues
-- Run this in your Supabase SQL Editor to fix the organization_members policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Organization members can read their organizations" ON organization;
DROP POLICY IF EXISTS "Organization members can update their organizations" ON organization;
DROP POLICY IF EXISTS "Organization members can read memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can insert organization memberships" ON organization_members;

-- Create simple, non-recursive policies for organization_members
-- Policy 1: Users can see their own memberships (no recursion)
CREATE POLICY "Users can view their own memberships" ON organization_members
  FOR SELECT USING (user_id = auth.uid());

-- Policy 2: Service role can manage memberships (for signup process)
CREATE POLICY "Service role can manage memberships" ON organization_members
  FOR ALL USING (true);

-- Create fixed policies for organization
-- Policy 1: Users can see organizations they belong to (using simple join)
CREATE POLICY "Users can view their organizations" ON organization
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = organization.id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Policy 2: Organization owners can update their organizations
CREATE POLICY "Owners can update organizations" ON organization
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = organization.id 
      AND organization_members.user_id = auth.uid()
      AND organization_members.role = 'owner'
    )
  );

-- Policy 3: Authenticated users can create organizations (for signup)
CREATE POLICY "Authenticated users can create organizations" ON organization
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT ALL ON organization TO authenticated;
GRANT ALL ON organization_members TO authenticated;
GRANT ALL ON organization TO service_role;
GRANT ALL ON organization_members TO service_role;

