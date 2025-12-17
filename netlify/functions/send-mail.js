// Netlify function: forward contact form to MailJS HTTP API
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { name, email, message } = body || {};
  if (!name || !email || !message) return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };

  // EmailJS server-side forwarder
  const TO_EMAIL = process.env.TO_EMAIL || 'ashish.221706@ncit.edu.np';

  // try to read local config if present
  let cfg = {};
  try { cfg = require('../../emailjs.config.json'); } catch (e) { cfg = {}; }

  const EMAILJS_API_URL = process.env.EMAILJS_API_URL || 'https://api.emailjs.com/api/v1.0/email/send';
  const SERVICE_ID = process.env.EMAILJS_SERVICE_ID || cfg.serviceId || cfg.service_id || '';
  const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || cfg.templateId || cfg.template_id || '';
  const USER_ID = process.env.EMAILJS_USER_ID || cfg.publicKey || cfg.userId || cfg.user_id || '';

  if (!SERVICE_ID || !TEMPLATE_ID || !USER_ID) return { statusCode: 500, body: JSON.stringify({ error: 'EmailJS not configured' }) };

  try {
    const payload = {
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: USER_ID,
      template_params: { name, email, message, time: new Date().toLocaleString(), to: TO_EMAIL },
    };

    const r = await fetch(EMAILJS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    if (!r.ok) {
      console.error('EmailJS error', r.status, text);
      return { statusCode: 500, body: JSON.stringify({ error: 'EmailJS send failed', details: text }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, details: text }) };
  } catch (e) {
    console.error('EmailJS forward error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Send failed', details: String(e) }) };
  }
};
