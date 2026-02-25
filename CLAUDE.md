# CLAUDE.md — Hot Beam Productions Website

This file provides guidance for AI assistants working in this repository.

## Project Overview

**Hot Beam Productions** is a Denver-based live event production company. This is their marketing website built with Next.js 16 (App Router), showcasing services (audio, lighting, video, lasers, SFX), a portfolio, gear rental catalog, and a contact/quote request form.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19 |
| Styling | Tailwind CSS v4 (PostCSS plugin, no config file) |
| Animations | Framer Motion 12 |
| Forms | React Hook Form 7 + native `<form>` in contact |
| Validation | Zod 4 |
| Icons | Lucide React |
| CAPTCHA | Cloudflare Turnstile (`@marsidev/react-turnstile`) |
| CSS utils | `clsx` + `tailwind-merge` via `cn()` in `src/lib/utils.ts` |
| Email | Cloudflare Worker + Cloudflare Email Routing |
| Images | Cloudflare R2 (CDN) |
| Deployment | Vercel (main site) + Cloudflare Workers (email handler) |

## Repository Structure

```
/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout: Navbar, Footer, JSON-LD schema
│   │   ├── globals.css         # Design tokens + global CSS (Tailwind v4 @theme)
│   │   ├── page.tsx            # Home page
│   │   ├── work/
│   │   │   ├── page.tsx        # Portfolio listing
│   │   │   └── [slug]/page.tsx # Individual project detail
│   │   ├── rentals/
│   │   │   ├── page.tsx        # Equipment rental catalog
│   │   │   └── [id]/page.tsx   # Rental item detail
│   │   ├── about/page.tsx      # About page
│   │   └── contact/page.tsx    # Contact / quote request page
│   ├── components/
│   │   ├── navbar.tsx          # Sticky glassmorphism navbar with mobile menu
│   │   ├── footer.tsx          # Site footer
│   │   ├── contact-form.tsx    # Quote request form (client component)
│   │   ├── glow-button.tsx     # Primary/secondary button with glow effect
│   │   ├── section-heading.tsx # Animated section headers
│   │   ├── hero-animations.tsx # Hero beam animations
│   │   ├── rental-card.tsx     # Equipment rental card
│   │   ├── rentals-filter.tsx  # Equipment category filter UI
│   │   └── media-placeholder.tsx # Fallback image component
│   ├── data/                   # Static JSON data (used until CMS is live)
│   │   ├── portfolio.json      # Portfolio projects
│   │   ├── projects.json       # Additional project metadata
│   │   ├── rentals.json        # Equipment rental catalog with pricing
│   │   ├── inventory.json      # Inventory data
│   │   └── team.json           # Team members
│   └── lib/
│       ├── utils.ts            # cn() — clsx + tailwind-merge helper
│       └── zoho-connector.ts   # CRM integration (likely unused)
├── worker/                     # Cloudflare Worker (separate project)
│   ├── src/index.ts            # Contact form email handler
│   ├── wrangler.toml           # Worker config (name: hotbeam-contact)
│   └── package.json            # Worker dependencies (wrangler, mimetext, zod)
├── public/                     # Static assets (logo, SVGs)
├── docs/plans/                 # Design & implementation planning docs
├── next.config.ts              # Next.js config: CSP headers, R2 image domain
├── tsconfig.json               # TypeScript config (path alias @/* → src/*)
├── eslint.config.mjs           # ESLint flat config (Next.js + TypeScript rules)
└── postcss.config.mjs          # PostCSS config (@tailwindcss/postcss)
```

## Development Commands

Run from the repository root:

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Run production server
npm run lint         # Run ESLint
```

For the Cloudflare Worker (run from `worker/`):

```bash
cd worker
npm install
npm run dev          # Start Worker dev environment (Miniflare)
npm run deploy       # Deploy to Cloudflare (requires wrangler auth)
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Cloudflare R2 image CDN hostname
NEXT_PUBLIC_R2_DOMAIN=pub-XXXX.r2.dev

# Cloudflare Turnstile (CAPTCHA) — public site key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key

# Cloudflare Worker URL for contact form submissions
NEXT_PUBLIC_WORKER_URL=https://hotbeam-contact.your-subdomain.workers.dev

# Sanity CMS (if/when integrated)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

For the Cloudflare Worker, set secrets via `wrangler secret put`:

```bash
cd worker
wrangler secret put TURNSTILE_SECRET_KEY
```

## Design System

The design system is defined via **Tailwind CSS v4 `@theme`** in `src/app/globals.css`. Do not create a `tailwind.config.js` — the v4 setup uses the PostCSS plugin directly.

### Design Tokens

