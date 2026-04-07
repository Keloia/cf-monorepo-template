/**
 * Error tracking middleware — adds Sentry breadcrumbs for request tracing.
 */
import type { MiddlewareHandler } from 'hono'
import type { Bindings, Variables } from '../lib/types'
import * as Sentry from '@sentry/cloudflare'

type HonoEnv = { Bindings: Bindings; Variables: Variables }

export const errorTrackingMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  Sentry.addBreadcrumb({
    category: 'http',
    message: `${c.req.method} ${c.req.path}`,
    level: 'info',
    data: {
      method: c.req.method,
      url: c.req.path,
    },
  })

  await next()
}
