# GrooveGrid - January 2025 Testing Guide

## 🎉 What's Ready to Test

Congratulations! Your GrooveGrid platform is deployed and ready for real-world testing with Mikilele Events. Here's what you can test starting in January.

---

## 🔗 Your Live Platform

- **Live Site**: https://groovegrid-seven.vercel.app
- **Admin Dashboard**: https://groovegrid-seven.vercel.app/admin
- **Login**: https://groovegrid-seven.vercel.app/login

---

## ✅ Completed Features (Ready for January Testing)

### 1. ✅ Authentication & Multi-Tenancy
- Sign up with organization creation
- Login/logout
- Organization switching (for users with multiple orgs)
- Secure authentication with Supabase

**Test It:**
1. Sign up at `/signup` with "Mikilele Events" as your organization
2. Access the admin dashboard at `/admin`

---

### 2. ✅ Dance School Management

#### Class Packages
- Create credit-based packages (5, 10, 20 classes)
- Set pricing and validity periods
- Activate/deactivate packages
- Track package sales

**Test It:**
1. Go to Admin → Packages (`/admin/packages`)
2. Click "New Package"
3. Create a "10-Class Pack" for $150, valid for 90 days
4. View your packages list

#### AI-Powered Course Creation
- Generate comprehensive curriculum using Claude AI
- Weekly lesson plans automatically created
- Learning objectives and prerequisites
- Customizable before publishing

**Test It:**
1. Go to Admin → Courses → Create Course (`/admin/courses/create`)
2. Enter: "Beginner Kizomba Fundamentals", 8 weeks, Beginner level
3. Click "Generate Curriculum with AI"
4. Review and edit the AI-generated content
5. Save the course

**Requirements:** You need an `ANTHROPIC_API_KEY` in your environment variables

#### Course Management
- View all your courses
- Edit course details
- Set course status (draft/published)
- Track enrollment capacity

---

### 3. ✅ Event Management & Ticketing

#### Event Creation
- Create events with full details
- Upload event images to Supabase Storage
- Set venue, date/time, capacity
- Choose event category (Workshop, Social, Festival, etc.)
- Save as draft or publish immediately

**Test It:**
1. Go to Admin → Events → Create Event (`/admin/events/create`)
2. Create a Kizomba Friday Social for January
3. Upload an event image
4. Set venue and capacity
5. Save as "Published"

#### Ticket Type Management
- Add multiple ticket types per event (Early Bird, VIP, General Admission)
- Set individual pricing for each type
- Define quantity available
- Real-time inventory tracking
- Visual progress bars showing sales

**Test It:**
1. After creating an event, go to Edit Event
2. Add ticket types:
   - Early Bird: $25, 30 tickets
   - General Admission: $35, 70 tickets
3. View the ticket sales dashboard

#### Public Event Listing
- Browse all published events
- Filter and search (future enhancement)
- View event details
- See ticket prices and availability

**Test It:**
1. Visit `/events` (public page)
2. Click on your event
3. View the event detail page

#### Guest Checkout with Stripe
- Add tickets to cart
- Enter buyer information (no login required)
- Secure payment processing via Stripe
- Calculate platform fees (2%) and tax (13% HST)
- Redirect to Stripe checkout

**Test It:**
1. Go to a public event page
2. Select ticket quantities
3. Enter your name and email
4. Click "Proceed to Checkout"
5. Complete payment in Stripe (use test cards)

**Stripe Test Card:** `4242 4242 4242 4242`, any future expiry, any CVC

---

## 🚧 In Progress (Next Priority)

### Stripe Webhook Handler
- Process successful payments
- Create order records
- Update ticket quantities sold
- Send confirmation emails

**Status:** Code structure ready, needs webhook configuration

### Email Confirmations (Resend)
- Order confirmation emails
- Ticket emails with QR codes
- Event reminders

**Requirements:** Configure `RESEND_API_KEY` in environment variables

---

## ⏸️ Not Yet Implemented (Future Phases)

### Multi-Event Passes
- Credit-based passes across events
- Monthly/annual pass options
- Pass redemption system

### Marketing Automation
- Email/SMS campaigns
- Audience segmentation
- Campaign analytics

### Analytics Dashboards
- Sales reporting
- Revenue tracking
- Campaign performance

