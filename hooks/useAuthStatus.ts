'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export interface AuthUser {
  id: string
  email?: string
  name?: string
  accountType?: string
  selectedRole?: string
  selectedDomain?: string
  emailVerified?: boolean
}

export interface UseAuthStatusReturn {
  isLoading: boolean
  isAuthenticated: boolean
  user: AuthUser | null
  hasCompletedOrientation: boolean
  shouldGoToOrientation: boolean
}

export function useAuthStatus(): UseAuthStatusReturn {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(status === 'loading')
  }, [status])

  const user = session?.user as AuthUser | null
  const isAuthenticated = !!user
  const hasCompletedOrientation = !!user?.selectedRole
  const shouldGoToOrientation = isAuthenticated && !hasCompletedOrientation

  return {
    isLoading,
    isAuthenticated,
    user,
    hasCompletedOrientation,
    shouldGoToOrientation,
  }
}

/**
 * Hook for protecting pages that require authentication
 * Automatically redirects to login if not authenticated
 */
export function useRequireAuth() {
  const router = useRouter()
  const authStatus = useAuthStatus()

  useEffect(() => {
    if (!authStatus.isLoading && !authStatus.isAuthenticated) {
      router.push('/auth/login')
    }
  }, [authStatus.isLoading, authStatus.isAuthenticated, router])

  return authStatus
}

/**
 * Hook for protecting pages that require orientation completion
 * Automatically redirects to orientation if role not selected
 */
export function useRequireOrientation() {
  const router = useRouter()
  const authStatus = useAuthStatus()

  useEffect(() => {
    if (authStatus.isLoading) return

    if (!authStatus.isAuthenticated) {
      router.push('/auth/login')
    } else if (!authStatus.hasCompletedOrientation) {
      router.push('/orientation')
    }
  }, [authStatus.isLoading, authStatus.isAuthenticated, authStatus.hasCompletedOrientation, router])

  return authStatus
}
