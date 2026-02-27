# AGENTS Guide

This file defines the default workflows and command reference for contributors and coding agents working in this repository.

## Core workflows

### 1) Local setup
1. Install dependencies in the root app:
   ```bash
   npm install
   ```
2. Install dependencies for Cloudflare workers when needed:
   ```bash
   npm --prefix worker install
   npm --prefix worker-ig-refresh install
   ```
3. Configure environment values in `.env.local` for local development.

### 2) Frontend development workflow
1. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
2. Run lint checks before committing:
   ```bash
   npm run lint
   ```
3. Validate a production build:
   ```bash
   npm run build
   ```

### 3) Cloudflare worker workflow
Use this for contact form and Instagram refresh workers.

1. Run the contact worker locally:
   ```bash
   npm --prefix worker run dev
   ```
2. Deploy the contact worker:
   ```bash
   npm --prefix worker run deploy
   ```
3. Run the IG refresh worker locally:
   ```bash
   npm --prefix worker-ig-refresh run dev
   ```
4. Deploy the IG refresh worker:
   ```bash
   npm --prefix worker-ig-refresh run deploy
   ```

### 4) Cloudflare OpenNext workflow
Use for Cloudflare-targeted preview/deploy from the Next.js app:

1. Build and preview locally:
   ```bash
   npm run preview
   ```
2. Build and deploy:
   ```bash
   npm run deploy
   ```
3. Build and upload artifacts:
   ```bash
   npm run upload
   ```

## Command reference

### Root app (`/workspace/newwebsite1`)
- `npm run dev` — Start Next.js development server.
- `npm run lint` — Run ESLint.
- `npm run build` — Create production build.
- `npm run start` — Start production server after build.
- `npm run preview` — Build with OpenNext and run Cloudflare preview.
- `npm run deploy` — Build with OpenNext and deploy to Cloudflare.
- `npm run upload` — Build with OpenNext and upload artifacts.
- `npm run cf-typegen` — Regenerate Cloudflare env TypeScript bindings.

### Contact worker (`/workspace/newwebsite1/worker`)
- `npm run dev` — Run worker locally using Wrangler.
- `npm run deploy` — Deploy worker using Wrangler.

### IG refresh worker (`/workspace/newwebsite1/worker-ig-refresh`)
- `npm run dev` — Run worker locally using Wrangler.
- `npm run deploy` — Deploy worker using Wrangler.

## Change validation checklist
Before opening a PR:
1. Run `npm run lint` in the repo root.
2. If app code changed, run `npm run build` in the repo root.
3. If worker code changed, run the corresponding worker `npm run dev` or `npm run deploy -- --dry-run` style validation as appropriate.
