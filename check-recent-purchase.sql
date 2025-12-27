-- Comprehensive diagnostic after successful purchase
-- Run this to see what was created

-- Check recent orders
SELECT 
  'ORDERS' as table_name,
  id,
  order_number,
  buyer_email,
  buyer_name,
  total,
  status,
  created_at
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 5;

-- Check order items for those orders
SELECT 
  'ORDER_ITEMS' as table_name,
  oi.id,
  oi.order_id,
  oi.item_type,
  oi.ticket_type_id,
  oi.quantity,
  oi.price_per_item,
  o.buyer_email,
  o.order_number
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.created_at > NOW() - INTERVAL '1 hour'
ORDER BY oi.created_at DESC;

-- Check individual tickets
SELECT 
  'TICKETS' as table_name,
  t.id,
  t.order_id,
  t.qr_code,
  t.status,
  o.buyer_email,
  o.order_number,
  tt.name as ticket_type_name,
  e.title as event_title
FROM tickets t
JOIN orders o ON o.id = t.order_id
JOIN ticket_types tt ON tt.id = t.ticket_type_id
JOIN events e ON e.id = tt.event_id
WHERE o.created_at > NOW() - INTERVAL '1 hour'
ORDER BY t.created_at DESC;

-- Check what user_id the orders have
SELECT 
  'USER_CHECK' as check_name,
  id,
  order_number,
  user_id,
  buyer_email,
  CASE 
    WHEN user_id IS NULL THEN 'NO USER_ID (this is why tickets dont show!)'
    ELSE 'Has user_id'
  END as status
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour';











-- Run this to see what was created

-- Check recent orders
SELECT 
  'ORDERS' as table_name,
  id,
  order_number,
  buyer_email,
  buyer_name,
  total,
  status,
  created_at
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 5;

-- Check order items for those orders
SELECT 
  'ORDER_ITEMS' as table_name,
  oi.id,
  oi.order_id,
  oi.item_type,
  oi.ticket_type_id,
  oi.quantity,
  oi.price_per_item,
  o.buyer_email,
  o.order_number
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.created_at > NOW() - INTERVAL '1 hour'
ORDER BY oi.created_at DESC;

-- Check individual tickets
SELECT 
  'TICKETS' as table_name,
  t.id,
  t.order_id,
  t.qr_code,
  t.status,
  o.buyer_email,
  o.order_number,
  tt.name as ticket_type_name,
  e.title as event_title
FROM tickets t
JOIN orders o ON o.id = t.order_id
JOIN ticket_types tt ON tt.id = t.ticket_type_id
JOIN events e ON e.id = tt.event_id
WHERE o.created_at > NOW() - INTERVAL '1 hour'
ORDER BY t.created_at DESC;

-- Check what user_id the orders have
SELECT 
  'USER_CHECK' as check_name,
  id,
  order_number,
  user_id,
  buyer_email,
  CASE 
    WHEN user_id IS NULL THEN 'NO USER_ID (this is why tickets dont show!)'
    ELSE 'Has user_id'
  END as status
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour';












