# 🔐 SECURITY IMPLEMENTATION & TESTING GUIDE

## ⚠️ IMPORTANT: READ BEFORE RUNNING SQL

**Current State**: RLS is ENABLED but with temporary permissive policies  
**Target State**: Enterprise-grade RLS with proper isolation  
**Risk Level**: LOW (all changes are reversible)

---

## 📋 PRE-IMPLEMENTATION CHECKLIST

Before running `COMPREHENSIVE_SECURITY_RLS.sql`, verify:

- [ ] All ticket purchases work correctly
- [ ] All pass purchases work correctly  
- [ ] All course enrollments work correctly
- [ ] Webhook successfully inserts data
- [ ] Portal pages display user data
- [ ] Admin dashboard shows organization data
- [ ] You have a backup of your database (optional but recommended)

### Create a Database Snapshot (Optional)

In Supabase Dashboard:
1. Go to Database → Backups
2. Click "Create Backup"
3. Name it "pre-security-upgrade"

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Run the Security SQL

1. Open Supabase SQL Editor
2. Copy entire contents of `COMPREHENSIVE_SECURITY_RLS.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Wait for completion (should take 10-20 seconds)

**Expected Output:**
```
Success. Rows returned 0 in X ms
```

### Step 2: Verify RLS is Enabled

Run this query:
```sql
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected**: All tables show `rls_enabled = true`

### Step 3: Check Policies Were Created

Run this query:
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Expected**: Each table should have 1-3 policies

---

## 🧪 SECURITY TESTING PROTOCOL

### Test Suite 1: Service Role (Webhook) Access

**Purpose**: Verify webhook can still insert data

#### Test 1A: Webhook Can Insert Orders
```sql
-- Simulate webhook insert
SET request.jwt.claims = '{"role": "service_role"}';

INSERT INTO orders (
  buyer_email, 
  buyer_name, 
  total, 
  status,
  organization_id
) VALUES (
  'security-test@example.com',
  'Security Test',
  50.00,
  'completed',
  'e110e5e0-c320-4c84-a155-ebf567f7585a'
);

-- Check it was inserted
SELECT * FROM orders WHERE buyer_email = 'security-test@example.com';

-- Clean up
DELETE FROM orders WHERE buyer_email = 'security-test@example.com';

RESET request.jwt.claims;
```

**Expected**: ✅ Insert succeeds, query returns 1 row

**If Failed**: Service role policy is not working. Webhook will fail.

---

#### Test 1B: Webhook Can Insert Passes
```sql
SET request.jwt.claims = '{"role": "service_role"}';

-- First insert an order
INSERT INTO orders (
  id,
  buyer_email, 
  buyer_name, 
  total, 
  status,
  organization_id
) VALUES (
  gen_random_uuid(),
  'pass-test@example.com',
  'Pass Test',
  45.00,
  'completed',
  'e110e5e0-c320-4c84-a155-ebf567f7585a'
) RETURNING id;

-- Use the returned ID to insert a pass
-- (Replace ORDER_ID_HERE with actual ID from above)
INSERT INTO user_passes (
  pass_type_id,
  order_id,
  organization_id,
  credits_total,
  credits_remaining,
  is_active
) VALUES (
  (SELECT id FROM pass_types LIMIT 1),
  'ORDER_ID_HERE',
  'e110e5e0-c320-4c84-a155-ebf567f7585a',
  5,
  5,
  true
);

-- Clean up
DELETE FROM user_passes WHERE order_id IN (
  SELECT id FROM orders WHERE buyer_email = 'pass-test@example.com'
);
DELETE FROM orders WHERE buyer_email = 'pass-test@example.com';

RESET request.jwt.claims;
```

**Expected**: ✅ Both inserts succeed

---

### Test Suite 2: User Data Isolation

**Purpose**: Verify users can only see their own data

#### Test 2A: User Can See Own Orders
```sql
-- Simulate User A (replace with actual test user email)
SET request.jwt.claims = '{"sub": "user-a-id", "email": "michel.adedokun@outlook.com", "role": "authenticated"}';

-- User A should see their orders
SELECT * FROM orders WHERE buyer_email = 'michel.adedokun@outlook.com';

-- User A should NOT see other users' orders
SELECT * FROM orders WHERE buyer_email != 'michel.adedokun@outlook.com';

RESET request.jwt.claims;
```

**Expected**: 
- ✅ First query returns their orders
- ✅ Second query returns ZERO rows (security working!)

**If Failed**: Users can see others' data - SECURITY BREACH

---

