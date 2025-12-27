# 👥 Client vs Organizer Signup & Login Guide

## 🎯 **Overview**

GrooveGrid now has **TWO user types**:

1. **Dance Enthusiasts (Clients)** - Buy tickets, enroll in classes, view their purchases
2. **Event Organizers** - Manage events, classes, sales, marketing

---

## ✅ **How It Works**

### **Signup Page** (`/signup`)

When users visit the signup page, they see a choice:

```
┌─────────────────────────────────────┐
│     I am a...                       │
├──────────────────┬──────────────────┤
│ Dance Enthusiast │ Event Organizer  │
│ Buy tickets      │ Manage events    │
│ Enroll in classes│ Classes, sales   │
└──────────────────┴──────────────────┘
```

**For Dance Enthusiasts (Clients):**
- Enter: Full Name, Email, Password
- Click "Create Account"
- Redirected to: `/portal` (Client Dashboard)

**For Event Organizers:**
- Enter: Full Name, Email, Password
- Enter: Organization Name, Subdomain
- Click "Create Account"
- Organization is automatically created
- User is set as "owner" role
- Redirected to: `/admin` (Admin Dashboard)

---

### **Login Page** (`/login`)

When users login:

1. Enter email & password
2. System checks if user has an organization membership
3. **If YES** → Redirect to `/admin` (Organizer)
4. **If NO** → Redirect to `/portal` (Client)

**Simple!** No need to choose user type on login.

---

## 🎨 **What Users See**

### **Client Signup Flow:**

1. **Select "Dance Enthusiast"**
   ```
   ✓ Full Name: John Doe
   ✓ Email: john@example.com
   ✓ Password: ••••••••
   ✓ Confirm Password: ••••••••
   ```

2. **Click "Create Account"**

3. **Redirected to `/portal`**
   - See purchased tickets
   - View enrolled classes
   - Browse upcoming events
   - Purchase passes

---

### **Organizer Signup Flow:**

1. **Select "Event Organizer"**
   ```
   ✓ Full Name: Jane Smith
   ✓ Email: jane@example.com
   ✓ Organization Name: Ottawa Kizomba
   ✓ Subdomain: ottawa-kizomba
   ✓ Password: ••••••••
   ✓ Confirm Password: ••••••••
   ```

2. **Click "Create Account"**

3. **Organization is created:**
   - Name: "Ottawa Kizomba"
   - URL: ottawa-kizomba.groovegrid.com
   - Jane is set as "owner"

4. **Redirected to `/admin`**
   - Create events
   - Manage classes
   - View sales
   - Marketing tools

---

## 🔐 **Database Changes**

### **User Metadata** (stored in `auth.users.raw_user_meta_data`):
```json
{
  "full_name": "John Doe",
  "user_type": "client" // or "organizer"
}
```

### **Organization Membership:**
- **Clients:** NO entry in `organization_members` table
- **Organizers:** Entry in `organization_members` with role = 'owner'

---

## 🛣️ **Routing Logic**

### **After Signup:**
```typescript
if (userType === 'organizer') {
  // Create organization
  // Add user to organization_members
  router.push('/admin');
} else {
  // Just create user account
  router.push('/portal');
}
```

### **After Login:**
```typescript
// Check if user has organization membership
const membership = await supabase
  .from('organization_members')
  .select('id')
  .eq('user_id', user.id)
  .maybeSingle();

if (membership) {
  router.push('/admin'); // Organizer
} else {
  router.push('/portal'); // Client
}
```

---

## 📊 **Feature Access**

### **Clients Can:**
- ✅ View public events (`/events`)
- ✅ View public passes (`/passes`)
- ✅ View public classes (`/classes`)
- ✅ Purchase tickets
- ✅ Purchase passes
- ✅ Enroll in courses
- ✅ Access client portal (`/portal`)
- ✅ View their purchases
- ❌ Cannot access `/admin` pages

