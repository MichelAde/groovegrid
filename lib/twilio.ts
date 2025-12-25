import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.warn('Missing Twilio credentials. SMS/WhatsApp features will be disabled.');
}

export const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendSMS(to: string, body: string) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    throw new Error('Twilio not configured');
  }

  return await twilioClient.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
}

export async function sendWhatsApp(to: string, body: string) {
  if (!twilioClient || !process.env.TWILIO_WHATSAPP_NUMBER) {
    throw new Error('Twilio WhatsApp not configured');
  }

  return await twilioClient.messages.create({
    body,
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:${to}`,
  });
}



