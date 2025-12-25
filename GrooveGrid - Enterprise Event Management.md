# GrooveGrid - Enterprise Event Management & Dance School Platform

You are an expert full-stack developer specializing in Next.js 14, TypeScript, Supabase, and modern SaaS architectures. Build GrooveGrid, a comprehensive multi-tenant event management and dance school platform.

## PROJECT OVERVIEW

GrooveGrid is a production-ready SaaS platform combining:
1. Event management with ticketing
2. Dance school administration with AI course generation
3. Marketing automation (Email/SMS/WhatsApp)
4. Multi-event pass system
5. Customer portal

**Tech Stack:**
- Frontend: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- Backend: Supabase (PostgreSQL with Row-Level Security)
- Payments: Stripe
- Email: Resend API
- SMS/WhatsApp: Twilio
- Storage: Supabase Storage
- Deployment: Vercel

## ARCHITECTURE REQUIREMENTS

### 1. PROJECT STRUCTURE
```
groovegrid/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── auth/callback/route.ts
│   │   ├── (public)/
│   │   │   ├── page.tsx                    # Homepage
│   │   │   ├── events/
│   │   │   │   ├── page.tsx                # Events listing
│   │   │   │   └── [id]/page.tsx           # Event details
│   │   │   ├── passes/page.tsx             # Passes listing
│   │   │   └── classes/page.tsx            # Classes listing
│   │   ├── admin/
│   │   │   ├── layout.tsx                  # Admin layout with org switcher
│   │   │   ├── page.tsx                    # Admin dashboard
│   │   │   ├── events/
│   │   │   │   ├── page.tsx                # Events management
│   │   │   │   ├── create/page.tsx
│   │   │   │   ├── [id]/edit/page.tsx      # Event editor with image upload
│   │   │   │   └── ticket-types/
│   │   │   │       ├── page.tsx            # Ticket types management
│   │   │   │       └── create/page.tsx
│   │   │   ├── bulk-upload/page.tsx        # Bulk image upload for events
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx                # Marketing campaigns
│   │   │   │   ├── create/page.tsx
│   │   │   │   ├── segments/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── create/page.tsx
│   │   │   │   └── analytics/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/page.tsx
│   │   │   ├── sales/page.tsx              # Sales dashboard
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx
│   │   │   │   └── create/page.tsx         # AI-powered course creation
│   │   │   └── enrollments/page.tsx
│   │   ├── portal/
│   │   │   ├── layout.tsx                  # Customer portal layout
│   │   │   ├── tickets/page.tsx            # My tickets
│   │   │   ├── passes/page.tsx             # My passes
│   │   │   └── classes/page.tsx            # My classes
│   │   └── api/
│   │       ├── checkout/route.ts           # Stripe checkout
│   │       ├── webhooks/stripe/route.ts    # Stripe webhooks
│   │       ├── campaigns/
│   │       │   ├── execute/route.ts
│   │       │   └── analytics/route.ts
│   │       └── segments/calculate/route.ts
│   ├── components/
│   │   ├── OrganizationSwitcher.tsx
│   │   ├── EventCard.tsx
│   │   ├── TicketTypeForm.tsx
│   │   └── CampaignBuilder.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── stripe.ts
│   │   └── resend.ts
│   └── emails/
│       ├── OrderConfirmation.tsx
│       ├── PassConfirmation.tsx
│       └── ClassPackageConfirmation.tsx
├── public/
├── .env.local
└── package.json
```

### 2. DATABASE SCHEMA (Supabase PostgreSQL)