### **Organizers Can:**
- ✅ Everything clients can do
- ✅ Access admin dashboard (`/admin`)
- ✅ Create & manage events
- ✅ Create & manage passes
- ✅ Create & manage courses
- ✅ View sales & analytics
- ✅ Run marketing campaigns
- ✅ Manage enrollments
- ✅ View billing & revenue
- ✅ Configure settings

---

## 🎯 **Testing the Feature**

### **Test 1: Client Signup**
1. Go to http://localhost:3000/signup
2. Select "Dance Enthusiast"
3. Fill in: Name, Email, Password
4. Click "Create Account"
5. **Should redirect to** `/portal`
6. **Should NOT see** admin menu items

### **Test 2: Organizer Signup**
1. Go to http://localhost:3000/signup
2. Select "Event Organizer"
3. Fill in: Name, Email, Organization Name, Subdomain, Password
4. Click "Create Account"
5. **Should redirect to** `/admin`
6. **Should see** admin dashboard with stats

### **Test 3: Client Login**
1. Create a client account (Dance Enthusiast)
2. Logout
3. Go to http://localhost:3000/login
4. Login with client credentials
5. **Should redirect to** `/portal`

### **Test 4: Organizer Login**
1. Login with organizer credentials (e.g., michel.adedokun@outlook.com)
2. **Should redirect to** `/admin`
3. **Should see** organization name in header

---

## 💡 **User Experience**

### **Signup Page UI:**

```
┌────────────────────────────────────────┐
│     Create Your Account                │
│                                        │
│     I am a...                          │
│  ┌──────────────┬──────────────┐      │
│  │Dance         │Event          │      │
│  │Enthusiast    │Organizer      │      │
│  │Buy tickets   │Manage events  │      │
│  └──────────────┴──────────────┘      │
│                                        │
│  Full Name: [____________]             │
│  Email:     [____________]             │
│                                        │
│  [IF ORGANIZER SELECTED:]              │
│  Organization: [____________]          │
│  Subdomain:    [____].groovegrid.com   │
│                                        │
│  Password:     [____________]          │
│  Confirm:      [____________]          │
│                                        │
│  [Create Account]                      │
│                                        │
│  Already have an account? Sign in      │
└────────────────────────────────────────┘
```

### **Dynamic Description:**
- **Client selected:** "Join the community and discover amazing dance events"
- **Organizer selected:** "Start managing your dance events and school today"

---

## 🔧 **Technical Implementation**

### **Files Modified:**

1. **`app/(auth)/signup/page.tsx`**
   - Added `userType` state ('client' | 'organizer')
   - Added user type selector buttons
   - Made organization fields conditional
   - Added `fullName` field
   - Updated signup logic to handle both types
   - Different redirects based on user type

2. **`app/(auth)/login/page.tsx`**
   - Added organization membership check
   - Smart redirect based on user type
   - Updated description to be neutral

---

## 🎊 **Benefits**

### **For Your Business:**
- ✅ Clear separation of user types
- ✅ Simpler onboarding for clients
- ✅ Clients don't need to create organizations
- ✅ Better user experience
- ✅ More sign-ups (less friction)

### **For Clients:**
- ✅ Quick signup (3 fields only)
- ✅ No confusion about "organization"
- ✅ Immediate access to events

### **For Organizers:**
- ✅ Full organization setup in one step
- ✅ Immediate access to admin tools
- ✅ Professional onboarding

---

## 🐛 **Troubleshooting**

### **Issue: Client sees /admin pages**
**Solution:** Check if they accidentally have an organization membership:
```sql
SELECT * FROM organization_members WHERE user_id = 'user-id';
-- Should be empty for clients
```

### **Issue: Organizer redirected to /portal**
**Solution:** Check if organization was created:
```sql
SELECT * FROM organization_members WHERE user_id = 'user-id';
-- Should have a row with role = 'owner'
```

### **Issue: Organization fields not showing**
**Solution:** Make sure you're clicking "Event Organizer" button

---

