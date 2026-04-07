/**
 * Sentry error tracking helpers.
 * Uses @sentry/cloudflare for native CF Workers integration.
 */
import * as Sentry from '@sentry/cloudflare'

export function setUserContext(userId: string): void {
  Sentry.setUser({ id: userId })
}

export function clearUserContext(): void {
  Sentry.setUser(null)
}

export function addDbBreadcrumb(operation: string, table: string): void {
  Sentry.addBreadcrumb({
    category: 'db',
    message: `${operation} ${table}`,
    level: 'info',
    data: { operation, table },
  })
}

export function addHttpBreadcrumb(method: string, url: string, statusCode?: number): void {
  Sentry.addBreadcrumb({
    category: 'http',
    message: `${method} ${url}`,
    level: 'info',
    data: { method, url, statusCode },
  })
}
