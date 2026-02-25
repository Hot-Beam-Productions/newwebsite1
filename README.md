# Hot Beam Productions Website

High-end event production website built with Next.js App Router and a local JSON content model.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Cloudflare Turnstile
- Cloudflare Worker contact endpoint (`worker/`)

## Content Architecture

All site content is centralized in:

- `src/data/data.json`

This file contains:

- Brand metadata and navigation
- Home page copy and service blocks
- Portfolio projects
- Team and company copy
- Rental inventory
- Contact page and form options

Typed accessors live in:

- `src/lib/site-data.ts`

## Local Development

1. Install dependencies

```bash
npm install
```

2. Configure environment

Create/update `.env.local`:

```env
NEXT_PUBLIC_CONTACT_ENDPOINT=https://hotbeam-contact.<your-subdomain>.workers.dev
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
NEXT_PUBLIC_R2_DOMAIN=pub-xxxx.r2.dev
# Optional
# INSTAGRAM_ACCESS_TOKEN=...
```

3. Start dev server

```bash
npm run dev
```

4. Open:

- `http://localhost:3000`

## Contact Form (Free Cloudflare + Optional Google)

The form posts to the Cloudflare Worker in `worker/src/index.ts`.

### Cloudflare setup

1. Enable Email Routing for your domain in Cloudflare.
2. Verify your destination inbox.
3. Deploy the worker:

```bash
cd worker
npm install
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler deploy
```

4. Set Worker variables (in `worker/wrangler.toml` or dashboard):

- `ALLOWED_ORIGINS`
- `CONTACT_TO_ADDRESS`
- Optional: `GOOGLE_APPS_SCRIPT_URL`

### Optional Google Sheets logging (free)

If you want each lead logged to a Google Sheet:

1. Create a Google Sheet.
2. Open Apps Script and deploy as Web App (`Anyone with link`).
3. Use this script body:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Leads');
  const data = JSON.parse(e.postData.contents || '{}');
  sheet.appendRow([
    new Date(),
    data.name || '',
    data.email || '',
    data.phone || '',
    data.eventDate || '',
    data.venue || '',
    data.eventType || '',
    (data.gearNeeds || []).join(', '),
    data.message || '',
    data.ipAddress || ''
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
```

4. Copy the Web App URL and set it as Worker secret/var:

```bash
npx wrangler secret put GOOGLE_APPS_SCRIPT_URL
```

## Production Build

```bash
npm run lint
npm run build
```

## Deploy

- Frontend: deploy on Vercel or Cloudflare Pages.
- Contact backend: deploy `worker/` with Wrangler.
- Update `NEXT_PUBLIC_CONTACT_ENDPOINT` in your production environment to the deployed Worker URL.
