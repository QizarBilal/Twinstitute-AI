/**
 * ERROR BOUNDARIES & LOADING UI UTILITIES
 * Standardized error handling and loading states
 */

'use client'

import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BOUNDARY COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: (error: Error, reset: () => void) => ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
        this.props.onError?.(error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback?.(this.state.error!, () => {
                    this.setState({ hasError: false, error: null })
                }) || <DefaultErrorFallback error={this.state.error} />
            )
        }

        return this.props.children
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT ERROR FALLBACK
// ─────────────────────────────────────────────────────────────────────────────

function DefaultErrorFallback({ error }: { error: Error | null }) {
    return (
        <div className="p-6 bg-red-900/20 border border-red-700 rounded-lg">
            <h3 className="text-red-400 font-semibold mb-2">Something went wrong</h3>
            <p className="text-red-300 text-sm">{error?.message || 'An unexpected error occurred'}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
                Try again
            </button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// API ERROR DISPLAY
// ─────────────────────────────────────────────────────────────────────────────

interface ApiErrorProps {
    error: string | null
    onDismiss?: () => void
}

export function ApiError({ error, onDismiss }: ApiErrorProps) {
    if (!error) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                    <div className="text-red-400 mt-0.5">⚠️</div>
                    <div>
                        <p className="text-red-200 text-sm font-semibold">Error</p>
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-red-400 hover:text-red-300 text-sm"
                    >
                        ✕
                    </button>
                )}
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SKELETON COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-gray-800/50 rounded-lg animate-pulse h-32 ${className}`} />
    )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`h-4 bg-gray-800/50 rounded animate-pulse ${
                        i === lines - 1 ? 'w-2/3' : 'w-full'
                    }`}
                />
            ))}
        </div>
    )
}

export function SkeletonGrid({
    columns = 3,
    count = 6,
}: {
    columns?: number
    count?: number
}) {
    return (
        <div className={`grid grid-cols-${columns} gap-4`}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    )
}

export function SkeletonChart({ height = '400px' }: { height?: string }) {
    return (
        <div
            className="bg-gray-800/50 rounded-lg animate-pulse"
            style={{ height }}
        />
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
    icon?: string
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
}

export function EmptyState({
    icon = '📭',
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
        >
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            {description && (
                <p className="text-gray-400 text-sm max-w-sm mb-6">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                    {action.label}
                </button>
            )}
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING OVERLAY
// ─────────────────────────────────────────────────────────────────────────────

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
        >
            <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-4"
            >
                <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                <p className="text-white text-sm font-medium">{message}</p>
            </motion.div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA STATE WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

interface DataStateWrapperProps {
    isLoading: boolean
    error: string | null
    isEmpty: boolean
    skeletonType?: 'card' | 'grid' | 'text' | 'chart'
    emptyState?: EmptyStateProps
    children: ReactNode
}

export function DataStateWrapper({
    isLoading,
    error,
    isEmpty,
    skeletonType = 'card',
    emptyState,
    children,
}: DataStateWrapperProps) {
    if (isLoading) {
        switch (skeletonType) {
            case 'grid':
                return <SkeletonGrid />
            case 'text':
                return <SkeletonText />
            case 'chart':
                return <SkeletonChart />
            default:
                return <SkeletonCard />
        }
    }

    if (error) {
        return <ApiError error={error} />
    }

    if (isEmpty) {
        return (
            <EmptyState
                icon={emptyState?.icon || '📭'}
                title={emptyState?.title || 'No data'}
                description={emptyState?.description}
                action={emptyState?.action}
            />
        )
    }

    return <>{children}</>
}
