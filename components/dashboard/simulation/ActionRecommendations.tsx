'use client'

import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { SimulationResult } from '@/lib/ai/simulationEngine'

interface ActionRecommendationsProps {
    simulation: SimulationResult
    isLoading?: boolean
}

export default function ActionRecommendations({ simulation, isLoading }: ActionRecommendationsProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-800/50 rounded animate-pulse" />
                ))}
            </div>
        )
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return COLORS.accents.error
            case 'high':
                return COLORS.accents.warning
            case 'medium':
                return COLORS.accents.primary
            default:
                return COLORS.text.secondary
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'critical':
                return '🔴 CRITICAL'
            case 'high':
                return '🟡 HIGH'
            case 'medium':
                return '🟢 MEDIUM'
            default:
                return '⭕ LOW'
        }
    }

    const getEffortIcon = (effort: string) => {
        switch (effort) {
            case 'low':
                return '✓'
            case 'medium':
                return '◐'
            case 'high':
                return '●'
            default:
                return '?'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3"
        >
            <div>
                <h3 className="text-sm font-bold text-white mb-4">Top Actions to Improve Outcome</h3>
                <p className="text-xs text-gray-500">
                    Prioritized by impact and feasibility
                </p>
            </div>

            {simulation.recommendations.length === 0 ? (
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-500 text-sm">No recommendations at this time.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {simulation.recommendations.map((rec, idx) => {
                        const priorityColor = getPriorityColor(rec.priority)
                        const impactPercentage = rec.impact

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                className="border rounded-lg p-4 overflow-hidden"
                                style={{
                                    borderColor: priorityColor + '40',
                                    backgroundColor: priorityColor + '08',
                                }}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="text-xs font-bold mb-2" style={{ color: priorityColor }}>
                                            {getPriorityBadge(rec.priority)}
                                        </div>
                                        <h4 className="text-sm font-semibold text-white">{rec.action}</h4>
                                    </div>
                                    <div
                                        className="text-right px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ml-4"
                                        style={{
                                            backgroundColor: priorityColor + '20',
                                            color: priorityColor,
                                        }}
                                    >
                                        +{rec.impact}% Impact
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-gray-800/50">
                                    {/* Impact bar */}
                                    <div>
                                        <div className="text-[10px] text-gray-500 mb-1">Outcome Improvement</div>
                                        <div className="bg-gray-800/50 rounded h-1.5 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(impactPercentage, 100)}%` }}
                                                transition={{ duration: 0.8, delay: 0.5 + idx * 0.1 }}
                                                className="h-full"
                                                style={{ backgroundColor: priorityColor }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1 font-semibold">
                                            {rec.impact}% boost
                                        </div>
                                    </div>

                                    {/* Effort level */}
                                    <div>
                                        <div className="text-[10px] text-gray-500 mb-1">Effort Required</div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-sm" style={{ color: COLORS.text.secondary }}>
                                                {getEffortIcon(rec.effort)}
                                                {getEffortIcon(rec.effort)}
                                                {getEffortIcon(rec.effort)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1 capitalize font-semibold">
                                            {rec.effort} effort
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-2 rounded font-medium text-xs transition-all text-white"
                                    style={{
                                        backgroundColor: priorityColor + '25',
                                        borderColor: priorityColor + '50',
                                        border: `1px solid ${priorityColor}40`,
                                    }}
                                >
                                    Start This Action
                                </motion.button>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Action Summary */}
            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/10 border border-blue-600/30 rounded-lg p-4 mt-4">
                <div className="text-xs font-semibold text-blue-400 uppercase mb-2">Summary</div>
                <p className="text-sm text-gray-300">
                    Following these {simulation.recommendations.length} recommendations could improve your readiness by{' '}
                    <span className="font-bold" style={{ color: COLORS.accents.success }}>
                        {simulation.recommendations.reduce((sum, rec) => sum + rec.impact, 0)}%
                    </span>
                    {' '}and accelerate your job-ready timeline.
                </p>
            </div>
        </motion.div>
    )
}
