const sgMail = require('@sendgrid/mail');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email, message } = body || {};
  if (!name || !email || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
  }

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL;
  const TO_EMAIL = process.env.TO_EMAIL || 'ashish.221706@ncit.edu.np';

  if (!SENDGRID_API_KEY || !FROM_EMAIL) {
    return { statusCode: 500, body: JSON.stringify({ error: 'SendGrid not configured' }) };
  }

  try {
    sgMail.setApiKey(SENDGRID_API_KEY);
    const msg = {
      to: TO_EMAIL,
      from: FROM_EMAIL,
      subject: `Portfolio contact from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p>From: ${name} &lt;${email}&gt;</p><pre>${message}</pre>`,
    };

    await sgMail.send(msg);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error('SendGrid error', e?.response || e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Send failed', details: String(e) }) };
  }
};
