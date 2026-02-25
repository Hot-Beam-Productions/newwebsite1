# Hot Beam Productions — Full Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Migrate Hot Beam Productions website from Sanity CMS to local JSON architecture, rebrand accent color from red to laser-cyan, add a secure Server Action contact form with Cloudflare Turnstile, and harden the app with CSP headers and full SEO metadata.

**Architecture:** Surgical in-place migration — existing page files are kept and updated rather than rewritten from scratch. Sanity stack removed entirely. All data sourced from `src/data/*.json` files read at build time. Interactive UI extracted to `'use client'` leaf components; all pages become async Server Components.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion 12, nodemailer, zod, @marsidev/react-turnstile, lucide-react

---

## Pre-Flight: What You Need To Know

- **Color token mapping:** The codebase uses two color token names interchangeably — `laser-red` (defined in `globals.css`) and `hotbeam-red` (used in page files, currently unresolved in Tailwind v4). Both become `laser-cyan` after this migration.
- **Accent before:** `#FF4D4D` (red). **Accent after:** `#00F5FF` (laser-cyan), dim: `#00C4CC`
- **R2 placeholder:** All R2 image URLs use `pub-XXXX.r2.dev` — this is intentional. User swaps it in `next.config.ts` line 3 and `.env.local` when ready.
- **No test framework exists** — verification is done via `npm run build` and `npm run dev` visual checks.
- **Framer Motion animations:** Wrap with `useReducedMotion()` hook from framer-motion in every client component that animates.

---

## Task 1: Remove Sanity Stack

**Files:**
- Delete: `sanity/` (entire directory)
- Delete: `sanity.config.ts`
- Delete: `src/app/studio/` (entire directory)

**Step 1: Uninstall Sanity packages**

```bash
npm uninstall sanity next-sanity @portabletext/react @sanity/image-url @sanity/vision
```

Expected: packages removed from `node_modules` and `package.json`

**Step 2: Delete Sanity directories**

```bash
rm -rf sanity sanity.config.ts src/app/studio
```

**Step 3: Install new dependencies**

```bash
npm install nodemailer @marsidev/react-turnstile
npm install --save-dev @types/nodemailer
npm install zod
```

Note: `zod` was already a transitive dependency — this makes it explicit in `package.json`.

**Step 4: Verify `package.json` dependencies**

Check that `package.json` now contains:
- `nodemailer`, `@marsidev/react-turnstile`, `zod` in `dependencies`
- `@types/nodemailer` in `devDependencies`
- None of: `sanity`, `next-sanity`, `@portabletext/react`, `@sanity/image-url`, `@sanity/vision`

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Sanity stack, install nodemailer/zod/turnstile"
```

---

## Task 2: Environment Variables

**Files:**
- Modify: `.env.local` (add new vars — DO NOT overwrite existing .env.local if it has Sanity keys the user may need to reference)

**Step 1: Add required env vars to `.env.local`**

Open `.env.local` and append:

```bash
# Google Workspace SMTP (use an App Password, not your account password)
SMTP_USER=you@yourdomain.com
SMTP_PASS=your-16-character-app-password
SMTP_TO=you@yourdomain.com

# Cloudflare Turnstile
# Get keys from: https://dash.cloudflare.com → Turnstile → Add Site (Invisible widget type)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA_your_site_key
TURNSTILE_SECRET_KEY=0x4AAAAAAA_your_secret_key

