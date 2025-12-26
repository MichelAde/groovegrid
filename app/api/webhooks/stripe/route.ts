import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'payment_intent.succeeded':
      console.log('PaymentIntent succeeded:', event.data.object.id);
      break;

    case 'payment_intent.payment_failed':
      console.log('PaymentIntent failed:', event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const supabase = await createClient();
    const metadata = session.metadata!;

    console.log('Processing checkout session:', session.id);
    console.log('Metadata:', metadata);

    const purchaseType = metadata.purchase_type;
    // Convert string 'null' back to actual null for database
    const eventId = metadata.event_id && metadata.event_id !== 'null' ? metadata.event_id : null;
    const organizationId = metadata.organization_id && metadata.organization_id !== 'null' ? metadata.organization_id : null;
    const buyerEmail = metadata.buyer_email || session.customer_email;
    const buyerName = metadata.buyer_name;
    const items = JSON.parse(metadata.items);

    // Calculate amounts
    const subtotal = parseFloat(metadata.subtotal);
    const fees = parseFloat(metadata.fees);
    const tax = parseFloat(metadata.tax);
    const total = parseFloat(metadata.total);

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        organization_id: organizationId,
        event_id: eventId || null,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: session.customer_details?.phone || null,
        payment_method: 'card',
        payment_status: 'completed',
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        subtotal,
        fees,
        tax,
        total,
        status: 'completed',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    console.log('Order created:', order.id);

    // Handle different purchase types
    if (purchaseType === 'ticket_purchase' && items) {
      await handleTicketPurchase(order.id, items, supabase);
    } else if (purchaseType === 'pass_purchase') {
      await handlePassPurchase(order.id, items, metadata, buyerEmail || '', supabase);
    } else if (purchaseType === 'package_purchase') {
      await handlePackagePurchase(order.id, items, metadata, buyerEmail || '', supabase);
    } else if (purchaseType === 'course_enrollment') {
      await handleCourseEnrollment(order.id, items, metadata, buyerEmail || '', supabase);
    }

    // Send confirmation email
    await sendConfirmationEmail(order, items, buyerEmail || 'customer@example.com', buyerName || 'Customer');

    console.log('Order processing completed successfully');
  } catch (error) {
    console.error('Error processing checkout:', error);
    throw error;
  }
}

async function handleTicketPurchase(
  orderId: string,
  items: any[],
  supabase: any
) {
  console.log('Processing ticket purchase:', items);

  for (const item of items) {
    const { ticket_type_id, quantity, price, name } = item;

    // Create order items
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: orderId,
        item_type: 'ticket',
        ticket_type_id,
        quantity,
        price_per_item: price,
        subtotal: price * quantity,
      });

    if (itemError) {
      console.error('Error creating order item:', itemError);
      throw itemError;
    }

    // Update ticket type quantity sold
    const { data: ticketType } = await supabase
      .from('ticket_types')
      .select('quantity_sold')
      .eq('id', ticket_type_id)
      .single();

    if (ticketType) {
      const { error: updateError } = await supabase
        .from('ticket_types')
        .update({
          quantity_sold: ticketType.quantity_sold + quantity,
        })
        .eq('id', ticket_type_id);

      if (updateError) {
        console.error('Error updating ticket quantity:', updateError);
        throw updateError;
      }
    }

    // Create tickets with QR codes
    for (let i = 0; i < quantity; i++) {
      const qrCode = `TICKET-${orderId}-${ticket_type_id}-${i + 1}`;
      
      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          order_id: orderId,
          ticket_type_id,
          qr_code: qrCode,
          status: 'valid',
        });

      if (ticketError) {
        console.error('Error creating ticket:', ticketError);
        throw ticketError;
      }
    }

    console.log(`Created ${quantity} tickets for ${name}`);
  }
}

async function handlePassPurchase(
  orderId: string,
  items: any[],
  metadata: any,
  buyerEmail: string,
  supabase: any
) {
  console.log('Processing pass purchase:', items);

  // Get the first item (should only be one pass type per purchase)
  const item = items[0];
  if (!item || !item.pass_type_id) {
    throw new Error('No pass type found in items');
  }

  const passTypeId = item.pass_type_id;
  const quantity = item.quantity || 1;
  const price = item.price;

  // Create order item
  const { error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id: orderId,
      item_type: 'pass',
      pass_type_id: passTypeId,
      quantity,
      price_per_item: price,
      subtotal: price * quantity,
    });

  if (itemError) {
    console.error('Error creating order item:', itemError);
    throw itemError;
  }

  // Get pass type details
  const { data: passType, error: passTypeError } = await supabase
    .from('pass_types')
    .select('credits_total, validity_days')  // Fixed: was 'credits'
    .eq('id', passTypeId)
    .single();

  if (passTypeError || !passType) {
    console.error('Error fetching pass type:', passTypeError);
    throw new Error('Pass type not found');
  }

  // Get user_id from buyer email (check auth.users via RPC or just skip for now)
  // Note: auth.users is not directly accessible, so we'll rely on email matching in portal
  const userId = null; // User will see their passes via email matching in RLS policy

  // Create user passes (one per quantity)
  for (let i = 0; i < quantity; i++) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + passType.validity_days);

    const passData: any = {
      order_id: orderId,
      pass_type_id: passTypeId,
      credits_total: passType.credits_total,  // Fixed: was passType.credits
      credits_remaining: passType.credits_total,  // Fixed: was passType.credits
      expiry_date: expiryDate.toISOString(),
      is_active: true,
    };

    // Add user_id if we found the user
    if (userId) {
      passData.user_id = userId;
    }

    const { error: passError } = await supabase
      .from('user_passes')
      .insert(passData);

    if (passError) {
      console.error('Error creating user pass:', passError);
      throw passError;
    }
  }

  console.log(`Created ${quantity} passes for ${buyerEmail}`);
}

