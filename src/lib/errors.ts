/**
 * Standard error codes and helpers for API responses.
 * All error responses follow: { error: CODE, message: text }
 */
export const ErrorCode = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode]

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export function errorResponse(
  code: ErrorCodeType | string,
  message: string,
  status: number,
): Response {
  return new Response(JSON.stringify({ error: code, message }), {
    status,
    headers: JSON_HEADERS,
  })
}

export const notFound = (msg = 'Not found') => errorResponse(ErrorCode.NOT_FOUND, msg, 404)

export const validationError = (msg = 'Validation error') =>
  errorResponse(ErrorCode.VALIDATION_ERROR, msg, 400)

export const unauthorized = (msg = 'Unauthorized') =>
  errorResponse(ErrorCode.UNAUTHORIZED, msg, 401)

export const forbidden = (msg = 'Forbidden') => errorResponse(ErrorCode.FORBIDDEN, msg, 403)

export const internalError = (msg = 'Internal server error') =>
  errorResponse(ErrorCode.INTERNAL_ERROR, msg, 500)
