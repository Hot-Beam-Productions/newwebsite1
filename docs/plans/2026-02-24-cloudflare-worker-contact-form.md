# Cloudflare Worker Contact Form Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Next.js Server Action + nodemailer/SMTP email path with a standalone Cloudflare Worker that validates the contact form, verifies Turnstile, and sends email via the native `send_email` binding.

**Architecture:** A new `worker/` subdirectory holds a Wrangler-managed Cloudflare Worker. The Next.js contact form component posts JSON directly to the Worker URL via `fetch()`. The Server Action (`src/app/actions/contact.ts`) is deleted entirely. The Worker uses `cloudflare:email` (built-in) + `mimetext` to construct and send the MIME email.

**Tech Stack:** Cloudflare Workers, Wrangler CLI, `cloudflare:email` module, `mimetext` npm package, Zod (for Worker-side validation), TypeScript.

---

## Prerequisites (manual steps before coding)

These must be done in the Cloudflare dashboard **before** deploying the Worker:

1. Go to `hotbeamproductions.com` → **Email** → **Email Routing** in the Cloudflare dashboard
2. Enable Email Routing
3. Under **Destination addresses**, add `contact@hotbeamproductions.com` and click the verification link sent to that inbox
4. No routing rules needed — the Worker sends directly via binding

---

## Task 1: Scaffold the `worker/` directory

**Files:**
- Create: `worker/package.json`
- Create: `worker/tsconfig.json`
- Create: `worker/wrangler.toml`

**Step 1: Create `worker/package.json`**

```json
{
  "name": "hotbeam-contact-worker",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "dependencies": {
    "mimetext": "^3.0.25",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241022.0",
    "typescript": "^5",
    "wrangler": "^3"
  }
}
```

**Step 2: Create `worker/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src/**/*.ts"]
}
```

**Step 3: Create `worker/wrangler.toml`**

```toml
name = "hotbeam-contact"
main = "src/index.ts"
compatibility_date = "2024-11-01"

[[send_email]]
name = "SEND_EMAIL"
destination_address = "contact@hotbeamproductions.com"
```

**Step 4: Install Worker dependencies**

```bash
cd worker && npm install
```

Expected: `node_modules/` created, no errors.

**Step 5: Commit**

```bash
git add worker/
git commit -m "feat: scaffold cloudflare worker directory"
```

---

## Task 2: Write the Worker (`worker/src/index.ts`)

**Files:**
- Create: `worker/src/index.ts`

**Step 1: Create `worker/src/index.ts`**

```typescript
import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  eventDate: z.string().optional(),
  venue: z.string().optional(),
  eventType: z.string().optional(),
  gearNeeds: z.array(z.string()).optional().default([]),
  message: z.string().min(10, "Message must be at least 10 characters"),
  turnstileToken: z.string().min(1, "Bot verification token missing"),
});

interface Env {
  SEND_EMAIL: SendEmail;
  TURNSTILE_SECRET_KEY: string;
}

const ALLOWED_ORIGINS = [
  "https://hotbeamproductions.com",
  "https://www.hotbeamproductions.com",
  "http://localhost:3000",
];

const FROM_ADDRESS = "contact@hotbeamproductions.com";
const TO_ADDRESS = "contact@hotbeamproductions.com";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";

    if (request.method === "OPTIONS") {
      return corsResponse(null, 204, origin);
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return corsResponse({ success: false, error: "Invalid request body" }, 400, origin);
    }

    // Validate with Zod
    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) {
      return corsResponse(
        { success: false, error: parsed.error.issues[0].message },
        400,
        origin
      );
    }

    // Verify Turnstile
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: parsed.data.turnstileToken,
        }),
      }
    );
    const verifyData = (await verifyRes.json()) as { success: boolean };
    if (!verifyData.success) {
      return corsResponse(
        { success: false, error: "Bot verification failed. Please try again." },
        400,
        origin
      );
    }

    // Build email HTML
    const { name, email, phone, eventDate, venue, eventType, gearNeeds, message } =
      parsed.data;

    const gearList =
      gearNeeds && gearNeeds.length > 0
        ? `<p><strong>Gear Needed:</strong> ${gearNeeds.join(", ")}</p>`
        : "";

    const html = `
      <h2 style="font-family:monospace">New Quote Request</h2>
      <table style="font-family:monospace;border-collapse:collapse;width:100%">
        <tr><td style="padding:4px 8px;color:#666">Name</td><td style="padding:4px 8px">${name}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Email</td><td style="padding:4px 8px"><a href="mailto:${email}">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding:4px 8px;color:#666">Phone</td><td style="padding:4px 8px">${phone}</td></tr>` : ""}
        ${eventDate ? `<tr><td style="padding:4px 8px;color:#666">Event Date</td><td style="padding:4px 8px">${eventDate}</td></tr>` : ""}
        ${venue ? `<tr><td style="padding:4px 8px;color:#666">Venue</td><td style="padding:4px 8px">${venue}</td></tr>` : ""}
        ${eventType ? `<tr><td style="padding:4px 8px;color:#666">Event Type</td><td style="padding:4px 8px">${eventType}</td></tr>` : ""}
      </table>
      ${gearList}
      <h3 style="font-family:monospace;margin-top:16px">Message</h3>
      <p style="font-family:monospace;white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:4px">${message}</p>
    `;

    // Send via Email Workers binding
    try {
      const msg = createMimeMessage();
      msg.setSender({ name: "Hot Beam Website", addr: FROM_ADDRESS });
      msg.setRecipient(TO_ADDRESS);
      msg.setHeader("Reply-To", email);
      msg.setSubject(`Quote Request from ${name}${eventType ? ` — ${eventType}` : ""}`);
      msg.addMessage({ contentType: "text/html", data: html });

      const emailMessage = new EmailMessage(FROM_ADDRESS, TO_ADDRESS, msg.asRaw());
      await env.SEND_EMAIL.send(emailMessage);
    } catch {
      return corsResponse(
        { success: false, error: "Failed to send message. Please try again." },
        500,
        origin
      );
    }

    return corsResponse({ success: true }, 200, origin);
  },
};

function corsResponse(body: unknown, status: number, origin: string): Response {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

**Step 2: Verify TypeScript compiles (from `worker/` directory)**

```bash
cd worker && npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add worker/src/index.ts
git commit -m "feat: add cloudflare worker for contact form email"
```

---

## Task 3: Set Worker secret and deploy

**Step 1: Authenticate Wrangler (skip if already logged in)**

```bash
cd worker && npx wrangler login
```

Expected: Browser opens, you authenticate with your Cloudflare account.

**Step 2: Set the Turnstile secret**

```bash
cd worker && npx wrangler secret put TURNSTILE_SECRET_KEY
```

Expected: Prompt appears — paste the value from `.env.local` (`TURNSTILE_SECRET_KEY=...`).

**Step 3: Deploy the Worker**

```bash
cd worker && npx wrangler deploy
```

Expected output includes:
```
Deployed hotbeam-contact triggers (1)
  https://hotbeam-contact.<your-subdomain>.workers.dev
