'use client'

import { useEffect, useState, useCallback } from 'react'

interface UseDataFetchOptions {
  deps?: any[]
  skip?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

interface UseDataFetchReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Generic data fetching hook for API endpoints
 * Handles loading, error, and refetch states
 */
export function useDataFetch<T = any>(
  endpoint: string,
  options: UseDataFetchOptions = {}
): UseDataFetchReturn<T> {
  const { deps = [endpoint], skip = false, onSuccess, onError } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (skip) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include', // Include cookies for next-auth session
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`)
      }

      const result: T = await response.json()
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error.message)
      onError?.(error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [endpoint, skip, onSuccess, onError])

  useEffect(() => {
    fetchData()
  }, deps)

  return { data, loading, error, refetch: fetchData }
}