Create comprehensive database schema with RLS policies:
```sql
-- Organizations (Multi-tenant)
CREATE TABLE organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  country VARCHAR(100),
  logo_url TEXT,
  brand_color VARCHAR(7) DEFAULT '#7C3AED',
  is_active BOOLEAN DEFAULT true,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(100),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  venue_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  country VARCHAR(100),
  capacity INTEGER,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Types
CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  sale_start_date TIMESTAMPTZ,
  sale_end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  max_per_order INTEGER,
  min_per_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  event_id UUID REFERENCES events(id),
  buyer_email VARCHAR(255),
  buyer_name VARCHAR(255),
  buyer_phone VARCHAR(50),
  subtotal DECIMAL(10, 2),
  fees DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  total DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'CAD',
  stripe_payment_intent_id VARCHAR(255),
  stripe_session_id TEXT,
  payment_status VARCHAR(50),
  payment_method VARCHAR(50),
  status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  ticket_type_id UUID REFERENCES ticket_types(id),
  user_id UUID REFERENCES auth.users(id),
  quantity INTEGER DEFAULT 1,
  price_per_ticket DECIMAL(10, 2),
  ticket_name VARCHAR(255),
  event_title VARCHAR(255),
  event_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pass Types
CREATE TABLE pass_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  credits_total INTEGER,
  validity_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Passes
CREATE TABLE user_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pass_type_id UUID REFERENCES pass_types(id),
  order_id UUID,
  credits_remaining INTEGER,
  credits_total INTEGER,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'active',
  stripe_session_id TEXT,
  amount_paid DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  level VARCHAR(50),
  duration_weeks INTEGER,
  start_date DATE,
  end_date DATE,
  schedule_days TEXT[],
  schedule_time TIME,
  max_students INTEGER,
  price DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class Packages
CREATE TABLE class_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  validity_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Packages
CREATE TABLE student_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES class_packages(id),
  credits_remaining INTEGER,
  credits_total INTEGER,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'active',
  stripe_session_id TEXT,
  amount_paid DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  payment_status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  target_revenue DECIMAL(10, 2),
  actual_audience_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Sequences
CREATE TABLE campaign_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  sequence_order INTEGER,
  channel VARCHAR(50),
  delay_minutes INTEGER,
  subject VARCHAR(255),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audience Segments
CREATE TABLE audience_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  segment_type VARCHAR(50),
  filters JSONB,
  estimated_size INTEGER DEFAULT 0,
  is_dynamic BOOLEAN DEFAULT false,
  last_calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Sends
CREATE TABLE campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  channel VARCHAR(50),
  status VARCHAR(50),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  revenue_generated DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**CRITICAL: Implement RLS policies to prevent infinite recursion:**
- Public content (events, tickets, courses, passes): `USING (true)`
- User data (orders, enrollments, passes): `USING (user_id = auth.uid())`
- Organization data: Check organization_members without cross-table lookups
- NO policies should reference admin_users table to avoid recursion

### 3. CORE FEATURES TO IMPLEMENT

#### A. Multi-Tenant Authentication & Organization Management
- Supabase Auth with email/password
- Organization creation and switching
- Organization member management with roles (owner, admin, member)
- RLS policies for multi-tenant data isolation
- OrganizationSwitcher component in admin header

#### B. Event Management System
**Public-facing:**
- Event listing page with filtering (category, date, location)
- Event detail page with ticket selection
- Responsive event cards with images
- Calendar view integration

**Admin:**
- Event CRUD operations
- Event edit page with image upload to Supabase Storage
- Bulk image upload page for multiple events
- Event status management (draft, published, cancelled)
- Event analytics (views, ticket sales, revenue)

#### C. Ticketing System
**Features:**
- Multiple ticket types per event (Early Bird, VIP, General Admission)
- Pricing tiers with sale start/end dates
- Capacity management and inventory tracking
- Real-time availability updates
- Min/max per order limits
- Guest checkout and registered user checkout

**Admin:**
- Ticket type management page with:
  - Create/edit/delete ticket types
  - Toggle active/inactive status
  - Visual progress bars showing % sold
  - Quick stats (price, sold, remaining)
  - Link to edit parent event

**Customer Portal:**
- My Tickets page showing:
  - Upcoming tickets with QR codes
  - Past tickets
  - Download functionality
  - Event details (date, venue, address)

#### D. Stripe Payment Integration
**Checkout:**
- Create Stripe Checkout session
- Handle guest and authenticated users
- Support ticket purchases, pass purchases, class packages
- Collect customer email, name, phone
- Calculate fees and taxes
- Redirect to success/cancel pages

**Webhook Handler (`/api/webhooks/stripe/route.ts`):**
```typescript
- Verify webhook signature
- Handle checkout.session.completed:
  * Create order record
  * Create order_items
  * Update ticket quantities
  * Create user_passes or student_packages
  * Send confirmation emails via Resend
- Handle different purchase types:
  * ticket_purchase
  * pass_purchase  
  * class_package_purchase
