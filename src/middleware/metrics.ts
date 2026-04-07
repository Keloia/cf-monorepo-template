/**
 * Metrics middleware — records request performance data to CF Analytics Engine.
 *
 * Writes a data point per request containing: method, path, status, duration.
 * Safe to use when the METRICS binding is not configured (silently no-ops).
 */
import type { MiddlewareHandler } from 'hono'
import type { Bindings, Variables } from '../lib/types'
import { recordRequestMetric } from '../lib/metrics'

type HonoEnv = { Bindings: Bindings; Variables: Variables }

export const metricsMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const start = Date.now()
  await next()
  const durationMs = Date.now() - start

  recordRequestMetric(c.env.METRICS, c.req.method, c.req.path, c.res.status, durationMs)
}
