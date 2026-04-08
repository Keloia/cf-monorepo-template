/**
 * Structured JSON logger for keloya-auth.
 * Outputs newline-delimited JSON to console (captured by CF Workers logging).
 *
 * Each log entry includes: level, message, timestamp, requestId, and extra fields.
 * Sensitive fields (tokens, keys, passwords) are automatically redacted.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }

const REDACTED_PATTERNS = [
  /token/i,
  /secret/i,
  /password/i,
  /key/i,
  /authorization/i,
  /cookie/i,
  /credential/i,
]

const REDACTED = '[REDACTED]'

function shouldRedact(key: string): boolean {
  return REDACTED_PATTERNS.some((p) => p.test(key))
}

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (shouldRedact(key)) {
      result[key] = REDACTED
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitize(value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }
  return result
}

export type BufferedLogEntry = {
  level: 'info' | 'warn' | 'error'
  message: string
  requestId: string
  extra?: Record<string, unknown>
}

export function createLogger(requestId: string, minLevel: LogLevel = 'info') {
  const minOrder = LEVEL_ORDER[minLevel]
  const buffer: BufferedLogEntry[] = []

  function log(level: LogLevel, message: string, extra?: Record<string, unknown>) {
    if (LEVEL_ORDER[level] < minOrder) return

    const sanitized = sanitize(extra ?? {})
    const entry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId,
      ...sanitized,
    }

    const line = JSON.stringify(entry)
    if (level === 'error') {
      console.error(line)
    } else if (level === 'warn') {
      console.warn(line)
    } else {
      console.log(line)
    }

    if (level !== 'debug') {
      buffer.push({
        level: level as 'info' | 'warn' | 'error',
        message,
        requestId,
        extra: sanitized,
      })
    }
  }

  return {
    debug: (msg: string, extra?: Record<string, unknown>) => log('debug', msg, extra),
    info: (msg: string, extra?: Record<string, unknown>) => log('info', msg, extra),
    warn: (msg: string, extra?: Record<string, unknown>) => log('warn', msg, extra),
    error: (msg: string, extra?: Record<string, unknown>) => log('error', msg, extra),
    getEntries: (): BufferedLogEntry[] => [...buffer],
  }
}

export type Logger = ReturnType<typeof createLogger>
