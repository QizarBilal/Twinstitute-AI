/**
 * API Request Handler Wrapper
 * Provides automatic error handling, validation, and standardized responses
 */

import { errorResponse, serverErrorResponse, unauthorizedResponse } from './response'
import { NextRequest } from 'next/server'

export interface ApiContext {
  userId?: string
  method: string
  url: string
}

/**
 * Wraps an async API handler with error handling
 * @param fn - The handler function to execute
 * @param context - Request context (method, url, userId)
 * @returns Standardized API response
 */
export async function apiHandler(
  fn: () => Promise<Response>,
  context?: { label?: string }
): Promise<Response> {
  try {
    const result = await fn()
    return result
  } catch (error: any) {
    const label = context?.label ? `[${context.label}]` : '[API ERROR]'
    console.error(label, {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack,
    })

    // Handle specific error types
    if (error.status === 401) {
      return unauthorizedResponse()
    }

    if (error.status === 404) {
      return errorResponse(error.message || 'Not found', 404)
    }

    if (error.status === 422) {
      return errorResponse(error.message || 'Validation error', 422)
    }

    // Generic server error
    return serverErrorResponse(error)
  }
}

/**
 * Authentication guard for protected routes
 */
export async function requireAuth(
  req: NextRequest
): Promise<{ userId: string } | null> {
  try {
    // TODO: Implement based on your auth system (NextAuth, Clerk, etc.)
    // Example with NextAuth:
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) return null
    // return { userId: session.user.id }
    
    // For now, return null - implement based on your auth setup
    return null
  } catch (error) {
    console.error('Auth check failed:', error)
    return null
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequired(data: any, fields: string[]): { valid: boolean; error?: string } {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      return {
        valid: false,
        error: `Missing required field: ${field}`,
      }
    }
  }
  return { valid: true }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate object structure
 */
export function validateSchema<T>(data: any, schema: Record<string, any>): { valid: boolean; error?: string } {
  for (const [key, rules] of Object.entries(schema)) {
    if (rules.required && !data[key]) {
      return {
        valid: false,
        error: `Missing required field: ${key}`,
      }
    }

    if (rules.type && typeof data[key] !== rules.type) {
      return {
        valid: false,
        error: `Invalid type for field ${key}, expected ${rules.type}`,
      }
    }
  }
  return { valid: true }
}
