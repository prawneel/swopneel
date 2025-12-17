// Netlify function: forward contact form to MailJS HTTP API
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { name, email, message } = body || {};
  if (!name || !email || !message) return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };

  const MAILJS_API_URL = process.env.MAILJS_API_URL;
  const MAILJS_API_KEY = process.env.MAILJS_API_KEY;
  const MAILJS_TEMPLATE_ID = process.env.MAILJS_TEMPLATE_ID;
  const TO_EMAIL = process.env.TO_EMAIL || 'ashish.221706@ncit.edu.np';

  if (!MAILJS_API_URL || !MAILJS_API_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'MailJS not configured' }) };

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
      return { statusCode: 500, body: JSON.stringify({ error: 'MailJS send failed', details: text }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, details: text }) };
  } catch (e) {
    console.error('MailJS forward error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Send failed', details: String(e) }) };
  }
};
