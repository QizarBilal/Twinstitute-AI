'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StrategySignal {
    id: string
    signalType: string
    urgency: string
    title: string
    reasoning: string
    agentConsensus: Record<string, { vote: string; confidence: number }>
    actionItems: string[]
    generatedAt: string
}

interface DebateResult {
    sessionId: string
    debateLog: { agent: string; avatar: string; message: string; color: string; confidence: number }[]
    consensus: string
    actionableOutput: string
    avgConfidence: number
}

const urgencyColors: Record<string, string> = {
    critical: 'bg-red-500/15 border-red-500/30 text-red-400',
    high: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    medium: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    low: 'bg-green-500/15 border-green-500/30 text-green-400',
}

const signalTypeIcons: Record<string, string> = {
    deepen: '📚',
    publish_project: '📤',
    change_strategy: '⚡',
    attempt_interview: '🎯',
    switch_path: '🔄',
}

export default function StrategyPage() {
    const [signals, setSignals] = useState<StrategySignal[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [activeTab, setActiveTab] = useState<'signals' | 'debate'>('signals')
    const [debateQuery, setDebateQuery] = useState('')
    const [debating, setDebating] = useState(false)
    const [debateResult, setDebateResult] = useState<DebateResult | null>(null)

    useEffect(() => {
        fetch('/api/strategy', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setSignals(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const generateSignals = async () => {
        setGenerating(true)
        try {
            const res = await fetch('/api/strategy', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await res.json()
            if (Array.isArray(data)) {
                setSignals(prev => [...data, ...prev])
            }
        } catch (e) {
            console.error('Strategy error:', e)
        }
        setGenerating(false)
    }

    const runDebate = async () => {
        if (!debateQuery.trim()) return
        setDebating(true)
        setDebateResult(null)
        try {
            const res = await fetch('/api/agents/debate', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: debateQuery }),
            })
            const data = await res.json()
            setDebateResult(data)
        } catch (e) {
            console.error('Debate error:', e)
        }
        setDebating(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Strategy Intelligence Console</h1>
                    <p className="text-gray-400 text-sm mt-1">Multi-agent strategy signals and live debates powered by your capability data.</p>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button onClick={() => setActiveTab('signals')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'signals' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
                    🧭 Strategy Signals
                </button>
                <button onClick={() => setActiveTab('debate')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'debate' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}>
                    💬 Live Agent Debate
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'signals' && (
                    <motion.div key="signals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        {/* Generate Button */}
                        <button
                            onClick={generateSignals}
                            disabled={generating}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-purple-500/20"
                        >
                            {generating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Analyzing Your Data...
                                </span>
                            ) : '🧭 Generate Fresh Strategy Signals'}
                        </button>

                        {/* Signals List */}
                        {signals.length === 0 ? (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                                <div className="text-4xl mb-3">🧭</div>
                                <h3 className="text-lg font-bold text-white mb-2">No Strategy Signals Yet</h3>
                                <p className="text-gray-400 text-sm max-w-md mx-auto">Click the button above to generate your first strategy analysis based on your capability data.</p>
                            </div>
                        ) : (
                            signals.map((signal, idx) => (
                                <motion.div
                                    key={signal.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{signalTypeIcons[signal.signalType] || '📊'}</span>
                                            <h3 className="text-lg font-bold text-white">{signal.title}</h3>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${urgencyColors[signal.urgency] || urgencyColors.medium}`}>
                                            {signal.urgency.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">{signal.reasoning}</p>

                                    {/* Agent Consensus */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        {Object.entries(signal.agentConsensus).map(([agent, data]) => (
                                            <div key={agent} className="bg-gray-800/50 rounded-xl p-3">
                                                <div className="text-xs text-gray-500 mb-1">{agent}</div>
                                                <div className="text-sm font-semibold text-white">{data.vote}</div>
                                                <div className="text-[10px] text-gray-500 mt-1">Confidence: {data.confidence}%</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Items */}
                                    <div className="space-y-1.5">
                                        <div className="text-xs font-semibold text-gray-400">Action Items</div>
                                        {signal.actionItems.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-gray-300 p-2 bg-gray-800/30 rounded-lg">
                                                <span className="text-purple-400 text-xs">→</span>
                                                {item}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-[10px] text-gray-600 mt-3">
                                        Generated: {new Date(signal.generatedAt).toLocaleString()}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}

                {activeTab === 'debate' && (
                    <motion.div key="debate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        {/* Debate Input */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-gray-300 mb-3">Ask the Agent Council</h3>
                            <p className="text-xs text-gray-500 mb-4">Pose a strategic question. 4 specialized AI agents will debate and provide consensus.</p>
                            <textarea
                                value={debateQuery}
                                onChange={e => setDebateQuery(e.target.value)}
                                placeholder="e.g., Should I switch from backend to full stack? Is now the right time to start interviewing? Should I focus on system design or algorithms?"
                                className="w-full h-24 bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
                            />
                            <button
                                onClick={runDebate}
                                disabled={debating || !debateQuery.trim()}
                                className="mt-3 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-sm rounded-xl transition-all"
                            >
                                {debating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Agents debating...
                                    </span>
                                ) : '💬 Start Agent Debate'}
                            </button>
                        </div>

                        {/* Debate Result */}
                        {debateResult && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                {/* Agent Messages */}
                                {debateResult.debateLog.map((entry, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.15 }}
                                        className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: entry.color + '20', border: `1px solid ${entry.color}40` }}>
                                                {entry.avatar}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{entry.agent}</div>
                                                <div className="text-[10px] text-gray-500">Confidence: {Math.round(entry.confidence)}%</div>
                                            </div>
                                            <div className="ml-auto h-1.5 w-20 bg-gray-800 rounded-full">
                                                <div className="h-full rounded-full" style={{ width: `${entry.confidence}%`, backgroundColor: entry.color }} />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">{entry.message}</p>
                                    </motion.div>
                                ))}

                                {/* Consensus */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/20 rounded-2xl p-6"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-bold text-purple-300">📊 Consensus Report</h3>
                                        <span className="text-lg font-bold text-white">{debateResult.avgConfidence}% avg</span>
                                    </div>
                                    <p className="text-sm text-gray-300">{debateResult.consensus}</p>
                                    <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                                        <div className="text-xs text-gray-400 mb-1">Actionable Output</div>
                                        <p className="text-sm text-white">{debateResult.actionableOutput}</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
