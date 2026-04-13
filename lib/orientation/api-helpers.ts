/**
 * API Helper Functions for Orientation System
 * Handles server-side API calls with proper URL construction
 */

/**
 * Get absolute URL for internal API calls from server-side code
 * Works in both development and production environments
 */
export function getAbsoluteUrl(path: string): string {
  // Try multiple sources for the base URL
  let baseUrl = process.env.NEXTAUTH_URL?.trim()
  
  // Fallback to VERCEL_URL if NEXTAUTH_URL not set
  if (!baseUrl && process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`
  }
  
  // Fallback to NODE_ENV detection
  if (!baseUrl) {
    if (process.env.NODE_ENV === 'production') {
      // In production without explicit URL, try VERCEL_PROJECT_PRODUCTION_URL
      baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? 
        `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 
        'http://localhost:3000'
    } else {
      // Development default
      baseUrl = 'http://localhost:3000'
    }
  }

  // Ensure baseUrl doesn't have trailing slash
  baseUrl = baseUrl.replace(/\/$/, '')

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  const fullUrl = `${baseUrl}${cleanPath}`
  console.log(`[getAbsoluteUrl] Constructed URL: ${fullUrl} (env: NODE_ENV=${process.env.NODE_ENV})`)
  
  return fullUrl
}

/**
 * Make internal API calls from server-side code with proper URL handling
 */
export async function fetchInternalApi<T = any>(
  path: string,
  options: RequestInit
): Promise<T> {
  const url = getAbsoluteUrl(path)
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      console.error(`[fetchInternalApi] Error calling ${path}: ${response.status} ${response.statusText}`)
      return null as any
    }

    return await response.json()
  } catch (error) {
    console.error(`[fetchInternalApi] Error calling ${path}:`, error)
    throw error
  }
}
