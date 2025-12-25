# 🔧 Comprehensive Fix for 404 Errors

## ✅ **Current Status**

Your local dev server is running on: **http://localhost:3001**
(Port 3000 was in use, so Next.js automatically switched to 3001)

---

## 🎯 **COMPLETE FIX - Follow These Steps Exactly**

### **STEP 1: Clear Next.js Cache (Critical!)**

New pages aren't detected until you clear the cache.

**On Windows PowerShell:**
```powershell
# Stop the current dev server first (Ctrl+C in the terminal where it's running)

# Then delete .next folder
Remove-Item -Recurse -Force .next

# Delete node_modules/.cache if it exists
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

# Restart dev server
npm run dev
```

**On Command Prompt:**
```cmd
rmdir /s /q .next
rmdir /s /q node_modules\.cache
npm run dev
```

---

### **STEP 2: Test Locally First**

After clearing cache and restarting, test these URLs:

1. **Dashboard:** http://localhost:3001/admin
2. **Passes:** http://localhost:3001/admin/passes
3. **Campaigns:** http://localhost:3001/admin/campaigns
4. **Sales:** http://localhost:3001/admin/sales
5. **Enrollments:** http://localhost:3001/admin/enrollments
6. **Settings:** http://localhost:3001/admin/settings
7. **Billing:** http://localhost:3001/admin/billing

**Expected Result:** All pages should load (might show "Coming Soon" for placeholder pages, but NO 404 errors)

---

### **STEP 3: Fix Vercel Deployment**

Once local works, fix Vercel:

#### **Option A: Clear Vercel Build Cache (Recommended)**

1. Go to Vercel Dashboard: https://vercel.com/your-project
2. Click **Settings** → **General**
3. Scroll down to **"Build & Development Settings"**
4. Find **"Clear Build Cache"** button
5. Click it
6. Go to **Deployments** tab
7. Click **"Redeploy"** on the latest deployment
8. Select **"Use existing Build Cache: OFF"**
9. Click **"Redeploy"**

#### **Option B: Force Rebuild via Git**

If Option A doesn't work:

```bash
# Create a trivial change to force rebuild
git commit --allow-empty -m "Force rebuild - clear cache"
git push
```

---

### **STEP 4: Wait for Vercel Build (3-5 minutes)**

**Check Build Logs:**
1. Go to **Vercel** → **Deployments**
2. Click on the latest deployment
3. Click **"Building"** to see logs
4. Look for **"✓ Compiled successfully"** 
5. Should see **NO red errors**

---

### **STEP 5: Clear Browser Cache**

After Vercel deployment succeeds:

**Hard Refresh:**
- **Windows:** `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

**Or Clear Cache:**
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select **"Empty Cache and Hard Reload"**

---

## 🐛 **Common Issues & Fixes**

### **Issue 1: "Port 3000 is in use"**

**Solution:** Dev server will automatically use port 3001 or 3002. Just use that port.

To free port 3000:
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F
```

---

### **Issue 2: "Module not found" errors**

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

---

### **Issue 3: Pages still 404 after cache clear**

**Solution:** Check if pages have correct structure:

Each page MUST have:
```typescript
export default function PageName() {
  return (
    <div>Page content</div>
  );
}
```

**Verify structure:**
```bash
# Check if page files exist
ls app/admin/passes/page.tsx
ls app/admin/campaigns/page.tsx
ls app/admin/sales/page.tsx
```

---

### **Issue 4: Vercel build fails**

**Check these:**
1. **TypeScript errors** - Fix any red errors in build logs
2. **Missing imports** - Check all import statements
3. **Environment variables** - Verify all env vars are set in Vercel

**Required Env Vars in Vercel:**
```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_BASE_URL
```

---

### **Issue 5: Browser shows old cached version**

**Solution:**
1. Open **Incognito/Private window**
2. Test URLs there (no cache)
3. If it works in incognito, it's a cache issue
4. Clear browser cache and cookies

---

## 🔍 **Diagnostic Commands**

Run these to diagnose issues:

```bash
# Check if files exist
ls app/admin/

# Verify Next.js version
npm list next

# Check for TypeScript errors
npx tsc --noEmit

# Build locally to see errors
npm run build
```

---

## ✅ **Success Checklist**

- [ ] Cleared `.next` folder
- [ ] Restarted dev server
- [ ] All pages load on localhost (3001)
- [ ] Cleared Vercel build cache
- [ ] Redeployed on Vercel
- [ ] Build succeeded (green checkmark)
- [ ] Hard refreshed browser
- [ ] All pages work on production

---

## 🆘 **If Nothing Works**

**Nuclear Option - Complete Reset:**

```bash
# Stop dev server (Ctrl+C)

# Delete all caches
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next

# Reinstall everything
npm install --legacy-peer-deps

# Rebuild
npm run build

# If build succeeds, run dev
npm run dev
```

---

## 📊 **Current File Structure (Should Match This)**

```
app/
├── admin/
│   ├── billing/
│   │   └── page.tsx ✅
│   ├── bulk-upload/
│   │   └── page.tsx ✅
│   ├── campaigns/
│   │   ├── [id]/
│   │   │   └── analytics/
│   │   │       └── page.tsx ✅
│   │   ├── create/
│   │   │   └── page.tsx ✅
│   │   ├── segments/
│   │   │   └── page.tsx ✅
│   │   └── page.tsx ✅
│   ├── enrollments/
│   │   └── page.tsx ✅
│   ├── passes/
│   │   └── page.tsx ✅
│   ├── sales/
│   │   └── page.tsx ✅
│   └── settings/
│       └── page.tsx ✅
```

---

## 🎯 **Next Steps After Fix**

Once everything works:

1. **Test Core Features:**
   - Create an event
   - Add ticket types
   - Create a pass type
   - View sales dashboard

2. **Configure Stripe Webhook:**
   - See `STRIPE_WEBHOOK_SETUP.md`
   - Add webhook to Stripe dashboard
   - Test with a purchase

3. **Start January Testing:**
   - See `JANUARY_TESTING_GUIDE.md`
   - Create real Mikilele events
   - Test with real customers

---

## 💡 **Pro Tips**

1. **Always clear cache after adding new pages**
2. **Test locally before deploying to Vercel**
3. **Use incognito mode to test without cache**
4. **Check Vercel logs for deployment errors**
5. **Hard refresh browser after deployments**

---

**Status:** Ready to fix! Follow STEP 1 above to start. 🚀

