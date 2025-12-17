// Vercel serverless: forward contact form to EmailJS HTTP API.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

  // Allow configuration via env, fallback to local emailjs.config.json when available
  let cfg: any = {};
  try {
    // dynamic import works in ESM environments
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cfg = require('../emailjs.config.json');
  } catch (e) {
    cfg = {};
  }

  const EMAILJS_API_URL = process.env.EMAILJS_API_URL || 'https://api.emailjs.com/api/v1.0/email/send';
  const SERVICE_ID = process.env.EMAILJS_SERVICE_ID || cfg.serviceId || cfg.service_id || '';
  const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || cfg.templateId || cfg.template_id || '';
  const USER_ID = process.env.EMAILJS_USER_ID || cfg.publicKey || cfg.userId || cfg.user_id || '';
  const TO_EMAIL = process.env.TO_EMAIL || 'ashish.221706@ncit.edu.np';

  if (!SERVICE_ID || !TEMPLATE_ID || !USER_ID) {
    return res.status(500).json({ error: 'EmailJS not configured on server (missing service/template/user id)' });
  }

  try {
    const payload = {
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: USER_ID,
      template_params: { name, email, message, time: new Date().toLocaleString(), to: TO_EMAIL },
    };

    const r = await fetch(EMAILJS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    if (!r.ok) {
      console.error('EmailJS error', r.status, text);
      return res.status(500).json({ error: 'EmailJS send failed', status: r.status, details: text });
    }

    return res.status(200).json({ ok: true, details: text });
  } catch (e: any) {
    console.error('EmailJS forward error', e);
    return res.status(500).json({ error: 'Send failed', details: String(e) });
  }
}