- Link orders to users (if authenticated) or mark as guest
```

#### E. Email System (Resend API)
**Email Templates (React Email):**
- OrderConfirmation.tsx
- PassConfirmation.tsx
- ClassPackageConfirmation.tsx
- EnrollmentConfirmation.tsx
- CampaignEmails (dynamic content)

**Sending Logic:**
- Send from webhooks after successful payment
- Include order details, ticket info, QR codes
- Responsive HTML emails
- Track opens and clicks for campaigns

#### F. Multi-Event Pass System
**Pass Types:**
- Single event passes
- Monthly passes
- All-access passes
- Credit-based passes
- Time-limited passes (validity_days)

**Features:**
- Pass purchase flow
- Credit redemption tracking
- Expiry date management
- Pass usage analytics
- Auto-renewal (future)

**Customer Portal:**
- My Passes page showing:
  - Active passes with credit balance
  - Expired passes
  - Progress bars for credit usage
  - Expiry dates

#### G. Dance School Management
**AI-Powered Course Creation:**
- Use Anthropic Claude API to generate:
  - Course curriculum
  - Weekly lesson plans
  - Learning objectives
  - Prerequisites
- Edit and customize AI-generated content
- Save as draft or publish

**Class Packages:**
- Credit-based packages (5, 10, 20 classes)
- Pricing tiers
- Validity periods
- Purchase and redemption tracking

**Enrollment Management:**
- Student enrollment in courses
- Capacity limits
- Waitlist functionality
- Payment tracking
- Enrollment status (active, completed, dropped)

**Customer Portal:**
- My Classes page showing:
  - Current enrollments
  - Class schedule
  - Progress tracking
  - Instructor info

#### H. Marketing Automation Platform
**Campaign Builder:**
- Multi-channel support (Email, SMS, WhatsApp)
- Visual sequence builder
- Delay timing between messages
- Dynamic content with variables
- A/B testing support

**Audience Segmentation:**
- Visual filter builder
- Dynamic segments with auto-recalculation
- Segment types:
  - Predefined (All users, Past attendees)
  - Custom (Advanced filters)
  - Dynamic (Auto-updates)
- Filters:
  - Purchase history (has_purchased, total_spent)
  - Event attendance (total_events_attended)
  - Engagement (email_opens, email_clicks)
  - Pass types
  - Last purchase date
  - Demographics

**Campaign Execution Engine:**
- Queue-based sending system
- Scheduled execution
- Delay handling between sequence steps
- Send via Resend (email) and Twilio (SMS/WhatsApp)
- Error handling and retry logic
- Rate limiting

**Analytics Dashboard:**
- Overall campaign performance
- Individual campaign metrics:
  - Sent, opened, clicked, converted
  - Open rate, click rate, conversion rate
  - Revenue attribution
- Channel breakdown (email vs SMS vs WhatsApp)
- Daily trends chart
- Top-performing campaigns table

#### I. Sales & Analytics Dashboards
**Sales Dashboard:**
- Revenue metrics (total, by period)
- Tickets sold (total, by event)
- Passes sold (total, by type)
- Average order value
- Revenue trend chart (daily/weekly/monthly)
- Top-selling events
- Recent orders list

**Campaign Analytics:**
- Total campaigns (active, draft, completed)
- Messages sent across all channels
- Aggregate open/click/conversion rates
- Total revenue from campaigns
- Recent campaign performance

#### J. Admin Dashboard
**Dashboard Cards:**
- Create Event
- Marketing Campaigns
- Campaign Analytics
- Sales Dashboard
- Ticket Management
- Pass Management
- Course Management
- Enrollments
- Bulk Upload Images

**Navigation:**
- Sidebar or header nav
- Organization switcher
- User menu
- Back to site link

### 4. UI/UX REQUIREMENTS

**Design System:**
- Tailwind CSS for styling
- Color scheme: Purple (#7C3AED) primary, Pink accent
- Responsive design (mobile-first)
- Lucide React icons
- Smooth transitions and hover effects

**Components:**
- EventCard: Image, title, date, venue, ticket button
- TicketTypeCard: Name, price, availability, progress bar
- PassCard: Name, credits, expiry, status badge
- CampaignCard: Name, status, metrics
- StatsCard: Icon, label, value, trend

**Forms:**
- Clear labels and placeholders
- Client-side validation
- Loading states
- Error messages
- Success notifications

**Tables:**
- Sortable columns
- Pagination
- Filters
- Quick actions (edit, delete, toggle)
- Responsive on mobile

### 5. IMPLEMENTATION CHECKLIST

**Phase 1: Foundation (Week 1)**
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Set up Supabase project and configure environment variables
- [ ] Create database schema with all tables
- [ ] Implement RLS policies (avoid infinite recursion)
- [ ] Set up Supabase Auth (login, signup, callback)
- [ ] Create base layouts (public, admin, portal)
- [ ] Implement OrganizationSwitcher component

**Phase 2: Event & Ticketing (Week 2)**
- [ ] Public event listing and detail pages
- [ ] Event CRUD in admin
- [ ] Event edit page with image upload to Supabase Storage
- [ ] Bulk image upload page
- [ ] Ticket type management
- [ ] Stripe checkout integration
- [ ] Stripe webhook handler
- [ ] Order creation and order_items
- [ ] Email confirmation (Resend API)

**Phase 3: Customer Portal (Week 3)**
- [ ] My Tickets page (upcoming/past)
- [ ] My Passes page (active/expired)
- [ ] My Classes page (enrollments)
- [ ] QR code generation
- [ ] Download functionality

**Phase 4: Pass & School Systems (Week 4)**
- [ ] Pass types management
- [ ] Pass purchase flow
- [ ] Credit redemption
- [ ] Course creation with AI (Anthropic Claude API)
- [ ] Class packages
- [ ] Student enrollment
- [ ] My Classes portal page

**Phase 5: Marketing Automation (Week 5)**
- [ ] Campaign creation wizard
- [ ] Campaign sequence builder
- [ ] Audience segmentation with filters
- [ ] Segment calculation engine
- [ ] Campaign execution engine (queue system)
- [ ] Email/SMS/WhatsApp sending
- [ ] Campaign analytics dashboard

**Phase 6: Analytics & Polish (Week 6)**
- [ ] Sales dashboard with charts
- [ ] Campaign analytics
- [ ] Event analytics
- [ ] Testing all flows end-to-end
- [ ] Bug fixes and optimizations
- [ ] Documentation

### 6. ENVIRONMENT VARIABLES
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# Twilio (Optional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_WHATSAPP_NUMBER=whatsapp:+1...

# Anthropic (for AI course generation)
ANTHROPIC_API_KEY=sk-ant-...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 7. CRITICAL IMPLEMENTATION NOTES

**Avoid Common Pitfalls:**
1. **RLS Recursion:** Never have admin_users policies check organization_members and vice versa
2. **Column Names:** Use correct column names from schema (e.g., `expiry_date` not `expires_at`)
3. **User ID Linking:** Always link order_items to user_id (not just orders)
4. **Webhook Security:** Always verify Stripe webhook signatures
5. **Error Handling:** Comprehensive try-catch blocks with user-friendly messages
6. **Loading States:** Show spinners during async operations
7. **Form Validation:** Both client and server-side validation
8. **Image Optimization:** Use Next.js Image component with proper sizing
9. **TypeScript:** Strict mode, no `any` types, proper interfaces
10. **Accessibility:** Proper ARIA labels, keyboard navigation, semantic HTML

**Performance Optimizations:**
- Use React Server Components where possible
- Implement pagination for large lists
- Add database indices on frequently queried columns
- Lazy load images
- Debounce search inputs
- Cache static data

**Security Best Practices:**
- Never expose service role key in client code
- Validate all user inputs
- Use parameterized queries (Supabase handles this)
- Implement rate limiting on API routes
- Sanitize user-generated content
- Use HTTPS in production
- Set appropriate CORS policies

### 8. DEPLOYMENT

**Vercel:**
- Connect GitHub repository
- Set environment variables in Vercel dashboard
- Enable automatic deployments
- Configure custom domain

**Supabase:**
- Enable RLS on all tables
- Set up database backups
- Configure auth email templates
- Enable storage bucket for event-images (public)

**Stripe:**
- Set up webhook endpoint in Stripe dashboard
- Use test mode for development
- Switch to live mode for production

### 9. TESTING CHECKLIST

**User Flows:**
- [ ] User signup and login
- [ ] Browse events and view details
- [ ] Purchase tickets (guest and authenticated)
- [ ] Receive email confirmation
- [ ] View tickets in portal
- [ ] Purchase passes
- [ ] Redeem pass credits
- [ ] Enroll in courses
- [ ] Admin creates event with image
- [ ] Admin bulk uploads images
- [ ] Admin creates marketing campaign
- [ ] Campaign sends emails successfully
- [ ] Analytics dashboards show correct data

**Edge Cases:**
- [ ] Sold out events
- [ ] Expired passes
- [ ] Invalid coupon codes
- [ ] Payment failures
- [ ] Webhook retries
- [ ] Concurrent ticket purchases
- [ ] Organization switching

## DELIVERABLES

Provide a complete, production-ready Next.js application with:
1. All files properly organized per the structure above
2. Fully functional features as specified
3. Comprehensive error handling
4. Responsive design
5. TypeScript throughout (no `any` types)
6. Comments explaining complex logic
7. README.md with setup instructions
8. Environment variables template (.env.example)

The application should be deployable to Vercel and ready to handle real users and transactions.

## SUCCESS CRITERIA

- ✅ All user flows work end-to-end
- ✅ Payments process successfully via Stripe
- ✅ Emails send correctly via Resend
- ✅ RLS policies enforce proper data isolation
- ✅ No infinite recursion errors
- ✅ Responsive on mobile, tablet, desktop
- ✅ Loading states and error handling throughout
- ✅ TypeScript compiles with no errors
- ✅ Application passes all test cases in checklist
- ✅ Code follows best practices and is maintainable

Build GrooveGrid as a professional, enterprise-grade SaaS platform ready for production deployment.