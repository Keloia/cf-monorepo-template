/**
 * Log forwarder for monitoring-services integration.
 *
 * Buffers structured log entries during a request lifecycle and flushes
 * them as a batch POST to the monitoring-services /ingest endpoint.
 * Gracefully no-ops if MONITOR_INGEST_URL is not configured.
 */
import type { Bindings } from './types'
import { fetchWithRetry } from './resilience'

export type LogEntry = {
  level: 'info' | 'warn' | 'error'
  message: string
  requestId?: string
  extra?: Record<string, unknown>
}

type IngestPayload = LogEntry & { source: string }

const DEFAULT_SOURCE = 'cf-worker'

export function createLogForwarder(env: Bindings) {
  const entries: LogEntry[] = []

  return {
    add(entry: LogEntry) {
      entries.push(entry)
    },

    async flush(): Promise<void> {
      if (!env.MONITOR_INGEST_URL || !env.MONITOR_API_KEY || entries.length === 0) {
        return
      }

      const source = env.SERVICE_NAME ?? DEFAULT_SOURCE
      const payload: IngestPayload[] = entries.map((e) => ({ ...e, source }))

      try {
        await fetchWithRetry(
          `${env.MONITOR_INGEST_URL}/ingest`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${env.MONITOR_API_KEY}`,
            },
            body: JSON.stringify(payload),
          },
          { maxRetries: 1, baseDelayMs: 100, maxDelayMs: 500 },
        )
      } catch {
        console.error('log-forwarder: failed to flush logs to monitoring-services')
      }
    },
  }
}

export type LogForwarder = ReturnType<typeof createLogForwarder>
