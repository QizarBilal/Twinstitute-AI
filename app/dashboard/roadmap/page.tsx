'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'
import { useSystem } from '@/lib/system'
import {
    generateAdaptiveRoadmap,
    calculateRoadmapProgress,
    estimateTimeToCompletion,
    getNodeReasoning,
    AdaptiveContext,
} from '@/lib/ai/roadmapAdapter'
import RoadmapGraph from '@/components/dashboard/roadmap/RoadmapGraph'
import NodeDetailsPanel from '@/components/dashboard/roadmap/NodeDetailsPanel'

// Empty state component - user needs to select a role first
const EmptyRoadmapState = () => (
    <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{ backgroundColor: COLORS.background.primary }}
    >
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
        >
            <div>
                <h2 style={{ color: COLORS.text.primary }} className="text-2xl font-semibold mb-4">
                    No Roadmap Yet
                </h2>
                <p style={{ color: COLORS.text.secondary }} className="mb-6 text-lg">
                    Complete the Orientation to select your career path and generate your personalized learning roadmap
                </p>
            </div>

            <motion.a
                href="/orientation"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-8 py-4 rounded-lg font-semibold transition-all"
                style={{
                    backgroundColor: COLORS.accent.primary,
                    color: '#ffffff',
                }}
            >
                Complete Orientation
            </motion.a>

            <p style={{ color: COLORS.text.secondary }} className="text-sm">
                A well-structured roadmap awaits once you select your area of focus
            </p>
        </motion.div>
    </div>
)

// Loading state component
const RoadmapLoadingState = () => (
    <div className="space-y-6">
        <div className="h-8 bg-gray-800/50 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-800/50 rounded animate-pulse" />
            ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-96 bg-gray-800/50 rounded animate-pulse" />
            <div className="h-96 bg-gray-800/50 rounded animate-pulse" />
        </div>
    </div>
)

export default function RoadmapPage() {
    const [roadmapData, setRoadmapData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

    // Fetch roadmap from API
    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                setLoading(true)
                const response = await fetch('/api/roadmap')
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch roadmap')
                }

                if (!data.success || !data.roadmap) {
                    // No roadmap yet - user needs to complete orientation
                    setRoadmapData(null)
                } else {
                    setRoadmapData(data.roadmap)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        fetchRoadmap()
    }, [])

    // Show empty state if no roadmap
    if (loading) {
        return <RoadmapLoadingState />
    }

    if (!roadmapData) {
        return <EmptyRoadmapState />
    }

    return (
        <div className="space-y-6 p-6" style={{ backgroundColor: COLORS.background.primary }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h1 className="text-3xl font-bold text-white">{roadmapData.userRole} Roadmap</h1>
                <p className="text-gray-400">
                    Your {roadmapData.durationMonths}-month learning journey ({roadmapData.intensityLevel})
                </p>
            </motion.div>

            {/* Roadmap Stats */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-4"
            >
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-semibold mb-2">DURATION</div>
                    <div className="text-3xl font-bold text-cyan-400">{roadmapData.totalDuration}</div>
                </div>
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-semibold mb-2">INTENSITY</div>
                    <div className="text-sm font-bold text-white">{roadmapData.intensityLevel}</div>
                </div>
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-semibold mb-2">PROGRESS</div>
                    <div className="text-3xl font-bold text-green-400">{roadmapData.completionPercentage}%</div>
                </div>
            </motion.div>

            {/* Roadmap Phases */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
            >
                {roadmapData.roadmapData && roadmapData.roadmapData.map((phase: any, phaseIdx: number) => (
                    <motion.div
                        key={phaseIdx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + phaseIdx * 0.1 }}
                        className="bg-gray-900/60 border border-gray-800 rounded-lg p-6 space-y-4"
                    >
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">{phase.phase}</h2>
                            <p className="text-sm text-gray-400">Duration: {phase.duration}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {phase.modules && phase.modules.map((module: any, modIdx: number) => (
                                <motion.div
                                    key={modIdx}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-bold text-white text-sm">{module.title}</h3>
                                        <span
                                            className="text-xs px-2 py-1 rounded"
                                            style={{
                                                backgroundColor: COLORS.accent.primary + '20',
                                                color: COLORS.accent.primary,
                                            }}
                                        >
                                            {module.difficulty}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-400">{module.description}</p>

                                    <div className="space-y-2">
                                        <div className="flex gap-2 flex-wrap">
                                            {module.skills && module.skills.map((skill: string, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                                        <span className="text-xs text-gray-500">{module.estimatedHours} hours</span>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="text-xs px-3 py-1 rounded"
                                            style={{
                                                backgroundColor: COLORS.accent.primary,
                                                color: '#000',
                                            }}
                                        >
                                            Start
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Reasoning */}
            {roadmapData.reasoning && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-lg p-4"
                >
                    <h3 className="text-sm font-bold text-purple-300 mb-3">🧠 Your Roadmap Strategy</h3>
                    <p className="text-sm text-gray-300">{roadmapData.reasoning}</p>
                </motion.div>
            )}
        </div>
    )
}

