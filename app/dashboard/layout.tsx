'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import TopNavigation from '@/components/dashboard/TopNavigation'
import { useSystem, initializeUserSession } from '@/lib/system'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { user, isLoading, refreshAll } = useSystem()

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Initialize user session
  useEffect(() => {
    if (session?.user?.email && user) {
      // User initialized
    }
  }, [user])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full animate-ping" />
            <div className="absolute inset-2 border-2 border-t-blue-600 border-r-transparent border-b-blue-800 border-l-transparent rounded-full animate-spin" />
          </div>
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">Loading Dashboard</span>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <TopNavigation />
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
