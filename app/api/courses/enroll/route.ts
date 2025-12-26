import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      course_id,
      buyer_email,
      buyer_name,
    } = body;

    if (!course_id || !buyer_email || !buyer_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*, organization(id, name)')
      .eq('id', course_id)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Calculate pricing
    const subtotal = course.price;
    const platformFeeRate = 0.02;
    const fees = subtotal * platformFeeRate;
    const taxRate = 0.13;
    const tax = (subtotal + fees) * taxRate;
    const total = subtotal + fees + tax;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: course.title,
              description: `${course.level} level • ${course.duration_weeks} weeks`,
            },
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Platform Fee (2%)',
              description: 'GrooveGrid service fee',
            },
            unit_amount: Math.round(fees * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'HST (13%)',
              description: 'Harmonized Sales Tax',
            },
            unit_amount: Math.round(tax * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/classes`,
      customer_email: buyer_email,
      metadata: {
        purchase_type: 'course_enrollment',
        course_id,
        organization_id: course.organization.id,
        buyer_email,
        buyer_name,
        items: JSON.stringify([{
          course_id,
          quantity: 1,
          price: course.price,
          name: course.title,
        }]),
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
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create enrollment session' },
      { status: 500 }
    );
  }
}

