# 🎯 Loading Mikilele Events Data - Complete Guide

## 📋 Overview

This guide will help you load all the real Mikilele Events data into your GrooveGrid application, including:
- ✅ Organization setup
- ✅ 8 Events (January - July 2026)
- ✅ 4 Pass Types
- ✅ 5 Dance Courses
- ✅ 5 Class Packages

---

## 🚀 Step 1: Get Your User ID

Before running the SQL script, you need your Supabase user ID.

### Option A: Via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/bmdzerzampxetxmpmihv
2. Click **Authentication** → **Users**
3. Find your user: `michel.adedokun@outlook.com`
4. Click on it
5. Copy the **UUID** (looks like: `a1b2c3d4-...`)

### Option B: Via SQL Query

1. Go to **SQL Editor** in Supabase
2. Run this query:

```sql
SELECT id, email FROM auth.users WHERE email = 'michel.adedokun@outlook.com';
```

3. Copy the `id` value

---

## 🔧 Step 2: Fix Schema Issues (IMPORTANT!)

Before loading data, we need to fix two schema issues:

1. **Go to Supabase SQL Editor:**
   - https://supabase.com/dashboard/project/bmdzerzampxetxmpmihv/sql

2. **Run Pre-Flight Fixes:**
   - Open file: `supabase-pre-flight-fixes.sql`
   - Copy **ALL content**
   - Paste into SQL Editor
   - Click **"Run"**
   - Should see: "✅ Schema fixes applied successfully!"

**What this fixes:**
- ✅ Adds `sort_order` column to `pass_types` table
- ✅ Allows NULL `credits` in `class_packages` table (for unlimited packages)

---

## 📝 Step 3: Update the SQL Script

1. Open the file: `load-mikilele-data.sql`
2. Find line 33 (search for `'YOUR_USER_ID'`)
3. Replace it with your actual user ID:

```sql
-- BEFORE:
  'YOUR_USER_ID', -- REPLACE THIS!

-- AFTER (example):
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
```

---

## 🎬 Step 4: Run the SQL Script

1. **Go to Supabase SQL Editor:**
   - https://supabase.com/dashboard/project/bmdzerzampxetxmpmihv/sql

2. **Open New Query:**
   - Click "+ New Query"

3. **Copy & Paste:**
   - Open `load-mikilele-data.sql`
   - Copy **ALL content** (make sure you updated YOUR_USER_ID!)
   - Paste into SQL Editor

4. **Run the Query:**
   - Click **"Run"** button
   - Wait for completion (5-10 seconds)

5. **Verify Success:**
   - You should see a success message with counts:
     ```
     status: "Data loaded successfully!"
     events_count: 8
     pass_types_count: 4
     courses_count: 5
     packages_count: 5
     ```

---

## ✅ Step 5: Verify Data in Your App

### Test Events:

1. Go to: http://localhost:3000/admin/events
2. You should see **8 events**:
   - Mikilele SBK Soirée - January 2026
   - Ambiance Mikilele - January 2026
   - Mikilele SBK Soirée - February 2026
   - Mikilele SBK Soirée - March 2026
   - Mikilele SBK Soirée - April 2026
   - Mikilele SBK Soirée - May 2026
   - Mikilele SBK Soirée - June 2026
   - Mikilele SBK Soirée - July 2026

### Test Pass Types:

1. Go to: http://localhost:3000/admin/passes
2. You should see **4 pass types**:
   - Single Event Pass ($15)
   - 5-Event Pass ($60)
   - 10-Event Pass ($110)
   - Monthly All-Access Pass ($45)

### Test Courses:

1. Go to: http://localhost:3000/admin/courses
2. You should see **5 courses**:
   - Semba Fundamentals - Beginner Level
   - Kizomba Essentials - Beginner Level
   - Semba Intermediate Techniques
   - Kizomba Urban & Tarraxinha
   - Semba & Kizomba Intensive Workshop

### Test Class Packages:

