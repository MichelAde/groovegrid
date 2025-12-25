-- GrooveGrid: Load Real Mikilele Events Data
-- Run this AFTER running supabase-schema.sql
-- This populates your database with actual Mikilele Events data

-- Note: Replace 'YOUR_USER_ID' with your actual Supabase auth user ID
-- You can find it by running: SELECT id FROM auth.users WHERE email = 'michel.adedokun@outlook.com';

-- Step 1: Create Organization (if not exists)
INSERT INTO organization (
  id,
  name,
  subdomain,
  email,
  phone,
  address,
  city,
  province,
  country,
  brand_color,
  subscription_tier,
  is_active
) VALUES (
  'e110e5e0-c320-4c84-a155-ebf567f7585a', -- Use this ID or generate new one
  'Mikilele Events',
  'mikilele',
  'mikileleevents@gmail.com',
  '647-766-2111',
  '1099 Maitland Avenue',
  'Ottawa',
  'Ontario',
  'Canada',
  '#7C3AED',
  'pro',
  true
) ON CONFLICT (subdomain) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  province = EXCLUDED.province,
  country = EXCLUDED.country,
  brand_color = EXCLUDED.brand_color,
  subscription_tier = EXCLUDED.subscription_tier;

-- Step 2: Add Organization Member (Link your user to organization)
-- IMPORTANT: Replace 'YOUR_USER_ID' with your actual user ID from auth.users
INSERT INTO organization_members (
  organization_id,
  user_id,
  role
) VALUES (
  'e110e5e0-c320-4c84-a155-ebf567f7585a',
  'YOUR_USER_ID', -- REPLACE THIS!
  'owner'
) ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;

-- Step 3: Create Events with Ticket Types

-- January 2026 - Mikilele SBK Soirée
DO $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO events (
    organization_id,
    title,
    description,
    category,
    start_datetime,
    end_datetime,
    venue_name,
    address,
    city,
    province,
    country,
    capacity,
    status
  ) VALUES (
    'e110e5e0-c320-4c84-a155-ebf567f7585a',
    'Mikilele SBK Soirée - January 2026',
    'Monthly Semba, Bacata & Kizomba social dance event featuring live DJ, dancing from 8 PM to midnight, and a welcoming atmosphere for all skill levels.',
    'Social Dance',
    '2026-01-17 20:00:00',
    '2026-01-18 00:00:00',
    'TBD',
    'TBD',
    'Ottawa',
    'Ontario',
    'Canada',
    100,
    'published'
  ) RETURNING id INTO event_id;

  -- Ticket types for January event
  INSERT INTO ticket_types (event_id, name, description, price, quantity_available, quantity_sold, is_active) VALUES
    (event_id, 'General Admission', 'Standard entry to the event', 15.00, 70, 1, true),
    (event_id, 'Student/Senior', 'Discounted rate for students and seniors with valid ID', 12.00, 20, 0, true),
    (event_id, 'Early Bird', 'Limited early bird pricing - first 10 tickets', 12.00, 10, 0, true);
END $$;

-- January 2026 - Ambiance Mikilele
DO $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO events (
    organization_id,
    title,
    description,
    category,
    start_datetime,
    end_datetime,
    venue_name,
    city,
    province,
    country,
    capacity,
    status
  ) VALUES (
    'e110e5e0-c320-4c84-a155-ebf567f7585a',
    'Ambiance Mikilele - January 2026',
    'Special edition evening featuring guest DJs and extended dancing hours',
    'Special Event',
    '2026-01-24 20:00:00',
    '2026-01-25 01:00:00',
    'TBD',
    'Ottawa',
    'Ontario',
    'Canada',
    120,
    'published'
  ) RETURNING id INTO event_id;

  INSERT INTO ticket_types (event_id, name, price, quantity_available, quantity_sold, is_active) VALUES
    (event_id, 'General Admission', 15.00, 80, 2, true);
END $$;

-- February 2026 - Mikilele SBK Soirée
DO $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO events (
    organization_id,
    title,
    description,
    category,
    start_datetime,
    end_datetime,
    venue_name,
    city,
    province,
    country,
    capacity,
    status
  ) VALUES (
    'e110e5e0-c320-4c84-a155-ebf567f7585a',
    'Mikilele SBK Soirée - February 2026',
    'Monthly Semba, Bacata & Kizomba social dance event',
    'Social Dance',
    '2026-02-21 20:00:00',
    '2026-02-22 00:00:00',
    'TBD',
    'Ottawa',
    'Ontario',
    'Canada',
    100,
    'published'
  ) RETURNING id INTO event_id;

  INSERT INTO ticket_types (event_id, name, price, quantity_available, is_active) VALUES
    (event_id, 'General Admission', 15.00, 70, true),
    (event_id, 'Student/Senior', 12.00, 20, true),
    (event_id, 'Early Bird', 12.00, 10, true);
