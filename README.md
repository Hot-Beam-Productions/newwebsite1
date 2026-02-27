# Hot Beam Productions Website

Production website and lightweight CMS for Hot Beam Productions.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + Framer Motion
- Firebase Auth + Firestore (client-SDK based admin CMS)
- Cloudflare Worker (`worker/`) for contact form intake
- Cloudflare Worker (`worker-ig-refresh/`) for Instagram token refresh + Vercel env sync
- Cloudflare R2 for image uploads via `src/app/api/upload/route.ts`

## Repository Layout

- `src/app/(public)` public routes
- `src/app/admin` admin dashboard and editor pages
- `src/app/api/upload/route.ts` authenticated R2 upload endpoint
- `src/components` shared UI components
- `src/components/admin` admin-specific UI + form utilities
- `src/lib` shared runtime helpers, validation schemas, Firebase clients
- `src/data/data.json` static fallback content (last-resort fallback)
- `worker/` contact form worker
- `worker-ig-refresh/` Instagram token refresh worker
- `scripts/` one-off Firestore maintenance scripts

## Content Model

Public pages use `getPublicSiteData()` from [`src/lib/public-site-data.ts`](/Users/danielmankin/Documents/GitHub/newwebsite/src/lib/public-site-data.ts).

Data resolution order:

1. Read from Firestore (`site`, `projects`, `rentals`)
2. Validate against Zod schemas (`src/lib/schemas.ts`)
3. Fall back to last published snapshot in R2 (`system/public-site-data.json` by default)
4. Fall back to `src/data/data.json` for any missing/invalid data

## Refresh Static Fallback JSON

To copy current Firestore content into `src/data/data.json`:

```bash
npm run sync:fallback-json
```

Validate only (no file write):

```bash
npm run sync:fallback-json:check
```

For periodic updates, run this command from cron/CI and then deploy.
`src/data/data.json` is build-time content, so production does not use a new file until the next build/deploy.

Automated option:

- Workflow: [`.github/workflows/sync-fallback-and-deploy.yml`](/Users/danielmankin/Documents/GitHub/newwebsite/.github/workflows/sync-fallback-and-deploy.yml)
- Schedule: every 6 hours (UTC) + manual `workflow_dispatch`
- Behavior: syncs `src/data/data.json`, commits only when changed, then deploys to Vercel production

Required GitHub repository secrets for this workflow:

- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill values.

Required for app/admin:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Required for contact form UI:

- `NEXT_PUBLIC_CONTACT_ENDPOINT`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Required for upload API route:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `NEXT_PUBLIC_R2_DOMAIN`

Optional:

- `NEXT_PUBLIC_ADMIN_EMAIL_DOMAIN` (client auth UX domain hint)
- `ADMIN_EMAIL_DOMAIN` (server-side upload auth domain check)
- `INSTAGRAM_ACCESS_TOKEN` (server-rendered Instagram feed)
- `PUBLIC_SITE_SNAPSHOT_KEY` (override R2 key for published public-data snapshot; default: `system/public-site-data.json`)

## Local Development

Install dependencies:

```bash
npm install
npm --prefix worker install
npm --prefix worker-ig-refresh install
```

Start web app:

```bash
npm run dev
```

Optional worker dev servers:

```bash
npm --prefix worker run dev
npm --prefix worker-ig-refresh run dev
```

## Production Validation

Run before opening a PR:

```bash
npm run lint
npm run build
npm --prefix worker run deploy -- --dry-run
npm --prefix worker-ig-refresh run deploy -- --dry-run
```

## Security Notes

- Admin writes are protected by Firebase Auth + Firestore rules (`@hotbeamproductions.com` + verified email).
- Upload API verifies Firebase ID tokens server-side before writing to R2.
- Contact worker enforces CORS allowlist, request size limits, input validation, and Turnstile verification.
- Contact worker intentionally omits Turnstile token from external lead logging.
- Public/cms payloads are schema-validated before rendering.

## Coding Standards

This repo favors straightforward, maintainable code:

- Prefer explicit, readable logic over dense abstractions.
- Keep validation close to write boundaries.
- Use shared helpers when logic repeats in 3+ places.
- Add comments only for non-obvious "why", not obvious "what".
- Remove dead code and generated artifacts from version control.

See [`AGENTS.md`](/Users/danielmankin/Documents/GitHub/newwebsite/AGENTS.md) for command workflows and contributor automation guidance.
