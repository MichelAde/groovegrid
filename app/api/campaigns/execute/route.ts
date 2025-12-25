import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import twilio from 'twilio';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { campaign_id } = await request.json();

    if (!campaign_id) {
      return NextResponse.json(
        { error: 'Campaign ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*, segments(*), organization(name)')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if campaign can be sent
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Campaign already sent or in progress' },
        { status: 400 }
      );
    }

    // Update campaign status to sending
    await supabase
      .from('campaigns')
      .update({
        status: 'sending',
        sent_at: new Date().toISOString(),
      })
      .eq('id', campaign_id);

    // Get recipients based on segment or all customers
    let recipients: string[] = [];

    if (campaign.segment_id) {
      // Get customers matching segment filters
      const { data: orders } = await supabase
        .from('orders')
        .select('buyer_email')
        .eq('organization_id', campaign.organization_id)
        .eq('status', 'confirmed');

      recipients = [...new Set(orders?.map(o => o.buyer_email) || [])];
    } else {
      // Get all customers
      const { data: orders } = await supabase
        .from('orders')
        .select('buyer_email')
        .eq('organization_id', campaign.organization_id)
        .eq('status', 'confirmed');

      recipients = [...new Set(orders?.map(o => o.buyer_email) || [])];
    }

    console.log(`Sending campaign to ${recipients.length} recipients`);

    // Send messages
    let successCount = 0;
    let failCount = 0;

    for (const email of recipients) {
      try {
        if (campaign.channel === 'email') {
          await sendEmail(campaign, email, supabase);
        } else if (campaign.channel === 'sms') {
          await sendSMS(campaign, email, supabase);
        } else if (campaign.channel === 'whatsapp') {
          await sendWhatsApp(campaign, email, supabase);
        }
        
        successCount++;

        // Record execution
        await supabase
          .from('campaign_executions')
          .insert({
            campaign_id: campaign.id,
            recipient_email: email,
            status: 'sent',
            sent_at: new Date().toISOString(),
          });

      } catch (error) {
        console.error(`Failed to send to ${email}:`, error);
        failCount++;

        // Record failed execution
        await supabase
          .from('campaign_executions')
          .insert({
            campaign_id: campaign.id,
            recipient_email: email,
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          });
      }
    }

    // Update campaign with final stats
    await supabase
      .from('campaigns')
      .update({
        status: 'completed',
        recipients_count: recipients.length,
      })
      .eq('id', campaign_id);

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
      total: recipients.length,
    });

  } catch (error: any) {
    console.error('Campaign execution error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute campaign' },
      { status: 500 }
    );
  }
}

async function sendEmail(campaign: any, recipientEmail: string, supabase: any) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Resend API key not configured');
  }

  // Get customer name if available
  const { data: orders } = await supabase
    .from('orders')
    .select('buyer_name')
    .eq('buyer_email', recipientEmail)
    .limit(1)
    .single();

  const customerName = orders?.buyer_name || 'there';

  // Replace placeholders
  let subject = campaign.subject || 'Message from ' + campaign.organization.name;
  let message = campaign.message || '';

  subject = subject.replace('{{name}}', customerName);
  subject = subject.replace('{{email}}', recipientEmail);

  message = message.replace('{{name}}', customerName);
  message = message.replace('{{email}}', recipientEmail);

  // Send email
  await resend.emails.send({
    from: `${campaign.organization.name} <campaigns@groovegrid.ca>`,
    to: recipientEmail,
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">${campaign.organization.name}</h1>
          </div>
          
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
            <div style="white-space: pre-wrap; line-height: 1.6;">
              ${message}
            </div>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
            <p>${campaign.organization.name} via GrooveGrid</p>
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${recipientEmail}" style="color: #9ca3af;">Unsubscribe</a></p>
          </div>
        </body>
      </html>
    `,
  });
}

async function sendSMS(campaign: any, recipientEmail: string, supabase: any) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured');
  }

  // Get phone number from orders (would need to be stored)
  // For now, skip SMS if no phone
  console.log('SMS sending not fully implemented - requires phone number storage');
  throw new Error('SMS requires phone number setup');
}

async function sendWhatsApp(campaign: any, recipientEmail: string, supabase: any) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured');
  }

  // Get phone number from orders (would need to be stored)
  // For now, skip WhatsApp if no phone
  console.log('WhatsApp sending not fully implemented - requires phone number storage');
  throw new Error('WhatsApp requires phone number setup');
}

