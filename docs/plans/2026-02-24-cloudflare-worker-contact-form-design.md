# Design: Cloudflare Worker Contact Form

**Date:** 2026-02-24
**Status:** Approved

## Context

The contact form currently uses a Next.js Server Action (`src/app/actions/contact.ts`) that sends email via `nodemailer` + Google Workspace SMTP (`smtp.gmail.com`). The goal is to remove all SMTP/nodemailer dependencies and replace them with a Cloudflare Worker that sends email natively via the Cloudflare Email Workers `send_email` binding.

The domain `hotbeamproductions.com` is already managed through Cloudflare, making the `send_email` binding the cleanest path — no external email service or API keys needed.

## Architecture

```
Browser (ContactForm)
  |
  | fetch() POST JSON
  v
Cloudflare Worker (worker/src/index.ts)
  |-- validate CORS
  |-- parse + validate body (Zod)
  |-- verify Turnstile token
  |-- send_email binding → contact@hotbeamproductions.com
  |
  v
{ success: true } or { success: false, error: "..." }
```

## New Directory: `worker/`

```
worker/
  src/
    index.ts          # Worker entry point
  wrangler.toml       # Cloudflare config + send_email binding
  package.json        # Worker deps: zod, @cloudflare/workers-types
  tsconfig.json
```

## Worker Logic (`worker/src/index.ts`)

1. Handle `OPTIONS` preflight for CORS
2. Reject non-`POST` requests with 405
3. Validate `Origin` header against allowed domains (prod + localhost)
4. Parse JSON body
5. Validate with Zod schema (same fields as current: name, email, phone, eventDate, venue, eventType, gearNeeds, message, turnstileToken)
6. Verify Turnstile token via `https://challenges.cloudflare.com/turnstile/v0/siteverify`
7. Build email HTML (same template as current)
8. Send via `send_email` binding using `cloudflare:email` module
9. Return JSON response

## Worker Config (`wrangler.toml`)

```toml
name = "hotbeam-contact"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[send_email]
name = "SEND_EMAIL"
destination_address = "contact@hotbeamproductions.com"
```

## Worker Secrets (via `wrangler secret put`)

| Secret | Description |
|--------|-------------|
| `TURNSTILE_SECRET_KEY` | Moved from Next.js `.env.local` |

## Changes to Next.js App

| File | Change |
|------|--------|
| `src/app/actions/contact.ts` | Deleted |
| `src/components/contact-form.tsx` | Replace `useActionState` pattern with `useState` + `fetch()` to `NEXT_PUBLIC_WORKER_URL` |
| `.env.local` | Remove `SMTP_USER`, `SMTP_PASS`, `SMTP_TO`; add `NEXT_PUBLIC_WORKER_URL` |
| `package.json` | Remove `nodemailer`, `@types/nodemailer` |

## Cloudflare Dashboard Setup (one-time, manual)

1. Go to **Email Routing** for `hotbeamproductions.com`
2. Enable Email Routing
3. Add destination address `contact@hotbeamproductions.com` and verify it
4. No routing rules needed — the Worker uses `send_email` binding directly

## Error Handling

- Zod validation errors → `{ success: false, error: "<first issue message>" }`
- Turnstile failure → `{ success: false, error: "Bot verification failed. Please try again." }`
- Email send failure → `{ success: false, error: "Failed to send message. Please try again." }`
- CORS rejection → 403
- Non-POST → 405

## ContactForm Component Changes

- Remove `useActionState`, `submitContactForm` import
- Add `useState` for: `pending`, `success`, `error`
- On submit: call `fetch(process.env.NEXT_PUBLIC_WORKER_URL, { method: 'POST', body: JSON.stringify(...) })`
- Preserve all existing field structure, Turnstile widget, and success/error UI
