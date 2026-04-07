/**
 * Resilience utilities for external HTTP calls (Google OAuth, etc.).
 *
 * Provides retry with exponential backoff for transient failures.
 * Cloudflare Workers are stateless — a full circuit breaker with
 * shared half-open/open state requires KV. This module implements
 * per-request retry with backoff, which covers the majority of
 * transient network failures without cross-request state.
 */

export type RetryOptions = {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  retryableStatuses?: number[]
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 2,
  baseDelayMs: 200,
  maxDelayMs: 2000,
  retryableStatuses: [429, 500, 502, 503, 504],
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function calculateDelay(attempt: number, baseMs: number, maxMs: number): number {
  const exponential = baseMs * Math.pow(2, attempt)
  const jitter = Math.random() * baseMs
  return Math.min(exponential + jitter, maxMs)
}

/**
 * Execute a fetch with retry and exponential backoff.
 *
 * Retries on network errors and configurable HTTP status codes.
 * Returns the last response on exhausted retries (does not throw
 * for HTTP errors — caller inspects response.ok as usual).
 */
export async function fetchWithRetry(
  input: RequestInfo,
  init?: RequestInit,
  options?: RetryOptions,
): Promise<Response> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | undefined
  let lastResponse: Response | undefined

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const response = await fetch(input, init)
      lastResponse = response

      if (response.ok || !opts.retryableStatuses.includes(response.status)) {
        return response
      }

      if (attempt < opts.maxRetries) {
        const delay = calculateDelay(attempt, opts.baseDelayMs, opts.maxDelayMs)
        await sleep(delay)
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      if (attempt < opts.maxRetries) {
        const delay = calculateDelay(attempt, opts.baseDelayMs, opts.maxDelayMs)
        await sleep(delay)
      }
    }
  }

  if (lastResponse) return lastResponse
  throw lastError ?? new Error('fetchWithRetry: all retries exhausted')
}