## 🚀 **Next Steps**

Now that you have client/organizer separation:

1. ✅ **Test both signup flows**
2. ✅ **Test both login redirects**
3. 🎨 **Add more features to `/portal`**
   - Purchase history
   - Upcoming events
   - Class schedule
4. 🎨 **Enhance client experience**
   - Personalized recommendations
   - Saved favorites
   - Email notifications

---

## 📝 **Example Scenarios**

### **Scenario 1: Dance Student**
- Maria wants to take Kizomba classes
- Goes to `/signup`, selects "Dance Enthusiast"
- Creates account in 30 seconds
- Goes to `/classes`, enrolls in course
- Views her enrollment in `/portal`

### **Scenario 2: Event Organizer**
- John runs "Toronto Salsa Events"
- Goes to `/signup`, selects "Event Organizer"
- Creates organization "Toronto Salsa"
- Subdomain: `toronto-salsa.groovegrid.com`
- Immediately starts creating events in `/admin/events`

### **Scenario 3: Existing User**
- Sarah already has client account
- Decides to become an organizer
- **Option 1:** Create new organizer account
- **Option 2:** We can add upgrade flow later

---

## ✅ **Success Checklist**

- [x] User type selector on signup page
- [x] Conditional organization fields
- [x] Full name field added
- [x] Client signup redirects to `/portal`
- [x] Organizer signup redirects to `/admin`
- [x] Login checks organization membership
- [x] Smart redirect on login
- [x] User metadata stores user type
- [x] Organization auto-created for organizers
- [x] Owner role assigned automatically

---

## 🎉 **You're Done!**

Your platform now supports:
- ✅ **Two user types** (Client & Organizer)
- ✅ **Smart routing** (Portal vs Admin)
- ✅ **Easy signup** for both types
- ✅ **Automatic redirect** based on user type

**Test it out and watch it work!** 🚀

---

**Last Updated:** December 25, 2025  
**Status:** Production Ready  
**Feature:** Client/Organizer Separation COMPLETE ✅













## 🎯 **Overview**

GrooveGrid now has **TWO user types**:

1. **Dance Enthusiasts (Clients)** - Buy tickets, enroll in classes, view their purchases
2. **Event Organizers** - Manage events, classes, sales, marketing

---

## ✅ **How It Works**

### **Signup Page** (`/signup`)

When users visit the signup page, they see a choice:

```
┌─────────────────────────────────────┐
│     I am a...                       │
├──────────────────┬──────────────────┤
│ Dance Enthusiast │ Event Organizer  │
│ Buy tickets      │ Manage events    │
│ Enroll in classes│ Classes, sales   │
└──────────────────┴──────────────────┘
```

**For Dance Enthusiasts (Clients):**
- Enter: Full Name, Email, Password
- Click "Create Account"
- Redirected to: `/portal` (Client Dashboard)

**For Event Organizers:**
- Enter: Full Name, Email, Password
- Enter: Organization Name, Subdomain
- Click "Create Account"
- Organization is automatically created
- User is set as "owner" role
- Redirected to: `/admin` (Admin Dashboard)

---

### **Login Page** (`/login`)

When users login:

1. Enter email & password
2. System checks if user has an organization membership
3. **If YES** → Redirect to `/admin` (Organizer)
4. **If NO** → Redirect to `/portal` (Client)

**Simple!** No need to choose user type on login.

---

## 🎨 **What Users See**

### **Client Signup Flow:**

1. **Select "Dance Enthusiast"**
   ```
   ✓ Full Name: John Doe
   ✓ Email: john@example.com
   ✓ Password: ••••••••
   ✓ Confirm Password: ••••••••
   ```

2. **Click "Create Account"**

3. **Redirected to `/portal`**
   - See purchased tickets
   - View enrolled classes
   - Browse upcoming events
   - Purchase passes

---

### **Organizer Signup Flow:**

