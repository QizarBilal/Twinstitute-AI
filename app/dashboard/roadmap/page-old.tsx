'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'

const RoadmapLoadingState = () => (
    <div className="space-y-6 p-6" style={{ backgroundColor: COLORS.background.primary }}>
        <div className="h-10 bg-gray-800/50 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-800/50 rounded animate-pulse" />
            ))}
        </div>
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-800/50 rounded animate-pulse" />
            ))}
        </div>
    </div>
)

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
            <h2 style={{ color: COLORS.text.primary }} className="text-2xl font-semibold">
                No Roadmap Yet
            </h2>
            <p style={{ color: COLORS.text.secondary }} className="mb-6 text-lg">
                Complete the Orientation to select your career path
            </p>
            <motion.a
                href="/orientation"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-8 py-4 rounded-lg font-semibold"
                style={{
                    backgroundColor: COLORS.accent.primary,
                    color: '#000',
                }}
            >
                Complete Orientation
            </motion.a>
        </motion.div>
    </div>
)

export default function RoadmapPage() {
    const [roadmapData, setRoadmapData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                setLoading(true)
                console.log('📍 Fetching roadmap...')
                const response = await fetch('/api/roadmap')
                const data = await response.json()

                console.log('📦 API Response:', data)

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch roadmap')
                }

                if (data.success && data.roadmap) {
                    const phases = data.roadmap.roadmapData || []
                    console.log('✅ Roadmap data valid:', {
                        phases: Array.isArray(phases) ? phases.length : 0,
                        phaseStructure: Array.isArray(phases) && phases.length > 0 ? phases[0] : 'N/A',
                        duration: data.roadmap.durationMonths,
                        role: data.roadmap.userRole,
                    })
                    setRoadmapData(data.roadmap)
                } else {
                    console.warn('⚠️ No roadmap data in response')
                    setRoadmapData(null)
                }
            } catch (err) {
                console.error('❌ Roadmap fetch error:', err)
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        fetchRoadmap()
    }, [])

    if (loading) return <RoadmapLoadingState />
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen p-6" style={{ backgroundColor: COLORS.background.primary }}>
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md text-center">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
                    <p className="text-red-300 text-sm">{error}</p>
                </div>
            </div>
        )
    }
    if (!roadmapData) return <EmptyRoadmapState />

    // Parse roadmap data
    let phases = []
    if (roadmapData.roadmapData) {
        try {
            phases = typeof roadmapData.roadmapData === 'string' ? JSON.parse(roadmapData.roadmapData) : roadmapData.roadmapData
        } catch (e) {
            console.error('Failed to parse roadmap data:', e)
            phases = []
        }
    }

    return (
        <div className="space-y-6 p-8" style={{ backgroundColor: COLORS.background.primary, minHeight: '100vh' }}>
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* CONTROL CENTER HEADER */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 mb-8">
                <div className="flex items-baseline gap-3">
                    <h1 className="text-4xl font-bold text-white">{roadmapData.userRole || 'Learning Path'}</h1>
                    <span className="text-gray-500 text-lg">Roadmap</span>
                </div>
                <p className="text-gray-400">
                    Your <span className="font-semibold text-cyan-400">{roadmapData.durationMonths || 6}</span>-month learning journey
                </p>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* CONTROL PANEL - Key Metrics */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-4 gap-4 mb-8"
            >
                {/* Duration */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Duration</div>
                    <div className="text-2xl font-bold text-cyan-400">{roadmapData.totalDuration}</div>
                    <div className="text-xs text-gray-500 mt-2">{roadmapData.durationMonths} months</div>
                </div>

                {/* Intensity */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Intensity</div>
                    <div className="text-sm font-bold text-white line-clamp-2">{roadmapData.intensityLevel}</div>
                </div>

                {/* Progress */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Progress</div>
                    <div className="text-2xl font-bold text-green-400">{roadmapData.completionPercentage || 0}%</div>
                    <div className="w-full bg-gray-800 rounded-full h-1 mt-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${roadmapData.completionPercentage || 0}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        />
                    </div>
                </div>

                {/* Role */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Target</div>
                    <div className="text-sm font-bold text-blue-300">{roadmapData.userRole}</div>
                    <div className="text-xs text-gray-500 mt-2">{roadmapData.domain || 'Software'}</div>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* ROADMAP LAYERS - The 4 Mandatory Layers */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
                {phases && phases.length > 0 ? (
                    phases.map((phase: any, phaseIdx: number) => (
                        <motion.div
                            key={phaseIdx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + phaseIdx * 0.15 }}
                            className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 space-y-4 hover:border-gray-700 transition-all"
                        >
                            {/* Phase Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.accent.primary }} />
                                        {phase.phase}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">Duration: {phase.duration}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-cyan-400">{phase.modules?.length || 0}</div>
                                    <div className="text-xs text-gray-500">modules</div>
                                </div>
                            </div>

                            {/* Modules Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                {phase.modules && phase.modules.length > 0 ? (
                                    phase.modules.map((module: any, modIdx: number) => (
                                        <motion.div
                                            key={modIdx}
                                            whileHover={{ scale: 1.02, borderColor: COLORS.accent.primary }}
                                            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3 cursor-pointer group transition-all"
                                        >
                                            {/* Module Header */}
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-bold text-white text-sm flex-1 group-hover:text-cyan-400 transition-colors">
                                                    {module.title}
                                                </h3>
                                                <div className="flex gap-2">
                                                    {module.userHasSkill && (
                                                        <span
                                                            className="text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap bg-green-900/40 text-green-300 border border-green-600/50"
                                                        >
                                                            ✓ Familiar
                                                        </span>
                                                    )}
                                                    <span
                                                        className="text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap"
                                                        style={{
                                                            backgroundColor:
                                                                module.difficulty === 'Beginner'
                                                                    ? '#10b98120'
                                                                    : module.difficulty === 'Intermediate'
                                                                          ? '#f59e0b20'
                                                                          : '#ef444420',
                                                            color:
                                                                module.difficulty === 'Beginner'
                                                                    ? '#10b981'
                                                                    : module.difficulty === 'Intermediate'
                                                                          ? '#f59e0b'
                                                                          : '#ef4444',
                                                        }}
                                                    >
                                                        {module.difficulty}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-xs text-gray-400 line-clamp-2">{module.description}</p>

                                            {/* Skills */}
                                            <div className="flex gap-1 flex-wrap">
                                                {module.skills &&
                                                    module.skills.slice(0, 3).map((skill: string, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                {module.skills && module.skills.length > 3 && (
                                                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                                                        +{module.skills.length - 3}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Tasks */}
                                            {module.tasks && module.tasks.length > 0 && (
                                                <div className="text-xs text-gray-400 pt-2 border-t border-gray-700 space-y-1">
                                                    <div className="font-semibold text-gray-300">Tasks:</div>
                                                    {module.tasks.slice(0, 3).map((task: string, idx: number) => (
                                                        <div key={idx} className="text-xs text-gray-500 flex items-start gap-2">
                                                            <span className="text-gray-600">•</span>
                                                            <span>{task}</span>
                                                        </div>
                                                    ))}
                                                    {module.tasks.length > 3 && (
                                                        <div className="text-xs text-gray-600">+{module.tasks.length - 3} more tasks</div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Footer: Hours & Button */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                                                <span className="text-xs text-gray-500 font-mono">{module.estimatedHours} hrs</span>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="text-xs px-3 py-1.5 rounded font-semibold transition-all"
                                                    style={{
                                                        backgroundColor: COLORS.accent.primary,
                                                        color: '#000',
                                                    }}
                                                    onClick={() => console.log('Start module:', module.title)}
                                                >
                                                    Start
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-6 text-gray-500">No modules in this phase</div>
                                )}
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-900/40 border border-gray-800 rounded-xl p-6">
                        <p className="text-gray-400 mb-4">📦 No phases available in this roadmap</p>
                        <p className="text-gray-500 text-sm">
                            If you see this message, there may be an issue with roadmap generation.
                        </p>
                        <p className="text-gray-500 text-xs mt-2">Check browser console for debugging information.</p>
                    </div>
                )}
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* AI REASONING - Why This Roadmap */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {roadmapData.reasoning && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-lg p-6 mt-8"
                >
                    <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                        <span>🧠</span> Roadmap Strategy
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{roadmapData.reasoning}</p>
                </motion.div>
            )}
        </div>
    )
}

