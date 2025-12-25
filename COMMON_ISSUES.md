# 🐛 Common Issues & Quick Fixes

## Issue 1: `npm run dev` Hangs / Doesn't Show "Ready"

### **Symptoms:**
- Running `npm run dev` starts but never shows "Ready in X.Xs"
- Terminal appears frozen
- Have to delete `.next` folder manually each time

### **Root Cause:**
Next.js build cache corruption, often caused by:
- Hard stopping the dev server (Ctrl+C)
- File system errors
- Rapid file changes
- Environment variable changes

### **Quick Fix:**

**Option A: Use the Clean Script** (Recommended)
```powershell
.\dev-clean.ps1
```

**Option B: Manual Cleanup**
```powershell
# Stop dev server if running (Ctrl+C)
Remove-Item -Recurse -Force .next
npm run dev
```

**Option C: Full Clean** (If issue persists)
```powershell
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
npm run dev
```

### **Permanent Solution:**

Add to `package.json` scripts:
```json
"scripts": {
  "dev": "next dev",
  "dev:clean": "rm -rf .next && next dev",
  "clean": "rm -rf .next node_modules/.cache"
}
```

Then use:
```powershell
npm run dev:clean
```

---

## Issue 2: Column "sort_order" Does Not Exist

### **Symptoms:**
- Error: `ERROR: 42703: column "sort_order" of relation "pass_types" does not exist`
- Happens when running `load-mikilele-data.sql`

### **Root Cause:**
The `pass_types` table in your database is missing the `sort_order` column that the application code expects.

### **Fix:**

**Step 1: Add the Missing Column**
Run this in Supabase SQL Editor BEFORE loading data:

```sql
-- Add sort_order column
ALTER TABLE pass_types 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
```

**Or use the provided script:**
- Open Supabase SQL Editor
- Run entire file: `supabase-add-sort-order.sql`

**Step 2: Then Load Your Data**
- Now run `load-mikilele-data.sql`
- Should work without errors!

---

## Issue 3: Vercel Environment Variables

### **Symptoms:**
- Local works fine
- Vercel deployment shows 400/404 errors
- Supabase queries fail in production

### **Root Cause:**
Environment variables not synced from local to Vercel, or incorrect values.

### **Fix:**

**Option A: Manual Sync**
1. Go to: https://vercel.com/michel-ades-projects/groovegrid/settings/environment-variables
2. Add each variable from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_BASE_URL` (use your Vercel URL!)
3. Click "Save" for each
4. Redeploy

**Option B: Vercel CLI** (If you have it installed)
```bash
vercel env pull .env.vercel
# Review and edit .env.vercel
vercel env push
```

**Important Notes:**
- ⚠️ Change `NEXT_PUBLIC_BASE_URL` to your production URL
- ⚠️ Never commit `.env.local` to git (it's in .gitignore)
- ✅ All `NEXT_PUBLIC_*` variables are exposed to the browser
- 🔒 Keep secret keys (STRIPE_SECRET_KEY, etc.) server-side only

---

## Issue 4: Image Upload Fails

### **Symptoms:**
- "Failed to upload image" error
- 404 when trying to upload
- Images don't save

### **Root Cause:**
Supabase Storage bucket doesn't exist or isn't public.

### **Fix:**

**Step 1: Create Storage Bucket**
1. Go to: https://supabase.com/dashboard/project/bmdzerzampxetxmpmihv/storage/buckets
2. Click "New bucket"
3. Name: `public`
4. Set as **Public** bucket
5. Click "Create"

**Step 2: Set Policies** (Optional - for more control)
```sql
-- Allow public read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'public' AND auth.role() = 'authenticated');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'public' AND auth.uid()::text = owner);
```

---

## Issue 5: 404 Errors on Vercel (Pages Not Found)

### **Symptoms:**
- Admin pages work locally
- Same pages show 404 on Vercel
- Browser console shows 404 for prefetch requests

### **Root Cause:**
Build cache issue or Next.js routing not properly built.

### **Fix:**

**Step 1: Clear Vercel Build Cache**
1. Go to: https://vercel.com/michel-ades-projects/groovegrid/settings/general
2. Scroll to "Build & Output Settings"
3. Click "Clear Build Cache"

**Step 2: Force Rebuild**
1. Go to: Deployments tab
2. Click latest deployment
3. Three dots → "Redeploy"
4. ✅ **UNCHECK** "Use existing Build Cache"
5. Click "Redeploy"
6. Wait for green checkmark

**Step 3: Hard Refresh Browser**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- Or clear browser cache

**Step 4: Check Build Logs**
If still failing:
1. Click on deployment
2. View "Build Logs"
3. Look for TypeScript errors or missing files

---

## Issue 6: Supabase RLS Policies Block Queries

### **Symptoms:**
- Queries work in SQL Editor
- Same queries return empty/error in app
- Console shows "permission denied" or no data

### **Root Cause:**
Row Level Security (RLS) policies are blocking access.

### **Fix:**

**Quick Test: Temporarily Disable RLS**
```sql
ALTER TABLE your_table_name DISABLE ROW LEVEL SECURITY;
```

⚠️ Only for testing! Re-enable after:
```sql
ALTER TABLE your_table_name ENABLE ROW LEVEL SECURITY;
```

**Proper Fix: Update RLS Policies**
Run: `supabase-fix-rls.sql` (already provided)

Or manually check policies:
```sql
-- View existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';