1. **Select "Event Organizer"**
   ```
   ✓ Full Name: Jane Smith
   ✓ Email: jane@example.com
   ✓ Organization Name: Ottawa Kizomba
   ✓ Subdomain: ottawa-kizomba
   ✓ Password: ••••••••
   ✓ Confirm Password: ••••••••
   ```

2. **Click "Create Account"**

3. **Organization is created:**
   - Name: "Ottawa Kizomba"
   - URL: ottawa-kizomba.groovegrid.com
   - Jane is set as "owner"

4. **Redirected to `/admin`**
   - Create events
   - Manage classes
   - View sales
   - Marketing tools

---

## 🔐 **Database Changes**

### **User Metadata** (stored in `auth.users.raw_user_meta_data`):
```json
{
  "full_name": "John Doe",
  "user_type": "client" // or "organizer"
}
```

### **Organization Membership:**
- **Clients:** NO entry in `organization_members` table
- **Organizers:** Entry in `organization_members` with role = 'owner'

---

## 🛣️ **Routing Logic**

### **After Signup:**
```typescript
if (userType === 'organizer') {
  // Create organization
  // Add user to organization_members
  router.push('/admin');
} else {
  // Just create user account
  router.push('/portal');
}
```

### **After Login:**
```typescript
// Check if user has organization membership
const membership = await supabase
  .from('organization_members')
  .select('id')
  .eq('user_id', user.id)
  .maybeSingle();

if (membership) {
  router.push('/admin'); // Organizer
} else {
  router.push('/portal'); // Client
}
```

---

## 📊 **Feature Access**

### **Clients Can:**
- ✅ View public events (`/events`)
- ✅ View public passes (`/passes`)
- ✅ View public classes (`/classes`)
- ✅ Purchase tickets
- ✅ Purchase passes
- ✅ Enroll in courses
- ✅ Access client portal (`/portal`)
- ✅ View their purchases
- ❌ Cannot access `/admin` pages

### **Organizers Can:**
- ✅ Everything clients can do
- ✅ Access admin dashboard (`/admin`)
- ✅ Create & manage events
- ✅ Create & manage passes
- ✅ Create & manage courses
- ✅ View sales & analytics
- ✅ Run marketing campaigns
- ✅ Manage enrollments
- ✅ View billing & revenue
- ✅ Configure settings

---

## 🎯 **Testing the Feature**

### **Test 1: Client Signup**
1. Go to http://localhost:3000/signup
2. Select "Dance Enthusiast"
3. Fill in: Name, Email, Password
4. Click "Create Account"
5. **Should redirect to** `/portal`
6. **Should NOT see** admin menu items

### **Test 2: Organizer Signup**
1. Go to http://localhost:3000/signup
2. Select "Event Organizer"
3. Fill in: Name, Email, Organization Name, Subdomain, Password
4. Click "Create Account"
5. **Should redirect to** `/admin`
6. **Should see** admin dashboard with stats

### **Test 3: Client Login**
1. Create a client account (Dance Enthusiast)
2. Logout
3. Go to http://localhost:3000/login
4. Login with client credentials
5. **Should redirect to** `/portal`

### **Test 4: Organizer Login**
1. Login with organizer credentials (e.g., michel.adedokun@outlook.com)
2. **Should redirect to** `/admin`
3. **Should see** organization name in header

---

## 💡 **User Experience**

### **Signup Page UI:**

```
┌────────────────────────────────────────┐
│     Create Your Account                │
│                                        │
│     I am a...                          │
│  ┌──────────────┬──────────────┐      │
│  │Dance         │Event          │      │
│  │Enthusiast    │Organizer      │      │
│  │Buy tickets   │Manage events  │      │
│  └──────────────┴──────────────┘      │
│                                        │
│  Full Name: [____________]             │
│  Email:     [____________]             │
│                                        │
│  [IF ORGANIZER SELECTED:]              │
│  Organization: [____________]          │
│  Subdomain:    [____].groovegrid.com   │
│                                        │
│  Password:     [____________]          │
│  Confirm:      [____________]          │
│                                        │
│  [Create Account]                      │
│                                        │
│  Already have an account? Sign in      │
└────────────────────────────────────────┘
```