# Cloudflare R2 public bucket domain (replace pub-XXXX with your actual bucket ID)
NEXT_PUBLIC_R2_DOMAIN=pub-XXXX.r2.dev
```

**Step 2: Verify `.gitignore` includes `.env.local`**

Check that `.gitignore` has a line: `.env.local`
If not, add it.

---

## Task 3: Create `src/data/rentals.json`

**Files:**
- Create: `src/data/rentals.json`

**Step 1: Create the data directory**

```bash
mkdir -p src/data
```

**Step 2: Write `src/data/rentals.json`**

```json
[
  {
    "id": "martin-mac-viper-profile",
    "slug": "martin-mac-viper-profile",
    "name": "Martin MAC Viper Profile",
    "category": "lighting",
    "brand": "Martin",
    "dailyRate": 150,
    "description": "1000W high-output profile luminaire with CMY color mixing, dual rotating gobo wheels, iris, and framing shutters. The workhorse of touring lighting rigs.",
    "specs": ["1000W", "CMY + CTO", "Dual Gobo Wheels", "Framing Shutters", "8–51° Zoom"],
    "imageUrl": "https://pub-XXXX.r2.dev/rentals/martin-mac-viper.jpg",
    "available": true
  },
  {
    "id": "db-v12-line-array",
    "slug": "db-v12-line-array",
    "name": "d&b audiotechnik V12 Line Array",
    "category": "audio",
    "brand": "d&b audiotechnik",
    "dailyRate": 200,
    "description": "3-way passive line array module for medium to large-scale events. 141 dB SPL max. Unmatched pattern control and intelligibility at distance.",
    "specs": ["3-Way Passive", "141 dB SPL Max", "120° H / 10° V", "27 kg"],
    "imageUrl": "https://pub-XXXX.r2.dev/rentals/db-v12.jpg",
    "available": true
  },
  {
    "id": "roe-cb5-led-panel",
    "slug": "roe-cb5-led-panel",
    "name": "ROE Visual CB5 LED Panel",
    "category": "video",
    "brand": "ROE Visual",
    "dailyRate": 120,
    "description": "5.77mm pixel pitch LED panel, 500×500mm tile. Indoor-rated. Perfect for stage backdrops, IMAG screens, and architectural installs.",
    "specs": ["5.77mm Pitch", "500×500mm", "5000 nits", "Refresh 3840Hz"],
    "imageUrl": "https://pub-XXXX.r2.dev/rentals/roe-cb5.jpg",
    "available": true
  },
  {
    "id": "kvant-spectrum-20",
    "slug": "kvant-spectrum-20",
    "name": "Kvant Spectrum 20 Laser",
    "category": "lasers",
    "brand": "Kvant",
    "dailyRate": 300,
    "description": "20W full-color RGBW laser projector with ILDA and DMX control. FDA Class IIIb. Our flagship unit for beam shows, aerial effects, and graphic projection.",
    "specs": ["20W RGBW", "ILDA + DMX", "FDA Registered", "3B Safety Interlock"],
    "imageUrl": "https://pub-XXXX.r2.dev/rentals/kvant-spectrum-20.jpg",
    "available": true
  },
  {
    "id": "cryofx-co2-jet",
    "slug": "cryofx-co2-jet",
    "name": "CryoFX CO2 Jet",
    "category": "sfx",
    "brand": "CryoFX",
    "dailyRate": 75,
    "description": "DMX-controlled CO2 cryo jet. 25-foot liquid CO2 blast. Used for crowd hits, DJ drops, and stage-edge impact moments.",
    "specs": ["DMX 512", "25 ft Blast Height", "CO2 Liquid Feed", "IP44"],
    "imageUrl": "https://pub-XXXX.r2.dev/rentals/cryo-jet.jpg",
    "available": true
  },
  {
    "id": "chauvet-rogue-r3-wash",
    "slug": "chauvet-rogue-r3-wash",
    "name": "Chauvet Rogue R3 Wash",
    "category": "lighting",
    "brand": "Chauvet Professional",
    "dailyRate": 95,
    "description": "RGBW LED wash moving head with variable zoom and motorized color diffusion. Ideal for stage washes, audience blinders, and set lighting.",
    "specs": ["RGBW LED", "Moving Head", "8–60° Zoom", "IP20"],
    "imageUrl": "https://pub-XXXX.r2.dev/rentals/rogue-r3.jpg",
    "available": true
  },
  {
    "id": "shure-axient-digital",
    "slug": "shure-axient-digital",
    "name": "Shure Axient Digital Wireless",
    "category": "audio",
    "brand": "Shure",
    "dailyRate": 125,
    "description": "Digital wireless microphone system with Quadversity diversity reception and ShowLink remote management. The industry standard for zero-dropout RF.",
    "specs": ["Digital RF", "Quadversity RX", "184 MHz Tuning Range", "ShowLink"],
    "imageUrl": "https://pub-XXXX.r2.dev/rentals/shure-axient.jpg",
    "available": true
  },
  {
    "id": "mdg-theone-haze",
    "slug": "mdg-theone-haze",
    "name": "MDG theONE Haze Generator",
    "category": "sfx",
    "brand": "MDG",
    "dailyRate": 85,
    "description": "Oil-based haze machine producing an ultra-fine, even atmospheric haze for beam definition. The industry standard for lighting looks that require clean air.",
    "specs": ["Oil-Based Fluid", "DMX 512", "Ultra-Fine Output", "Dual-Output Nozzle"],
    "imageUrl": "https://pub-XXXX.r2.dev/rentals/mdg-theone.jpg",
    "available": true
  },
  {
    "id": "grandma3-light",
    "slug": "grandma3-light",
    "name": "grandMA3 Light Console",
    "category": "lighting",
    "brand": "MA Lighting",
    "dailyRate": 275,
    "description": "Full-size touring lighting console. 8 universes onboard, 4096 parameter output native. Runs on the MA3 platform used on every major touring production.",
    "specs": ["4096 Parameters", "8 Universes", "2× Touchscreens", "MA3 Platform"],
    "imageUrl": "https://pub-XXXX.r2.dev/rentals/grandma3-light.jpg",
    "available": true
  },
  {
    "id": "barco-e2-processor",
    "slug": "barco-e2-processor",
    "name": "Barco E2 Screen Management System",
    "category": "video",
    "brand": "Barco",
    "dailyRate": 350,
    "description": "Flagship multi-screen video management system. 32 inputs, 16 outputs, seamless switching and scaling for complex stage video systems.",
    "specs": ["32 Inputs", "16 Outputs", "4K Support", "1 ms Switching"],
    "imageUrl": "https://pub-XXXX.r2.dev/rentals/barco-e2.jpg",
    "available": true
  }
]
```

**Step 3: Commit**

```bash
git add src/data/rentals.json
git commit -m "feat: add rentals.json data source"
```

---

## Task 4: Create `src/data/portfolio.json`

**Files:**
- Create: `src/data/portfolio.json`

**Step 1: Write `src/data/portfolio.json`**

```json
[
  {
    "id": "red-rocks-amphitheatre",
    "slug": "red-rocks-amphitheatre",
    "title": "Red Rocks Amphitheatre",
    "client": "Live Nation",
    "eventDate": "2024-08-15",
    "services": ["lighting", "lasers", "sfx"],
    "description": "Full laser and SFX package for a sold-out show at Red Rocks. 22× Martin MAC Ultra Wash, Kvant Spectrum 20W laser array, and CryoFX CO2 cannons on the lip. 9,500 capacity.",
    "longDescription": "Red Rocks demands precision. We deployed a 22-fixture MAC Ultra rig across the natural rock faces, synchronized a 4-head Kvant laser array with ILDA time-code, and rigged CO2 cannons at 15-meter trim height. Advance site visit 10 days prior. Zero technical riders filed.",
    "mainImageUrl": "https://pub-XXXX.r2.dev/portfolio/red-rocks-hero.jpg",
    "gallery": [
      "https://pub-XXXX.r2.dev/portfolio/red-rocks-01.jpg",
      "https://pub-XXXX.r2.dev/portfolio/red-rocks-02.jpg",
      "https://pub-XXXX.r2.dev/portfolio/red-rocks-03.jpg"
    ],
    "featured": true
  },
  {
    "id": "denver-tech-summit",
    "slug": "denver-tech-summit",
    "title": "Denver Tech Summit",
    "client": "TechStars",
    "eventDate": "2024-04-22",
    "services": ["audio", "video", "lighting"],
    "description": "Corporate general session for 1,200 attendees. ROE CB5 LED wall at 32×12ft, d&b V-Series PA flown left/right, and a Barco E2 driving 3-screen confidence monitor system.",
    "longDescription": "TechStars needed broadcast-quality production in a convention center room with no existing infrastructure. We flew a d&b V12 array from a dead-hang grid, built a 384-tile ROE CB5 LED wall from scratch, and drove the entire signal chain from a grandMA3 Light through an Allen & Heath dLive.",
    "mainImageUrl": "https://pub-XXXX.r2.dev/portfolio/tech-summit-hero.jpg",
    "gallery": [
      "https://pub-XXXX.r2.dev/portfolio/tech-summit-01.jpg",
      "https://pub-XXXX.r2.dev/portfolio/tech-summit-02.jpg"
    ],
    "featured": false
  },
  {
    "id": "mountain-music-festival",
    "slug": "mountain-music-festival",
    "title": "Mountain Music Festival",
    "client": "Colorado Events Co",
    "eventDate": "2024-07-04",
    "services": ["audio", "lighting", "lasers", "sfx"],
    "description": "Three-day outdoor festival at 8,400 ft elevation. Full touring production package: FOH, monitors, stage wash, laser array, and haze across two stages.",
    "longDescription": "High altitude changes everything — PA tuning, haze fluid behavior, generator load calculations. We advanced both stages with the client four months out, ran d&b Y-Series on the second stage, and coordinated a 6-head laser array sunset show timed to fireworks. No failures across all three days.",
    "mainImageUrl": "https://pub-XXXX.r2.dev/portfolio/mountain-fest-hero.jpg",
    "gallery": [
      "https://pub-XXXX.r2.dev/portfolio/mountain-fest-01.jpg",
      "https://pub-XXXX.r2.dev/portfolio/mountain-fest-02.jpg",
      "https://pub-XXXX.r2.dev/portfolio/mountain-fest-03.jpg",
      "https://pub-XXXX.r2.dev/portfolio/mountain-fest-04.jpg"
    ],
    "featured": true
  },
  {
    "id": "corporate-gala-deloitte",
    "slug": "corporate-gala-deloitte",
    "title": "Annual Corporate Gala",
    "client": "Deloitte",
    "eventDate": "2024-11-09",
    "services": ["lighting", "video", "audio"],
    "description": "Black-tie gala for 600 executives at the Denver Art Museum. Architectural LED wash designed around the existing Gio Ponti permanent collection.",
    "longDescription": "The Denver Art Museum's Hamilton Building presented a unique rigging challenge — no traditional fly points. We engineered a custom ground-support truss system that framed the artwork without a single penetration into the building. Lighting plot designed 6 weeks in advance with the museum's curatorial team.",
    "mainImageUrl": "https://pub-XXXX.r2.dev/portfolio/deloitte-gala-hero.jpg",
    "gallery": [
      "https://pub-XXXX.r2.dev/portfolio/deloitte-gala-01.jpg",
      "https://pub-XXXX.r2.dev/portfolio/deloitte-gala-02.jpg"
    ],
    "featured": false
  },
  {
    "id": "neon-nights-festival",
    "slug": "neon-nights-festival",
    "title": "Neon Nights Festival",
    "client": "AEG Presents",
    "eventDate": "2024-09-28",
    "services": ["lasers", "sfx", "lighting"],
    "description": "EDM festival headline stage. 40kW laser package — the largest we've deployed in Colorado. 8-head beam array plus ground-level cryo cannons across 80-ft stage width.",
    "longDescription": "AEG's technical rider called for 40kW total laser output across 8 positions. We specified Kvant Spectrum units, wrote the custom ILDA sequence to sync with the headline DJ's time-code, and placed cryo cannons on custom pipe-and-base mounts at stage-edge for the drops. FDA variance filed 30 days in advance.",
    "mainImageUrl": "https://pub-XXXX.r2.dev/portfolio/neon-nights-hero.jpg",
    "gallery": [
      "https://pub-XXXX.r2.dev/portfolio/neon-nights-01.jpg",
      "https://pub-XXXX.r2.dev/portfolio/neon-nights-02.jpg",
      "https://pub-XXXX.r2.dev/portfolio/neon-nights-03.jpg"
    ],
    "featured": true
  },
  {
    "id": "ecotech-product-launch",
    "slug": "ecotech-product-launch",
    "title": "EcoTech Product Launch",
    "client": "EcoTech Inc",
    "eventDate": "2024-03-14",
    "services": ["video", "lighting", "audio"],
    "description": "Product reveal event for 300 media and investors. 4K projection mapping onto a 24-ft custom-built reveal structure, with d&b point source system and precision LED accent lighting.",
    "longDescription": "The client needed the product physically hidden until moment of reveal. We built a 24-ft curved reveal structure, mapped a custom animation across its surface using two Barco projectors, and triggered the drop on time-code. Rehearsals over two days. Final reveal executed in one take.",
    "mainImageUrl": "https://pub-XXXX.r2.dev/portfolio/ecotech-launch-hero.jpg",
    "gallery": [
      "https://pub-XXXX.r2.dev/portfolio/ecotech-launch-01.jpg",
      "https://pub-XXXX.r2.dev/portfolio/ecotech-launch-02.jpg"
    ],
    "featured": false
  }
]
```

**Step 2: Commit**

```bash
git add src/data/portfolio.json
git commit -m "feat: add portfolio.json data source"
```

---

## Task 5: Create `src/data/team.json`

**Files:**
- Create: `src/data/team.json`

**Step 1: Write `src/data/team.json`**

```json
{
  "partners": [
    {
      "id": "daniel",
      "name": "Daniel Mankin",
      "role": "Co-Founder & Technical Director",
      "bio": "Daniel handles system design, laser operation, and show programming. Trained in photonics and live systems engineering. Has operated laser rigs at Red Rocks, Civic Center Park, and venues across the Front Range. FDA LSO certified.",
      "imageUrl": "https://pub-XXXX.r2.dev/team/daniel.jpg"
    },
    {
      "id": "beau",
      "name": "Beau [Last Name]",
      "role": "Co-Founder & Production Manager",
      "bio": "Beau leads logistics, venue relationships, and crew coordination. Built his career running audio for regional touring acts before co-founding Hot Beam. Manages the gear inventory, vendor relationships, and advance production process.",
      "imageUrl": "https://pub-XXXX.r2.dev/team/beau.jpg"
    }
  ],
  "crew": [
    {
      "id": "crew-01",
      "name": "Crew Member",
      "role": "A1 / FOH Engineer",
      "imageUrl": "https://pub-XXXX.r2.dev/team/crew-01.jpg"
    },
    {
      "id": "crew-02",
      "name": "Crew Member",
      "role": "Lighting Programmer",
      "imageUrl": "https://pub-XXXX.r2.dev/team/crew-02.jpg"
    },
    {
      "id": "crew-03",
      "name": "Crew Member",
      "role": "Video Engineer",
      "imageUrl": "https://pub-XXXX.r2.dev/team/crew-03.jpg"
    }
  ]
}
```

**Note:** Replace `[Last Name]` and crew names with real names before deploy. `imageUrl` fields accept any valid HTTPS URL — Cloudflare R2, or a direct URL from any CDN.

**Step 2: Commit**

```bash
git add src/data/team.json
git commit -m "feat: add team.json data source"
```

---

## Task 6: Rewrite `next.config.ts`

**Files:**
- Modify: `next.config.ts`

**Step 1: Replace the entire file**

```ts
import type { NextConfig } from "next";

