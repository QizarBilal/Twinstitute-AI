/**
 * GLOBAL CONTEXT PROVIDERS
 * Unified state management for the entire Twinstitute system
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiClient } from './apiClient'
import {
    SystemState,
    UserProfile,
    CapabilityTwin,
    SkillGenome,
    Roadmap,
    DomainSelection,
} from './types'
import { getSystemState } from './dataFlow'

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

interface SystemContextValue {
    // State
    state: SystemState
    user: UserProfile | null
    domain: DomainSelection | null
    twin: CapabilityTwin | null
    genome: SkillGenome | null
    roadmap: Roadmap | null
    isLoading: boolean
    error: string | null

    // Actions
    refreshUser: () => Promise<void>
    refreshTwin: () => Promise<void>
    refreshGenome: () => Promise<void>
    refreshRoadmap: () => Promise<void>
    refreshAll: () => Promise<void>
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

const SystemContext = createContext<SystemContextValue | undefined>(undefined)

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function SystemProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<SystemState>({
        user: null,
        domain: null,
        twin: null,
        genome: null,
        roadmap: null,
        lastRevenueActivity: null,
        isLoading: true,
        error: null,
        updatedAt: new Date().toISOString(),
    })

    // ─────────────────────────────────────────────────────────────────────────
    // REFRESH FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    const refreshUser = useCallback(async () => {
        try {
            const response = await apiClient.getUser()
            if (response.success && response.data) {
                const userData = response.data as UserProfile
                setState(prev => ({
                    ...prev,
                    user: userData,
                    domain: {
                        domain: userData.selectedDomain || '',
                        role: userData.selectedRole || '',
                        confidenceScore: 0,
                        timestamp: new Date().toISOString(),
                    },
                    updatedAt: new Date().toISOString(),
                }))
            }
        } catch (error) {
            console.error('Failed to refresh user:', error)
        }
    }, [])

    const refreshTwin = useCallback(async () => {
        try {
            const response = await apiClient.getTwin()
            if (response.success && response.data) {
                const twinData = response.data as CapabilityTwin
                setState(prev => ({
                    ...prev,
                    twin: twinData,
                    updatedAt: new Date().toISOString(),
                }))
            }
        } catch (error) {
            console.error('Failed to refresh twin:', error)
        }
    }, [])

    const refreshGenome = useCallback(async () => {
        try {
            const response = await apiClient.getGenome()
            if (response.success && response.data) {
                const genomeData = response.data as SkillGenome
                setState(prev => ({
                    ...prev,
                    genome: genomeData,
                    updatedAt: new Date().toISOString(),
                }))
            }
        } catch (error) {
            console.error('Failed to refresh genome:', error)
        }
    }, [])

    const refreshRoadmap = useCallback(async () => {
        try {
            const response = await apiClient.getRoadmap()
            if (response.success && response.data) {
                const roadmapData = response.data as Roadmap
                setState(prev => ({
                    ...prev,
                    roadmap: roadmapData,
                    updatedAt: new Date().toISOString(),
                }))
            }
        } catch (error) {
            console.error('Failed to refresh roadmap:', error)
        }
    }, [])

    const refreshAll = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }))
        try {
            const response = await getSystemState('')
            if (response.success && response.data) {
                setState({
                    ...response.data,
                    isLoading: false,
                    updatedAt: new Date().toISOString(),
                })
            } else {
                setState(prev => ({
                    ...prev,
                    error: response.error || 'Failed to load system state',
                    isLoading: false,
                }))
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: String(error),
                isLoading: false,
            }))
        }
    }, [])

    // ─────────────────────────────────────────────────────────────────────────
    // INITIAL LOAD
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        refreshAll()
    }, [refreshAll])

    // ─────────────────────────────────────────────────────────────────────────
    // CONTEXT VALUE
    // ─────────────────────────────────────────────────────────────────────────

    const value: SystemContextValue = {
        state,
        user: state.user,
        domain: state.domain,
        twin: state.twin,
        genome: state.genome,
        roadmap: state.roadmap,
        isLoading: state.isLoading,
        error: state.error,

        refreshUser,
        refreshTwin,
        refreshGenome,
        refreshRoadmap,
        refreshAll,
    }

    return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK TO USE CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

export function useSystem() {
    const context = useContext(SystemContext)
    if (context === undefined) {
        throw new Error('useSystem must be used within SystemProvider')
    }
    return context
}

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALIZED HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useUserProfile() {
    const { user, refreshUser, isLoading, error } = useSystem()
    return { user, refreshUser, isLoading, error }
}

export function useCapabilityTwin() {
    const { twin, refreshTwin, isLoading } = useSystem()
    return { twin, refreshTwin, isLoading }
}

export function useSkillGenome() {
    const { genome, refreshGenome, isLoading } = useSystem()
    return { genome, refreshGenome, isLoading }
}

export function useRoadmap() {
    const { roadmap, refreshRoadmap, isLoading } = useSystem()
    return { roadmap, refreshRoadmap, isLoading }
}

export function useDomain() {
    const { domain, user, isLoading } = useSystem()
    return { domain, user, isLoading }
}

export function useSystemState() {
    const { state, refreshAll, isLoading, error } = useSystem()
    return { state, refreshAll, isLoading, error }
}