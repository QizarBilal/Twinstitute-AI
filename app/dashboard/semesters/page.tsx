'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Semester {
    id: string
    name: string
    description: string
    domain: string
    targetRole: string
    durationWeeks: number
    labCycles: number
    evaluationRounds: number
    isActive: boolean
    startDate?: string
    endDate?: string
}

interface Milestone {
    id: string
    title: string
    description: string
    milestoneType: string
    targetValue: number
    currentValue: number
    isCompleted: boolean
    creditsAwarded: number
    completedAt?: string
}

export default function SemestersPage() {
    const [semesters, setSemesters] = useState<Semester[]>([])
    const [currentSemester, setCurrentSemester] = useState<Semester | null>(null)
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSemesters()
    }, [])

    const fetchSemesters = async () => {
        try {
            const [semestersRes, currentRes] = await Promise.all([
                fetch('/api/semesters').then(r => r.json()),
                fetch('/api/semesters/current').then(r => r.json())
            ])

            setSemesters(semestersRes || [])
            setCurrentSemester(currentRes)

            if (currentRes) {
                const milestonesRes = await fetch(`/api/milestones?semesterId=${currentRes.id}`).then(r => r.json())
                setMilestones(milestonesRes || [])
            }
        } catch (error) {
            console.error('Failed to fetch semesters:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm">Loading institutional semesters...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Institutional Semesters</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Structured formation cycles with lab sessions and evaluations
                    </p>
                </div>
                {currentSemester && (
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium rounded-lg">
                        Active: {currentSemester.name}
                    </div>
                )}
            </div>

            {/* Current Semester */}
            {currentSemester && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">{currentSemester.name}</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm text-green-400">Active</span>
                        </div>
                    </div>

                    <p className="text-gray-300 mb-6">{currentSemester.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">{currentSemester.durationWeeks}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Weeks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{currentSemester.labCycles}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Lab Cycles</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{currentSemester.evaluationRounds}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Evaluations</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-400">{currentSemester.targetRole}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Target Role</div>
                        </div>
                    </div>

                    {/* Milestones */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Semester Milestones</h3>
                        <div className="space-y-3">
                            {milestones.map((milestone) => (
                                <div key={milestone.id} className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                        milestone.isCompleted
                                            ? 'bg-green-500'
                                            : milestone.currentValue > 0
                                                ? 'bg-blue-500'
                                                : 'bg-gray-600'
                                    }`}>
                                        {milestone.isCompleted && <span className="text-xs text-white">✓</span>}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-white">{milestone.title}</h4>
                                        <p className="text-sm text-gray-400">{milestone.description}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min((milestone.currentValue / milestone.targetValue) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {milestone.currentValue}/{milestone.targetValue}
                                            </span>
                                        </div>
                                    </div>
                                    {milestone.isCompleted && (
                                        <div className="text-sm text-green-400 font-medium">
                                            +{milestone.creditsAwarded} credits
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* All Semesters */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Formation Curriculum</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {semesters.map((semester) => (
                        <motion.div
                            key={semester.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`border rounded-xl p-5 transition-all ${
                                semester.isActive
                                    ? 'border-blue-500/50 bg-blue-500/5'
                                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white">{semester.name}</h3>
                                {semester.isActive && (
                                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">
                                        Active
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-400 text-sm mb-4">{semester.description}</p>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Domain:</span>
                                    <span className="text-white ml-2">{semester.domain}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Role:</span>
                                    <span className="text-white ml-2">{semester.targetRole}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Duration:</span>
                                    <span className="text-white ml-2">{semester.durationWeeks} weeks</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Labs:</span>
                                    <span className="text-white ml-2">{semester.labCycles} cycles</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {semesters.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold text-white mb-2">No semesters configured</h3>
                    <p className="text-gray-400 text-sm">
                        Institutional semesters will be set up by your formation coordinator.
                    </p>
                </div>
            )}
        </div>
    )
}