-- Drop problematic policy
DROP POLICY IF EXISTS "policy_name" ON your_table_name;

-- Create proper policy
CREATE POLICY "new_policy_name"
ON your_table_name FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));
```

---

## Issue 7: NULL Value Constraint Violations

### **Symptoms:**
- Error: `ERROR: 23502: null value in column "credits" of relation "class_packages" violates not-null constraint`
- Error: `ERROR: 42703: column "sort_order" of relation "pass_types" does not exist`
- Happens when running `load-mikilele-data.sql`

### **Root Cause:**
Schema issues where the database structure doesn't match what the application expects:
1. `pass_types` table missing `sort_order` column
2. `class_packages` table has `credits` as NOT NULL, but unlimited packages need NULL

### **Fix:**

**Quick Fix: Run Pre-Flight Script** (Recommended)

1. Open Supabase SQL Editor
2. Run entire file: `supabase-pre-flight-fixes.sql`
3. This fixes both issues at once!

**Or Manual Fix:**

```sql
-- Fix 1: Add sort_order column
ALTER TABLE pass_types 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Fix 2: Allow NULL credits
ALTER TABLE class_packages 
ALTER COLUMN credits DROP NOT NULL;
```

**Then:**
- Run `load-mikilele-data.sql`
- Should work perfectly! ✅

---

## Quick Diagnostics

### Test Supabase Connection:
```javascript
// In browser console on your app
const { data, error } = await supabase.from('organization').select('*').limit(1);
console.log('Data:', data, 'Error:', error);
```

### Test Environment Variables:
```javascript
// In browser console
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Has Supabase Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

### Check User Auth:
```javascript
// In browser console on your app
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

---

## Prevention Tips

1. **Always use `dev-clean.ps1`** if dev server acts weird
2. **Commit often** to avoid losing work
3. **Test locally first** before deploying
4. **Keep `.env.local` backed up** (but not in git!)
5. **Check Vercel logs** when production fails
6. **Use Supabase Dashboard** to verify data and policies
7. **Clear browser cache** when testing fixes

---

## Still Having Issues?

### Checklist:
- [ ] `.env.local` exists and has all required keys
- [ ] Dev server restarted after `.env.local` changes
- [ ] Supabase database tables created (`supabase-schema.sql`)
- [ ] RLS policies fixed (`supabase-fix-rls.sql`)
- [ ] `sort_order` column added (`supabase-add-sort-order.sql`)
- [ ] Vercel environment variables added
- [ ] Vercel build cache cleared and redeployed
- [ ] Browser cache cleared

### Debug Commands:
```powershell
# Check if files exist
Test-Path .env.local
Test-Path node_modules

# View environment
Get-Content .env.local

# Check Node/npm versions
node --version
npm --version

# Clean everything
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

---

**Most issues are solved by:**
1. ✅ Clean restart (`dev-clean.ps1`)
2. ✅ Proper environment variables
3. ✅ Vercel cache clear + redeploy
4. ✅ Running all SQL scripts in order

---

**Last Updated:** December 25, 2025

