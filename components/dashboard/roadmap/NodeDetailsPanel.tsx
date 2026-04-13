'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { RoadmapNode } from '@/lib/ai/roadmapAdapter'

interface NodeDetailsPanelProps {
    node: RoadmapNode | null
    onStartTask?: (nodeId: string) => void
    onViewRelated?: (nodeId: string) => void
}

export default function NodeDetailsPanel({
    node,
    onStartTask,
    onViewRelated,
}: NodeDetailsPanelProps) {
    const statusInfo = useMemo(() => {
        if (!node) return null

        const statusConfig = {
            completed: { icon: '✓', label: 'Completed', color: COLORS.accents.success },
            active: { icon: '●', label: 'In Progress', color: COLORS.accents.cyan },
            unlocked: { icon: '⭐', label: 'Ready to Start', color: COLORS.accents.primary },
            locked: { icon: '🔒', label: 'Locked', color: COLORS.text.tertiary },
        }

        return statusConfig[node.status]
    }, [node])

    const difficultyColor = useMemo(() => {
        if (!node) return COLORS.text.secondary
        switch (node.difficulty) {
            case 'foundation':
                return '#10B981'
            case 'intermediate':
                return '#F59E0B'
            case 'advanced':
                return '#EF4444'
            default:
                return COLORS.text.secondary
        }
    }, [node])

    if (!node) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center text-gray-500"
            >
                <div className="text-center">
                    <svg
                        className="w-12 h-12 mx-auto mb-3 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p>Select a node to view details</p>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 h-full overflow-y-auto"
        >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900/90 pb-4 -mx-4 px-4 pt-2">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">{node.title}</h2>
                        <div className="flex gap-2 flex-wrap">
                            {/* Status badge */}
                            <div
                                className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                                style={{ backgroundColor: statusInfo?.color + '20', color: statusInfo?.color }}
                            >
                                <span>{statusInfo?.icon}</span>
                                <span>{statusInfo?.label}</span>
                            </div>

                            {/* Difficulty badge */}
                            <div
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: difficultyColor + '20', color: difficultyColor }}
                            >
                                {node.difficulty.charAt(0).toUpperCase() + node.difficulty.slice(1)}
                            </div>

                            {/* Category badge */}
                            <div
                                className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-300"
                            >
                                {node.category}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">About This Node</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{node.description}</p>
            </div>

            {/* Why This Matters */}
            <div className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-600/20 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-blue-400 uppercase mb-2">💡 Why This Matters</h3>
                <p className="text-sm text-gray-300">{node.careerImpact}</p>
                <div className="mt-2 text-xs text-gray-400">
                    Role alignment: <span className="font-semibold text-cyan-400">{node.relevance}%</span>
                </div>
            </div>

            {/* Skills Covered */}
            {node.skills.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Skills Covered</h3>
                    <div className="space-y-2">
                        {node.skills.slice(0, 6).map((skill) => (
                            <div
                                key={skill}
                                className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/30 px-3 py-2 rounded-lg"
                            >
                                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                                {skill}
                            </div>
                        ))}
                        {node.skills.length > 6 && (
                            <div className="text-xs text-gray-500 px-3 py-2">
                                +{node.skills.length - 6} more skills
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Linked Tasks */}
            {node.linkedTasks.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                        📋 Linked Tasks ({node.linkedTasks.length})
                    </h3>
                    <div className="space-y-2">
                        {node.linkedTasks.slice(0, 3).map((taskId) => (
                            <div
                                key={taskId}
                                className="bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-xs text-gray-400"
                            >
                                {taskId}
                            </div>
                        ))}
                        {node.linkedTasks.length > 3 && (
                            <div className="text-xs text-gray-500 px-2">
                                +{node.linkedTasks.length - 3} more tasks
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Time Estimate */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        ⏱️ Estimated Time
                    </div>
                    <div className="text-lg font-bold text-white">
                        {node.estimatedHours}h
                    </div>
                </div>
            </div>

            {/* Prerequisites */}
            {node.prerequisites.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Prerequisites</h3>
                    <div className="space-y-1">
                        {node.prerequisites.map((prereqId) => (
                            <div key={prereqId} className="text-xs text-gray-400 flex items-center gap-2">
                                <span>→</span>
                                {prereqId}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Unlock Reason (if locked) */}
            {node.status === 'locked' && node.unlockReason && (
                <div className="bg-amber-600/20 border border-amber-600/50 rounded-lg p-3">
                    <h3 className="text-xs font-semibold text-amber-400 mb-1">🔒 Why This Is Locked</h3>
                    <p className="text-xs text-gray-300">{node.unlockReason}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 sticky bottom-0 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent pt-4 -mx-4 px-4 pb-4">
                {node.status !== 'completed' && node.status !== 'locked' && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onStartTask?.(node.id)}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all"
                    >
                        {node.status === 'active' ? '▶ Continue Node' : '▶ Start Node'}
                    </motion.button>
                )}

                {node.linkedTasks.length > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onViewRelated?.(node.id)}
                        className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-lg transition-colors"
                    >
                        📋 View Related Tasks
                    </motion.button>
                )}

                {node.status === 'locked' && (
                    <div className="py-3 bg-gray-800/50 text-gray-400 text-sm text-center rounded-lg">
                        Complete prerequisites to unlock
                    </div>
                )}

                {node.status === 'completed' && (
                    <div className="py-3 bg-green-600/20 text-green-400 text-sm text-center rounded-lg font-semibold">
                        ✓ Node Completed
                    </div>
                )}
            </div>
        </motion.div>
    )
}
