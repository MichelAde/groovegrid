# 🚀 DATABASE SETUP - STEP BY STEP

## ❌ You Got This Error:
```
ERROR: relation "organizations" does not exist
```

**This means**: Database tables haven't been created yet.

---

## ✅ SOLUTION (5 Minutes Total)

### **STEP 1: Check What Exists** ⏱️ 30 seconds

1. Open Supabase: https://supabase.com/dashboard/project/bmdzerzampxetxmpmihv/sql

2. Run this query:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'organization';
```

**Result:**
- ✅ **If you see "organization"** → Skip to STEP 3
- ❌ **If you see "no rows"** → Continue to STEP 2

---

### **STEP 2: Create All Tables** ⏱️ 2 minutes

**Only do this if STEP 1 showed NO TABLES**

1. Open file in your project: `supabase-schema.sql`

2. **Copy ALL content** (entire file, ~440 lines)

3. **Paste** into Supabase SQL Editor

4. **Click "Run"**

5. **Wait** for "Success" message (~10-15 seconds)

---

### **STEP 3: Apply Fixes** ⏱️ 1 minute

1. Open file: `supabase-pre-flight-fixes.sql`

2. Copy and paste into SQL Editor

3. Click "Run"

---

### **STEP 4: Setup Organization & Portal** ⏱️ 1 minute

1. Open file: `setup-after-schema.sql`

2. Copy and paste into SQL Editor

3. Click "Run"

4. **Check output** - should see:
```
========================================
DATABASE SETUP COMPLETE
========================================
Organization: 1 row(s)
Events: 0 row(s)
Pass Types: 0 row(s)

⚠️  No events found
→ NEXT STEP: Run load-mikilele-data.sql
========================================
```

---

### **STEP 5: Load Sample Data** ⏱️ 2 minutes

1. Open file: `load-mikilele-data.sql`

2. **Find line 54** that says: `'YOUR_USER_ID'`

3. **Replace with your user ID**:
   - Go to: Supabase → Authentication → Users
   - Copy the UUID of your account (looks like: `a1b2c3d4-...`)
   - Paste it replacing `'YOUR_USER_ID'`

4. **Copy entire file** and paste into SQL Editor

5. **Click "Run"**

6. **Should take ~5 seconds**, then you'll see success messages

---

## ✅ VERIFY IT WORKED

Run this query:

```sql
SELECT 
  (SELECT COUNT(*) FROM organization) as orgs,
  (SELECT COUNT(*) FROM events) as events,
  (SELECT COUNT(*) FROM pass_types) as passes,
  (SELECT COUNT(*) FROM courses) as courses;
```

**Expected output:**
```
orgs: 1
events: 8
passes: 4
courses: 7
```

---

## 🎯 AFTER DATABASE SETUP

Once all SQL scripts are done:

1. ✅ Database is ready
2. ✅ Wait for Vercel deployment to finish
3. ✅ Test the site: https://groovegrid-seven.vercel.app

**Test pages:**
- `/events` - Should show 8 events
- `/passes` - Should show 4 pass types
- `/classes` - Should show 7 courses

---

## 🆘 TROUBLESHOOTING

### If you get "subdomain must be unique"
The organization already exists! Skip to STEP 5 (load data).

### If you get "column does not exist"
Run STEP 3 again (`supabase-pre-flight-fixes.sql`).

### If events still don't show
Check RLS policies:
```sql
SELECT * FROM events WHERE status = 'published' LIMIT 5;
```

If this returns rows but the website doesn't show them, re-run `setup-after-schema.sql`.

---

## 📋 FILE EXECUTION ORDER

**Summary of what to run:**

1. ✅ `supabase-schema.sql` - Creates all tables
2. ✅ `supabase-pre-flight-fixes.sql` - Fixes known issues
3. ✅ `setup-after-schema.sql` - Sets up organization & RLS
4. ✅ `load-mikilele-data.sql` - Loads 8 events, 4 passes, 7 courses

**Total time: ~5 minutes**

---

## ✨ YOU'RE DONE WHEN...

- ✅ All 4 SQL scripts executed successfully
- ✅ Vercel deployment shows "Ready"
- ✅ https://groovegrid-seven.vercel.app/events shows events
- ✅ https://groovegrid-seven.vercel.app/passes shows passes

**Then you can start testing signup, portal, and admin features!** 🎉












## ❌ You Got This Error:
```
ERROR: relation "organizations" does not exist
```

**This means**: Database tables haven't been created yet.

---

## ✅ SOLUTION (5 Minutes Total)

### **STEP 1: Check What Exists** ⏱️ 30 seconds

1. Open Supabase: https://supabase.com/dashboard/project/bmdzerzampxetxmpmihv/sql

2. Run this query:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'organization';
```