#### Test 2B: User Cannot See Other Users' Passes
```sql
-- Create test data as service role
SET request.jwt.claims = '{"role": "service_role"}';

-- Insert order for User A
INSERT INTO orders (id, buyer_email, buyer_name, total, status, organization_id)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'user-a@test.com',
  'User A',
  60.00,
  'completed',
  'e110e5e0-c320-4c84-a155-ebf567f7585a'
);

-- Insert pass for User A
INSERT INTO user_passes (
  pass_type_id,
  order_id,
  organization_id,
  credits_total,
  credits_remaining,
  is_active
) VALUES (
  (SELECT id FROM pass_types LIMIT 1),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'e110e5e0-c320-4c84-a155-ebf567f7585a',
  5,
  5,
  true
);

-- Insert order for User B
INSERT INTO orders (id, buyer_email, buyer_name, total, status, organization_id)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'user-b@test.com',
  'User B',
  60.00,
  'completed',
  'e110e5e0-c320-4c84-a155-ebf567f7585a'
);

-- Insert pass for User B
INSERT INTO user_passes (
  pass_type_id,
  order_id,
  organization_id,
  credits_total,
  credits_remaining,
  is_active
) VALUES (
  (SELECT id FROM pass_types LIMIT 1),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'e110e5e0-c320-4c84-a155-ebf567f7585a',
  5,
  5,
  true
);

-- Now test as User A
SET request.jwt.claims = '{"sub": "user-a-id", "email": "user-a@test.com", "role": "authenticated"}';

-- User A should see ONLY their pass
SELECT up.*, o.buyer_email
FROM user_passes up
JOIN orders o ON o.id = up.order_id;

-- Should return ONLY 1 row with buyer_email = 'user-a@test.com'

-- Test as User B
SET request.jwt.claims = '{"sub": "user-b-id", "email": "user-b@test.com", "role": "authenticated"}';

SELECT up.*, o.buyer_email
FROM user_passes up
JOIN orders o ON o.id = up.order_id;

-- Should return ONLY 1 row with buyer_email = 'user-b@test.com'

-- Clean up
SET request.jwt.claims = '{"role": "service_role"}';
DELETE FROM user_passes WHERE order_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);
DELETE FROM orders WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

RESET request.jwt.claims;
```

**Expected**: 
- ✅ User A sees only their pass (1 row)
- ✅ User B sees only their pass (1 row)
- ✅ Neither sees the other's data

**If Failed**: Data isolation broken - CRITICAL SECURITY ISSUE

---

### Test Suite 3: Public Access

**Purpose**: Verify anonymous users can browse public content

#### Test 3A: Public Can View Published Events
```sql
-- No authentication
RESET request.jwt.claims;

-- Should return published events
SELECT id, title, status FROM events WHERE status = 'published';

-- Should return ZERO draft events
SELECT id, title, status FROM events WHERE status = 'draft';
```

**Expected**:
- ✅ Published events visible
- ✅ Draft events hidden

---

#### Test 3B: Public Can View Pass Types
```sql
RESET request.jwt.claims;

-- Should return active pass types
SELECT id, name, is_active FROM pass_types WHERE is_active = true;

-- Should return ZERO inactive passes
SELECT id, name, is_active FROM pass_types WHERE is_active = false;
```

**Expected**:
- ✅ Active passes visible
- ✅ Inactive passes hidden

---

### Test Suite 4: Organization Isolation

**Purpose**: Verify organization members can only see their org's data

#### Test 4A: Org Member Can View Their Events
```sql
-- Simulate org member (replace with actual member ID and email)
SET request.jwt.claims = '{"sub": "your-user-id", "email": "your-email@example.com", "role": "authenticated"}';

-- Should see events for organizations you belong to
SELECT e.id, e.title, e.organization_id
FROM events e
JOIN organization_members om ON om.organization_id = e.organization_id
WHERE om.user_id = auth.uid();

RESET request.jwt.claims;
```

**Expected**: ✅ Returns only events from member's organizations

---

#### Test 4B: Org Member Cannot See Other Orgs
```sql
-- This test requires having multiple organizations
-- If you only have one org, skip this test

SET request.jwt.claims = '{"sub": "your-user-id", "email": "your-email@example.com", "role": "authenticated"}';

-- Try to view ALL events (should be filtered by RLS)
SELECT COUNT(*) as accessible_events FROM events;

-- Compare with actual total (as service role)
SET request.jwt.claims = '{"role": "service_role"}';
SELECT COUNT(*) as total_events FROM events;

RESET request.jwt.claims;
```

