import { Hono } from 'hono'
import * as Sentry from '@sentry/cloudflare'
import type { Bindings, Variables } from './lib/types'
import { requestIdMiddleware } from './middleware/request-id'
import { metricsMiddleware } from './middleware/metrics'
import { errorTrackingMiddleware } from './middleware/error-tracking'
import healthRoute from './routes/health'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Global middleware
app.use('*', requestIdMiddleware)
app.use('*', metricsMiddleware)
app.use('*', errorTrackingMiddleware)

app.get('/', (c) => c.json({ service: 'cf-worker', status: 'ok' }))

// Routes
app.route('/', healthRoute)

// 404 handler
app.notFound((c) => c.json({ error: 'NOT_FOUND', message: 'Route not found' }, 404))

export default Sentry.withSentry(
  (env: Bindings) => ({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    sendDefaultPii: false,
    release: env.SENTRY_RELEASE,
  }),
  app,
)