**Result:**
- ✅ **If you see "organization"** → Skip to STEP 3
- ❌ **If you see "no rows"** → Continue to STEP 2

---

### **STEP 2: Create All Tables** ⏱️ 2 minutes

**Only do this if STEP 1 showed NO TABLES**

1. Open file in your project: `supabase-schema.sql`

2. **Copy ALL content** (entire file, ~440 lines)

3. **Paste** into Supabase SQL Editor

4. **Click "Run"**

5. **Wait** for "Success" message (~10-15 seconds)

---

### **STEP 3: Apply Fixes** ⏱️ 1 minute

1. Open file: `supabase-pre-flight-fixes.sql`

2. Copy and paste into SQL Editor

3. Click "Run"

---

### **STEP 4: Setup Organization & Portal** ⏱️ 1 minute

1. Open file: `setup-after-schema.sql`

2. Copy and paste into SQL Editor

3. Click "Run"

4. **Check output** - should see:
```
========================================
DATABASE SETUP COMPLETE
========================================
Organization: 1 row(s)
Events: 0 row(s)
Pass Types: 0 row(s)

⚠️  No events found
→ NEXT STEP: Run load-mikilele-data.sql
========================================
```

---

### **STEP 5: Load Sample Data** ⏱️ 2 minutes

1. Open file: `load-mikilele-data.sql`

2. **Find line 54** that says: `'YOUR_USER_ID'`

3. **Replace with your user ID**:
   - Go to: Supabase → Authentication → Users
   - Copy the UUID of your account (looks like: `a1b2c3d4-...`)
   - Paste it replacing `'YOUR_USER_ID'`

4. **Copy entire file** and paste into SQL Editor

5. **Click "Run"**

6. **Should take ~5 seconds**, then you'll see success messages

---

## ✅ VERIFY IT WORKED

Run this query:

```sql
SELECT 
  (SELECT COUNT(*) FROM organization) as orgs,
  (SELECT COUNT(*) FROM events) as events,
  (SELECT COUNT(*) FROM pass_types) as passes,
  (SELECT COUNT(*) FROM courses) as courses;
```

**Expected output:**
```
orgs: 1
events: 8
passes: 4
courses: 7
```

---

## 🎯 AFTER DATABASE SETUP

Once all SQL scripts are done:

1. ✅ Database is ready
2. ✅ Wait for Vercel deployment to finish
3. ✅ Test the site: https://groovegrid-seven.vercel.app

**Test pages:**
- `/events` - Should show 8 events
- `/passes` - Should show 4 pass types
- `/classes` - Should show 7 courses

---

## 🆘 TROUBLESHOOTING

### If you get "subdomain must be unique"
The organization already exists! Skip to STEP 5 (load data).

### If you get "column does not exist"
Run STEP 3 again (`supabase-pre-flight-fixes.sql`).

### If events still don't show
Check RLS policies:
```sql
SELECT * FROM events WHERE status = 'published' LIMIT 5;
```

If this returns rows but the website doesn't show them, re-run `setup-after-schema.sql`.

---

## 📋 FILE EXECUTION ORDER

**Summary of what to run:**

1. ✅ `supabase-schema.sql` - Creates all tables
2. ✅ `supabase-pre-flight-fixes.sql` - Fixes known issues
3. ✅ `setup-after-schema.sql` - Sets up organization & RLS
4. ✅ `load-mikilele-data.sql` - Loads 8 events, 4 passes, 7 courses

**Total time: ~5 minutes**

---

## ✨ YOU'RE DONE WHEN...

- ✅ All 4 SQL scripts executed successfully
- ✅ Vercel deployment shows "Ready"
- ✅ https://groovegrid-seven.vercel.app/events shows events
- ✅ https://groovegrid-seven.vercel.app/passes shows passes

**Then you can start testing signup, portal, and admin features!** 🎉