**Expected**: 
- ✅ accessible_events < total_events (unless you're in all orgs)

---

## 🧪 END-TO-END TESTING

### E2E Test 1: Complete Purchase Flow

**Test the entire purchase process with RLS enabled:**

1. **Make a Purchase** (on website):
   - Go to https://groovegrid-seven.vercel.app/passes
   - Purchase a pass with email `test-security@example.com`
   - Complete Stripe checkout

2. **Verify Webhook Inserted Data**:
   ```sql
   -- As service role, check order was created
   SET request.jwt.claims = '{"role": "service_role"}';
   SELECT * FROM orders WHERE buyer_email = 'test-security@example.com';
   SELECT * FROM user_passes WHERE order_id IN (
     SELECT id FROM orders WHERE buyer_email = 'test-security@example.com'
   );
   RESET request.jwt.claims;
   ```

3. **Verify User Can See Purchase**:
   - Log in to portal with `test-security@example.com`
   - Go to "My Passes"
   - Should see the purchased pass

4. **Verify Other Users Cannot See It**:
   - Log in with different email
   - Go to "My Passes"
   - Should NOT see test-security@example.com's pass

**Expected**: ✅ All steps succeed

---

### E2E Test 2: Admin Dashboard Access

1. **Log in as Organization Owner**
2. **Go to Admin Dashboard**
3. **Click "Events"** - Should see your org's events
4. **Click "Sales"** - Should see orders for your org's events
5. **Try to manually edit another org's event** - Should fail

**Expected**: ✅ Can manage own org, cannot access other orgs

---

## 🚨 ROLLBACK PROCEDURE

### If Something Goes Wrong

#### Option 1: Disable RLS Temporarily
```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_passes DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
```

#### Option 2: Drop All Policies
```sql
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END$$;
```

#### Option 3: Restore from Backup
1. Go to Supabase Dashboard → Database → Backups
2. Select "pre-security-upgrade"
3. Click "Restore"

---

## ✅ POST-IMPLEMENTATION CHECKLIST

After running security SQL, verify:

- [ ] Webhook test purchase completes successfully
- [ ] Check Vercel logs - no RLS errors
- [ ] Portal displays user's own data
- [ ] Portal does NOT display other users' data
- [ ] Admin dashboard shows org data
- [ ] Public pages still load (events, passes, courses)
- [ ] Anonymous users can browse public content
- [ ] Ticket purchases work
- [ ] Pass purchases work
- [ ] Course enrollments work

---

## 📊 SECURITY LEVELS

### Before (Current - Temporary)
```
Security Level: ⭐⭐⭐ (3/5)
- Application-level filtering
- Anyone with anon key could query everything
- RLS enabled but with permissive policies
```

### After (Target - Enterprise)
```
Security Level: ⭐⭐⭐⭐⭐ (5/5)
- Database-level enforcement
- Users isolated by email/user_id
- Organizations completely isolated
- Service role controlled access
- Public data properly filtered
```

---

## 🎯 EXPECTED OUTCOMES

### Security Benefits:
✅ **Data Isolation**: Users can only see their purchases  
✅ **Tenant Isolation**: Orgs cannot access each other's data  
✅ **Public Safety**: Anonymous users only see published content  
✅ **Webhook Protection**: Service role bypasses RLS correctly  
✅ **Audit Trail**: All access controlled at database level  

### No Breaking Changes:
✅ All existing features work  
✅ Webhook still inserts data  
✅ Portal still displays correctly  
✅ Admin dashboard unchanged  
✅ Public pages unaffected  

---

## 💡 BEST PRACTICES

### DO:
- ✅ Test in development first if possible
- ✅ Run verification queries after implementation
- ✅ Monitor Vercel logs for RLS errors
- ✅ Test with multiple user accounts
- ✅ Keep backup before major changes

### DON'T:
- ❌ Run in production during peak hours
- ❌ Skip testing
- ❌ Modify policies without understanding them
- ❌ Disable RLS permanently
- ❌ Mix service role and user queries

---

## 📞 NEED HELP?

If you encounter issues after implementing RLS:

1. **Check Vercel Logs**: Look for RLS policy violations
2. **Test SQL Directly**: Use the test queries above
3. **Check User Email**: Ensure `buyer_email` matches logged-in user
4. **Verify Service Role**: Confirm webhook uses `SUPABASE_SERVICE_ROLE_KEY`
5. **Ask Me**: Share the error and I'll help debug!

---

## 🚀 READY TO IMPLEMENT?

**Step-by-step:**
1. ✅ Read this guide completely
2. ✅ Run pre-implementation checklist
3. ✅ Run `COMPREHENSIVE_SECURITY_RLS.sql`
4. ✅ Execute Test Suite 1 (Service Role)
5. ✅ Execute Test Suite 2 (User Isolation)
6. ✅ Execute Test Suite 3 (Public Access)
7. ✅ Run E2E Test 1 (Purchase Flow)
8. ✅ Complete post-implementation checklist
9. ✅ Monitor for 24 hours

**Estimated Time**: 30-45 minutes for full testing

**Risk Level**: LOW (fully reversible)

**Recommended Time**: During low-traffic period

---

**Ready? Let me know and I can guide you through each step!**

