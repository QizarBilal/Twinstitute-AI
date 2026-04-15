'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CohortAnalytics {
    cohortId: string
    cohortName: string
    totalStudents: number
    activeStudents: number
    avgCapabilityScore: number
    avgReadinessScore: number
    formationVelocity: number
    completionRate: number
    skillGapHeatmap: Record<string, number>
    burnoutRiskAverage: number
}

interface InstitutionMetrics {
    totalStudents: number
    activeCohorts: number
    avgFormationVelocity: number
    readinessHeatmap: {
        low: number
        medium: number
        high: number
        ready: number
    }
    topSkillGaps: Array<{ skill: string; frequency: number }>
    institutionalEfficiency: number
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<CohortAnalytics[]>([])
    const [institutionMetrics, setInstitutionMetrics] = useState<InstitutionMetrics | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeView, setActiveView] = useState<'cohorts' | 'institution'>('cohorts')

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            const [cohortRes, institutionRes] = await Promise.all([
                fetch('/api/analytics/cohorts').then(r => r.json()),
                fetch('/api/analytics/institution').then(r => r.json())
            ])

            setAnalytics(cohortRes?.data || [])
            setInstitutionMetrics(institutionRes?.data || null)
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm">Loading institutional analytics...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-white">Institutional Analytics</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Cohort capability maps, formation velocity tracking, and readiness heatmaps
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveView('cohorts')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeView === 'cohorts'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        Cohort Analytics
                    </button>
                    <button
                        onClick={() => setActiveView('institution')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeView === 'institution'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        Institution Overview
                    </button>
                </div>
            </motion.div>

            {activeView === 'institution' && institutionMetrics && (
                <div className="space-y-6">
                    {/* Institution Overview Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Total Students</div>
                            <div className="text-2xl font-bold text-white">{institutionMetrics.totalStudents}</div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Active Cohorts</div>
                            <div className="text-2xl font-bold text-blue-400">{institutionMetrics.activeCohorts}</div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Avg Formation Velocity</div>
                            <div className="text-2xl font-bold text-green-400">{institutionMetrics.avgFormationVelocity.toFixed(1)} pts/wk</div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Institutional Efficiency</div>
                            <div className="text-2xl font-bold text-purple-400">{Math.round(institutionMetrics.institutionalEfficiency)}%</div>
                        </div>
                    </div>

                    {/* Readiness Heatmap */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Readiness Heatmap</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Low Readiness', value: institutionMetrics.readinessHeatmap.low, color: 'bg-red-500' },
                                { label: 'Medium Readiness', value: institutionMetrics.readinessHeatmap.medium, color: 'bg-amber-500' },
                                { label: 'High Readiness', value: institutionMetrics.readinessHeatmap.high, color: 'bg-blue-500' },
                                { label: 'Interview Ready', value: institutionMetrics.readinessHeatmap.ready, color: 'bg-green-500' }
                            ].map((level, idx) => (
                                <div key={idx} className="text-center">
                                    <div className={`w-full h-20 ${level.color} rounded-lg mb-2 flex items-end justify-center pb-2`}>
                                        <span className="text-white font-bold text-lg">{level.value}</span>
                                    </div>
                                    <div className="text-xs text-gray-400">{level.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Skill Gaps */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Skill Gaps Across Cohorts</h3>
                        <div className="space-y-3">
                            {institutionMetrics.topSkillGaps.map((gap, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                    <span className="text-white font-medium">{gap.skill}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-red-500 h-2 rounded-full"
                                                style={{ width: `${Math.min(gap.frequency * 10, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-400">{gap.frequency} cohorts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'cohorts' && (
                <div className="space-y-6">
                    {analytics.map((cohort) => (
                        <motion.div
                            key={cohort.cohortId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">{cohort.cohortName}</h3>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-gray-400">
                                        {cohort.activeStudents}/{cohort.totalStudents} active
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        cohort.completionRate > 80 ? 'bg-green-500/20 text-green-400' :
                                        cohort.completionRate > 60 ? 'bg-blue-500/20 text-blue-400' :
                                        cohort.completionRate > 40 ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                        {Math.round(cohort.completionRate)}% completion
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">{cohort.avgCapabilityScore.toFixed(1)}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Capability</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-400">{cohort.avgReadinessScore.toFixed(1)}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Readiness</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">{cohort.formationVelocity.toFixed(1)}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Formation Velocity</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-400">{cohort.burnoutRiskAverage.toFixed(1)}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Burnout Risk</div>
                                </div>
                            </div>

                            {/* Skill Gap Heatmap */}
                            <div>
                                <h4 className="text-sm font-semibold text-white mb-3">Skill Gap Heatmap</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {Object.entries(cohort.skillGapHeatmap).slice(0, 8).map(([skill, gap]) => (
                                        <div key={skill} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                                            <span className="text-xs text-gray-300 truncate">{skill}</span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-8 bg-gray-700 rounded-full h-1">
                                                    <div
                                                        className="bg-red-500 h-1 rounded-full"
                                                        style={{ width: `${Math.min(gap * 20, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500">{gap}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {analytics.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-lg font-semibold text-white mb-2">No cohort analytics available</h3>
                            <p className="text-gray-400 text-sm">
                                Analytics will populate as students join cohorts and complete formation activities.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