### Customer Portal
- View purchased tickets
- Manage passes
- See class enrollments

---

## 📋 January Testing Checklist

### Week 1-2: School Management Testing
- [ ] Create at least 2 class packages
- [ ] Generate AI curriculum for "Beginner Kizomba"
- [ ] Test course creation workflow
- [ ] Review AI-generated lesson plans
- [ ] Create "Intermediate Semba" course manually

### Week 3-4: Event & Ticketing Testing
- [ ] Create your first real Mikilele event for late January
- [ ] Upload an attractive event image
- [ ] Set up 2-3 ticket types (Early Bird, General)
- [ ] Publish the event
- [ ] Test the public event page
- [ ] Complete a test purchase using Stripe test mode
- [ ] Verify checkout flow works smoothly

### Week 5: Multi-Event Passes (if implemented)
- [ ] Create a monthly pass type
- [ ] Test pass purchase
- [ ] Verify credit tracking

---

## 🐛 Known Issues & Workarounds

### Issue 1: Email Confirmation Loop
**Problem:** Email verification can cause login issues
**Workaround:** Disable email confirmation in Supabase (Authentication → Providers → Email → Toggle OFF "Confirm email")

### Issue 2: RLS Infinite Recursion
**Problem:** Organization_members policies can cause recursion
**Solution:** Run `supabase-fix-rls.sql` in Supabase SQL Editor (already created in your repo)

### Issue 3: Webhook Not Processing Orders
**Problem:** Orders won't complete without webhook handler
**Temporary Solution:** Manually update `ticket_types.quantity_sold` in Supabase after test purchases

---

## 🔧 Environment Variables Checklist

Make sure these are set in Vercel:

**Required for Basic Functionality:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `NEXT_PUBLIC_BASE_URL`

**Required for Full Features:**
- ⏸️ `STRIPE_WEBHOOK_SECRET` (for order processing)
- ⏸️ `RESEND_API_KEY` (for email confirmations)
- ✅ `ANTHROPIC_API_KEY` (for AI course generation)
- ⏸️ `TWILIO_*` (for SMS, optional)

---

## 📊 Success Metrics for January

### Target Metrics:
- Create 2-3 real events for Mikilele
- Set up at least 2 courses with AI
- Generate 5-10 test ticket purchases
- Gather UX feedback on event creation flow
- Identify pain points in ticket purchasing

### Questions to Answer:
1. Is the event creation process intuitive?
2. Does the AI generate useful course content?
3. Is the public event page attractive and clear?
4. Is the checkout flow smooth?
5. What features are missing that you need immediately?

---

## 🚀 Next Steps After January Testing

Based on your feedback, we'll prioritize:

1. **Webhook Implementation** - Complete order processing
2. **Email System** - Automated confirmations with QR codes
3. **Customer Portal** - View tickets and manage purchases
4. **Multi-Event Passes** - Build loyalty system
5. **Marketing Automation** - Campaigns and segmentation
6. **Analytics** - Sales and revenue dashboards

---

## 💡 Pro Tips

1. **Test in Stripe Test Mode First**: Use test cards to verify everything works before going live
2. **Start with Draft Events**: Create events as drafts, add all details, then publish
3. **Use Real Photos**: Upload professional event images for better conversion
4. **Test Mobile Experience**: Most ticket buyers will use mobile phones
5. **Gather Feedback**: Ask beta testers (your friends) to try the checkout flow

---

## 🆘 Getting Help

If you encounter issues:

1. **Check Vercel Logs**: Vercel Dashboard → Your Project → Logs
2. **Check Supabase Logs**: Supabase Dashboard → Logs
3. **Verify Environment Variables**: Vercel → Settings → Environment Variables
4. **Review RLS Policies**: Make sure `supabase-fix-rls.sql` was run

---

## 📅 February Beta Cohort Preparation

Once you've tested with Mikilele Events in January, we'll be ready to onboard your first 2 beta organizers in February. Key preparation:

1. Document any issues you encountered
2. Create a list of "must-have" improvements
3. Identify the killer features that worked great
4. Prepare onboarding materials (screenshots, tutorials)
5. Plan concierge onboarding sessions

---

**You're ready to start testing! 🎉**

Create your first Mikilele event and let the testing begin!

