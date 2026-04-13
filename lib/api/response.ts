/**
 * Standardized API Response Format
 * Ensures all API endpoints follow consistent response structure
 */

export interface StandardApiResponse<T = any> {
  success: boolean
  data: T | null
  error: string | null
  timestamp: string
}

/**
 * Creates a standardized API response
 * @param success - Whether the operation succeeded
 * @param data - The response data (null on error)
 * @param error - Error message (null on success)
 * @returns Standardized Response object
 */
export function apiResponse<T = any>(
  success: boolean,
  data: T | null = null,
  error: string | null = null
): Response {
  const response: StandardApiResponse<T> = {
    success,
    data: success ? data : null,
    error: !success ? error : null,
    timestamp: new Date().toISOString(),
  }

  // HTTP status code based on success
  const statusCode = success ? 200 : 400

  return Response.json(response, { status: statusCode })
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T): Response {
  return apiResponse(true, data, null)
}

/**
 * Error response helper
 */
export function errorResponse(error: string, statusCode: number = 400): Response {
  const response: StandardApiResponse = {
    success: false,
    data: null,
    error,
    timestamp: new Date().toISOString(),
  }
  return Response.json(response, { status: statusCode })
}

/**
 * Validation error response
 */
export function validationError(field: string, message: string): Response {
  return errorResponse(`Validation error: ${field} - ${message}`, 422)
}

/**
 * Not found response
 */
export function notFoundResponse(resource: string): Response {
  return errorResponse(`${resource} not found`, 404)
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(): Response {
  return errorResponse('Unauthorized', 401)
}

/**
 * Server error response
 */
export function serverErrorResponse(error?: Error): Response {
  const message = error?.message || 'Internal server error'
  return errorResponse(message, 500)
}
