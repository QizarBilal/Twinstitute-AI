'use client'

import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { SimulationResult } from '@/lib/ai/simulationEngine'

interface PredictionCardProps {
    simulation: SimulationResult
    isLoading?: boolean
}

export default function PredictionCard({ simulation, isLoading }: PredictionCardProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-6 bg-gray-800/50 rounded animate-pulse" />
                <div className="h-16 bg-gray-800/50 rounded animate-pulse" />
                <div className="h-12 bg-gray-800/50 rounded animate-pulse" />
            </div>
        )
    }

    // Color for readiness score
    const readinessColor =
        simulation.readinessScore >= 80
            ? COLORS.accents.success
            : simulation.readinessScore >= 60
              ? COLORS.accents.warning
              : COLORS.accents.error

    // Placement probability color
    const placementColor =
        simulation.placementProbability >= 70
            ? COLORS.accents.success
            : simulation.placementProbability >= 50
              ? COLORS.accents.warning
              : COLORS.accents.error

    // Days/Weeks format
    const timelineDisplay =
        simulation.jobReadyWeeks < 4
            ? `${simulation.jobReadyWeeks} weeks`
            : `${Math.ceil(simulation.jobReadyWeeks / 4.33)} months`

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Main Readiness Score */}
            <div className="relative">
                <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border border-gray-800 rounded-lg p-8">
                    <div className="flex items-center gap-8">
                        {/* Circular Progress */}
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <svg
                                className="w-full h-full transform -rotate-90"
                                viewBox="0 0 120 120"
                            >
                                {/* Background circle */}
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    fill="none"
                                    stroke="rgba(107, 114, 128, 0.2)"
                                    strokeWidth="8"
                                />
                                {/* Progress circle */}
                                <motion.circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    fill="none"
                                    stroke={readinessColor}
                                    strokeWidth="8"
                                    strokeDasharray={`${2 * Math.PI * 54}`}
                                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - simulation.readinessScore / 100)}`}
                                    initial={{ strokeDashoffset: `${2 * Math.PI * 54}` }}
                                    animate={{
                                        strokeDashoffset: `${2 * Math.PI * 54 * (1 - simulation.readinessScore / 100)}`,
                                    }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-4xl font-bold text-white">
                                    {simulation.readinessScore}
                                </div>
                                <div className="text-xs text-gray-400">/ 100</div>
                            </div>
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                    Job Readiness Score
                                </div>
                                <div
                                    className="text-sm font-semibold"
                                    style={{ color: readinessColor }}
                                >
                                    {simulation.readinessScore >= 80
                                        ? '✓ Ready for placement'
                                        : simulation.readinessScore >= 60
                                          ? '⏳ Getting close'
                                          : '📈 Keep improving'}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                    Time to Job-Ready
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {timelineDisplay}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Target date: {new Date(simulation.jobReadyDate).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two-column stats */}
            <div className="grid grid-cols-2 gap-4">
                {/* Placement Probability */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-900/60 border border-gray-800 rounded-lg p-4"
                >
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
                        Placement Probability
                    </div>
                    <div className="flex items-end gap-3">
                        <div
                            className="text-3xl font-bold"
                            style={{ color: placementColor }}
                        >
                            {simulation.placementProbability}%
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                            realistic chance
                        </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${simulation.placementProbability}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: placementColor }}
                        />
                    </div>
                </motion.div>

                {/* Confidence Level */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-900/60 border border-gray-800 rounded-lg p-4"
                >
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
                        Prediction Confidence
                    </div>
                    <div className="flex items-end gap-3">
                        <div className="text-3xl font-bold text-cyan-400">
                            {simulation.confidenceLevel}%
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                            {simulation.confidenceLevel >= 80
                                ? 'Very High'
                                : simulation.confidenceLevel >= 60
                                  ? 'High'
                                  : 'Moderate'}
                        </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${simulation.confidenceLevel}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-600"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/10 border border-blue-600/30 rounded-lg p-4 space-y-3">
                <div className="text-xs font-semibold text-blue-400 uppercase">Key Insights</div>
                <div className="space-y-2 text-sm text-gray-300">
                    {simulation.readinessScore >= 80 && (
                        <div className="flex gap-2">
                            <span>✓</span>
                            <span>You are approaching job-ready status. Focus on interview preparation.</span>
                        </div>
                    )}
                    {simulation.readinessScore < 80 && simulation.readinessScore >= 60 && (
                        <div className="flex gap-2">
                            <span>⏳</span>
                            <span>You're on track. Continue improving weaker skills to accelerate timeline.</span>
                        </div>
                    )}
                    {simulation.readinessScore < 60 && (
                        <div className="flex gap-2">
                            <span>📈</span>
                            <span>Focus on foundational skills and consistency to accelerate your growth.</span>
                        </div>
                    )}
                    {simulation.placementProbability < 50 && (
                        <div className="flex gap-2">
                            <span>⚠️</span>
                            <span>Placement probability is lower than ideal. Address risk factors below.</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
