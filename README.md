# GrooveGrid - Event Management & Dance School Platform

A comprehensive multi-tenant SaaS platform for dance event organizers and school owners, built specifically for the Kizomba/Semba community in Canada.

## 🚀 Features

### ✅ Implemented (Phase 1-2)

#### Multi-Tenant Foundation
- ✅ Supabase authentication (email/password)
- ✅ Organization creation and management
- ✅ Organization switcher for multi-org users
- ✅ Row Level Security (RLS) policies
- ✅ Comprehensive database schema

#### Dance School Management
- ✅ Class packages CRUD (credit-based systems)
- ✅ AI-powered course curriculum generation (Claude)
- ✅ Course management
- ✅ Pricing and validity period management

#### UI/UX
- ✅ Beautiful Tailwind CSS design system
- ✅ Responsive layouts (public, admin, portal)
- ✅ Purple (#7C3AED) and Pink accent theme
- ✅ Component library (Button, Input, Card, etc.)

### 🚧 In Progress (Phase 3-9)

- Event management & ticketing
- Multi-event pass system
- Stripe payment integration
- Email confirmations (Resend)
- Marketing automation
- Analytics dashboards
- Community calendar
- SMS/WhatsApp campaigns (Twilio)

## 📦 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Payments**: Stripe
- **Email**: Resend API with React Email
- **SMS/WhatsApp**: Twilio
- **AI**: Anthropic Claude
- **Deployment**: Vercel

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account (test mode)
- Resend account
- Anthropic API key
- Twilio account (optional, for SMS/WhatsApp)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# Anthropic (AI course generation)
ANTHROPIC_API_KEY=sk-ant-...

# Twilio (optional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_WHATSAPP_NUMBER=whatsapp:+1...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script to create all tables, indexes, and RLS policies

This will create:
- All database tables
- Indexes for performance
- Row Level Security policies
- Storage bucket for event images

### 4. Configure Supabase Authentication

1. In Supabase Dashboard → Authentication → URL Configuration
2. Add your site URL: `http://localhost:3000`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/admin`

### 5. Set Up Storage Bucket

1. Go to Supabase Dashboard → Storage
2. The `event-images` bucket should be created automatically by the SQL script
3. Make sure it's set to **public**

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
groovegrid/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (public)/            # Public-facing pages
│   │   ├── page.tsx         # Homepage
│   │   ├── events/          # Event listing (TODO)
│   │   ├── classes/         # Classes listing (TODO)
│   │   └── passes/          # Passes listing (TODO)
│   ├── admin/               # Admin/Organizer dashboard
│   │   ├── page.tsx         # Dashboard
│   │   ├── events/          # Event management (TODO)
│   │   ├── courses/         # Course management ✅
│   │   ├── packages/        # Class packages ✅
│   │   ├── passes/          # Pass management (TODO)
│   │   ├── campaigns/       # Marketing (TODO)
│   │   └── sales/           # Analytics (TODO)
│   ├── portal/              # Customer portal (TODO)
│   └── api/
│       ├── checkout/        # Stripe checkout (TODO)
│       ├── webhooks/        # Stripe webhooks (TODO)
│       └── courses/
│           └── generate/    # AI curriculum generation ✅
├── components/
│   ├── ui/                  # UI components ✅
│   └── OrganizationSwitcher.tsx ✅
├── lib/
│   ├── supabase/            # Supabase clients ✅
│   ├── stripe.ts            # Stripe client ✅
│   ├── resend.ts            # Email client ✅
│   ├── anthropic.ts         # AI client ✅
│   ├── twilio.ts            # SMS/WhatsApp client ✅
│   └── utils.ts             # Utilities ✅
├── supabase-schema.sql      # Database schema ✅
└── package.json
```

## 🔐 Authentication Flow

1. User signs up at `/signup`
2. Creates organization with unique subdomain
3. Automatically becomes organization owner
4. Can invite other members later

## 🎨 Design System

- **Primary Color**: Purple (#7C3AED)
- **Secondary Color**: Pink (#EC4899)
- **Font**: Inter
- **Components**: Radix UI + Custom Tailwind

## 📊 Database Schema

### Core Tables
- `organization` - Multi-tenant organizations
- `organization_members` - User-org relationships
- `events` - Event listings
- `ticket_types` - Ticket configurations
- `orders` - Purchase records
- `order_items` - Line items
- `pass_types` - Multi-event passes
- `user_passes` - Active user passes
- `courses` - Dance courses
- `class_packages` - Class credit packages
- `student_packages` - User-owned packages
- `enrollments` - Course enrollments
- `campaigns` - Marketing campaigns
- `campaign_sequences` - Email/SMS sequences
- `audience_segments` - User segmentation
- `campaign_sends` - Tracking sends/opens

## 🧪 Testing Strategy (January 2025)

### Week 1-2: School Management
- [ ] Create Semba beginner course with AI
- [ ] Create class packages (5, 10, 20 classes)
- [ ] Test package purchase flow

### Week 3-4: Event Ticketing
- [ ] Create workshop events
- [ ] Set up ticket types
- [ ] Test guest checkout

### Week 5: Multi-Event Passes
- [ ] Create monthly passes
- [ ] Test pass redemption

### Week 6+: Marketing
- [ ] Build audience segments
- [ ] Test email campaigns

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Post-Deployment

1. Update Supabase redirect URLs with production domain
2. Set up Stripe webhook endpoint in production
3. Configure email templates in Resend
4. Update `NEXT_PUBLIC_BASE_URL` environment variable

## 📝 Next Steps

1. **Phase 3**: Implement event management and ticketing system
2. **Phase 4**: Build multi-event pass system
3. **Phase 5**: Integrate Stripe webhooks and email confirmations
4. **Phase 6**: Create marketing automation platform
5. **Phase 7**: Build analytics dashboards
6. **Phase 8**: Implement community calendar
7. **Phase 9**: Polish, test, and deploy to production

## 🐛 Known Issues

- None currently (Phase 1-2 complete)

## 📄 License

Proprietary - Mikilele Events

## 👥 Support

For issues or questions, contact: michel.adedokun@outlook.com

---

**Built with ❤️ for the Kizomba & Semba community in Canada**