```

Copy the Worker URL — you'll need it in Task 4.

**Step 4: Smoke-test the Worker with curl**

Replace `<WORKER_URL>` with the URL from the deploy output:

```bash
curl -X POST https://<WORKER_URL> \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello this is a test message","turnstileToken":"XXXX"}'
```

Expected: `{"success":false,"error":"Bot verification failed. Please try again."}` (Turnstile token is fake — that's correct, it means the Worker is running and validating.)

---

## Task 4: Update `.env.local`

**Files:**
- Modify: `.env.local`

**Step 1: Replace SMTP block with Worker URL**

Remove these three lines:
```
# Google Workspace SMTP (use an App Password, not your account password)
SMTP_USER=contact@hotbeamproductions.com
SMTP_PASS=your-16-character-app-password
SMTP_TO=contact@hotbeamproductions.com
```

Add in their place:
```
# Cloudflare Worker — contact form endpoint
NEXT_PUBLIC_WORKER_URL=https://hotbeam-contact.<your-subdomain>.workers.dev
```

Also remove `TURNSTILE_SECRET_KEY` if it was listed — it now lives only in the Worker secret, not in the Next.js env.

**Step 2: Commit**

```bash
git add .env.local
git commit -m "chore: remove smtp env vars, add worker url"
```

---

## Task 5: Rewrite `contact-form.tsx` to use `fetch()`

**Files:**
- Modify: `src/components/contact-form.tsx`

**Step 1: Replace the entire file contents**

The key changes:
- Remove: `useActionState`, `submitContactForm` import, `ContactFormState`
- Remove: hidden `cf-turnstile-response` input (token goes into JSON body directly)
- Add: `useState` for `pending`, `success`, `error`
- Add: `handleSubmit` async function that POSTs JSON to `NEXT_PUBLIC_WORKER_URL`
- Change: `<form action={action}>` → `<form onSubmit={handleSubmit}>`

```tsx
"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { GlowButton } from "@/components/glow-button";

const inputStyles =
  "w-full px-4 py-3 rounded bg-surface border border-border text-foreground placeholder:text-muted/60 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/40 transition-colors";