async function handlePackagePurchase(
  orderId: string,
  items: any[],
  metadata: any,
  buyerEmail: string,
  supabase: any
) {
  console.log('Processing package purchase:', items);

  // Get the first item (should only be one package per purchase)
  const item = items[0];
  if (!item || !item.package_id) {
    throw new Error('No package found in items');
  }

  const packageId = item.package_id;
  const quantity = item.quantity || 1;
  const price = item.price;

  // Create order item
  const { error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id: orderId,
      item_type: 'package',
      package_id: packageId,
      quantity,
      price_per_item: price,
      subtotal: price * quantity,
    });

  if (itemError) {
    console.error('Error creating order item:', itemError);
    throw itemError;
  }

  // Get package details
  const { data: packageData, error: packageError } = await supabase
    .from('class_packages')
    .select('credits')
    .eq('id', packageId)
    .single();

  if (packageError || !packageData) {
    console.error('Error fetching package:', packageError);
    throw new Error('Package not found');
  }

  // Get user_id from buyer email
  // Get user_id from buyer email (check auth.users via RPC or just skip for now)
  // Note: auth.users is not directly accessible, so we'll rely on email matching in RLS policy
  const userId = null; // User will see their packages via email matching in RLS policy

  // Create package enrollments (one per quantity)
  for (let i = 0; i < quantity; i++) {
    const enrollmentData: any = {
      order_id: orderId,
      package_id: packageId,
      credits_total: packageData.credits,
      credits_remaining: packageData.credits,
      status: 'active',
    };

    // Add user_id if we found the user
    if (userId) {
      enrollmentData.user_id = userId;
    }

    const { error: enrollError } = await supabase
      .from('package_enrollments')
      .insert(enrollmentData);

    if (enrollError) {
      console.error('Error creating package enrollment:', enrollError);
      throw enrollError;
    }
  }

  console.log(`Created ${quantity} package enrollments for ${buyerEmail}`);
}

async function handleCourseEnrollment(
  orderId: string,
  items: any[],
  metadata: any,
  buyerEmail: string,
  supabase: any
) {
  console.log('Processing course enrollment:', items);

  // Get the first item (should only be one course per purchase)
  const item = items[0];
  if (!item || !item.course_id) {
    throw new Error('No course found in items');
  }

  const courseId = item.course_id;
  const price = item.price;

  // Create order item
  const { error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id: orderId,
      item_type: 'course',
      course_id: courseId,
      quantity: 1,
      price_per_item: price,
      subtotal: price,
    });

  if (itemError) {
    console.error('Error creating order item:', itemError);
    throw itemError;
  }

  // Get user_id from buyer email (check auth.users via RPC or just skip for now)
  // Note: auth.users is not directly accessible, so we'll rely on email matching in RLS policy
  const userId = null; // User will see their enrollments via email matching in RLS policy

  // Create course enrollment
  const enrollmentData: any = {
    order_id: orderId,
    course_id: courseId,
    status: 'active',
    enrollment_date: new Date().toISOString(),  // Fixed: was enrolled_at
  };

  // Add user_id if we found the user
  if (userId) {
    enrollmentData.user_id = userId;
  }

  const { error: enrollError } = await supabase
    .from('enrollments')  // Fixed: was course_enrollments
    .insert(enrollmentData);

  if (enrollError) {
    console.error('Error creating course enrollment:', enrollError);
    throw enrollError;
  }

  console.log(`Created course enrollment for ${buyerEmail}`);
}

async function sendConfirmationEmail(
  order: any,
  items: any[],
  email: string,
  name: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email');
    return;
  }

  try {
    // For now, send a simple HTML email
    // TODO: Create React Email templates
    const itemsList = items.map(item => 
      `- ${item.quantity}x ${item.name} @ $${item.price.toFixed(2)} each`
    ).join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Order Confirmed! 🎉</h1>
          </div>
          
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
            <p>Hi ${name},</p>
            
            <p>Thank you for your purchase! Your order has been confirmed.</p>
            
            <h2 style="color: #374151; border-bottom: 2px solid #7c3aed; padding-bottom: 8px;">Order Details</h2>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.id}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            
            <h3 style="color: #374151;">Items:</h3>
            <pre style="background-color: #f9fafb; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${itemsList}</pre>
            
            <div style="border-top: 2px solid #e5e7eb; margin-top: 20px; padding-top: 15px;">
              <p style="margin: 5px 0;">Subtotal: $${order.subtotal.toFixed(2)}</p>
              <p style="margin: 5px 0;">Platform Fee (2%): $${order.fees.toFixed(2)}</p>
              <p style="margin: 5px 0;">Tax (HST 13%): $${order.tax.toFixed(2)}</p>
              <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>Total: $${order.total.toFixed(2)}</strong></p>
            </div>
            
            <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0;"><strong>📱 Your Tickets:</strong></p>
              <p style="margin: 10px 0 0 0;">Your tickets with QR codes are attached to this email. Show them at the event entrance.</p>
            </div>
            
            <p style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/portal/tickets" 
                 style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View My Tickets
              </a>
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you have any questions, please reply to this email.<br>
              We're here to help!
            </p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
            <p>GrooveGrid - Event Management Platform</p>
            <p>Powered by dance, driven by community</p>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'GrooveGrid <orders@groovegrid.ca>',
      to: email,
      subject: `Order Confirmation - Order #${order.id.slice(0, 8)}`,
      html: htmlContent,
    });

    console.log('Confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw - email failure shouldn't block order processing
  }
}

