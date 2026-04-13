'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { publishPortfolio, unpublishPortfolio } from '@/lib/api/portfolioClient'

interface ProofArtifact {
    id: string; title: string; type: string; description: string; skills: string[]
    capabilityLevel: string | null; isPublic: boolean; shareUrl: string | null
    recruiterSummary: string | null; createdAt: string
}

interface PortfolioData {
    profile: { name: string; title: string; stage: string; capabilityScore: number; readinessScore: number; totalCredits: number }
    proofArtifacts: ProofArtifact[]
    completedLabs: { title: string; type: string; domain: string; difficulty: number; score: number; creditsEarned: number }[]
    stats: { totalProofs: number; publicProofs: number; labsCompleted: number; avgLabScore: number }
}

interface PublishStatus {
    published: boolean
    publicUrl?: string
    token?: string
}

export default function PortfolioStudioPage() {
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
    const [publishStatus, setPublishStatus] = useState<PublishStatus>({ published: false })
    const [loading, setLoading] = useState(true)
    const [publishing, setPublishing] = useState(false)
    const [showPublishModal, setShowPublishModal] = useState(false)
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<'artifacts' | 'labs'>('artifacts')
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/portfolio')
                const data = await res.json()
                if (data.success) {
                    setPortfolio(data.data)
                    // Check if portfolio is published by checking session/user state
                    // For now, we'll fetch the status from user session
                }
            } catch (err) {
                console.error('Failed to load portfolio:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handlePublish = async () => {
        setPublishing(true)
        setError('')
        try {
            const result = await publishPortfolio()
            if (result.success) {
                setPublishStatus({
                    published: true,
                    publicUrl: result.data.publicUrl,
                    token: result.data.token,
                })
            } else {
                setError(result.error || 'Failed to publish portfolio')
            }
        } catch (err) {
            setError('An error occurred while publishing')
            console.error(err)
        } finally {
            setPublishing(false)
        }
    }

    const handleUnpublish = async () => {
        setPublishing(true)
        setError('')
        try {
            const result = await unpublishPortfolio()
            if (result.success) {
                setPublishStatus({ published: false })
                setShowPublishModal(false)
            } else {
                setError(result.error || 'Failed to unpublish portfolio')
            }
        } catch (err) {
            setError('An error occurred while unpublishing')
            console.error(err)
        } finally {
            setPublishing(false)
        }
    }

    const copyToClipboard = async () => {
        if (publishStatus.publicUrl) {
            try {
                await navigator.clipboard.writeText(publishStatus.publicUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                console.error('Failed to copy:', err)
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const p = portfolio

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Proof Portfolio Studio</h1>
                    <p className="text-gray-400 text-sm mt-1">Your public portfolio of capabilities, execution traces, and design logic.</p>
                </div>
                <button
                    onClick={() => {
                        if (publishStatus.published) {
                            setShowPublishModal(true)
                        } else {
                            handlePublish()
                        }
                    }}
                    disabled={publishing}
                    className={`px-4 py-2 text-white text-sm font-medium rounded-xl transition-all shadow-lg ${
                        publishStatus.published
                            ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {publishing ? (
                        <>
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {publishStatus.published ? 'Updating...' : 'Publishing...'}
                        </>
                    ) : publishStatus.published ? (
                        '✓ Published'
                    ) : (
                        'Publish Portfolio'
                    )}
                </button>
            </motion.div>

            {/* Publish Status Alert */}
            <AnimatePresence>
                {publishStatus.published && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start justify-between"
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">✅</span>
                            <div>
                                <h3 className="font-semibold text-emerald-400">Portfolio Published</h3>
                                <p className="text-sm text-gray-400 mt-1">Your portfolio is now public and shareable with recruiters.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPublishModal(true)}
                            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                        >
                            View Link
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Alert */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
                    >
                        <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Stats */}
            {p && (
                <div className="grid grid-cols-5 gap-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-white">{p.stats.totalProofs}</div>
                        <div className="text-xs text-gray-500">Total Proofs</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">{p.stats.publicProofs}</div>
                        <div className="text-xs text-gray-500">Public</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">{p.stats.labsCompleted}</div>
                        <div className="text-xs text-gray-500">Labs Done</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">{p.stats.avgLabScore}</div>
                        <div className="text-xs text-gray-500">Avg Score</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-amber-400">{p.profile.totalCredits}</div>
                        <div className="text-xs text-gray-500">Credits</div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-800 pb-4">
                {([
                    { id: 'artifacts', label: '📜 Execution Traces & Proofs' },
                    { id: 'labs', label: '🧪 Completed Lab Archive' },
                ] as const).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'artifacts' && (
                    <motion.div key="artifacts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {p && p.proofArtifacts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {p.proofArtifacts.map((artifact) => (
                                    <div key={artifact.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 group hover:border-purple-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${artifact.type === 'execution_trace' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                {artifact.type === 'execution_trace' ? '⚡' : '🏗️'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {artifact.isPublic && <span className="text-[10px] text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full uppercase font-semibold">Public</span>}
                                                {artifact.capabilityLevel && (
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${artifact.capabilityLevel === 'Advanced' ? 'text-green-400 border-green-500/30' : artifact.capabilityLevel === 'Intermediate' ? 'text-blue-400 border-blue-500/30' : 'text-gray-400 border-gray-600'} border`}>
                                                        {artifact.capabilityLevel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 cursor-pointer group-hover:text-purple-300 transition-colors">{artifact.title}</h3>
                                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{artifact.description}</p>
                                        {artifact.recruiterSummary && (
                                            <p className="text-xs text-gray-500 italic mb-3 line-clamp-2">{artifact.recruiterSummary}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            {artifact.skills.map((s: string) => (
                                                <span key={s} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">{s}</span>
                                            ))}
                                        </div>
                                        <div className="text-[10px] text-gray-600 mt-3">{new Date(artifact.createdAt).toLocaleDateString()}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-gray-800 border-2 border-gray-700 rounded-full flex items-center justify-center text-2xl mb-4">📜</div>
                                <h3 className="text-xl font-bold text-white mb-2">No Proof Artifacts Yet</h3>
                                <p className="text-gray-400 text-sm max-w-md mb-6">Complete lab tasks and generate proof artifacts to build your portfolio.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'labs' && (
                    <motion.div key="labs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {p && p.completedLabs.length > 0 ? (
                            <div className="space-y-3">
                                {p.completedLabs.map((lab, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
                                        <div>
                                            <div className="text-sm font-semibold text-white">{lab.title}</div>
                                            <div className="text-xs text-gray-500">{lab.domain} · {lab.type.replace('_', ' ')} · Difficulty {lab.difficulty}/10</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-blue-400">{lab.score}/100</div>
                                                <div className="text-[10px] text-gray-500">score</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-purple-400">+{lab.creditsEarned}</div>
                                                <div className="text-[10px] text-gray-500">credits</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-20">No completed labs to display.</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Publish Modal */}
            <AnimatePresence>
                {showPublishModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPublishModal(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black border border-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold text-white mb-2">
                                🌐 Your Portfolio is Live
                            </h2>
                            <p className="text-gray-400 mb-6">
                                Share this link with recruiters to showcase your verified capabilities and proofs.
                            </p>

                            {/* Share Link Section */}
                            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Public Portfolio Link</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-sm text-blue-400 break-all p-3 bg-gray-800/50 rounded-lg font-mono">
                                        {publishStatus.publicUrl}
                                    </code>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={copyToClipboard}
                                        className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium text-sm whitespace-nowrap"
                                    >
                                        {copied ? '✓' : '📋'} {copied ? 'Copied' : 'Copy'}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Share Methods */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    href={`https://twitter.com/intent/tweet?text=Check%20out%20my%20verified%20portfolio%20on%20Twinstitute%20AI&url=${encodeURIComponent(publishStatus.publicUrl || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium"
                                >
                                    𝕏 Share
                                </motion.a>
                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publishStatus.publicUrl || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium"
                                >
                                    💼 LinkedIn
                                </motion.a>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (publishStatus.publicUrl) {
                                            window.open(publishStatus.publicUrl, '_blank')
                                        }
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium"
                                >
                                    👁️ View
                                </motion.button>
                            </div>

                            {/* Features Highlight */}
                            <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 mb-6 space-y-2 text-sm">
                                <p className="flex items-center gap-2 text-blue-300">
                                    <span>✅</span> Recruiters can view your verified proofs
                                </p>
                                <p className="flex items-center gap-2 text-blue-300">
                                    <span>✅</span> Capability scores and metrics are displayed
                                </p>
                                <p className="flex items-center gap-2 text-blue-300">
                                    <span>✅</span> Read-only access (no editing)
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowPublishModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                                >
                                    Close
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleUnpublish}
                                    disabled={publishing}
                                    className="flex-1 px-4 py-3 bg-red-800/20 hover:bg-red-800/30 text-red-400 border border-red-500/30 rounded-lg transition-colors font-medium disabled:opacity-50"
                                >
                                    {publishing ? 'Unpublishing...' : 'Unpublish'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
