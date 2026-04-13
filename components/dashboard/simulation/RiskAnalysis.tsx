'use client'

import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { SimulationResult } from '@/lib/ai/simulationEngine'

interface RiskAnalysisProps {
    simulation: SimulationResult
    isLoading?: boolean
}

export default function RiskAnalysis({ simulation, isLoading }: RiskAnalysisProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-800/50 rounded animate-pulse" />
                ))}
            </div>
        )
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'high':
                return COLORS.accents.error
            case 'medium':
                return COLORS.accents.warning
            case 'low':
                return COLORS.accents.success
            default:
                return COLORS.accents.primary
        }
    }

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'high':
                return '🔴'
            case 'medium':
                return '🟡'
            case 'low':
                return '🟢'
            default:
                return '⭕'
        }
    }

    const riskColor = getRiskColor(simulation.riskLevel)
    const riskIcon = getRiskIcon(simulation.riskLevel)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
        >
            {/* Risk Level Summary */}
            <div
                className="border rounded-lg p-4"
                style={{
                    backgroundColor: riskColor + '15',
                    borderColor: riskColor + '40',
                }}
            >
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase">Overall Risk</div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl">{riskIcon}</span>
                            <span
                                className="text-lg font-bold capitalize"
                                style={{ color: riskColor }}
                            >
                                {simulation.riskLevel}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div
                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                                backgroundColor: riskColor + '20',
                                color: riskColor,
                            }}
                        >
                            {simulation.riskLevel === 'high'
                                ? 'Immediate Action'
                                : simulation.riskLevel === 'medium'
                                  ? 'Monitor Closely'
                                  : 'On Track'}
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-400">
                    {simulation.riskLevel === 'high'
                        ? 'Multiple risk factors detected. Address critical issues to improve outcomes.'
                        : simulation.riskLevel === 'medium'
                          ? 'Some caution advised. Monitor these factors closely.'
                          : 'Good trajectory. Continue current pace.'}
                </p>
            </div>

            {/* Risk Factors */}
            {simulation.riskFactors.length > 0 && (
                <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase">Risk Factors</div>
                    {simulation.riskFactors.map((factor, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + idx * 0.1 }}
                            className="bg-gray-900/50 border border-red-600/20 rounded-lg p-3 flex gap-3 items-start"
                        >
                            <span className="text-red-400 font-bold mt-0.5">⚠</span>
                            <div className="flex-1">
                                <p className="text-sm text-gray-300">{factor}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Strength Areas */}
            {simulation.strengthAreas.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-800">
                    <div className="text-xs font-semibold text-gray-500 uppercase">Strength Areas</div>
                    {simulation.strengthAreas.map((strength, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 + idx * 0.1 }}
                            className="bg-gray-900/50 border border-emerald-600/20 rounded-lg p-3 flex gap-3 items-start"
                        >
                            <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                            <div className="flex-1">
                                <p className="text-sm text-gray-300">{strength}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Weak Areas */}
            {simulation.weakAreas.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-800">
                    <div className="text-xs font-semibold text-gray-500 uppercase">Areas to Improve</div>
                    {simulation.weakAreas.map((weakness, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + idx * 0.1 }}
                            className="bg-gray-900/50 border border-amber-600/20 rounded-lg p-3 flex gap-3 items-start"
                        >
                            <span className="text-amber-400 font-bold mt-0.5">↑</span>
                            <div className="flex-1">
                                <p className="text-sm text-gray-300">{weakness}</p>
                                <p className="text-xs text-gray-500 mt-1">Priority improvement area</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}
