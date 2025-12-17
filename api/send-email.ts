import { IncomingMessage, ServerResponse } from 'http';

// Vercel / serverless API: sends email using SendGrid.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL;
  const TO_EMAIL = process.env.TO_EMAIL || 'ashish.221706@ncit.edu.np';

  if (!SENDGRID_API_KEY || !FROM_EMAIL) {
    res.status(500).json({ error: 'SendGrid not configured on server (missing env vars)' });
    return;
  }

  try {
    const sg = (await import('@sendgrid/mail')).default;
    sg.setApiKey(SENDGRID_API_KEY);

    const msg: any = {
      to: TO_EMAIL,
      from: FROM_EMAIL,
      subject: `Portfolio contact from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p>From: ${name} &lt;${email}&gt;</p><pre>${message}</pre>`,
    };

    await sg.send(msg);
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('SendGrid send error', e?.response || e);
    res.status(500).json({ error: 'Send failed', details: e?.toString?.() || e });
  }
}