END $$;

-- March 2026
DO $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO events (
    organization_id,
    title,
    description,
    category,
    start_datetime,
    end_datetime,
    venue_name,
    city,
    province,
    country,
    capacity,
    status
  ) VALUES (
    'e110e5e0-c320-4c84-a155-ebf567f7585a',
    'Mikilele SBK Soirée - March 2026',
    'Monthly Semba, Bacata & Kizomba social dance event',
    'Social Dance',
    '2026-03-21 20:00:00',
    '2026-03-22 00:00:00',
    'TBD',
    'Ottawa',
    'Ontario',
    'Canada',
    100,
    'published'
  ) RETURNING id INTO event_id;

  INSERT INTO ticket_types (event_id, name, price, quantity_available, is_active) VALUES
    (event_id, 'General Admission', 15.00, 70, true),
    (event_id, 'Student/Senior', 12.00, 20, true),
    (event_id, 'Early Bird', 12.00, 10, true);
END $$;

-- April 2026
DO $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO events (
    organization_id,
    title,
    description,
    category,
    start_datetime,
    end_datetime,
    venue_name,
    city,
    province,
    country,
    capacity,
    status
  ) VALUES (
    'e110e5e0-c320-4c84-a155-ebf567f7585a',
    'Mikilele SBK Soirée - April 2026',
    'Monthly Semba, Bacata & Kizomba social dance event',
    'Social Dance',
    '2026-04-18 20:00:00',
    '2026-04-19 00:00:00',
    'TBD',
    'Ottawa',
    'Ontario',
    'Canada',
    100,
    'published'
  ) RETURNING id INTO event_id;

  INSERT INTO ticket_types (event_id, name, price, quantity_available, is_active) VALUES
    (event_id, 'General Admission', 15.00, 70, true),
    (event_id, 'Student/Senior', 12.00, 20, true),
    (event_id, 'Early Bird', 12.00, 10, true);
END $$;

-- May 2026
DO $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO events (
    organization_id,
    title,
    description,
    category,
    start_datetime,
    end_datetime,
    venue_name,
    city,
    province,
    country,
    capacity,
    status
  ) VALUES (
    'e110e5e0-c320-4c84-a155-ebf567f7585a',
    'Mikilele SBK Soirée - May 2026',
    'Monthly Semba, Bacata & Kizomba social dance event',
    'Social Dance',
    '2026-05-16 20:00:00',
    '2026-05-17 00:00:00',
    'TBD',
    'Ottawa',
    'Ontario',
    'Canada',
    100,
    'published'
  ) RETURNING id INTO event_id;

  INSERT INTO ticket_types (event_id, name, price, quantity_available, is_active) VALUES
    (event_id, 'General Admission', 15.00, 70, true),
    (event_id, 'Student/Senior', 12.00, 20, true),
    (event_id, 'Early Bird', 12.00, 10, true);
END $$;

-- June 2026
DO $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO events (
    organization_id,
    title,
    description,
    category,
    start_datetime,
    end_datetime,
    venue_name,
    city,
    province,
    country,
    capacity,
    status
  ) VALUES (
    'e110e5e0-c320-4c84-a155-ebf567f7585a',
    'Mikilele SBK Soirée - June 2026',
    'Monthly Semba, Bacata & Kizomba social dance event',
    'Social Dance',
    '2026-06-20 20:00:00',
    '2026-06-21 00:00:00',
    'TBD',
    'Ottawa',
    'Ontario',
    'Canada',
    100,
    'published'
  ) RETURNING id INTO event_id;

  INSERT INTO ticket_types (event_id, name, price, quantity_available, is_active) VALUES
    (event_id, 'General Admission', 15.00, 70, true),
    (event_id, 'Student/Senior', 12.00, 20, true),
    (event_id, 'Early Bird', 12.00, 10, true);
END $$;

-- July 2026
DO $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO events (
    organization_id,
    title,
    description,
    category,
    start_datetime,
    end_datetime,
    venue_name,
    city,
    province,
    country,
    capacity,
    status
  ) VALUES (
    'e110e5e0-c320-4c84-a155-ebf567f7585a',
    'Mikilele SBK Soirée - July 2026',
    'Monthly Semba, Bacata & Kizomba social dance event',
    'Social Dance',
    '2026-07-18 20:00:00',
    '2026-07-19 00:00:00',
    'TBD',
    'Ottawa',
    'Ontario',
    'Canada',
    100,
    'published'
  ) RETURNING id INTO event_id;

  INSERT INTO ticket_types (event_id, name, price, quantity_available, is_active) VALUES
    (event_id, 'General Admission', 15.00, 70, true),
    (event_id, 'Student/Senior', 12.00, 20, true),
    (event_id, 'Early Bird', 12.00, 10, true);