| Token | Value | Usage |
|---|---|---|
| `--color-background` | `#050505` | Page background |
| `--color-foreground` | `#e8e8e8` | Primary text |
| `--color-laser-cyan` | `#00F5FF` | Accent color (CTAs, highlights, hover) |
| `--color-laser-cyan-dim` | `#00C4CC` | Dimmer accent variant |
| `--color-surface` | `#0a0a0a` | Card/input backgrounds |
| `--color-surface-light` | `#111111` | Slightly lighter surface |
| `--color-border` | `#1a1a1a` | Default borders |
| `--color-border-bright` | `#2a2a2a` | Highlighted borders |
| `--color-muted` | `#666666` | Secondary/muted text |
| `--color-muted-light` | `#999999` | Lighter muted text |
| `--font-heading` | Bebas Neue / Archivo Black | Display headings (uppercase, wide tracking) |
| `--font-mono` | IBM Plex Mono | Body text and all monospace |

### Key CSS Utilities

- `.text-glow` — Cyan glow text shadow effect
- `.mono-label` — Monospace label styling
- Noise texture overlay applied globally via `html::after`
- Dark scrollbar with cyan hover state

### Visual Style

- **Dark** aesthetic throughout (near-black backgrounds)
- **Monospace** fonts for all body text (IBM Plex Mono)
- **Bebas Neue** for display/heading text
- Glassmorphism navbar (backdrop-blur)
- Subtle noise texture overlay on the entire page
- Cyan (`#00F5FF`) as the sole accent color

## Coding Conventions

### TypeScript

- Strict mode is enabled — no `any` types
- Use the `@/*` path alias (resolves to `src/*`) for all internal imports
- Prefer explicit return types on functions that return JSX or complex values
- Use `z.object()` (Zod) for all external data validation

### Components

- Server Components by default (Next.js App Router)
- Add `"use client"` only when the component requires browser APIs, state, or event handlers
- Use `cn()` from `src/lib/utils.ts` to merge Tailwind classes
- Import icons from `lucide-react` (already a dependency)
- Animations use Framer Motion — prefer `motion.div` with `initial`/`animate`/`transition`

### Styling

- All styling via Tailwind utility classes — no inline styles unless dynamically computed
- Use semantic color tokens (`text-muted`, `bg-surface`, `border-border`) not raw hex values
- Mobile-first responsive design (`md:`, `lg:` breakpoint prefixes)
- Use `laser-cyan` for interactive/accent elements

### File Naming

- Components: `kebab-case.tsx`
- Pages: `page.tsx` (App Router convention)
- Data files: `kebab-case.json`

### Data

Currently, the `src/data/` JSON files serve as the data layer. The README references Sanity CMS integration, but the `sanity/` directory and Sanity client code are not present in the current codebase — the site reads from local JSON files only.

## Contact Form Architecture

The contact form is a two-part system:

1. **Frontend** (`src/components/contact-form.tsx`) — Client component that:
   - Collects event details (name, email, phone, date, venue, type, gear needs, message)
   - Verifies the user with Cloudflare Turnstile (invisible CAPTCHA)
   - POSTs JSON to `NEXT_PUBLIC_WORKER_URL`

2. **Backend** (`worker/src/index.ts`) — Cloudflare Worker that:
   - Validates the `Origin` header against an allowlist (CORS)
   - Validates the request body with Zod (`ContactSchema`)
   - Verifies the Turnstile token with Cloudflare's API
   - Sends a formatted HTML email via Cloudflare Email Routing
   - Sets `Reply-To` header to the submitter's email

When modifying the contact form, keep the Zod schema in `worker/src/index.ts` and the form fields in `contact-form.tsx` in sync.

## Security Configuration

The following security headers are applied to all routes in `next.config.ts`:

- **Content-Security-Policy** — Restricts scripts to `'self'` + Cloudflare Turnstile, images to self + R2 CDN
- **X-Frame-Options: DENY** — No embedding in iframes
- **X-Content-Type-Options: nosniff**
- **Referrer-Policy: strict-origin-when-cross-origin**
- **Permissions-Policy** — Camera, microphone, and geolocation disabled

When adding new external resources (fonts, scripts, images), update the CSP in `next.config.ts` accordingly.

## SEO & Metadata

- Root metadata is defined in `src/app/layout.tsx` — includes title template, description, OG tags, and keywords
- Each page should export its own `metadata` or `generateMetadata` to override defaults
- A **LocalBusiness JSON-LD** schema is embedded in the root layout `<head>` for local SEO
- Title template: `"Page Name | Hot Beam Productions"`

## Known Issues / Notes

- `src/lib/zoho-connector.ts` appears unused — verify before removing
- The README references a `/studio` Sanity CMS route and a `sanity/` directory, but neither exists in the current codebase — the README is outdated in this regard
- Firebase debug log file may exist from a prior integration attempt; it is not used
- The `docs/plans/` directory contains implementation notes that may not reflect the current state of the code