const R2_HOSTNAME = process.env.NEXT_PUBLIC_R2_DOMAIN ?? "pub-XXXX.r2.dev";

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  `img-src 'self' data: blob: https://${R2_HOSTNAME}`,
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: R2_HOSTNAME,
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: ContentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Step 2: Verify build doesn't break**

```bash
npm run build
```

Expected: Build succeeds. If it fails on missing Sanity env vars — you've already deleted the studio route, so those imports should be gone.

**Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: update next.config.ts — R2 images, CSP headers, security headers"
```

---

## Task 7: Rebrand Design Tokens

**Files:**
- Modify: `src/app/globals.css`
- Modify (bulk): all `.tsx` files in `src/`

**Step 1: Rewrite `globals.css` color tokens**

Replace lines 1–18 (the `@theme inline` block and font imports) with:

```css
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Bebas+Neue&family=Archivo+Black&display=swap");
@import "tailwindcss";

@theme inline {
  --color-background: #050505;
  --color-foreground: #e8e8e8;
  --color-laser-cyan: #00F5FF;
  --color-laser-cyan-dim: #00C4CC;
  --color-surface: #0a0a0a;
  --color-surface-light: #111111;
  --color-border: #1a1a1a;
  --color-border-bright: #2a2a2a;
  --color-muted: #666666;
  --color-muted-light: #999999;
  --font-heading: "Bebas Neue", "Archivo Black", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
  --font-body: "IBM Plex Mono", monospace;
}
```

**Step 2: Update utility classes in `globals.css`**

Replace every occurrence of `FF4D4D` (red hex) with `00F5FF` (cyan hex).
Replace every occurrence of `255, 77, 77` (red RGB) with `0, 245, 255` (cyan RGB).

Specifically, update these rules:
- `.text-glow` → `text-shadow: 0 0 10px rgba(0, 245, 255, 0.6), 0 0 30px rgba(0, 245, 255, 0.3);`
- `.gradient-text` → `background: linear-gradient(135deg, #00F5FF 0%, #00C4CC 100%);`
- `.scanline-overlay::after` → `rgba(0, 245, 255, 0.02)`
- `::selection` → `background: rgba(0, 245, 255, 0.2);`
- `::-webkit-scrollbar-thumb:hover` → `background: #00F5FF;`

The final `globals.css` should look like:

```css
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Bebas+Neue&family=Archivo+Black&display=swap");
@import "tailwindcss";

@theme inline {
  --color-background: #050505;
  --color-foreground: #e8e8e8;
  --color-laser-cyan: #00F5FF;
  --color-laser-cyan-dim: #00C4CC;
  --color-surface: #0a0a0a;
  --color-surface-light: #111111;
  --color-border: #1a1a1a;
  --color-border-bright: #2a2a2a;
  --color-muted: #666666;
  --color-muted-light: #999999;
  --font-heading: "Bebas Neue", "Archivo Black", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
  --font-body: "IBM Plex Mono", monospace;
}

html {
  position: relative;
}

/* Noise texture overlay */
html::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 0.01em;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #050505; }
::-webkit-scrollbar-thumb { background: #222; border-radius: 0; }
::-webkit-scrollbar-thumb:hover { background: #00F5FF; }

/* Glow text */
.text-glow {
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.6), 0 0 30px rgba(0, 245, 255, 0.3);
}

/* Monospaced label */
.mono-label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-muted);
}

/* Spec divider line */
.spec-line {
  height: 1px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-border-bright) 0,
    var(--color-border-bright) 4px,
    transparent 4px,
    transparent 8px
  );
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #00F5FF 0%, #00C4CC 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Scanline overlay */
.scanline-overlay {
  position: relative;
  overflow: hidden;
}
.scanline-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 245, 255, 0.02) 2px,
    rgba(0, 245, 255, 0.02) 4px
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.scanline-overlay:hover::after { opacity: 1; }

/* Selection */
::selection {
  background: rgba(0, 245, 255, 0.2);
  color: #fff;
}
```

**Step 3: Bulk-replace color tokens in all `.tsx` source files**

Run these from the project root to replace all color references across the codebase:

```bash
# Replace hotbeam-red → laser-cyan
find src -name "*.tsx" -exec sed -i '' 's/hotbeam-red/laser-cyan/g' {} +

# Replace laser-red → laser-cyan
find src -name "*.tsx" -exec sed -i '' 's/laser-red/laser-cyan/g' {} +

# Replace hotbeam-orange → laser-cyan-dim
find src -name "*.tsx" -exec sed -i '' 's/hotbeam-orange/laser-cyan-dim/g' {} +
```

**Step 4: Update `src/components/glow-button.tsx` for new color**

Open `src/components/glow-button.tsx`. The `variants` object should now read:

```ts
const variants = {
  primary: cn(
    "bg-laser-cyan text-background border border-laser-cyan",
    "hover:bg-laser-cyan-dim hover:shadow-[0_0_20px_rgba(0,245,255,0.3)]",
    "active:scale-[0.98]"
  ),
  outline: cn(
    "border border-laser-cyan/40 text-laser-cyan bg-transparent",
    "hover:bg-laser-cyan/10 hover:border-laser-cyan",
    "active:scale-[0.98]"
  ),
};
```

Note the primary variant uses `text-background` (dark) instead of `text-white` — laser cyan is bright enough that dark text on it is more legible and accessible.

**Step 5: Verify build**

```bash
npm run build
```

Expected: clean build. No TypeScript errors.

**Step 6: Commit**

```bash
git add src/
git commit -m "feat: rebrand accent — red → laser-cyan (#00F5FF), update all design tokens"
```

---

## Task 8: Create `MediaPlaceholder` Component

**Files:**
- Create: `src/components/media-placeholder.tsx`

**Step 1: Write the component**

This replaces all `"Upload via Sanity Studio"` UI in the codebase.

```tsx
interface MediaPlaceholderProps {
  label?: string;
  aspect?: "video" | "square" | "portrait" | "wide";
  className?: string;
}

const aspectMap = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/6]",
};

export function MediaPlaceholder({
  label = "Image",
  aspect = "video",
  className = "",
}: MediaPlaceholderProps) {
  return (
    <div
      className={`relative w-full ${aspectMap[aspect]} bg-surface flex items-center justify-center ${className}`}
      aria-label={`${label} placeholder`}
    >
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,245,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Dashed border */}
      <div className="absolute inset-3 border border-dashed border-laser-cyan/30 rounded" />
      {/* Center label */}
      <div className="relative z-10 text-center">
        <div className="w-10 h-10 mx-auto rounded border border-laser-cyan/30 flex items-center justify-center mb-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-laser-cyan/50"
          >
            <rect x="1" y="3" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1" />
            <circle cx="5.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1" />
            <path d="M1 11l4-4 3 3 2-2 5 5" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mono-label !text-laser-cyan/40">{label}</p>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/media-placeholder.tsx
git commit -m "feat: add MediaPlaceholder component for R2 image slots"
```

---

## Task 9: Create Dynamic Route `/work/[slug]`

**Files:**
- Create: `src/app/work/[slug]/page.tsx`

**Step 1: Write the file**

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import { MediaPlaceholder } from "@/components/media-placeholder";
import portfolio from "@/data/portfolio.json";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return portfolio.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = portfolio.find((p) => p.slug === slug);
  if (!project) return { title: "Not Found" };
  return {
    title: `${project.title} | Hot Beam Productions`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.mainImageUrl ? [{ url: project.mainImageUrl }] : [],
    },
  };
}

