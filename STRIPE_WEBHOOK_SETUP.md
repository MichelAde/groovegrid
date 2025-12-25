# Stripe Webhook Setup Guide

## Overview
The webhook endpoint processes successful payments and creates orders, tickets, and sends confirmation emails.

**Webhook URL:** `https://your-domain.com/api/webhooks/stripe`

---

## Development Setup (Testing Locally)

### 1. Install Stripe CLI
Download from: https://stripe.com/docs/stripe-cli

### 2. Login to Stripe CLI
```bash
stripe login
```

### 3. Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output a webhook signing secret like: `whsec_...`

### 4. Add to `.env.local`
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Test a Payment
Make a test purchase on your local site. The Stripe CLI will show the webhook events in real-time.

---

## Production Setup (Vercel)

### 1. Get Your Production URL
Your Vercel URL: `https://groovegrid-seven.vercel.app`
Webhook endpoint: `https://groovegrid-seven.vercel.app/api/webhooks/stripe`

### 2. Create Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://groovegrid-seven.vercel.app/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed` ✅ (REQUIRED)
   - `payment_intent.succeeded` (optional)
   - `payment_intent.payment_failed` (optional)
5. Click "Add endpoint"

### 3. Get Signing Secret
After creating the endpoint, Stripe will show you the "Signing secret" (starts with `whsec_`).

### 4. Add to Vercel Environment Variables

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add new variable:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_...` (from Stripe dashboard)
   - **Environment:** Production (and Preview if needed)
3. Click "Save"
4. Redeploy your app for the variable to take effect

---

## Testing the Webhook

### Test Mode Payment
Use Stripe test card: `4242 4242 4242 4242`
- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC (e.g., 123)
- Any ZIP code

### Check if Webhook Fired

1. **In Stripe Dashboard:**
   - Go to Developers → Webhooks
   - Click on your endpoint
   - View the "Events" tab
   - You should see `checkout.session.completed` events

2. **In Supabase:**
   - Check the `orders` table for new records
   - Check the `order_items` table
   - Check the `tickets` table for generated tickets
   - Check `ticket_types` to see `quantity_sold` updated

3. **In Resend (if configured):**
   - Go to Resend dashboard
   - Check "Emails" tab
   - You should see the confirmation email sent

---

## Webhook Event Flow

```
Customer completes checkout
    ↓
Stripe sends webhook to your endpoint
    ↓
Verify webhook signature (security check)
    ↓
Parse checkout session metadata
    ↓
Create order record in database
    ↓
Create order_items for each ticket type
    ↓
Update ticket_types.quantity_sold
    ↓
Generate individual tickets with QR codes
    ↓
Send confirmation email via Resend
    ↓
Return success response to Stripe
```

---

## Troubleshooting

### Webhook Returns 400 Error
- **Cause:** Invalid signature
- **Fix:** Double-check `STRIPE_WEBHOOK_SECRET` in Vercel matches Stripe dashboard
- **Fix:** Make sure you're using the webhook secret for the correct environment (test vs. live)

### Webhook Returns 500 Error
- **Cause:** Code error during processing
- **Fix:** Check Vercel logs: Vercel Dashboard → Your Project → Logs
- **Fix:** Check Supabase logs for database errors

### Webhook Never Fires
- **Cause:** URL not correct or endpoint not reachable
- **Fix:** Verify webhook URL in Stripe dashboard
- **Fix:** Make sure your Vercel deployment is live
- **Fix:** Test endpoint manually with `curl` to check it's reachable

### Orders Not Created
- **Cause:** Metadata missing from checkout session
- **Check:** Console logs in webhook handler
- **Check:** Checkout API is including all required metadata

### Emails Not Sent
- **Cause:** Resend API key not configured
- **Fix:** Add `RESEND_API_KEY` to Vercel environment variables
- **Note:** Order will still be created even if email fails

### QR Codes Not Generated
- **Cause:** Tickets table insert failing
- **Check:** Supabase logs for `tickets` table errors
- **Check:** RLS policies allow inserting tickets

---

## Security Notes

1. **Always verify webhook signature** - This is critical to prevent fake requests
2. **Use HTTPS in production** - Webhook endpoints must use HTTPS
3. **Keep webhook secret private** - Never commit to Git or share publicly
4. **Handle idempotency** - Stripe may send the same event multiple times

---

## Next Steps After Webhook Works

1. ✅ Verify orders are created correctly
2. ✅ Test that ticket quantities update
3. ✅ Confirm emails are sent
4. Create React Email templates for better emails
5. Generate actual QR code images (instead of just text)
6. Add email attachments with QR codes
7. Implement pass and package purchase webhooks

---

## Useful Commands

### View Webhook Events (Stripe CLI)
```bash
stripe events list
```

### Resend Specific Event (for testing)
```bash
stripe events resend evt_...
```

### Trigger Test Event
```bash
stripe trigger checkout.session.completed
```

---

**Status:** Webhook handler code complete, needs configuration in Stripe + Vercel

