'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CohortAnalytics {
    id: string; name: string; targetDomain: string; targetRole: string | null; isActive: boolean; memberCount: number; semester: string | null
    analytics: {
        avgScore: number; avgReadiness: number; avgVelocity: number
        stages: { foundation: number; building: number; advancing: number; expert: number }
        avgDimensions: Record<string, number>
        skillGaps: { dimension: string; score: number; gap: number }[]
        readinessHeatmap: { name: string; score: number; readiness: number; stage: string; velocity: number }[]
    }
}

interface InstitutionData {
    isInstitutionMember: boolean
    role?: string
    institution?: { id: string; name: string; domain: string; planType: string; maxStudents: number; isVerified: boolean }
    cohorts?: CohortAnalytics[]
    placementAnalytics?: { totalStudents: number; placementReady: number; placementRate: number; avgFormationVelocity: number }
}

const stageColors = {
    foundation: '#ef4444',
    building: '#f59e0b',
    advancing: '#6366f1',
    expert: '#10b981',
}

export default function InstitutionPage() {
    const [data, setData] = useState<InstitutionData | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'cohorts' | 'heatmap' | 'onboard'>('overview')
    const [selectedCohort, setSelectedCohort] = useState<CohortAnalytics | null>(null)
    const [onboarding, setOnboarding] = useState(false)
    const [formData, setFormData] = useState({ name: '', domain: '', planType: 'starter' })

    useEffect(() => {
        fetch('/api/institution', { credentials: 'include' })
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const handleOnboard = async () => {
        setOnboarding(true)
        const res = await fetch('/api/institution', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
        if (res.ok) {
            const result = await res.json()
            setData({ ...data, isInstitutionMember: true, role: 'admin', institution: result.institution, cohorts: [], placementAnalytics: { totalStudents: 0, placementReady: 0, placementRate: 0, avgFormationVelocity: 0 } })
            setActiveTab('overview')
        }
        setOnboarding(false)
    }

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
    }

    // Not a member — show onboarding
    if (!data?.isInstitutionMember) {
        return (
            <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-white">Institution Portal</h1>
                    <p className="text-gray-400 text-sm mt-1">Onboard your institution to access cohort analytics, skill gap detection, and placement tracking.</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl mx-auto bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-10"
                >
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-4">🏫</div>
                        <h2 className="text-xl font-bold text-white mb-2">Register Your Institution</h2>
                        <p className="text-gray-400 text-sm">Get real-time visibility into student capability formation.</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Institution Name</label>
                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. MIT, Stanford..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Domain</label>
                            <input value={formData.domain} onChange={e => setFormData({ ...formData, domain: e.target.value })} placeholder="e.g. mit.edu" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Plan</label>
                            <select value={formData.planType} onChange={e => setFormData({ ...formData, planType: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50">
                                <option value="starter">Starter (100 students)</option>
                                <option value="professional">Professional (500 students)</option>
                                <option value="enterprise">Enterprise (Unlimited)</option>
                            </select>
                        </div>
                        <button onClick={handleOnboard} disabled={onboarding || !formData.name || !formData.domain} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium rounded-xl transition-all mt-4">
                            {onboarding ? 'Creating...' : '🏫 Register Institution'}
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    const inst = data.institution!
    const cohorts = data.cohorts || []
    const placement = data.placementAnalytics!

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">{inst.name}</h1>
                    <p className="text-gray-400 text-sm mt-1">Institution Portal — {inst.domain} · {inst.planType}</p>
                </div>
                <div className="flex items-center gap-2">
                    {inst.isVerified && <span className="text-xs px-2.5 py-1 bg-green-500/15 text-green-400 rounded-full">✓ Verified</span>}
                    <span className="text-xs px-2.5 py-1 bg-indigo-500/15 text-indigo-400 rounded-full capitalize">{data.role}</span>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2">
                {([
                    { id: 'overview', label: '📊 Overview' },
                    { id: 'cohorts', label: '👥 Cohorts' },
                    { id: 'heatmap', label: '🔥 Readiness Heatmap' },
                ] as const).map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                                <div className="text-3xl font-bold text-white">{placement.totalStudents}</div>
                                <div className="text-xs text-gray-500 mt-1">Total Students</div>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                                <div className="text-3xl font-bold text-green-400">{placement.placementReady}</div>
                                <div className="text-xs text-gray-500 mt-1">Placement Ready</div>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                                <div className="text-3xl font-bold text-blue-400">{placement.placementRate}%</div>
                                <div className="text-xs text-gray-500 mt-1">Placement Rate</div>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                                <div className="text-3xl font-bold text-purple-400">{placement.avgFormationVelocity}</div>
                                <div className="text-xs text-gray-500 mt-1">Avg Velocity</div>
                            </div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-gray-300 mb-4">Active Cohorts</h3>
                            {cohorts.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-8">No cohorts created yet. Create your first cohort to start tracking students.</p>
                            ) : (
                                <div className="space-y-3">
                                    {cohorts.map(c => (
                                        <div key={c.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => { setSelectedCohort(c); setActiveTab('cohorts') }}>
                                            <div>
                                                <div className="text-sm font-semibold text-white">{c.name}</div>
                                                <div className="text-xs text-gray-500">{c.targetDomain} · {c.memberCount} students</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-blue-400">{c.analytics.avgScore}</div>
                                                    <div className="text-[10px] text-gray-500">Avg Score</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-green-400">{c.analytics.avgReadiness}%</div>
                                                    <div className="text-[10px] text-gray-500">Readiness</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'cohorts' && selectedCohort && (
                    <motion.div key="cohorts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setActiveTab('overview')} className="text-gray-400 hover:text-white text-sm">← Back</button>
                            <h2 className="text-lg font-bold text-white">{selectedCohort.name}</h2>
                        </div>

                        {/* Stage Distribution */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-gray-300 mb-4">Stage Distribution</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {Object.entries(selectedCohort.analytics.stages).map(([stage, count]) => (
                                    <div key={stage} className="text-center bg-gray-800/50 rounded-xl p-4">
                                        <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: stageColors[stage as keyof typeof stageColors] + '30' }}>
                                            <div className="w-full h-full rounded-full flex items-center justify-center text-lg font-bold" style={{ color: stageColors[stage as keyof typeof stageColors] }}>{count}</div>
                                        </div>
                                        <div className="text-xs text-gray-400 capitalize">{stage}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skill Gaps */}
                        {selectedCohort.analytics.skillGaps.length > 0 && (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-gray-300 mb-4">Cohort Skill Gaps</h3>
                                <div className="space-y-3">
                                    {selectedCohort.analytics.skillGaps.map((gap, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400 w-40 capitalize">{gap.dimension.replace(/([A-Z])/g, ' $1')}</span>
                                            <div className="flex-1 h-2 bg-gray-800 rounded-full">
                                                <div className="h-full rounded-full bg-red-500" style={{ width: `${gap.score}%` }} />
                                            </div>
                                            <span className="text-xs text-red-400 w-16">Gap: {gap.gap}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Capability Map */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-gray-300 mb-4">Capability Dimensions (Cohort Average)</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {Object.entries(selectedCohort.analytics.avgDimensions).map(([dim, score]) => (
                                    <div key={dim} className="bg-gray-800/50 rounded-xl p-3">
                                        <div className="text-xs text-gray-500 capitalize mb-1">{dim.replace(/([A-Z])/g, ' $1')}</div>
                                        <div className="text-lg font-bold text-white">{score}%</div>
                                        <div className="h-1 bg-gray-700 rounded-full mt-1">
                                            <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: score >= 50 ? '#6366f1' : '#ef4444' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'heatmap' && (
                    <motion.div key="heatmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        {cohorts.map(cohort => (
                            <div key={cohort.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-gray-300 mb-4">{cohort.name} — Readiness Heatmap</h3>
                                {cohort.analytics.readinessHeatmap.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-8">No student data available</p>
                                ) : (
                                    <div className="grid grid-cols-6 gap-2">
                                        {cohort.analytics.readinessHeatmap.map((student, i) => {
                                            const hue = Math.round(student.readiness * 1.2)
                                            return (
                                                <div key={i} className="rounded-xl p-3 text-center" style={{ backgroundColor: `hsl(${hue}, 60%, 15%)`, border: `1px solid hsl(${hue}, 60%, 30%)` }}>
                                                    <div className="text-xs text-white font-medium truncate">{student.name}</div>
                                                    <div className="text-lg font-bold mt-1" style={{ color: `hsl(${hue}, 70%, 60%)` }}>{student.readiness}%</div>
                                                    <div className="text-[9px] text-gray-400 capitalize">{student.stage}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                        {cohorts.length === 0 && (
                            <div className="text-center text-gray-500 py-20">No cohorts to display heatmap for.</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