const gearOptions = [
  "Audio / PA System",
  "Lighting Design",
  "Video / LED Walls",
  "Lasers",
  "SFX (Cryo, Haze, Confetti)",
  "Full Production Package",
];

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [turnstileToken, setTurnstileToken] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);

    const formData = new FormData(e.currentTarget);

    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      eventDate: formData.get("eventDate") || undefined,
      venue: formData.get("venue") || undefined,
      eventType: formData.get("eventType") || undefined,
      gearNeeds: formData.getAll("gearNeeds") as string[],
      message: formData.get("message"),
      turnstileToken,
    };

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_WORKER_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { success: boolean; error?: string };
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-20" role="status">
        <CheckCircle
          className="w-16 h-16 text-laser-cyan mx-auto mb-6"
          aria-hidden="true"
        />
        <h3 className="font-heading text-3xl tracking-wider uppercase text-foreground mb-4">
          Message Sent
        </h3>
        <p className="text-muted max-w-md mx-auto text-sm">
          Got it. We&apos;ll review your specs and reply within one business
          day. For urgent requests, call us directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invisible Turnstile widget */}
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setTurnstileToken}
        options={{ size: "invisible" }}
      />

      {/* Error state */}
      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded bg-red-950/30 border border-red-900/40 text-red-400 text-sm"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm text-muted mb-2">
            Name <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            className={inputStyles}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-muted mb-2">
            Email <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputStyles}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>
      </div>

      {/* Phone & Event Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="block text-sm text-muted mb-2">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={inputStyles}
            placeholder="(303) 555-0100"
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="eventDate" className="block text-sm text-muted mb-2">
            Event Date
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            className={inputStyles}
          />
        </div>
      </div>

      {/* Venue & Event Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="venue" className="block text-sm text-muted mb-2">
            Venue
          </label>
          <input
            id="venue"
            name="venue"
            className={inputStyles}
            placeholder="Venue name or address"
          />
        </div>
        <div>
          <label
            htmlFor="eventType"
            className="block text-sm text-muted mb-2"
          >
            Event Type
          </label>
          <select id="eventType" name="eventType" className={inputStyles}>
            <option value="">Select type...</option>
            <option value="Concert / Festival">Concert / Festival</option>
            <option value="Corporate Event">Corporate Event</option>
            <option value="Conference">Conference</option>
            <option value="Wedding">Wedding</option>
            <option value="Private Event">Private Event</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Gear Needs */}
      <fieldset>
        <legend className="block text-sm text-muted mb-3">
          What do you need?
        </legend>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {gearOptions.map((gear) => (
            <label
              key={gear}
              className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-foreground transition-colors"
            >
              <input
                type="checkbox"
                name="gearNeeds"
                value={gear}
                className="rounded border-border bg-surface text-laser-cyan focus:ring-laser-cyan/40 focus-visible:ring-2"
              />
              {gear}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm text-muted mb-2">
          Tell us about your event <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          className={inputStyles}
          placeholder="Describe your event, expected attendance, technical requirements, or share your rider..."
        />
      </div>

      <GlowButton
        type="submit"
        variant="primary"
        className={pending ? "opacity-60 cursor-wait" : ""}
      >
        <Send className="w-4 h-4 mr-2 inline" aria-hidden="true" />
        {pending ? "Sending..." : "Send Quote Request"}
      </GlowButton>
    </form>
  );
}
```

**Step 2: Verify the Next.js app builds**

```bash
npm run build
```

Expected: Build completes with no TypeScript or module errors.

**Step 3: Commit**

```bash
git add src/components/contact-form.tsx
git commit -m "feat: rewrite contact form to post to cloudflare worker"
```

---

## Task 6: Delete the Server Action and remove nodemailer

**Files:**
- Delete: `src/app/actions/contact.ts`
- Modify: `package.json` (root)

**Step 1: Delete the Server Action file**

```bash
rm src/app/actions/contact.ts
```

**Step 2: Remove nodemailer from root `package.json`**

In the root `package.json`, remove these two entries:
- From `"dependencies"`: `"nodemailer": "^8.0.1"`
- From `"devDependencies"`: `"@types/nodemailer": "^7.0.11"`

**Step 3: Remove nodemailer from node_modules**

```bash
npm uninstall nodemailer @types/nodemailer
```

Expected: `package.json` and `package-lock.json` updated, no errors.

**Step 4: Confirm the build still passes**

```bash
npm run build
```

Expected: Build completes cleanly.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove server action and nodemailer, switch to cloudflare worker"
```

---

## Task 7: End-to-end verification

**Step 1: Start the Next.js dev server**

```bash
npm run dev
```

**Step 2: Open `http://localhost:3000/contact` in a browser**

**Step 3: Fill in and submit the form**

Fill in all required fields with real data and submit. Watch the network tab for a request to the Worker URL. Expected: `{ "success": true }` response, form shows the success state.

**Step 4: Check the inbox**

Verify that `contact@hotbeamproductions.com` received the email with correct fields populated.

**Step 5: Verify the `.env.local` comment no longer mentions SMTP**

There should be no mention of Google Workspace or SMTP anywhere in the project outside of git history.

---

## Summary of all changed files

| File | Action |
|------|--------|
| `worker/package.json` | Created |
| `worker/tsconfig.json` | Created |
| `worker/wrangler.toml` | Created |
| `worker/src/index.ts` | Created |
| `src/app/actions/contact.ts` | Deleted |
| `src/components/contact-form.tsx` | Modified |
| `.env.local` | Modified |
| `package.json` (root) | Modified |
