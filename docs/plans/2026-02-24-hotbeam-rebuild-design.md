# Hot Beam Productions — Full Rebuild Design Doc
**Date:** 2026-02-24
**Status:** Approved

---

## Context

Migrating the Hot Beam Productions website (Next.js 16, App Router, Tailwind CSS v4, React 19) away from Sanity CMS to a hardcoded local JSON architecture. Simultaneously rebranding accent color from red to laser-cyan and wiring up a secure contact form with Server Actions + Nodemailer + Cloudflare Turnstile.

**Current stack:** next-sanity, sanity, @portabletext/react, @sanity/image-url, @sanity/vision
**Target stack:** Local JSON files, nodemailer, zod, @cloudflare/turnstile (widget loaded via script tag)

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Migration strategy | Surgical in-place (Option 1) | Preserves working Framer Motion animations and component structure |
| Turnstile mode | Managed/Invisible (Option 1) | Zero friction for B2B audience (TDs, event planners) |
| Accent color | Laser Cyan `#00F5FF` | High contrast (12.4:1 on `#050505`), technical aesthetic |
| R2 domain | `pub-XXXX.r2.dev` placeholder | User to swap in real domain |

---

## Phase 1: CMS Removal & JSON Architecture

### Removals
- Uninstall: `sanity`, `next-sanity`, `@portabletext/react`, `@sanity/image-url`, `@sanity/vision`
- Delete: `sanity/` directory, `sanity.config.ts`, `src/app/studio/`

### Installations
- `nodemailer` + `@types/nodemailer`
- `zod` (explicit dep — already in node_modules transitively)

### Data Files (`src/data/`)

**`rentals.json`** — Array of rental items:
```ts
{
  id: string;          // e.g. "martin-mac-viper"
  name: string;
  slug: string;        // URL-safe, matches id
  category: "lighting" | "audio" | "video" | "lasers" | "sfx" | "rigging";
  brand: string;
  dailyRate: number | null;
  description: string;
  specs: string[];
  imageUrl: string;    // Cloudflare R2 URL
  available: boolean;
}
```

**`portfolio.json`** — Array of projects:
```ts
{
  id: string;
  title: string;
  slug: string;
  client: string;
  eventDate: string;   // ISO date
  services: ("audio"|"lighting"|"video"|"lasers"|"sfx")[];
  description: string;
  longDescription: string;
  mainImageUrl: string;
  gallery: string[];   // Array of R2 URLs
  featured: boolean;
}
```

**`team.json`** — Partners first, then crew:
```ts
{
  partners: [         // Always exactly 2 entries (50/50)
    {
      id: string;
      name: string;
      role: string;   // e.g. "Co-Founder & Technical Director"
      bio: string;
      imageUrl: string;
    }
  ],
  crew: [
    {
      id: string;
      name: string;
      role: string;
      imageUrl: string;
    }
  ]
}
```

### Routing
- `src/app/work/[slug]/page.tsx` — Server Component, `generateStaticParams` reads `portfolio.json`, `generateMetadata` per project
- `src/app/rentals/[id]/page.tsx` — Server Component, `generateStaticParams` reads `rentals.json`, `generateMetadata` per item

### `next.config.ts`
- `images.remotePatterns`: remove `cdn.sanity.io`, add `pub-XXXX.r2.dev`
- `headers()`: inject strict CSP:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com`
  - `frame-src https://challenges.cloudflare.com`
  - `connect-src 'self' https://challenges.cloudflare.com`
  - `img-src 'self' data: https://pub-XXXX.r2.dev`
  - `font-src 'self' https://fonts.gstatic.com`
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`

---

## Phase 2: Contact Form

### Server Action (`src/app/actions/contact.ts`)
1. Receive `FormData`
2. Zod validation: name (min 2), email (valid format), message (min 10), turnstileToken (required)
3. Turnstile verification: POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with secret + token
4. If both pass: send via nodemailer (Google Workspace SMTP, `smtp.gmail.com:587`, STARTTLS, app password)
5. Return `{ success: true } | { success: false, error: string }`

### Client Component (`src/components/contact-form.tsx`)
- `'use client'` leaf
- Loads Turnstile via `@marsidev/react-turnstile` or script injection
- Uses `useActionState` (React 19) to call Server Action
- Shows success/error state without full page reload

### Env vars
```
SMTP_USER=you@yourdomain.com
SMTP_PASS=your-app-password
SMTP_TO=you@yourdomain.com
TURNSTILE_SECRET_KEY=...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
```

---

## Phase 3: Design Rebrand

### Token Changes (`globals.css`)
- Remove all `laser-red` / `hotbeam-red` references
- Add `--color-laser-cyan: #00F5FF` and `--color-laser-cyan-dim: #00C4CC`
- Update `gradient-text`, `text-glow`, `.scanline-overlay` → cyan
- All component references `text-hotbeam-red` → `text-laser-cyan`

### Copy Direction
- Strip: "immersive", "world-class", "passionate", "innovative"
- Add: specific gear names, wattages, dB specs, pixel pitches
- Hero H1: rewritten to be direct and authoritative
- Target audience: Technical Directors, Event Planners

### Media Placeholders
- `<MediaPlaceholder label="..." aspect="..." />` component
- Dashed cyan border, subtle grid lines, centered label
- Replaces all "Upload via Sanity Studio" UI

### Motion / Accessibility
- `useReducedMotion()` wraps all Framer Motion animations
- All icon buttons get `aria-label`
- Filter buttons: keyboard `onKeyDown` + `role="button"` or `<button>`
- Focus rings: `focus-visible` only (no mouse focus rings)

---

## Phase 4: SEO & Performance

### Metadata
- `generateMetadata` on `/work/[slug]` and `/rentals/[id]`
- Title: `{project.title} | Hot Beam Productions`
- Description: from JSON field
- OG: `og:title`, `og:description`, `og:image` from `mainImageUrl`

### LocalBusiness JSON-LD
Injected in `src/app/layout.tsx` as `<script type="application/ld+json">`:
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Hot Beam Productions",
  "url": "https://hotbeamproductions.com",
  "telephone": "(303) 555-1234",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Denver",
    "addressRegion": "CO",
    "addressCountry": "US"
  },
  "areaServed": ["Denver Metro", "Front Range CO", "United States"],
  "serviceType": ["Audio Production", "Lighting Design", "Video Production", "Laser Shows", "Special Effects"]
}
```

### Server Component Architecture
- All `page.tsx` files: remove `'use client'`, convert to async Server Components
- Extract interactive parts to `'use client'` leaf components:
  - `RentalsFilter.tsx` — category tabs + search
  - `WorkGrid.tsx` — handled at page level (no filter interactivity needed)
  - `ContactForm.tsx` — form with Turnstile
  - Animation wrappers stay client, layouts stay server
