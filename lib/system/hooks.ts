/**
 * DATA FETCHING HOOKS & UTILITIES
 * Standardized hooks for component-level data fetching with error handling
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiClient } from './apiClient'
import { ApiResponse } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC DATA FETCH HOOK
// ─────────────────────────────────────────────────────────────────────────────

interface UseFetchOptions {
    refetchInterval?: number // ms
    enabled?: boolean
    onSuccess?: (data: any) => void
    onError?: (error: string) => void
}

export function useDataFetch<T>(
    endpoint: string,
    options: UseFetchOptions = {}
) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { refetchInterval, enabled = true, onSuccess, onError } = options

    // Fetch function
    const fetch = useCallback(async () => {
        if (!enabled) return

        setLoading(true)
        setError(null)

        try {
            const response = await apiClient.request<T>(endpoint)

            if (response.success && response.data) {
                setData(response.data)
                onSuccess?.(response.data)
            } else {
                const errorMsg = response.error || 'Failed to load data'
                setError(errorMsg)
                onError?.(errorMsg)
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'An error occurred'
            setError(errorMsg)
            onError?.(errorMsg)
        } finally {
            setLoading(false)
        }
    }, [endpoint, enabled, onSuccess, onError])

    // Initial fetch
    useEffect(() => {
        fetch()
    }, [fetch])

    // Refetch interval
    useEffect(() => {
        if (!refetchInterval) return

        const interval = setInterval(fetch, refetchInterval)
        return () => clearInterval(interval)
    }, [fetch, refetchInterval])

    return {
        data,
        loading,
        error,
        refetch: fetch,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SPECIFIC DATA FETCH HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useUser(options?: UseFetchOptions) {
    return useDataFetch('/user', options)
}

export function useTwin(options?: UseFetchOptions) {
    return useDataFetch('/twin', options)
}

export function useGenome(options?: UseFetchOptions) {
    return useDataFetch('/genome', options)
}

export function useRoadmap(options?: UseFetchOptions) {
    return useDataFetch('/roadmap', options)
}

export function useTasks(filters?: any, options?: UseFetchOptions) {
    const queryString = filters ? `?${new URLSearchParams(filters)}` : ''
    return useDataFetch(`/labs/tasks${queryString}`, options)
}

export function useSubmissions(filters?: any, options?: UseFetchOptions) {
    const queryString = filters ? `?${new URLSearchParams(filters)}` : ''
    return useDataFetch(`/labs/submissions${queryString}`, options)
}

export function useProofs(options?: UseFetchOptions) {
    return useDataFetch('/proof', options)
}

export function useSimulation(options?: UseFetchOptions) {
    return useDataFetch('/simulation', options)
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATION HOOK (FOR POST/PUT/DELETE)
// ─────────────────────────────────────────────────────────────────────────────

interface UseMutationOptions {
    onSuccess?: (data: any) => void
    onError?: (error: string) => void
}

export function useMutation<T>(
    endpoint: string,
    options: UseMutationOptions = {}
) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { onSuccess, onError } = options

    const mutate = useCallback(
        async (data?: any, method: string = 'POST') => {
            setLoading(true)
            setError(null)

            try {
                const response = await apiClient.request<T>(endpoint, {
                    method,
                    body: JSON.stringify(data),
                })

                if (response.success) {
                    onSuccess?.(response.data)
                    return response.data
                } else {
                    const errorMsg = response.error || 'Operation failed'
                    setError(errorMsg)
                    onError?.(errorMsg)
                    throw new Error(errorMsg)
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'An error occurred'
                setError(errorMsg)
                onError?.(errorMsg)
                throw err
            } finally {
                setLoading(false)
            }
        },
        [endpoint, onSuccess, onError]
    )

    return {
        mutate,
        loading,
        error,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATED FETCH HOOK
// ─────────────────────────────────────────────────────────────────────────────

interface PageInfo {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
}

export function usePaginatedFetch<T>(
    endpoint: string,
    pageSize: number = 10
) {
    const [page, setPage] = useState(1)
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pageInfo, setPageInfo] = useState<PageInfo>({
        page: 1,
        pageSize,
        totalCount: 0,
        totalPages: 0,
    })

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true)
            setError(null)

            try {
                const queryString = `?page=${page}&pageSize=${pageSize}`
                const response = await apiClient.request<T[]>(`${endpoint}${queryString}`)

                if (response.success && response.data) {
                    setData(response.data)
                    // Assuming API returns page info in response
                    // Adjust based on your API response format
                } else {
                    setError(response.error || 'Failed to load page')
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchPage()
    }, [endpoint, page, pageSize])

    return {
        data,
        loading,
        error,
        pageInfo,
        setPage,
    }
}
