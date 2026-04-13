'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import CapabilityScoreCard from '@/components/dashboard/twin/CapabilityScoreCard'
import SkillRadarChart from '@/components/dashboard/twin/SkillRadarChart'
import GrowthTimeline from '@/components/dashboard/twin/GrowthTimeline'
import WeakSkillsPanel from '@/components/dashboard/twin/WeakSkillsPanel'
import RoleAlignmentPanel from '@/components/dashboard/twin/RoleAlignmentPanel'
import PredictionPanel from '@/components/dashboard/twin/PredictionPanel'
import PerformanceStats from '@/components/dashboard/twin/PerformanceStats'

const dimensionInfo: Record<string, { label: string; icon: string; description: string }> = {
    executionReliability: { label: 'Execution Reliability', icon: '⚡', description: 'Consistency in delivering working solutions' },
    learningSpeed: { label: 'Learning Speed', icon: '📈', description: 'Rate of skill acquisition over time' },
    problemSolvingDepth: { label: 'Problem Solving', icon: '🧩', description: 'Depth of analytical problem-solving' },
    consistency: { label: 'Consistency', icon: '🎯', description: 'Regularity of output quality' },
    designReasoning: { label: 'Design Reasoning', icon: '🏗️', description: 'Architecture and design decision quality' },
    abstractionLevel: { label: 'Abstraction Level', icon: '🔮', description: 'Ability to think at appropriate abstraction levels' },
    innovationIndex: { label: 'Innovation Index', icon: '💡', description: 'Creative and novel approach frequency' },
    burnoutRisk: { label: 'Burnout Risk', icon: '🔥', description: 'Current burnout indicator level (lower is better)' },
}

export default function TwinPage() {
    const { data: twin, loading: twinLoading } = useDataFetch('/api/user/twin')

    if (twinLoading) {
        return (
            <div className="space-y-6">
                {/* Header skeleton */}
                <div className="h-16 bg-gray-800/50 rounded-lg animate-pulse" />

                {/* Grid skeletons */}
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-80 bg-gray-800/50 rounded-lg animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-72 bg-gray-800/50 rounded-lg animate-pulse" />
                    ))}
                </div>
                <div className="h-96 bg-gray-800/50 rounded-lg animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">Digital Capability Twin</h1>
                <p className="text-gray-400">
                    Your evolving digital twin — real-time capability insights, growth tracking, and AI-powered predictions
                </p>
            </motion.div>

            {/* Row 1: Skills, Score, Growth (3 columns) */}
            <div className="grid grid-cols-3 gap-4">
                {/* Skill Radar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6"
                >
                    <SkillRadarChart />
                </motion.div>

                {/* Capability Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6"
                >
                    <CapabilityScoreCard loading={twinLoading} />
                </motion.div>

                {/* Growth Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6"
                >
                    <GrowthTimeline />
                </motion.div>
            </div>

            {/* Row 2: Weak Skills, Role Alignment, Predictions (3 columns) */}
            <div className="grid grid-cols-3 gap-4">
                {/* Weak Skills Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6"
                >
                    <WeakSkillsPanel />
                </motion.div>

                {/* Role Alignment Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6"
                >
                    <RoleAlignmentPanel />
                </motion.div>

                {/* Prediction Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6"
                >
                    <PredictionPanel />
                </motion.div>
            </div>

            {/* Row 3: Performance Stats (Full Width) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6"
            >
                <PerformanceStats />
            </motion.div>

            {/* Footer Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800"
            >
                {/* How It Works */}
                <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-gray-800/50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-white mb-2">How Your Twin Works</h3>
                    <ul className="text-xs text-gray-400 space-y-1">
                        <li>✓ Real-time updates from every lab task you complete</li>
                        <li>✓ AI-powered skill analysis from your genome graph</li>
                        <li>✓ Predictive insights on your trajectory</li>
                        <li>✓ Personalized recommendations based on your growth</li>
                    </ul>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                        onClick={() => window.location.href = '/dashboard/labs'}
                    >
                        → Complete Labs to Update Twin
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg transition-colors"
                        onClick={() => {
                            const canvas = document.querySelector('canvas')
                            if (canvas) {
                                const link = document.createElement('a')
                                link.href = canvas.toDataURL()
                                link.download = `twin-${new Date().toISOString().slice(0, 10)}.png`
                                link.click()
                            }
                        }}
                    >
                        ↓ Download Twin Report
                    </motion.button>
                </div>
            </motion.div>

            {/* Twin Status Info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-center justify-between text-xs text-gray-500 px-2 py-1"
            >
                <span>Twin synced: {twin?.lastUpdated ? new Date(twin.lastUpdated).toLocaleTimeString() : 'Now'}</span>
                <span>Updates continuously after each completed task</span>
            </motion.div>
        </div>
    )
}
