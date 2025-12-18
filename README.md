# swopneel — Deployment & CV / EmailJS Setup

This repository is a Vite + React app prepared for both Vercel and Netlify deployments. It includes serverless endpoints to allow uploading a new CV and updating `public/cv_meta.json` so clients can detect changes.

## Quick start

Install dependencies and run locally:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## EmailJS client (contact form)

Configuration is stored in `emailjs.config.json` at the repository root. It currently contains your public key and placeholder values for `serviceId` and `templateId`.

Update the file with your EmailJS service and template IDs. Example:

```json
{
  "publicKey": "hpNGItdN3uNBJOCpJ",
  "serviceId": "service_xxx",
  "templateId": "template_xxx"
}
```

Required template variables:
- `to_email` (recipient) — if you want to override recipient in template parameters
- `user_name`
- `user_email`
- `message`

Example EmailJS template body (use in your EmailJS dashboard):

```
From: {{user_name}} <{{user_email}}>
To: {{to_email}}

Message:
{{message}}
```

If sending fails with `Bad request` or `400`, check that your template variable names match the ones above.

## Serverless upload endpoints (CV)

There are two server functions to support committing a CV to the GitHub repo and updating `public/cv_meta.json`:

- Vercel: `api/upload-cv.ts` (deployed under `/api/upload-cv`)
- Netlify: `netlify/functions/upload-cv.js` (deployed under `/.netlify/functions/upload-cv`)

Both require the following environment variables to be set on the hosting platform:

- `GITHUB_TOKEN` — a personal access token with `repo` scope
- `GITHUB_OWNER` — your GitHub account or org name
- `GITHUB_REPO` — repository name (e.g., `swopneel`)
- Optional: `GITHUB_BRANCH` (default: `main`)
- Optional: `CV_PATH` (default path used in code is `public/ASHISH DHAMALA CV.pdf`)
- Optional: `CV_META_PATH` (default `public/cv_meta.json`)

### Validating endpoints locally

You can run local dev servers and then run the validator script to test both endpoints:

```bash
# start Vite dev
npm run dev

# (Optional) start Netlify dev if you use netlify CLI
# netlify dev

# then in another terminal run:
node scripts/validate_endpoints.js
```

The validator attempts to POST a small base64 payload to `http://localhost:3000/api/upload-cv` and `http://localhost:8888/.netlify/functions/upload-cv` and will show the responses.

## Replacing placeholders

- Replace `emailjs.config.json` `serviceId` and `templateId` with values from EmailJS.
- Set the GitHub-related env vars in your Vercel/Netlify project settings before using the admin upload flow.

## Troubleshooting EmailJS

- If you see `Send failed` in the UI, open the browser console for detailed errors. Common causes:
  - Wrong `serviceId` or `templateId`.
  - Template variable names don't match the template parameters sent from the form.
  - Public key not initialized (the config file `publicKey` is missing).

## Notes

- The Contact form UI prevents page reload and shows an inline status message with helpful guidance when sending fails.
- The repo includes `vercel.json` and `netlify.toml` for easy deployments.
<div align="center">

</div>


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploying to Hosting (Vercel / Netlify / Render)

This project is ready for Vercel, Netlify, or Render. Use the steps below to deploy and set environment variables.

- Build command: `npm run build`
- Output directory: (Vite's default) handled by Vercel/Netlify/Render automatically

Required environment variables (set in each platform's dashboard):

- `EMAILJS_SERVICE_ID` — EmailJS service id (e.g., `service_6bwk7ey`)
- `EMAILJS_TEMPLATE_ID` — EmailJS template id (e.g., `template_q5ccrhv`)
- `EMAILJS_USER_ID` — EmailJS public key/user id (e.g., `hpNGItdN3uNBJOCpJ`)
- Optional: `TO_EMAIL` — destination email for server-side templates (if used)

Additional optional envs for admin CV upload flow:

- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH` (default `main`)

Vercel
- Import the repository in Vercel, set the env vars in Project Settings → Environment Variables, and deploy. Serverless functions in `api/` will run on Vercel automatically.

Netlify
- Create a site from Git and connect the repo. Add the same environment variables in Site settings → Build & deploy → Environment. Netlify functions are in `netlify/functions/` and will auto-deploy.

Render
- Create a new Web Service (or Static Site if using static hosting) and connect to your repo. Provide the same env vars in the Render dashboard. For serverless functions, consider using Render's Background Workers or an external server if needed.

After deployment
- Open your deployed site and test the contact form — the client-side EmailJS implementation will run in the user's browser and send messages through EmailJS.

Security note
- Do not commit secret API keys to the repository. Use the `.env.example` as a template and set the real secrets in the hosting platform.

