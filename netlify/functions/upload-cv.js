// Netlify function to upload CV to GitHub repository.
// Requires env vars: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH (optional, default 'main'), CV_PATH (optional)

const GITHUB_API = 'https://api.github.com';

async function ghRequest(path, method = 'GET', body, token) {
  const headers = { 'Authorization': `token ${token}`, 'User-Agent': 'starkfolio-cv-uploader' };
  if (body && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  const res = await fetch(`${GITHUB_API}${path}`, { method, headers, body });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { json = text; }
  return { status: res.status, ok: res.ok, json };
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const cvPath = process.env.CV_PATH || 'public/ashish dhamala cv.pdf';
  const metaPath = process.env.CV_META_PATH || 'public/cv_meta.json';

  if (!token || !owner || !repo) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Server not configured. Missing GITHUB_* env vars.' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { name, content } = body;
    if (!name || !content) return { statusCode: 400, body: JSON.stringify({ error: 'Missing name or content' }) };

    // read meta
    let currentVersion = 0;
    const metaResp = await ghRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(metaPath)}?ref=${branch}`, 'GET', undefined, token);
    if (metaResp.ok && metaResp.json && metaResp.json.content) {
      const metaBuf = Buffer.from(metaResp.json.content, 'base64').toString('utf8');
      try { const meta = JSON.parse(metaBuf); currentVersion = meta.version || 0; } catch(e) {}
    }
    const newVersion = currentVersion + 1;

    const putBody = { message: `Upload CV v${newVersion}`, content, branch };
    const existing = await ghRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(cvPath)}?ref=${branch}`, 'GET', undefined, token);
    if (existing.ok && existing.json && existing.json.sha) putBody.sha = existing.json.sha;

    const uploadResp = await ghRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(cvPath)}`, 'PUT', putBody, token);
    if (!uploadResp.ok) return { statusCode: 500, body: JSON.stringify({ error: 'Failed to upload CV', detail: uploadResp.json }) };

    const metaContent = Buffer.from(JSON.stringify({ version: newVersion, filename: name }, null, 2)).toString('base64');
    const metaPut = { message: `Update CV meta v${newVersion}`, content: metaContent, branch };
    const metaExisting = await ghRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(metaPath)}?ref=${branch}`, 'GET', undefined, token);
    if (metaExisting.ok && metaExisting.json && metaExisting.json.sha) metaPut.sha = metaExisting.json.sha;
    const metaResp2 = await ghRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(metaPath)}`, 'PUT', metaPut, token);
    if (!metaResp2.ok) return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update meta', detail: metaResp2.json }) };

    return { statusCode: 200, body: JSON.stringify({ ok: true, version: newVersion, filename: name }) };
  } catch (e) {
    console.error('upload-cv error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error', detail: String(e) }) };
  }
}
