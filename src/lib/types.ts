/**
 * Cloudflare Workers bindings.
 * Mirrors the bindings defined in wrangler.toml.
 */
export type Bindings = {
  DB: D1Database
  KV?: KVNamespace
  METRICS?: AnalyticsEngineDataset
  SENTRY_DSN?: string
  SENTRY_RELEASE?: string
}

/**
 * Hono context variables set by middleware.
 */
export type Variables = {
  requestId: string
  logger: import('./logger').Logger
}
