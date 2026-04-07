# cf-monorepo-template

Cloudflare Workers monorepo template with batteries included. Built on **Hono.js** with D1, KV, Vitest, and a full tooling chain.

## Stack

- **Runtime:** Cloudflare Workers (Hono.js)
- **Database:** Cloudflare D1 (SQLite)
- **Cache:** Cloudflare KV
- **Observability:** Sentry + CF Analytics Engine
- **Testing:** Vitest + `@cloudflare/vitest-pool-workers`
- **Package Manager:** Bun

## What's Included

### Libraries (`src/lib/`)

| Module | Description |
|---|---|
| `logger.ts` | Structured JSON logger with auto-redaction of sensitive fields |
| `errors.ts` | Standard error codes and JSON error response helpers |
| `resilience.ts` | `fetchWithRetry` — exponential backoff with jitter |
| `feature-flags.ts` | KV-backed feature flags with progressive rollout |
| `ulid.ts` | Monotonic ULID generator (Crockford Base32) |
| `metrics.ts` | CF Analytics Engine metric helpers |
| `sentry.ts` | Sentry breadcrumb and context helpers |

### Middleware (`src/middleware/`)

| Module | Description |
|---|---|
| `request-id.ts` | Generates/propagates `X-Request-ID` for distributed tracing |
| `metrics.ts` | Records request duration to Analytics Engine |
| `error-tracking.ts` | Adds Sentry breadcrumbs per request |

### Tooling

- **ESLint** — flat config with strict TypeScript rules, naming conventions, complexity limits
- **Prettier** — consistent formatting
- **Husky + lint-staged** — pre-commit linting and formatting
- **Secretlint** — prevents committing secrets
- **Knip** — detects unused code and dependencies
- **jscpd** — copy-paste detection
- **Renovate** — automated dependency updates

## Quick Start

```bash
# Clone
git clone https://github.com/Keloia/cf-monorepo-template.git my-worker
cd my-worker

# Install
bun install

# Dev
bun run dev

# Test
bun run test

# Typecheck
bun run typecheck

# Lint
bun run lint
```

## Setup Cloudflare Resources

```bash
# Create D1 database
wrangler d1 create my-worker-db
# Update database_id in wrangler.toml

# Create KV namespace (uncomment kv_namespaces in wrangler.toml)
wrangler kv namespace create KV
# Update id in wrangler.toml

# Apply migrations
wrangler d1 migrations apply my-worker-db --local

# Deploy
bun run deploy
```

## Project Structure

```
src/
├── index.ts              # Hono app entrypoint
├── index.test.ts         # Smoke test
├── lib/
│   ├── types.ts          # CF bindings & Hono variables
│   ├── logger.ts         # Structured logger
│   ├── errors.ts         # Error helpers
│   ├── resilience.ts     # Retry with backoff
│   ├── feature-flags.ts  # KV feature flags
│   ├── ulid.ts           # ULID generator
│   ├── metrics.ts        # Analytics Engine
│   └── sentry.ts         # Error tracking
├── middleware/
│   ├── request-id.ts     # Request tracing
│   ├── metrics.ts        # Request metrics
│   └── error-tracking.ts # Sentry breadcrumbs
└── routes/
    └── health.ts         # Example route
migrations/
└── 0001_init.sql         # Example D1 schema
wrangler.toml             # CF bindings config
```

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Local dev server via wrangler |
| `bun run deploy` | Deploy to Cloudflare Workers |
| `bun run test` | Run tests |
| `bun run test:coverage` | Run tests with coverage |
| `bun run typecheck` | TypeScript type checking |
| `bun run lint` | Lint source code |
| `bun run lint:fix` | Lint and auto-fix |
| `bun run format` | Format with Prettier |
| `bun run knip` | Detect unused code |
| `bun run jscpd` | Detect copy-paste |

## License

MIT
