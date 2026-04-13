'use client'

import { SessionProvider } from 'next-auth/react'
import { SystemProvider } from '@/lib/system/context'
import { ErrorBoundary } from '@/lib/system/errorBoundary'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ErrorBoundary>
                <SystemProvider>
                    {children}
                </SystemProvider>
            </ErrorBoundary>
        </SessionProvider>
    )
}
