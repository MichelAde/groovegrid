import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      items, // Array of {ticket_type_id, quantity, price, name}
      event_id,
      buyer_email,
      buyer_name,
      purchase_type = 'ticket_purchase' 
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get event or organization details based on purchase type
    let event = null;
    let organization = null;

    if (purchase_type === 'ticket_purchase' && event_id) {
      const { data: eventData } = await supabase
        .from('events')
        .select('*, organization(name)')
        .eq('id', event_id)
        .single();

      if (!eventData) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
      event = eventData;
      organization = eventData.organization;
    } else if (purchase_type === 'pass_purchase' || purchase_type === 'package_purchase') {
      // For passes/packages, get organization from the item
      const passOrPackageId = body.pass_type_id || body.package_id;
      const table = purchase_type === 'pass_purchase' ? 'pass_types' : 'class_packages';
      
      const { data: itemData } = await supabase
        .from(table)
        .select('*, organization(name)')
        .eq('id', passOrPackageId)
        .single();

      if (itemData) {
        organization = itemData.organization;
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    
    // Platform fee: 2% as per market research
    const platformFeeRate = 0.02;
    const fees = subtotal * platformFeeRate;
    
    // Tax (13% HST for Ontario, adjust based on province)
    const taxRate = 0.13;
    const tax = (subtotal + fees) * taxRate;
    
    const total = subtotal + fees + tax;

    // Create line items for Stripe
    const line_items = items.map((item: any) => {
      let productName = item.name;
      let productDescription = '';
      
      if (purchase_type === 'ticket_purchase' && event) {
        productName = `${event.title} - ${item.name}`;
        productDescription = `Event: ${event.title}`;
      } else if (purchase_type === 'pass_purchase') {
        productDescription = `Multi-event pass`;
      } else if (purchase_type === 'package_purchase') {
        productDescription = `Class package`;
      }

      return {
        price_data: {
          currency: 'cad',
          product_data: {
            name: productName,
            description: productDescription,
            images: event?.image_url ? [event.image_url] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Add platform fee as a line item
    if (fees > 0) {
      line_items.push({
        price_data: {
          currency: 'cad',
          product_data: {
            name: 'Platform Fee (2%)',
            description: 'GrooveGrid service fee',
          },
          unit_amount: Math.round(fees * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as a line item
    if (tax > 0) {
      line_items.push({
        price_data: {
          currency: 'cad',
          product_data: {
            name: 'HST (13%)',
            description: 'Harmonized Sales Tax',
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: event_id 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/events/${event_id}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/passes`,
      customer_email: buyer_email,
      metadata: {
        purchase_type,
        event_id: event_id || '',
        organization_id: organization?.id || event?.organization_id || '',
        buyer_email,
        buyer_name,
        pass_type_id: body.pass_type_id || '',
        package_id: body.package_id || '',
        items: JSON.stringify(items.map((item: any) => ({
          ticket_type_id: item.ticket_type_id,
          pass_type_id: item.pass_type_id,
          package_id: item.package_id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        }))),
        subtotal: subtotal.toFixed(2),
        fees: fees.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

