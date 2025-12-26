# 🚀 QUICK ACTION GUIDE - DO THIS NOW!

## ⏱️ **STEP 1: WAIT 3 MINUTES**

Vercel is currently deploying your fixes. Check status:
- Go to: https://vercel.com/dashboard
- Find: "groovegrid" project
- Wait for: "Ready" status ✅

---

## 📊 **STEP 2: RUN THIS SQL IN SUPABASE**

**File:** `fix-rls-for-passes-and-enrollments.sql`

1. Open Supabase Dashboard
2. Click "SQL Editor"
3. Copy entire contents of `fix-rls-for-passes-and-enrollments.sql`
4. Click "Run"
5. Should see: "Success. No rows returned" or verification results

**This fixes the 400 errors for passes and enrollments.**

---

## 🧪 **STEP 3: TEST PASS PURCHASE**

### A. Test on Production (Vercel):
1. Go to: `https://groovegrid-seven.vercel.app/passes`
2. Click on any pass
3. Fill in your name and email
4. Click "Purchase"
5. **Complete Stripe payment** (use test card)
6. ✅ **SHOULD NOT SEE UUID ERROR!**
7. Go to: `/portal/passes`
8. ✅ **Your pass should appear!**

### B. Test Locally (if needed):
Same steps as above, but use `http://localhost:3000/passes`

---

## 🎓 **STEP 4: TEST ENROLLMENT**

1. Go to: `/classes`
2. Click "Enroll Now" on any class
3. Fill in name and email
4. See price breakdown
5. Click "Proceed to Payment"
6. Complete Stripe payment
7. ✅ **Should see enrollment in `/portal/courses`**

---

## ✅ **STEP 5: VERIFY IN DATABASE**

Run this in Supabase SQL Editor:

```sql
-- Check recent orders
SELECT * FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check user passes
SELECT * FROM user_passes 
ORDER BY created_at DESC LIMIT 5;

-- Check if pass has your email
SELECT 
  up.*,
  o.buyer_email,
  pt.name as pass_name
FROM user_passes up
JOIN orders o ON o.id = up.order_id
JOIN pass_types pt ON pt.id = up.pass_type_id
ORDER BY up.created_at DESC LIMIT 5;
```

You should see:
- ✅ New order with your email
- ✅ New user_pass record
- ✅ event_id is NULL (not empty string!)

---

## 🐛 **IF STILL SEEING 400 ERRORS:**

### Error: `user_passes 400 Bad Request`

**Quick Fix:** Temporarily disable RLS for testing:
```sql
ALTER TABLE user_passes DISABLE ROW LEVEL SECURITY;
```

Then try pass purchase again. If it works, the issue is RLS policy. Re-enable and fix policies:
```sql
ALTER TABLE user_passes ENABLE ROW LEVEL SECURITY;
-- Then run fix-rls-for-passes-and-enrollments.sql again
```

---

## 📧 **OPTIONAL: ENABLE EMAIL CONFIRMATIONS**

If you want email receipts after purchase:

1. Go to: https://resend.com
2. Get your API key
3. Go to Vercel Dashboard → Settings → Environment Variables
4. Add: `RESEND_API_KEY` = `re_xxxxx`
5. Redeploy Vercel

**Note:** Orders work fine without email, this is optional!

---

## 📋 **TROUBLESHOOTING CHECKLIST**

### Pass Purchase Fails:
- [ ] Did Vercel finish deploying? (Check dashboard)
- [ ] Did you run `fix-rls-for-passes-and-enrollments.sql`?
- [ ] Is `user_passes` table in database? (Check Supabase)
- [ ] Any errors in Vercel logs? (Check Runtime Logs)

### Pass Not Showing in Portal:
- [ ] Did you run RLS fix SQL?
- [ ] Are you logged in with same email used for purchase?
- [ ] Check Vercel logs for webhook errors
- [ ] Try disabling RLS temporarily (see above)

### Enrollment Button Not Working:
- [ ] Check browser console for errors
- [ ] Verify `/api/courses/enroll` exists (should after deployment)
- [ ] Check if `Dialog` component loaded (no React errors)

---

## 🎉 **EXPECTED RESULTS**

After completing all steps above:

✅ Pass purchases work without UUID error  
✅ Passes appear in `/portal/passes`  
✅ Enrollment button opens dialog  
✅ Course enrollment works  
✅ No 400 errors in console  
✅ Orders created in database  
✅ Stripe payments process correctly  

---

## 📞 **STILL STUCK?**

If something doesn't work:

1. **Check Vercel Logs:**
   - Dashboard → Project → Runtime Logs
   - Look for errors after test purchase

2. **Check Browser Console:**
   - F12 → Console tab
   - Copy any red errors

3. **Check Database:**
   - Run verification SQL above
   - Screenshot results

4. **Share with me:**
   - Error messages
   - Which step failed
   - Screenshots of logs

---

**Start with Step 1 (wait for deployment) then Step 2 (run SQL)!** 🚀