1. Go to: http://localhost:3000/admin/packages
2. You should see **5 packages**:
   - Single Drop-In Class ($18)
   - 5-Class Package ($75)
   - 10-Class Package ($135)
   - 20-Class Package ($250)
   - Monthly Unlimited ($200)

---

## 🎨 Step 6: Add Event Images (Optional)

Your events are now loaded, but they don't have poster images yet. You can add them:

### Option 1: Upload Images

1. Go to each event: http://localhost:3000/admin/events
2. Click **"Edit"** on an event
3. Scroll to **"Event Poster / Image"** section
4. Click **"Upload Image"**
5. Select your poster image
6. Click **"Save Changes"**

### Option 2: Use Image URLs

1. Go to event edit page
2. In the **"Event Poster / Image"** section
3. Paste an image URL in the text field
4. Click **"Save Changes"**

**Recommended Image Size:** 1200x630px (Facebook event cover size)

---

## 📤 Bonus: Bulk Import/Export

You can now also use the bulk import/export feature!

### Export Your Data:

1. Go to: http://localhost:3000/admin/bulk-upload
2. Click **"Export Events (JSON)"** or any other export button
3. This downloads a JSON file you can use as a template

### Import Additional Data:

1. Create or edit a JSON file with your data
2. Go to: http://localhost:3000/admin/bulk-upload
3. Click **"Import"** for the data type
4. Select your JSON file
5. Review the import results

---

## 🐛 Troubleshooting

### Error: "User ID not found"

**Solution:** Make sure you replaced `'YOUR_USER_ID'` with your actual UUID from Step 1.

### Error: "Organization already exists"

**Solution:** This is fine! The script uses `ON CONFLICT DO UPDATE` to update existing data.

### Error: "Policy violation" or "Permission denied"

**Solution:** Make sure you're logged in as `michel.adedokun@outlook.com` and that you ran the `supabase-schema.sql` first.

### Events not showing up

**Solution:** 
1. Check if you're logged in
2. Verify the organization ID matches: `e110e5e0-c320-4c84-a155-ebf567f7585a`
3. Run this query to check:
   ```sql
   SELECT COUNT(*) FROM events WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
   ```

### Need to reload data

If you want to clear and reload:

```sql
-- Clear all data for Mikilele Events
DELETE FROM ticket_types WHERE event_id IN (
  SELECT id FROM events WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a'
);
DELETE FROM events WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
DELETE FROM pass_types WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
DELETE FROM courses WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';
DELETE FROM class_packages WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a';

-- Then run load-mikilele-data.sql again
```

---

## 📊 What's Next?

After loading your data:

1. ✅ **Add Event Images** - Make your events look professional
2. ✅ **Test Ticket Purchasing** - Go to public event pages and test checkout
3. ✅ **Configure Stripe** - Set up payment processing
4. ✅ **Test Pass System** - Purchase and use multi-event passes
5. ✅ **Create Marketing Campaigns** - Use the audience segmentation tools
6. ✅ **Deploy to Production** - Push to Vercel when ready

---

## 🎉 Success Checklist

- [ ] User ID updated in SQL script
- [ ] SQL script run successfully
- [ ] 8 events visible in admin panel
- [ ] 4 pass types visible in admin panel
- [ ] 5 courses visible in admin panel
- [ ] 5 class packages visible in admin panel
- [ ] Event images added (optional)
- [ ] Tested public event pages
- [ ] Tested bulk import/export

**Congratulations! Your Mikilele Events data is now loaded!** 🎊

---

## 💡 Pro Tips

1. **Use Bulk Export as Templates**: Export your data to create templates for future events
2. **Duplicate Events**: Edit existing events and save as new to quickly create similar events
3. **Consistent Naming**: Keep event titles consistent for better organization
4. **Update Venues**: Don't forget to update "TBD" venues once confirmed
5. **Early Bird Deadlines**: Set sale_end_date for early bird tickets

---

Need help? Check the other guide files or create an issue in your repository!

