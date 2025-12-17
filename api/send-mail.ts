// Vercel serverless: forward contact form to MailJS HTTP API.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

  const MAILJS_API_URL = process.env.MAILJS_API_URL;
  const MAILJS_API_KEY = process.env.MAILJS_API_KEY;
  const MAILJS_TEMPLATE_ID = process.env.MAILJS_TEMPLATE_ID;
  const TO_EMAIL = process.env.TO_EMAIL || 'ashish.221706@ncit.edu.np';

  if (!MAILJS_API_URL || !MAILJS_API_KEY) {
    return res.status(500).json({ error: 'MailJS not configured on server (missing env vars)' });
  }

  try {
    const payload = {
      template_id: MAILJS_TEMPLATE_ID,
      to: TO_EMAIL,
      variables: { name, email, message, time: new Date().toLocaleString() },
    };

    const r = await fetch(MAILJS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MAILJS_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    if (!r.ok) {
      console.error('MailJS error', r.status, text);
      return res.status(500).json({ error: 'MailJS send failed', details: text });
    }

    return res.status(200).json({ ok: true, details: text });
  } catch (e: any) {
    console.error('MailJS forward error', e);
    return res.status(500).json({ error: 'Send failed', details: String(e) });
  }
}
