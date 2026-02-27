# Dependency Upgrade Scan (2026-02-27)

## Scope scanned
- Root app: `npm outdated --json`
- Contact worker: `cd worker && npm outdated --json`
- IG refresh worker: `cd worker-ig-refresh && npm outdated --json`

## Findings

### Root app (`/workspace/newwebsite1`)
| Package | Current | Wanted | Latest | Risk | Recommendation |
|---|---:|---:|---:|---|---|
| `@types/node` | 20.19.33 | 20.19.35 | 25.3.2 | Low (patch in same major) | Upgrade to `20.19.35` now; defer v25 until Node runtime/tooling compatibility is explicitly planned. |
| `react` | 19.2.3 | 19.2.3 | 19.2.4 | Low (patch) | Upgrade to `19.2.4` with `react-dom` together. |
| `react-dom` | 19.2.3 | 19.2.3 | 19.2.4 | Low (patch) | Upgrade to `19.2.4` with `react`. |
| `wrangler` | 4.68.1 | 4.69.0 | 4.69.0 | Low (patch/minor in v4 line) | Upgrade to `4.69.0`. |
| `eslint` | 9.39.3 | 9.39.3 | 10.0.2 | High (major) | Keep on v9 for now; schedule dedicated migration to v10 once Next.js/eslint-config-next support is confirmed. |

### Contact worker (`/workspace/newwebsite1/worker`)
| Package | Current | Wanted | Latest | Risk | Recommendation |
|---|---:|---:|---:|---|---|
| `wrangler` | 4.68.1 | 4.69.0 | 4.69.0 | Low | Upgrade to `4.69.0` (can align with root). |
| `@cloudflare/workers-types` | 4.20260304.0 | 4.20260305.0 | 4.20260226.1 | Low | Keep current `wanted` range. This package appears date-versioned and channel-tag behavior can show `wanted > latest`; avoid downgrading. |

### IG refresh worker (`/workspace/newwebsite1/worker-ig-refresh`)
| Package | Current | Wanted | Latest | Risk | Recommendation |
|---|---:|---:|---:|---|---|
| `@cloudflare/workers-types` | 4.20260305.0 | 4.20260305.0 | 4.20260226.1 | Low | Keep as-is; no upgrade needed. The same channel-tag caveat applies. |

## Safe upgrade plan

1. Apply low-risk patch updates first:
   - root: `react`, `react-dom`, `@types/node`, `wrangler`
   - worker: `wrangler`
2. Run validation:
   - root: `npm run lint && npm run build`
   - worker(s): `npm run deploy -- --dry-run` or `wrangler deploy --dry-run` if configured
3. Defer majors:
   - `eslint@10` after checking `eslint-config-next` compatibility and changelog migration notes.

## Suggested commands

### Root
```bash
npm install react@19.2.4 react-dom@19.2.4
npm install -D @types/node@20.19.35 wrangler@4.69.0
```

### Contact worker
```bash
cd worker
npm install wrangler@4.69.0 --save-dev
```

### Validation
```bash
npm run lint
npm run build
cd worker && npm run dev -- --help
cd ../worker-ig-refresh && npm run dev -- --help
```
