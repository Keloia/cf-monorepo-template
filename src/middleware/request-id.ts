/**
 * Request ID middleware for distributed tracing.
 *
 * Generates a unique request ID (or reuses X-Request-ID from upstream)
 * and propagates it through the request lifecycle via Hono context.
 * The ID is also set on the response header for client-side correlation.
 */
import type { MiddlewareHandler } from 'hono'
import type { Bindings, Variables } from '../lib/types'
import { createLogger } from '../lib/logger'
import { createLogForwarder } from '../lib/log-forwarder'

type HonoEnv = { Bindings: Bindings; Variables: Variables }

export const requestIdMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const requestId = c.req.header('X-Request-ID') ?? crypto.randomUUID()
  c.set('requestId', requestId)

  const logger = createLogger(requestId)
  c.set('logger', logger)

  logger.info('request started', {
    method: c.req.method,
    path: c.req.path,
  })

  c.header('X-Request-ID', requestId)

  const start = Date.now()
  await next()
  const duration = Date.now() - start

  logger.info('request completed', {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: duration,
  })

  if (c.env.MONITOR_INGEST_URL && c.executionCtx?.waitUntil) {
    const forwarder = createLogForwarder(c.env)
    for (const entry of logger.getEntries()) {
      forwarder.add(entry)
    }
    c.executionCtx.waitUntil(forwarder.flush())
  }
}