### **Dynamic Description:**
- **Client selected:** "Join the community and discover amazing dance events"
- **Organizer selected:** "Start managing your dance events and school today"

---

## 🔧 **Technical Implementation**

### **Files Modified:**

1. **`app/(auth)/signup/page.tsx`**
   - Added `userType` state ('client' | 'organizer')
   - Added user type selector buttons
   - Made organization fields conditional
   - Added `fullName` field
   - Updated signup logic to handle both types
   - Different redirects based on user type

2. **`app/(auth)/login/page.tsx`**
   - Added organization membership check
   - Smart redirect based on user type
   - Updated description to be neutral

---

## 🎊 **Benefits**

### **For Your Business:**
- ✅ Clear separation of user types
- ✅ Simpler onboarding for clients
- ✅ Clients don't need to create organizations
- ✅ Better user experience
- ✅ More sign-ups (less friction)

### **For Clients:**
- ✅ Quick signup (3 fields only)
- ✅ No confusion about "organization"
- ✅ Immediate access to events

### **For Organizers:**
- ✅ Full organization setup in one step
- ✅ Immediate access to admin tools
- ✅ Professional onboarding

---

## 🐛 **Troubleshooting**

### **Issue: Client sees /admin pages**
**Solution:** Check if they accidentally have an organization membership:
```sql
SELECT * FROM organization_members WHERE user_id = 'user-id';
-- Should be empty for clients
```

### **Issue: Organizer redirected to /portal**
**Solution:** Check if organization was created:
```sql
SELECT * FROM organization_members WHERE user_id = 'user-id';
-- Should have a row with role = 'owner'
```

### **Issue: Organization fields not showing**
**Solution:** Make sure you're clicking "Event Organizer" button

---

## 🚀 **Next Steps**

Now that you have client/organizer separation:

1. ✅ **Test both signup flows**
2. ✅ **Test both login redirects**
3. 🎨 **Add more features to `/portal`**
   - Purchase history
   - Upcoming events
   - Class schedule
4. 🎨 **Enhance client experience**
   - Personalized recommendations
   - Saved favorites
   - Email notifications

---

## 📝 **Example Scenarios**

### **Scenario 1: Dance Student**
- Maria wants to take Kizomba classes
- Goes to `/signup`, selects "Dance Enthusiast"
- Creates account in 30 seconds
- Goes to `/classes`, enrolls in course
- Views her enrollment in `/portal`

### **Scenario 2: Event Organizer**
- John runs "Toronto Salsa Events"
- Goes to `/signup`, selects "Event Organizer"
- Creates organization "Toronto Salsa"
- Subdomain: `toronto-salsa.groovegrid.com`
- Immediately starts creating events in `/admin/events`

### **Scenario 3: Existing User**
- Sarah already has client account
- Decides to become an organizer
- **Option 1:** Create new organizer account
- **Option 2:** We can add upgrade flow later

---

## ✅ **Success Checklist**

- [x] User type selector on signup page
- [x] Conditional organization fields
- [x] Full name field added
- [x] Client signup redirects to `/portal`
- [x] Organizer signup redirects to `/admin`
- [x] Login checks organization membership
- [x] Smart redirect on login
- [x] User metadata stores user type
- [x] Organization auto-created for organizers
- [x] Owner role assigned automatically

---

## 🎉 **You're Done!**

Your platform now supports:
- ✅ **Two user types** (Client & Organizer)
- ✅ **Smart routing** (Portal vs Admin)
- ✅ **Easy signup** for both types
- ✅ **Automatic redirect** based on user type

**Test it out and watch it work!** 🚀

---

**Last Updated:** December 25, 2025  
**Status:** Production Ready  
**Feature:** Client/Organizer Separation COMPLETE ✅













