import type { VercelRequest, VercelResponse } from '@vercel/node';

// Serverless endpoint to upload CV to GitHub repository.
// Requires env vars: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH (optional, default 'main'), CV_PATH (optional, default 'public/ashish dhamala cv.pdf')

const GITHUB_API = 'https://api.github.com';

async function ghRequest(path: string, method = 'GET', body?: any, token?: string) {
  const headers: any = { 'Authorization': `token ${token}`, 'User-Agent': 'starkfolio-cv-uploader' };
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send({ error: 'Method not allowed' });

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const cvPath = process.env.CV_PATH || 'public/ashish dhamala cv.pdf';
  const metaPath = process.env.CV_META_PATH || 'public/cv_meta.json';

  if (!token || !owner || !repo) {
    return res.status(400).json({ error: 'Server not configured. Missing GITHUB_* env vars.' });
  }

  try {
    const { name, type, content } = req.body || {};
    if (!name || !content) return res.status(400).json({ error: 'Missing name or content' });

    // Determine current version from meta file
    let currentVersion = 0;
    const metaResp = await ghRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(metaPath)}?ref=${branch}`, 'GET', undefined, token);
    if (metaResp.ok && metaResp.json && metaResp.json.content) {
      const metaBuf = Buffer.from(metaResp.json.content, 'base64').toString('utf8');
      try { const meta = JSON.parse(metaBuf); currentVersion = meta.version || 0; } catch(e) {}
    }
    const newVersion = currentVersion + 1;

    // Upload CV file (overwrite or create)
    const putBody = {
      message: `Upload CV v${newVersion}`,
      content: content, // base64 encoded
      branch,
    } as any;

    // Check if file exists to include sha
    const existing = await ghRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(cvPath)}?ref=${branch}`, 'GET', undefined, token);
    if (existing.ok && existing.json && existing.json.sha) putBody.sha = existing.json.sha;

    const uploadResp = await ghRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(cvPath)}`, 'PUT', putBody, token);
    if (!uploadResp.ok) return res.status(500).json({ error: 'Failed to upload CV', detail: uploadResp.json });

    // Update meta file
    const metaContent = Buffer.from(JSON.stringify({ version: newVersion, filename: name }, null, 2)).toString('base64');
    const metaPut = { message: `Update CV meta v${newVersion}`, content: metaContent, branch } as any;
    const metaExisting = await ghRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(metaPath)}?ref=${branch}`, 'GET', undefined, token);
    if (metaExisting.ok && metaExisting.json && metaExisting.json.sha) metaPut.sha = metaExisting.json.sha;
    const metaResp2 = await ghRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(metaPath)}`, 'PUT', metaPut, token);
    if (!metaResp2.ok) return res.status(500).json({ error: 'Failed to update meta', detail: metaResp2.json });

    return res.status(200).json({ ok: true, version: newVersion, filename: name });
  } catch (e: any) {
    console.error('upload-cv error', e);
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
