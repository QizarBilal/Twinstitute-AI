'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TranscriptData {
    student: { name: string; email: string; accountType: string; joinedAt: string }
    capabilityTwin: {
        overallScore: number; stage: string; readinessScore: number; formationVelocity: number
        dimensions: Record<string, number>; targetRole: string; targetDomain: string
    } | null
    skillGenome: {
        nodes: { id: string; label: string; level: number; category: string }[]
        coreStrength: number; breadthScore: number; depthScore: number
    } | null
    credits: { execution: number; design: number; reliability: number; innovation: number; problem_solving: number; consistency: number; grand_total: number }
    labPerformance: { totalSubmissions: number; passed: number; avgScore: number; taskBreakdown: { type: string; count: number }[] }
    proofArtifacts: { title: string; type: string; capabilityLevel: string; isPublic: boolean; skills: string[] }[]
    milestones: { title: string; type: string; progress: string; completed: boolean }[]
    generatedAt: string
}

const creditTypeColors: Record<string, string> = {
    execution: '#6366f1',
    design: '#8b5cf6',
    reliability: '#06b6d4',
    innovation: '#f59e0b',
    problem_solving: '#10b981',
    consistency: '#ef4444',
}

export default function TranscriptPage() {
    const [transcript, setTranscript] = useState<TranscriptData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/transcript', { credentials: 'include' })
            .then(res => res.json())
            .then(data => { setTranscript(data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm">Generating Capability Transcript...</span>
                </div>
            </div>
        )
    }

    if (!transcript) {
        return <div className="text-center text-gray-400 py-20">Unable to generate transcript. Complete some lab tasks first.</div>
    }

    const twin = transcript.capabilityTwin
    const perf = transcript.labPerformance

    return (
        <div className="space-y-6 pb-10">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Capability Transcript</h1>
                    <p className="text-gray-400 text-sm mt-1">Your complete, verified formation record — exportable and recruiter-ready.</p>
                </div>
                <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-purple-500/20">
                    📄 Export PDF
                </button>
            </motion.div>

            {/* Student Header */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-white">{transcript.student.name}</h2>
                        <p className="text-indigo-300/80 text-sm mt-1">{transcript.student.email}</p>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
                                {transcript.student.accountType}
                            </span>
                            <span className="text-xs text-gray-400">
                                Joined {new Date(transcript.student.joinedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-400 mb-1">Overall Capability Score</div>
                        <div className="text-5xl font-bold text-white">{twin?.overallScore || 0}</div>
                        <div className="text-xs text-indigo-400 capitalize mt-1">{twin?.stage || 'Foundation'} Stage</div>
                    </div>
                </div>
            </motion.div>

            {/* Capability Dimensions */}
            {twin && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
                >
                    <h3 className="text-sm font-semibold text-gray-300 mb-5">Capability Dimensions</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {Object.entries(twin.dimensions).map(([key, value], idx) => (
                            <div key={key} className="bg-gray-800/50 rounded-xl p-4">
                                <div className="text-xs text-gray-500 capitalize mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                <div className="text-xl font-bold text-white mb-2">{value}%</div>
                                <div className="h-1.5 bg-gray-700 rounded-full">
                                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${value}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-gray-800/50 rounded-xl p-4">
                            <div className="text-xs text-gray-500 mb-1">Target Role</div>
                            <div className="text-sm font-semibold text-white">{twin.targetRole || 'Not set'}</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4">
                            <div className="text-xs text-gray-500 mb-1">Readiness Score</div>
                            <div className="text-sm font-semibold text-green-400">{twin.readinessScore}%</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4">
                            <div className="text-xs text-gray-500 mb-1">Formation Velocity</div>
                            <div className="text-sm font-semibold text-blue-400">{twin.formationVelocity} pts/wk</div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Credit Summary */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
            >
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-gray-300">Capability Credits</h3>
                    <span className="text-2xl font-bold text-purple-400">{transcript.credits.grand_total} total</span>
                </div>
                <div className="grid grid-cols-6 gap-3">
                    {Object.entries(transcript.credits).filter(([k]) => k !== 'grand_total').map(([type, amount]) => (
                        <div key={type} className="text-center bg-gray-800/50 rounded-xl p-4">
                            <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${creditTypeColors[type]}20` }}>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: creditTypeColors[type] }} />
                            </div>
                            <div className="text-lg font-bold text-white">{amount}</div>
                            <div className="text-[10px] text-gray-500 capitalize">{type.replace('_', ' ')}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Lab Performance */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
            >
                <h3 className="text-sm font-semibold text-gray-300 mb-5">Lab Performance</h3>
                <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{perf.totalSubmissions}</div>
                        <div className="text-xs text-gray-500 mt-1">Total Submissions</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-green-400">{perf.passed}</div>
                        <div className="text-xs text-gray-500 mt-1">Passed</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-purple-400">{perf.avgScore}</div>
                        <div className="text-xs text-gray-500 mt-1">Avg Score</div>
                    </div>
                </div>
                {perf.taskBreakdown.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-xs text-gray-500 mb-2">Task Type Breakdown</div>
                        {perf.taskBreakdown.map((tb, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 w-28 capitalize">{tb.type.replace('_', ' ')}</span>
                                <div className="flex-1 h-2 bg-gray-800 rounded-full">
                                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, (tb.count / Math.max(perf.totalSubmissions, 1)) * 100)}%` }} />
                                </div>
                                <span className="text-xs text-gray-300 w-8">{tb.count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Milestones */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
            >
                <h3 className="text-sm font-semibold text-gray-300 mb-5">Formation Milestones</h3>
                <div className="grid grid-cols-2 gap-3">
                    {transcript.milestones.map((m, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${m.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-gray-800/30 border-gray-700/50'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${m.completed ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                {m.completed ? '✓' : '○'}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-white font-medium">{m.title}</div>
                                <div className="text-xs text-gray-500">{m.progress}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Proof Artifacts */}
            {transcript.proofArtifacts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
                >
                    <h3 className="text-sm font-semibold text-gray-300 mb-5">Proof Artifacts</h3>
                    <div className="space-y-3">
                        {transcript.proofArtifacts.map((proof, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">📜</div>
                                    <div>
                                        <div className="text-sm font-medium text-white">{proof.title}</div>
                                        <div className="text-xs text-gray-500 capitalize">{proof.type.replace('_', ' ')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {proof.capabilityLevel && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${proof.capabilityLevel === 'Advanced' ? 'bg-green-500/15 text-green-400' : proof.capabilityLevel === 'Intermediate' ? 'bg-blue-500/15 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                                            {proof.capabilityLevel}
                                        </span>
                                    )}
                                    {proof.isPublic && <span className="text-xs text-gray-500">🌐 Public</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-xs text-gray-600 pt-4 border-t border-gray-800"
            >
                Generated by Twinstitute AI Engine — {new Date(transcript.generatedAt).toLocaleString()}
                <br />
                This transcript is a verified, machine-generated record of capability formation.
            </motion.div>
        </div>
    )
}
