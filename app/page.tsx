'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import CinematicLoading from '@/components/shared/animations/CinematicLoading'
import { LandingPage } from '@/components/landing/LandingPage'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [hasSeenLoading, setHasSeenLoading] = useState(true)

  useEffect(() => {
    // Check if user has already seen loading in this session
    const loadingShown = sessionStorage.getItem('loadingShown')
    if (!loadingShown) {
      setHasSeenLoading(false)
      sessionStorage.setItem('loadingShown', 'true')
    }
  }, [])

  useEffect(() => {
    // If loading is complete and user is logged in, redirect to loading-entry
    if (loadingComplete && status === 'authenticated' && session?.user) {
      router.push('/loading-entry')
    }
  }, [loadingComplete, status, session, router])

  const handleLoadingComplete = () => {
    setLoadingComplete(true)
    
    // Check if user logged in during loading
    if (status === 'authenticated' && session?.user) {
      router.push('/loading-entry')
    }
  }

  // Show loading page only on first visit (not from auth pages)
  if (!loadingComplete && !hasSeenLoading) {
    return <CinematicLoading onComplete={handleLoadingComplete} />
  }

  // After loading completes, show landing page
  // (unless authenticated - will redirect via useEffect)
  return <LandingPage />
}