const serviceColors: Record<string, string> = {
  audio: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  lighting: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  video: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  lasers: "bg-laser-cyan/15 text-laser-cyan border-laser-cyan/20",
  sfx: "bg-green-500/15 text-green-400 border-green-500/20",
};

export default async function WorkProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = portfolio.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link
          href="/work"
          className="inline-flex items-center gap-2 mono-label !text-muted hover:!text-laser-cyan transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" />
          All Work
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="mono-label text-laser-cyan mb-3">{project.client}</p>
          <h1 className="font-heading text-6xl md:text-8xl tracking-wide text-foreground leading-none">
            {project.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-6">
            {project.services.map((s) => (
              <span
                key={s}
                className={`text-xs px-3 py-1 rounded border ${serviceColors[s] ?? "bg-white/10 text-white/60 border-white/10"}`}
              >
                {s}
              </span>
            ))}
            {project.eventDate && (
              <span className="text-xs px-3 py-1 rounded border border-border text-muted">
                {new Date(project.eventDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Hero image */}
        <div className="rounded-lg overflow-hidden mb-12">
          {project.mainImageUrl && !project.mainImageUrl.includes("pub-XXXX") ? (
            <div className="relative aspect-video w-full">
              <Image
                src={project.mainImageUrl}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <MediaPlaceholder label="Hero photo / Stage render" aspect="video" />
          )}
        </div>

        {/* Body copy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2 space-y-4 text-muted leading-relaxed text-sm">
            <p>{project.longDescription}</p>
          </div>
          <div className="space-y-6">
            <div className="p-5 rounded-lg bg-surface border border-border">
              <p className="mono-label !text-foreground mb-3">Event Details</p>
              <dl className="space-y-2 text-xs text-muted">
                <div className="flex justify-between">
                  <dt>Client</dt>
                  <dd className="text-foreground">{project.client}</dd>
                </div>
                {project.eventDate && (
                  <div className="flex justify-between">
                    <dt>Date</dt>
                    <dd className="text-foreground">
                      {new Date(project.eventDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Departments</dt>
                  <dd className="text-foreground capitalize">
                    {project.services.join(", ")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="mb-16">
            <p className="mono-label !text-foreground mb-6">Gallery</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.gallery.map((url, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  {!url.includes("pub-XXXX") ? (
                    <div className="relative aspect-video w-full">
                      <Image src={url} alt={`${project.title} ${i + 1}`} fill className="object-cover" />
                    </div>
                  ) : (
                    <MediaPlaceholder label="Gallery photo / BTS rigging" aspect="video" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="border-t border-border pt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-heading text-3xl tracking-wider text-foreground">
              Book This Package
            </h3>
            <p className="text-muted text-sm mt-1">
              Tell us your event specs. We'll tell you what's possible.
            </p>
          </div>
          <GlowButton href="/contact" variant="primary">
            Request a Quote
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/work/
git commit -m "feat: add /work/[slug] dynamic route with generateStaticParams + metadata"
```

---

## Task 10: Create Dynamic Route `/rentals/[id]`

**Files:**
- Create: `src/app/rentals/[id]/page.tsx`

**Step 1: Write the file**

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import { MediaPlaceholder } from "@/components/media-placeholder";
import rentals from "@/data/rentals.json";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return rentals.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = rentals.find((r) => r.id === id);
  if (!item) return { title: "Not Found" };
  return {
    title: `${item.name} Rental | Hot Beam Productions`,
    description: item.description,
    openGraph: {
      title: `${item.name} — ${item.brand}`,
      description: item.description,
      images: item.imageUrl && !item.imageUrl.includes("pub-XXXX")
        ? [{ url: item.imageUrl }]
        : [],
    },
  };
}

export default async function RentalDetailPage({ params }: Props) {
  const { id } = await params;
  const item = rentals.find((r) => r.id === id);
  if (!item) notFound();

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link
          href="/rentals"
          className="inline-flex items-center gap-2 mono-label !text-muted hover:!text-laser-cyan transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" />
          All Inventory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="rounded-lg overflow-hidden">
            {item.imageUrl && !item.imageUrl.includes("pub-XXXX") ? (
              <div className="relative aspect-square w-full">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" priority />
              </div>
            ) : (
              <MediaPlaceholder label="Product photo / 3D render" aspect="square" />
            )}
          </div>

          {/* Info */}
          <div>
            <p className="mono-label text-laser-cyan mb-2">{item.brand}</p>
            <h1 className="font-heading text-5xl tracking-wide text-foreground leading-tight mb-4">
              {item.name}
            </h1>
            <p className="text-muted text-sm leading-relaxed mb-6">{item.description}</p>

            {/* Availability */}
            <div className="flex items-center gap-2 mb-6">
              {item.available ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="mono-label !text-green-400">Available for Rent</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-muted" />
                  <span className="mono-label !text-muted">Check Availability</span>
                </>
              )}
            </div>

            {/* Specs */}
            {item.specs && item.specs.length > 0 && (
              <div className="mb-6">
                <p className="mono-label !text-foreground mb-3">Key Specs</p>
                <div className="space-y-2">
                  {item.specs.map((spec) => (
                    <div key={spec} className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-laser-cyan" />
                      <span className="text-xs text-muted">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rate + CTA */}
            <div className="border-t border-border pt-6 mt-6">
              {item.dailyRate ? (
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="font-heading text-5xl gradient-text">${item.dailyRate}</span>
                  <span className="text-muted text-sm">/ day</span>
                </div>
              ) : (
                <p className="text-sm text-muted mb-4">Contact us for pricing</p>
              )}
              <GlowButton href="/contact" variant="primary">
                Inquire About This Piece
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/rentals/[id]/
git commit -m "feat: add /rentals/[id] dynamic route with generateStaticParams + metadata"
```

---

## Task 11: Create `RentalsFilter` + Convert `/rentals/page.tsx` to Server Component

**Files:**
- Create: `src/components/rentals-filter.tsx`
- Modify: `src/app/rentals/page.tsx`

**Step 1: Create `src/components/rentals-filter.tsx`**

This is the `'use client'` leaf that owns all the filter/search interactivity.

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Lightbulb, Volume2, Monitor, Sparkles, Zap, Wrench, Search,
} from "lucide-react";
import Link from "next/link";
import { GlowButton } from "@/components/glow-button";

type RentalItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  dailyRate: number | null;
  description: string;
  specs: string[];
  imageUrl: string;
  available: boolean;
};

const categories = [
  { value: "all", label: "All Gear", icon: Wrench },
  { value: "lighting", label: "Lighting", icon: Lightbulb },
  { value: "audio", label: "Audio", icon: Volume2 },
  { value: "video", label: "Video", icon: Monitor },
  { value: "lasers", label: "Lasers", icon: Zap },
  { value: "sfx", label: "SFX", icon: Sparkles },
];

export function RentalsFilter({ items }: { items: RentalItem[] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const prefersReduced = useReducedMotion();

  const filtered = items.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-6 mb-12">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              onKeyDown={(e) => e.key === "Enter" && setActiveCategory(cat.value)}
              aria-pressed={activeCategory === cat.value}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan ${
                activeCategory === cat.value
                  ? "bg-laser-cyan/20 text-laser-cyan border border-laser-cyan/40"
                  : "bg-surface border border-border text-muted hover:text-foreground hover:border-white/20"
              }`}
            >
              <cat.icon className="w-4 h-4" aria-hidden="true" />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative lg:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search rental inventory"
            className="w-full lg:w-64 pl-10 pr-4 py-2 rounded bg-surface border border-border text-foreground placeholder:text-muted text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/40 transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + searchQuery}
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReduced ? false : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: prefersReduced ? 0 : i * 0.04 }}
              className="group bg-surface border border-border rounded-lg overflow-hidden hover:border-laser-cyan/30 transition-all duration-500"
            >
              {/* Image placeholder */}
              <div className="relative h-48 bg-surface-light flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-laser-cyan/10 flex items-center justify-center mb-2">
                    <span className="font-heading text-lg text-laser-cyan">{item.name[0]}</span>
                  </div>
                  <p className="text-xs text-muted mono-label">
                    {item.category}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-heading text-lg tracking-wider uppercase text-foreground leading-tight">
                  {item.name}
                </h3>
                {item.brand && <p className="text-xs text-muted mt-1">{item.brand}</p>}
                <p className="text-sm text-muted mt-3 line-clamp-2">{item.description}</p>

                {item.specs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.specs.slice(0, 3).map((spec) => (
                      <span key={spec} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-muted">
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  {item.dailyRate ? (
                    <span className="text-lg font-bold gradient-text">
                      ${item.dailyRate}
                      <span className="text-xs text-muted font-normal">/day</span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted">Contact for pricing</span>
                  )}
                  <Link
                    href={`/rentals/${item.id}`}
                    className="mono-label !text-laser-cyan border border-laser-cyan/30 px-3 py-1 rounded hover:bg-laser-cyan/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan"
                    aria-label={`View details for ${item.name}`}
                  >
                    Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted text-lg">No gear found matching your criteria.</p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 text-center">
        <p className="text-muted mb-4">
          Our public inventory is a fraction of what we carry. Deep stock available on request.
        </p>
        <GlowButton href="/contact" variant="primary">
          Request Custom Quote
        </GlowButton>
      </div>
    </>
  );
}
```

**Step 2: Rewrite `src/app/rentals/page.tsx` as a Server Component**

Replace the entire file:

```tsx
import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { RentalsFilter } from "@/components/rentals-filter";
import rentals from "@/data/rentals.json";

export const metadata: Metadata = {
  title: "Gear Rental Inventory | Hot Beam Productions",
  description:
    "Professional event production equipment for rent. Lasers, line arrays, LED walls, moving lights, SFX. Show-ready inventory, maintained to touring spec.",
};

export default function RentalsPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Inventory"
          title="Gear Rentals"
          subtitle="Touring-spec equipment. Every unit is maintained, tested, and show-ready. Prices are day rates — multi-day and package pricing available on request."
        />
        <RentalsFilter items={rentals} />
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/rentals-filter.tsx src/app/rentals/page.tsx
git commit -m "feat: extract RentalsFilter to client component, convert rentals page to Server Component"
```

---

## Task 12: Convert `/work/page.tsx` to Server Component

**Files:**
- Modify: `src/app/work/page.tsx`

**Step 1: Replace the file entirely**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MediaPlaceholder } from "@/components/media-placeholder";
import portfolio from "@/data/portfolio.json";

export const metadata: Metadata = {
  title: "Our Work | Hot Beam Productions",
  description:
    "Event production portfolio — lasers, lighting, audio, video, and SFX. Red Rocks, corporate galas, outdoor festivals, and product launches across Colorado and the US.",
};

const serviceColors: Record<string, string> = {
  audio: "bg-blue-500/15 text-blue-400",
  lighting: "bg-yellow-500/15 text-yellow-400",
  video: "bg-purple-500/15 text-purple-400",
  lasers: "bg-laser-cyan/15 text-laser-cyan",
  sfx: "bg-green-500/15 text-green-400",
};

export default function WorkPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Portfolio"
          title="Our Work"
          subtitle="Selected productions across Colorado and nationally. Every project started with a rider and ended with a run-of-show."
        />

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {portfolio.map((project, index) => (
            <div key={project.id} className="break-inside-avoid group">
              <Link
                href={`/work/${project.slug}`}
                className="block relative rounded-lg overflow-hidden bg-surface border border-border hover:border-laser-cyan/30 transition-all duration-500"
                aria-label={`View ${project.title} project details`}
              >
                {/* Image */}
                <div
                  className="relative w-full bg-surface-light overflow-hidden"
                  style={{ height: `${250 + (index % 3) * 80}px` }}
                >
                  {project.mainImageUrl && !project.mainImageUrl.includes("pub-XXXX") ? (
                    <Image
                      src={project.mainImageUrl}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <MediaPlaceholder label="Stage photo / 3D render" aspect="video" className="!aspect-auto h-full" />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <ArrowUpRight className="absolute top-4 right-4 w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-heading text-xl tracking-wider uppercase text-foreground group-hover:text-laser-cyan transition-colors">
                    {project.title}
                  </h3>
                  {project.client && (
                    <p className="text-sm text-muted mt-1">{project.client}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.services.map((service) => (
                      <span
                        key={service}
                        className={`text-xs px-2 py-1 rounded capitalize ${serviceColors[service] ?? "bg-white/10 text-white/60"}`}
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/work/page.tsx
git commit -m "feat: convert /work to Server Component, wire portfolio.json"
```

---

## Task 13: Convert `/about/page.tsx` to Server Component + Wire `team.json`

**Files:**
- Modify: `src/app/about/page.tsx`

**Step 1: Replace the file**

```tsx
import type { Metadata } from "next";
import { ArrowRight, Zap, Users, Award, MapPin } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import { SectionHeading } from "@/components/section-heading";
import { MediaPlaceholder } from "@/components/media-placeholder";
import teamData from "@/data/team.json";

export const metadata: Metadata = {
  title: "About | Hot Beam Productions",
  description:
    "Denver-based live event production company. Co-founded by Daniel Mankin and Beau. Full-service audio, lighting, video, lasers, and SFX. Front Range and nationwide.",
};

const stats = [
  { label: "Events Produced", value: "500+", icon: Zap },
  { label: "Team Members", value: "15+", icon: Users },
  { label: "Years Operating", value: "10+", icon: MapPin },
  { label: "States Deployed", value: "12+", icon: Award },
];

export default function AboutPage() {
  const { partners, crew } = teamData;

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="The Company"
          title="About Us"
          subtitle="Two co-founders. Fifteen years of combined stage experience. One production company that moves at the speed of the industry."
        />

        {/* Partners — 50/50 layout */}
        <section className="mb-24" aria-labelledby="partners-heading">
          <p id="partners-heading" className="mono-label text-laser-cyan mb-8">Founders</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="p-8 rounded-lg bg-surface border border-border hover:border-laser-cyan/20 transition-colors"
              >
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-light">
                    {partner.imageUrl && !partner.imageUrl.includes("pub-XXXX") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={partner.imageUrl}
                        alt={partner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MediaPlaceholder label="Headshot" aspect="square" className="!h-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl tracking-wider text-foreground">
                      {partner.name}
                    </h3>
                    <p className="mono-label text-laser-cyan mt-1">{partner.role}</p>
                    <p className="text-sm text-muted mt-4 leading-relaxed">{partner.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div>
            <h3 className="font-heading text-4xl tracking-wider uppercase text-foreground mb-6">
              Built for the Show Floor
            </h3>
            <div className="space-y-4 text-muted leading-relaxed text-sm">
              <p>
                Hot Beam started because we were tired of watching under-spec'd gear show up to
                high-stakes gigs. We built our inventory around the fixtures we actually wanted
                to run — MAC Vipers, Kvant lasers, d&b line arrays — and we maintain it ourselves.
              </p>
              <p>
                We operate as a tight crew. No layers between the client and the people actually
                running the show. Daniel advances the technical rider. Beau runs logistics and crew.
                Both of us are on-site, every time, until load-out is complete.
              </p>
              <p>
                Our clients are TDs and event planners who've been burned before by production
                companies that oversell and under-deliver. We quote conservatively, communicate
                early, and solve problems before the first truck rolls.
              </p>
            </div>
          </div>
          <div className="relative">
            <MediaPlaceholder label="Team / BTS photography" aspect="portrait" className="rounded-lg" />
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-laser-cyan/15 rounded-lg -z-10" />
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24" aria-label="Company statistics">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-8 rounded-lg bg-surface border border-border">
              <stat.icon className="w-6 h-6 text-laser-cyan mx-auto mb-4" aria-hidden="true" />
              <p className="font-heading text-4xl font-bold gradient-text">{stat.value}</p>
              <p className="text-sm text-muted mt-2">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Values */}
        <section className="mb-24">
          <h3 className="font-heading text-4xl tracking-wider uppercase gradient-text mb-10">
            Why Hot Beam?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Technical Depth",
                description:
                  "We can read a rider, spec a system, and program a show. We don't hand off technical decisions to vendors — we own them.",
              },
              {
                title: "Tier 1 Inventory",
                description:
                  "MAC Vipers. d&b line arrays. Kvant lasers. grandMA3 consoles. We bought the gear that touring riders call for and we keep it in working condition.",
              },
              {
                title: "Small Crew Advantage",
                description:
                  "Fast decisions, direct communication, no account managers between you and the people doing the work. We move when you need to move.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="p-8 rounded-lg bg-surface border border-border hover:border-laser-cyan/30 transition-all duration-500 scanline-overlay"
              >
                <h4 className="font-heading text-xl tracking-wider uppercase text-foreground mb-3">
                  {value.title}
                </h4>
                <p className="text-muted text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Crew */}
        {crew.length > 0 && (
          <section className="mb-24">
            <p className="mono-label text-laser-cyan mb-6">Crew</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {crew.map((member) => (
                <div key={member.id} className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-surface-light mb-3">
                    {member.imageUrl && !member.imageUrl.includes("pub-XXXX") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <MediaPlaceholder label="" aspect="square" className="!aspect-auto !h-full" />
                    )}
                  </div>
                  <p className="text-sm text-foreground">{member.name}</p>
                  <p className="mono-label mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center">
          <h3 className="font-heading text-4xl tracking-wider uppercase text-foreground mb-4">
            Let&apos;s Run a Show Together
          </h3>
          <p className="text-muted mb-8 max-w-lg mx-auto text-sm">
            Send us your rider, your venue specs, and your timeline. We&apos;ll come back with a
            real quote from the people who&apos;ll be on-site.
          </p>
          <GlowButton href="/contact" variant="primary">
            Start a Conversation
            <ArrowRight className="inline ml-2 w-4 h-4" aria-hidden="true" />
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: convert about page to Server Component, wire team.json, rewrite copy"
```

---

## Task 14: Rewrite Home Page Copy + Convert to Server Component

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/hero-animations.tsx`

**Step 1: Create `src/components/hero-animations.tsx`** (client leaf for Framer Motion beams)

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroBeams() {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return null;

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15" aria-hidden="true">
      <motion.div
        className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-laser-cyan to-transparent"
        animate={{ y: ["-100%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-laser-cyan-dim to-transparent"
        animate={{ y: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
      />
      <motion.div
        className="absolute top-0 left-3/4 w-[1px] h-full bg-gradient-to-b from-transparent via-laser-cyan to-transparent"
        animate={{ y: ["-100%", "100%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 2 }}
      />
    </div>
  );
}

export function HeroContent() {
  const prefersReduced = useReducedMotion();
  const fade = prefersReduced ? {} : { opacity: 0 };
  const fadeIn = prefersReduced ? {} : { opacity: 1 };

  return (
    <motion.div initial={fade} animate={fadeIn} transition={{ duration: 0.5 }}>
      <motion.p
        initial={prefersReduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-sm font-medium tracking-[0.3em] uppercase text-laser-cyan mb-6"
      >
        Denver, CO — Live Event Production
      </motion.p>
    </motion.div>
  );
}
```

**Step 2: Replace `src/app/page.tsx`**

```tsx
import Image from "next/image";
import {
  Volume2, Lightbulb, Monitor, Zap, Sparkles, ArrowRight,
} from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import { SectionHeading } from "@/components/section-heading";
import { HeroBeams } from "@/components/hero-animations";

const services = [
  {
    icon: Volume2,
    title: "Audio",
    description:
      "d&b audiotechnik and L-Acoustics line arrays. From a 300-person general session to a 10,000-capacity festival main stage, we size and tune the system to the room — not the rental invoice.",
  },
  {
    icon: Lightbulb,
    title: "Lighting",
    description:
      "grandMA3 programming, MAC Ultra fixtures, and Robe moving heads. Full touring rigs and corporate one-offs. Patch to blackout, we handle the full technical workflow.",
  },
  {
    icon: Monitor,
    title: "Video",
    description:
      "ROE LED walls, Barco processing, and Resolume media servers. Whether it's a 40-tile stage backdrop or a 3-screen corporate confidence system, we engineer the signal chain.",
  },
  {
    icon: Zap,
    title: "Lasers",
    description:
      "FDA-registered Class IIIb and IV systems. Kvant Spectrum RGBW projectors, ILDA time-code sync, and custom beam choreography. We hold the variance, we run the show.",
  },
  {
    icon: Sparkles,
    title: "SFX",
    description:
      "CryoFX CO2 cannons, MDG haze, confetti, and flame effects. We integrate SFX into the lighting and audio cue stack so the drops hit on time, every time.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-clip pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-background" />
        <HeroBeams />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm font-medium tracking-[0.3em] uppercase text-laser-cyan mb-6">
            Denver, CO — Live Event Production
          </p>

          <div className="overflow-hidden">
            <Image
              src="/logo.png"
              alt="Hot Beam Productions"
              width={600}
              height={164}
              className="w-[400px] sm:w-[500px] md:w-[600px] h-auto mx-auto drop-shadow-[0_0_40px_rgba(0,245,255,0.2)]"
              priority
            />
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl tracking-wider uppercase text-foreground/80 mt-2">
            Audio · Lighting · Lasers · Video · SFX
          </h2>

          <p className="mt-8 text-muted text-base max-w-2xl mx-auto leading-relaxed">
            We build production rigs for touring acts, festivals, corporate events, and private shows.
            Tier-1 gear, experienced crew, honest quotes. Based in Denver — deployed everywhere.
          </p>

          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <GlowButton href="/work" variant="primary">
              See Our Work
              <ArrowRight className="inline ml-2 w-4 h-4" aria-hidden="true" />
            </GlowButton>
            <GlowButton href="/contact" variant="outline">
              Get a Quote
            </GlowButton>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Services */}
      <section className="py-24 px-6" aria-labelledby="services-heading">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            label="Capabilities"
            title="What We Do"
            subtitle="Full-service production with the technical depth to execute at any scale. We own our gear, we employ our crew, and we show up ready to work."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="group relative p-8 rounded-lg bg-surface border border-border hover:border-laser-cyan/30 transition-all duration-500 scanline-overlay"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-laser-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-laser-cyan/10 flex items-center justify-center mb-6 group-hover:bg-laser-cyan/20 transition-colors">
                    <service.icon className="w-6 h-6 text-laser-cyan" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-2xl tracking-wider uppercase text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-5xl md:text-6xl font-bold tracking-wider uppercase gradient-text">
            Your Rider. Our Rig.
          </h2>
          <p className="mt-6 text-muted text-base max-w-xl mx-auto leading-relaxed">
            Send us the event specs and we&apos;ll build a quote from the ground up — no canned
            packages, no hidden labor charges.
          </p>
          <div className="mt-10">
            <GlowButton href="/contact" variant="primary">
              Start Your Project
              <ArrowRight className="inline ml-2 w-4 h-4" aria-hidden="true" />
            </GlowButton>
          </div>
        </div>
      </section>
    </>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/page.tsx src/components/hero-animations.tsx
git commit -m "feat: convert home page to Server Component, rewrite copy, laser-cyan rebrand"
```

---

## Task 15: Create Server Action for Contact Form

**Files:**
- Create: `src/app/actions/contact.ts`

**Step 1: Create the actions directory**

```bash
mkdir -p src/app/actions
```

**Step 2: Write `src/app/actions/contact.ts`**

```ts
"use server";

import { z } from "zod";
import nodemailer from "nodemailer";

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

export type ContactFormState = {
  success: boolean;
  error?: string;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    eventDate: formData.get("eventDate") || undefined,
    venue: formData.get("venue") || undefined,
    eventType: formData.get("eventType") || undefined,
    gearNeeds: formData.getAll("gearNeeds") as string[],
    message: formData.get("message"),
    turnstileToken: formData.get("cf-turnstile-response"),
  };

  // 1. Validate input
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // 2. Verify Turnstile token
  const verifyRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: parsed.data.turnstileToken,
      }),
    }
  );
  const verifyData = (await verifyRes.json()) as { success: boolean };
  if (!verifyData.success) {
    return { success: false, error: "Bot verification failed. Please try again." };
  }

  // 3. Send email via nodemailer (Google Workspace SMTP)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  const { name, email, phone, eventDate, venue, eventType, gearNeeds, message } = parsed.data;

  const gearList = gearNeeds.length > 0
    ? `<p><strong>Gear Needed:</strong> ${gearNeeds.join(", ")}</p>`
    : "";

  await transporter.sendMail({
    from: `"Hot Beam Website" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_TO,
    replyTo: email,
    subject: `Quote Request from ${name}${eventType ? ` — ${eventType}` : ""}`,
    html: `
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
    `,
  });

  return { success: true };
}
```

**Step 3: Commit**

```bash
git add src/app/actions/
git commit -m "feat: add contact Server Action with Zod validation + Turnstile verification + nodemailer"
```

---

## Task 16: Create `ContactForm` Client Component + Update Contact Page

**Files:**
- Create: `src/components/contact-form.tsx`
- Modify: `src/app/contact/page.tsx`

**Step 1: Write `src/components/contact-form.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import { submitContactForm, type ContactFormState } from "@/app/actions/contact";

const inputStyles =
  "w-full px-4 py-3 rounded bg-surface border border-border text-foreground placeholder:text-muted/60 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/40 transition-colors";

const initialState: ContactFormState = { success: false };

const gearOptions = [
  "Audio / PA System",
  "Lighting Design",
  "Video / LED Walls",
  "Lasers",
  "SFX (Cryo, Haze, Confetti)",
  "Full Production Package",
];

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactForm, initialState);
  const [turnstileToken, setTurnstileToken] = useState("");

  if (state.success) {
    return (
      <div className="text-center py-20" role="status">
        <CheckCircle className="w-16 h-16 text-laser-cyan mx-auto mb-6" aria-hidden="true" />
        <h3 className="font-heading text-3xl tracking-wider uppercase text-foreground mb-4">
          Message Sent
        </h3>
        <p className="text-muted max-w-md mx-auto text-sm">
          Got it. We&apos;ll review your specs and reply within one business day. For urgent
          requests, call us directly.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      {/* Hidden Turnstile token */}
      <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />

      {/* Invisible Turnstile widget */}
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setTurnstileToken}
        options={{ size: "invisible" }}
      />

      {/* Error state */}
      {state.error && (
        <div
          className="flex items-center gap-3 p-4 rounded bg-red-950/30 border border-red-900/40 text-red-400 text-sm"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {state.error}
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
          <label htmlFor="phone" className="block text-sm text-muted mb-2">Phone</label>
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
          <label htmlFor="venue" className="block text-sm text-muted mb-2">Venue</label>
          <input
            id="venue"
            name="venue"
            className={inputStyles}
            placeholder="Venue name or address"
          />
        </div>
        <div>
          <label htmlFor="eventType" className="block text-sm text-muted mb-2">Event Type</label>
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
        <legend className="block text-sm text-muted mb-3">What do you need?</legend>
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

      <GlowButton type="submit" variant="primary" className={pending ? "opacity-60 cursor-wait" : ""}>
        <Send className="w-4 h-4 mr-2 inline" aria-hidden="true" />
        {pending ? "Sending..." : "Send Quote Request"}
      </GlowButton>
    </form>
  );
}
```

**Step 2: Rewrite `src/app/contact/page.tsx` as a Server Component**

```tsx
import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Get a Quote | Hot Beam Productions",
  description:
    "Request a production quote for audio, lighting, video, lasers, or SFX. Denver-based, deployed nationwide. Response within one business day.",
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Contact"
          title="Get a Quote"
          subtitle="Send us your event specs. We read riders, respond to technical questions, and quote from real gear lists — not generic packages."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Sidebar */}
          <div className="space-y-8">
            <div>
              <h3 className="font-heading text-2xl tracking-wider uppercase text-foreground mb-6">
                Direct Contact
              </h3>
              <div className="space-y-4">
                <a
                  href="mailto:info@hotbeamproductions.com"
                  className="flex items-center gap-3 text-muted hover:text-foreground transition-colors"
                >
                  <Mail className="w-5 h-5 text-laser-cyan flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm">info@hotbeamproductions.com</span>
                </a>
                <a
                  href="tel:+13035551234"
                  className="flex items-center gap-3 text-muted hover:text-foreground transition-colors"
                >
                  <Phone className="w-5 h-5 text-laser-cyan flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm">(303) 555-1234</span>
                </a>
                <div className="flex items-center gap-3 text-muted">
                  <MapPin className="w-5 h-5 text-laser-cyan flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm">Denver, Colorado</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-border">
              <h4 className="font-heading text-lg tracking-wider uppercase text-foreground mb-3">
                Response Time
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                One business day for quote requests. Same day for urgent inquiries — call us
                directly.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-border">
              <h4 className="font-heading text-lg tracking-wider uppercase text-foreground mb-3">
                Service Area
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Based in Denver. We work the entire Front Range regularly and travel nationally
                for the right shows. Ask about touring rates.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/contact-form.tsx src/app/contact/page.tsx src/app/actions/
git commit -m "feat: wire ContactForm with Server Action, Turnstile, Zod — contact page to Server Component"
```

---

## Task 17: Update `layout.tsx` — JSON-LD + Enhanced Metadata

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Replace the file**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: "Hot Beam Productions | Denver Event Production — Audio, Lasers, Lighting, Video",
    template: "%s | Hot Beam Productions",
  },
  description:
    "Denver-based live event production company. Touring-grade audio, intelligent lighting, LED walls, FDA-registered laser systems, and SFX. Front Range and nationwide.",
  keywords: [
    "event production Denver",
    "laser show Colorado",
    "live event production",
    "audio visual Denver",
    "stage lighting rental",
    "CO2 cryo jet rental",
    "LED wall rental Denver",
    "concert production Colorado",
  ],
  openGraph: {
    siteName: "Hot Beam Productions",
    locale: "en_US",
    type: "website",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Hot Beam Productions",
  url: "https://hotbeamproductions.com",
  telephone: "+13035551234",
  email: "info@hotbeamproductions.com",
  description:
    "Full-service live event production company based in Denver, Colorado. Audio, lighting, video, laser systems, and special effects for concerts, festivals, corporate events, and private shows.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Denver",
    addressRegion: "CO",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "39.7392",
    longitude: "-104.9903",
  },
  areaServed: [
    { "@type": "State", name: "Colorado" },
    { "@type": "Country", name: "United States" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Event Production Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Audio Production" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Lighting Design & Programming" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "LED Video Walls" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Laser Show Production" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Special Effects — CO2, Haze, Confetti" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Gear Rental" } },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="antialiased bg-background text-foreground font-mono">
        <Navbar />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add LocalBusiness JSON-LD schema, enhance root metadata"
```

---

## Task 18: Update `SectionHeading` for Reduced Motion

**Files:**
- Modify: `src/components/section-heading.tsx`

**Step 1: Update the component**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  label?: string;
}

