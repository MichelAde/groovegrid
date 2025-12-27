-- Fix existing orders and verify everything

-- Update existing 'confirmed' orders to 'completed' so they show in portal
UPDATE orders 
SET status = 'completed' 
WHERE status = 'confirmed';

-- Check results
SELECT 
  'Recent Orders' as info,
  id,
  order_number,
  buyer_email,
  status,
  total,
  created_at
FROM orders 
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;

-- Check order items
SELECT 
  'Order Items' as info,
  oi.id,
  o.order_number,
  oi.item_type,
  oi.quantity,
  oi.price_per_item,
  tt.name as ticket_type
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
LEFT JOIN ticket_types tt ON tt.id = oi.ticket_type_id
WHERE o.created_at > NOW() - INTERVAL '2 hours'
ORDER BY oi.created_at DESC;

-- Check individual tickets
SELECT 
  'Individual Tickets' as info,
  t.id,
  o.order_number,
  t.qr_code,
  t.status,
  tt.name as ticket_type,
  e.title as event_title
FROM tickets t
JOIN orders o ON o.id = t.order_id
JOIN ticket_types tt ON tt.id = t.ticket_type_id
JOIN events e ON e.id = tt.event_id
WHERE o.created_at > NOW() - INTERVAL '2 hours'
ORDER BY t.created_at DESC;

SELECT '✅ Orders updated to completed status! Check your portal now!' as result;












-- Update existing 'confirmed' orders to 'completed' so they show in portal
UPDATE orders 
SET status = 'completed' 
WHERE status = 'confirmed';

-- Check results
SELECT 
  'Recent Orders' as info,
  id,
  order_number,
  buyer_email,
  status,
  total,
  created_at
FROM orders 
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;

-- Check order items
SELECT 
  'Order Items' as info,
  oi.id,
  o.order_number,
  oi.item_type,
  oi.quantity,
  oi.price_per_item,
  tt.name as ticket_type
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
LEFT JOIN ticket_types tt ON tt.id = oi.ticket_type_id
WHERE o.created_at > NOW() - INTERVAL '2 hours'
ORDER BY oi.created_at DESC;

-- Check individual tickets
SELECT 
  'Individual Tickets' as info,
  t.id,
  o.order_number,
  t.qr_code,
  t.status,
  tt.name as ticket_type,
  e.title as event_title
FROM tickets t
JOIN orders o ON o.id = t.order_id
JOIN ticket_types tt ON tt.id = t.ticket_type_id
JOIN events e ON e.id = tt.event_id
WHERE o.created_at > NOW() - INTERVAL '2 hours'
ORDER BY t.created_at DESC;

SELECT '✅ Orders updated to completed status! Check your portal now!' as result;













