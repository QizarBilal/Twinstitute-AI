'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { exportToPDF } from '@/lib/pdf-export'

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
    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        fetch('/api/transcript', { credentials: 'include' })
            .then(res => res.json())
            .then(data => { setTranscript(data.data); setLoading(false) })
            .catch(err => { console.error(err); setLoading(false) })
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

    const downloadTranscript = async () => {
        setIsDownloading(true)
        try {
            const success = await exportToPDF('transcript-content', transcript.student.name.replace(/\s+/g, '_') + '_Formation_Transcript')
            if (success) {
                console.log('Transcript PDF exported successfully')
            }
        } catch (error) {
            console.error('Error downloading transcript:', error)
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className="px-8 py-8 space-y-6 min-h-screen bg-black">
            <div id="transcript-content" className="space-y-6">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-white">Formation Record</h1>
                    <p className="text-slate-400 text-sm mt-1">Your complete, verified capability transcript</p>
                </div>
                <button 
                    onClick={downloadTranscript}
                    disabled={isDownloading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDownloading ? 'Downloading...' : 'Export PDF'}
                </button>
            </motion.div>

            {/* Student Profile Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl"
            >
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h2 className="text-4xl font-bold text-white mb-2">{transcript.student.name}</h2>
                        <p className="text-slate-400 text-sm mb-4">{transcript.student.email}</p>
                        <div className="flex items-center gap-3">
                            <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium capitalize">
                                {transcript.student.accountType}
                            </span>
                            <span className="text-xs text-slate-500">
                                Joined {new Date(transcript.student.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-xs mb-2 uppercase tracking-wide">Overall Score</p>
                        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1">
                            {twin?.overallScore || 0}
                        </div>
                        <p className="text-slate-400 text-xs capitalize font-medium">{twin?.stage || 'Foundation'} Stage</p>
                    </div>
                </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-3 gap-4"
            >
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 backdrop-blur">
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Readiness</p>
                    <div className="text-3xl font-bold text-slate-200 mb-2">{twin?.readinessScore || 0}%</div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: `${twin?.readinessScore || 0}%` }} />
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 backdrop-blur">
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Formation Velocity</p>
                    <div className="text-3xl font-bold text-slate-200">{twin?.formationVelocity || 0}</div>
                    <p className="text-slate-500 text-xs mt-2">points per week</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 backdrop-blur">
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Lab Submissions</p>
                    <div className="text-3xl font-bold text-slate-200">{perf.totalSubmissions}</div>
                    <p className="text-slate-500 text-xs mt-2">{perf.passed} passed</p>
                </div>
            </motion.div>

            {/* Capability Dimensions */}
            {twin && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur"
                >
                    <h3 className="text-lg font-semibold text-white mb-6">Capability Dimensions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(twin.dimensions).slice(0, 8).map(([key, value]) => (
                            <div key={key} className="bg-slate-800/30 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-slate-300 text-sm font-medium capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </p>
                                    <span className="text-blue-400 font-bold text-sm">{value}%</span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${value}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Credits & Performance */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="grid grid-cols-2 gap-4"
            >
                {/* Capability Credits */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
                    <h3 className="text-lg font-semibold text-white mb-6">Capability Credits</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(transcript.credits).filter(([k]) => k !== 'grand_total').map(([type, amount]) => (
                            <div key={type} className="bg-slate-800/50 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-blue-400 mb-1">{amount}</p>
                                <p className="text-xs text-slate-500 capitalize">{type.replace('_', ' ')}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-2">Total Credits</p>
                        <p className="text-3xl font-bold text-slate-200">{transcript.credits.grand_total}</p>
                    </div>
                </div>

                {/* Lab Performance */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
                    <h3 className="text-lg font-semibold text-white mb-6">Lab Performance</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                            <span className="text-slate-300 text-sm">Pass Rate</span>
                            <span className="text-blue-400 font-bold">
                                {perf.totalSubmissions > 0 ? Math.round((perf.passed / perf.totalSubmissions) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                            <span className="text-slate-300 text-sm">Average Score</span>
                            <span className="text-emerald-400 font-bold">{perf.avgScore}%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                            <span className="text-slate-300 text-sm">Submissions</span>
                            <span className="text-cyan-400 font-bold">{perf.totalSubmissions}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Milestones */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur"
            >
                <h3 className="text-lg font-semibold text-white mb-6">Formation Milestones</h3>
                <div className="grid grid-cols-2 gap-3">
                    {transcript.milestones.map((m, i) => (
                        <div 
                            key={i} 
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                                m.completed 
                                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                                    : 'bg-slate-800/30 border-slate-700/50'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                m.completed 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-slate-700 text-slate-400'
                            }`}>
                                {m.completed ? '✓' : '.'}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-200 font-medium text-sm truncate">{m.title}</p>
                                <p className="text-slate-500 text-xs">{m.progress}</p>
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
                    className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur"
                >
                    <h3 className="text-lg font-semibold text-white mb-6">Proof Artifacts</h3>
                    <div className="space-y-3">
                        {transcript.proofArtifacts.map((proof, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                <div className="flex-1">
                                    <p className="text-slate-200 font-medium">{proof.title}</p>
                                    <p className="text-slate-500 text-xs capitalize">{proof.type.replace('_', ' ')}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    {proof.capabilityLevel && (
                                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                            proof.capabilityLevel === 'Advanced' 
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : proof.capabilityLevel === 'Intermediate'
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-slate-700 text-slate-400'
                                        }`}>
                                            {proof.capabilityLevel}
                                        </span>
                                    )}
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
                className="text-center text-xs text-slate-500 pt-6 border-t border-slate-700/50"
            >
                <p>Generated by Twinstitute AI Engine — {new Date(transcript.generatedAt).toLocaleString()}</p>
                <p className="mt-1">This transcript is a verified, machine-generated record of your capability formation.</p>
            </motion.div>
            </div>
        </div>
    )
}
