-- URGENT: Quick Diagnostic for Order Issue
-- Run these queries ONE BY ONE and share results

-- 1. Check if organization_id column exists (CRITICAL!)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'organization_id';
-- Expected: 1 row showing 'organization_id | uuid'
-- If empty: THIS IS THE PROBLEM! Run fix-orders-table.sql

-- 2. Check if any orders exist from today
SELECT 
  id,
  order_number,
  buyer_email,
  buyer_name,
  total,
  status,
  created_at
FROM orders 
WHERE created_at > CURRENT_DATE
ORDER BY created_at DESC;
-- Expected: See your order(s)
-- If empty: Order creation failed

-- 3. Check orders from your email specifically  
SELECT 
  id,
  order_number,
  buyer_email,
  total,
  status,
  created_at
FROM orders 
WHERE buyer_email ILIKE '%michel.adedokun%'
ORDER BY created_at DESC
LIMIT 5;
-- Shows if any orders exist for your email

-- 4. If orders exist, check order_items
SELECT 
  oi.*,
  tt.name as ticket_name,
  tt.event_id
FROM order_items oi
LEFT JOIN ticket_types tt ON oi.ticket_type_id = tt.id
WHERE oi.order_id IN (
  SELECT id FROM orders 
  WHERE buyer_email ILIKE '%michel.adedokun%'
)
ORDER BY oi.created_at DESC;
-- Shows if tickets were created for your orders

-- 5. Check all columns in orders table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
-- Shows complete table structure

---
-- INTERPRETATION:
-- If #1 is empty → Run fix-orders-table.sql IMMEDIATELY
-- If #2 is empty → Order creation is failing, check Vercel logs
-- If #3 shows orders but #4 is empty → Ticket creation failed
-- If everything is empty → Webhook is failing internally











-- Run these queries ONE BY ONE and share results

-- 1. Check if organization_id column exists (CRITICAL!)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'organization_id';
-- Expected: 1 row showing 'organization_id | uuid'
-- If empty: THIS IS THE PROBLEM! Run fix-orders-table.sql

-- 2. Check if any orders exist from today
SELECT 
  id,
  order_number,
  buyer_email,
  buyer_name,
  total,
  status,
  created_at
FROM orders 
WHERE created_at > CURRENT_DATE
ORDER BY created_at DESC;
-- Expected: See your order(s)
-- If empty: Order creation failed

-- 3. Check orders from your email specifically  
SELECT 
  id,
  order_number,
  buyer_email,
  total,
  status,
  created_at
FROM orders 
WHERE buyer_email ILIKE '%michel.adedokun%'
ORDER BY created_at DESC
LIMIT 5;
-- Shows if any orders exist for your email

-- 4. If orders exist, check order_items
SELECT 
  oi.*,
  tt.name as ticket_name,
  tt.event_id
FROM order_items oi
LEFT JOIN ticket_types tt ON oi.ticket_type_id = tt.id
WHERE oi.order_id IN (
  SELECT id FROM orders 
  WHERE buyer_email ILIKE '%michel.adedokun%'
)
ORDER BY oi.created_at DESC;
-- Shows if tickets were created for your orders

-- 5. Check all columns in orders table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
-- Shows complete table structure

---
-- INTERPRETATION:
-- If #1 is empty → Run fix-orders-table.sql IMMEDIATELY
-- If #2 is empty → Order creation is failing, check Vercel logs
-- If #3 shows orders but #4 is empty → Ticket creation failed
-- If everything is empty → Webhook is failing internally













