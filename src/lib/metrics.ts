/**
 * Metrics collection via Cloudflare Analytics Engine.
 *
 * Provides helpers to write structured data points for request performance.
 * Safe to use when the METRICS binding is not configured (silently no-ops).
 */

export function recordRequestMetric(
  metrics: AnalyticsEngineDataset | undefined,
  method: string,
  path: string,
  status: number,
  durationMs: number,
): void {
  if (!metrics) return

  metrics.writeDataPoint({
    indexes: ['http_request'],
    blobs: [method, path, String(status)],
    doubles: [durationMs, status >= 500 ? 1 : 0],
  })
}

export function recordErrorMetric(
  metrics: AnalyticsEngineDataset | undefined,
  errorCode: string,
  path: string,
): void {
  if (!metrics) return

  metrics.writeDataPoint({
    indexes: ['error'],
    blobs: [errorCode, path],
    doubles: [1],
  })
}