END $$;

-- Step 4: Create Pass Types
INSERT INTO pass_types (
  organization_id,
  name,
  description,
  type,
  price,
  credits_total,
  validity_days,
  is_active,
  sort_order
) VALUES
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', 'Single Event Pass', 'One-time entry pass to any Mikilele event', 'single-event', 15.00, 1, 90, true, 1),
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', '5-Event Pass', 'Credit-based pass valid for any 5 Mikilele events', 'multi-event', 60.00, 5, 180, true, 2),
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', '10-Event Pass', 'Best value! Credit-based pass valid for any 10 Mikilele events', 'multi-event', 110.00, 10, 365, true, 3),
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', 'Monthly All-Access Pass', 'Unlimited entry to all Mikilele SBK Soirée events for one month', 'monthly', 45.00, NULL, 30, true, 4)
ON CONFLICT DO NOTHING;

-- Step 5: Create Courses
INSERT INTO courses (
  organization_id,
  title,
  description,
  instructor,
  level,
  duration_weeks,
  start_date,
  end_date,
  schedule_days,
  schedule_time,
  max_students,
  price,
  status
) VALUES
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', 'Semba Fundamentals - Beginner Level', 'Learn the foundational steps and rhythms of Semba dance. This 8-week course covers basic footwork, partner connection, and musicality. Perfect for complete beginners!', 'To Be Announced', 'Beginner', 8, '2026-01-15', '2026-03-05', ARRAY['Thursday'], '19:30:00', 20, 160.00, 'published'),
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', 'Kizomba Essentials - Beginner Level', 'Discover the smooth and sensual world of Kizomba. This 6-week course introduces basic steps, body movement, and connection techniques essential for social dancing.', 'To Be Announced', 'Beginner', 6, '2026-02-01', '2026-03-08', ARRAY['Sunday'], '15:00:00', 16, 120.00, 'published'),
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', 'Semba Intermediate Techniques', 'Take your Semba to the next level! This course focuses on advanced footwork variations, styling, and complex partner work. Prerequisites: completion of beginner Semba course or instructor approval.', 'To Be Announced', 'Intermediate', 8, '2026-03-12', '2026-04-30', ARRAY['Thursday'], '20:45:00', 16, 180.00, 'published'),
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', 'Kizomba Urban & Tarraxinha', 'Explore the modern evolution of Kizomba with Urban Kiz and the intimate movements of Tarraxinha. This 6-week intensive course covers isolation, waves, and musicality.', 'To Be Announced', 'Intermediate', 6, '2026-03-15', '2026-04-19', ARRAY['Sunday'], '16:30:00', 14, 140.00, 'published'),
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', 'Semba & Kizomba Intensive Workshop', 'Full-day intensive workshop combining both Semba and Kizomba techniques. Includes morning session on Semba fundamentals and afternoon session on Kizomba connection and musicality. Lunch included!', 'To Be Announced', 'All Levels', 1, '2026-02-14', '2026-02-14', ARRAY['Saturday'], '10:00:00', 30, 75.00, 'published')
ON CONFLICT DO NOTHING;

-- Step 6: Create Class Packages
INSERT INTO class_packages (
  organization_id,
  name,
  description,
  credits,
  price,
  validity_days,
  is_active
) VALUES
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', 'Single Drop-In Class', 'Try a single class with no commitment. Perfect for first-timers or visitors.', 1, 18.00, 30, true),
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', '5-Class Package', 'Flexible package valid for any 5 dance classes. Perfect for trying different courses or attending drop-in sessions.', 5, 75.00, 90, true),
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', '10-Class Package', 'Best value! Attend any 10 dance classes. Ideal for regular students committed to improving their skills.', 10, 135.00, 180, true),
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', '20-Class Package', 'Ultimate package for dedicated dancers. Valid for any 20 classes with extended validity period.', 20, 250.00, 365, true),
  ('e110e5e0-c320-4c84-a155-ebf567f7585a', 'Monthly Unlimited', 'Unlimited access to all regular classes for one month. The ultimate package for dance enthusiasts!', NULL, 200.00, 30, true)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Data loaded successfully!' AS status,
       (SELECT COUNT(*) FROM events WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a') AS events_count,
       (SELECT COUNT(*) FROM pass_types WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a') AS pass_types_count,
       (SELECT COUNT(*) FROM courses WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a') AS courses_count,
       (SELECT COUNT(*) FROM class_packages WHERE organization_id = 'e110e5e0-c320-4c84-a155-ebf567f7585a') AS packages_count;

