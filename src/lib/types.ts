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
  /** Base URL of the monitoring-services /ingest endpoint (optional — no-op if absent) */
  MONITOR_INGEST_URL?: string
  /** Bearer token for authenticating with the monitoring-services /ingest endpoint */
  MONITOR_API_KEY?: string
  /** Service name used as the `source` field in forwarded logs (defaults to "cf-worker") */
  SERVICE_NAME?: string
}

/**
 * Hono context variables set by middleware.
 */
export type Variables = {
  requestId: string
  logger: import('./logger').Logger
}