export function SectionHeading({ title, subtitle, label }: SectionHeadingProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mb-12"
    >
      {label && <p className="mono-label text-laser-cyan mb-2">{label}</p>}
      <h2 className="font-heading text-5xl md:text-7xl tracking-wide text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-muted text-sm max-w-xl">{subtitle}</p>
      )}
      <div className="spec-line mt-6 w-32" />
    </motion.div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/section-heading.tsx
git commit -m "fix: wrap SectionHeading Framer Motion with useReducedMotion"
```

---

## Task 19: Final Build Verification

**Step 1: Run a full build**

```bash
npm run build
```

Expected output:
```
✓ Compiled successfully
Route (app)                              Size     First Load JS
├ ○ /                                   ...
├ ○ /about                              ...
├ ○ /contact                            ...
├ ○ /rentals                            ...
├ ● /rentals/[id]                       ...  (10 static pages)
├ ○ /work                               ...
└ ● /work/[slug]                        ...  (6 static pages)
```

If you see TypeScript errors on missing env vars at build time:
- The Server Action uses `process.env.SMTP_USER!` (non-null assertion) — this is intentional. Build will succeed; runtime will fail if env vars are missing. That's expected behavior for secrets.

**Step 2: Run dev server and visually check**

```bash
npm run dev
```

Check these routes:
- `/` — Hero loads, laser-cyan beam animations, no console errors
- `/work` — Grid renders with placeholders, no Sanity references
- `/work/red-rocks-amphitheatre` — Detail page loads
- `/rentals` — Category filters work, search works
- `/rentals/martin-mac-viper-profile` — Detail page loads
- `/about` — Two partner cards render side-by-side
- `/contact` — Form renders, no "Upload via Sanity" text anywhere

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: Hot Beam Productions — CMS-free rebuild complete

- Remove Sanity CMS stack entirely
- Add local JSON data sources (rentals, portfolio, team)
- Add laser-cyan (#00F5FF) rebrand across all components
- Add /work/[slug] and /rentals/[id] dynamic routes with generateStaticParams
- Add Server Action contact form with Zod validation + Cloudflare Turnstile
- Add nodemailer / Google Workspace SMTP integration
- Add strict CSP headers + security headers in next.config.ts
- Add LocalBusiness JSON-LD schema in root layout
- Convert all page files to Server Components
- Extract interactive UI to client leaf components
- Wrap all Framer Motion animations with useReducedMotion
- Improve accessibility: aria-labels, keyboard nav, focus-visible rings"
```

---

## Post-Implementation Checklist

Before the site goes live:

- [ ] Replace `pub-XXXX.r2.dev` with real R2 domain in `next.config.ts` and `.env.local`
- [ ] Set real `SMTP_USER`, `SMTP_PASS`, `SMTP_TO` in production environment
- [ ] Create Turnstile widget at https://dash.cloudflare.com → Turnstile → Add Site (select **Invisible** type)
- [ ] Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` from the Turnstile dashboard
- [ ] Upload real images to R2 bucket, update `imageUrl` fields in JSON data files
- [ ] Update Beau's last name in `team.json`
- [ ] Update phone number in `contact/page.tsx` and `layout.tsx` with real number
- [ ] Test the contact form end-to-end in production (not dev — Turnstile won't verify in localhost without a localhost site key)
- [ ] For localhost Turnstile testing: create a separate Turnstile site key with `localhost` as the allowed origin
