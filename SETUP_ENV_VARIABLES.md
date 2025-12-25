# 🔐 Environment Variables Setup Guide

## 🚨 **CRITICAL: You Need These to Run the App!**

Your app is getting 400 errors from Supabase because environment variables are missing.

---

## **Step 1: Create .env.local File**

Create a file named **`.env.local`** in your project root with this content:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://bmdzerzampxetxmpmihv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Stripe Configuration (REQUIRED)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: AI Course Generation
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY_HERE

# Optional: Email
RESEND_API_KEY=YOUR_RESEND_KEY_HERE
```

---

## **Step 2: Get Your Supabase Keys**

### **Where to Find Them:**

1. Go to: https://supabase.com/dashboard
2. Click your project: **bmdzerzampxetxmpmihv**
3. Click **Settings** (gear icon) → **API**
4. You'll see:

**Project URL:**
```
https://bmdzerzampxetxmpmihv.supabase.co
```

**Project API keys:**
- **anon** / **public** key (starts with `eyJ...`)
- **service_role** key (also starts with `eyJ...` - KEEP SECRET!)

### **Copy These Into .env.local:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://bmdzerzampxetxmpmihv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## **Step 3: Get Your Stripe Keys**

### **Where to Find Them:**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. You'll see:

**Publishable key:**
```
pk_test_...
```

**Secret key:**
```
sk_test_...
```

### **Copy These Into .env.local:**

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

---

## **Step 4: Restart Dev Server**

After creating `.env.local`:

```powershell
# Stop dev server (Ctrl+C)

# Start it again
npm run dev
```

---

## **Step 5: Verify It Works**

1. Go to: http://localhost:3000/admin/passes
2. You should see **"No Pass Types Yet"** (not an error!)
3. This means Supabase is connected! ✅

---

## **Step 6: Add to Vercel**

For production to work:

1. Go to: https://vercel.com/michel-ades-projects/groovegrid
2. Click **Settings** → **Environment Variables**
3. Add these one by one:

| Variable Name | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | https://bmdzerzampxetxmpmihv.supabase.co | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGci... | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJhbGci... | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_test_... | Production |
| `STRIPE_SECRET_KEY` | sk_test_... | Production |
| `NEXT_PUBLIC_BASE_URL` | https://groovegrid-seven.vercel.app | Production |

4. Click **"Save"** for each
5. **Redeploy** your app

---

## **Quick Copy-Paste Template**

Create `.env.local` file with this:

```bash
# Get these values from Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://bmdzerzampxetxmpmihv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Get these from Stripe Dashboard  
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Local dev URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## **Troubleshooting**

### **Error: "Cannot find module"**
- Restart dev server after creating .env.local

### **Error: "Invalid API key"**
- Double-check you copied the full key
- No extra spaces at beginning/end

### **Error: "400 Bad Request from Supabase"**
- Make sure you created the database tables (run supabase-schema.sql)
- Verify anon key is correct

---

**DO THIS NOW:**
1. Create `.env.local` file
2. Add Supabase keys
3. Restart dev server
4. Test http://localhost:3000/admin/passes

**This will fix the 400 errors!** 🚀

