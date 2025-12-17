const fetch = globalThis.fetch || require('node-fetch');
const fs = require('fs');

async function testVercel() {
  const url = 'http://localhost:3000/api/upload-cv';
  console.log('Testing Vercel API endpoint:', url);
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'test.pdf', content: Buffer.from('hello').toString('base64') }) });
    console.log('Vercel response status:', res.status);
    console.log('Vercel body:', await res.text());
  } catch (e) {
    console.warn('Vercel endpoint test failed (is your dev server running?)', e.message || e);
  }
}

async function testNetlify() {
  const url = 'http://localhost:8888/.netlify/functions/upload-cv';
  console.log('Testing Netlify function endpoint:', url);
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'test.pdf', content: Buffer.from('hello').toString('base64') }) });
    console.log('Netlify response status:', res.status);
    console.log('Netlify body:', await res.text());
  } catch (e) {
    console.warn('Netlify endpoint test failed (is netlify dev running?)', e.message || e);
  }
}

(async function main(){
  console.log('Endpoint validator — tries common local dev URLs. Requires local dev servers running.');
  await testVercel();
  await testNetlify();
  console.log('Done.');
})();
