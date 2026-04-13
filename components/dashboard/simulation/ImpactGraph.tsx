'use client'

import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { SimulationResult } from '@/lib/ai/simulationEngine'

interface ImpactGraphProps {
    baseSimulation: SimulationResult
    scenarioSimulation: SimulationResult
    isLoading?: boolean
}

export default function ImpactGraph({
    baseSimulation,
    scenarioSimulation,
    isLoading,
}: ImpactGraphProps) {
    if (isLoading) {
        return <div className="h-48 bg-gray-800/50 rounded animate-pulse" />
    }

    const metrics = [
        {
            name: 'Readiness',
            base: baseSimulation.readinessScore,
            scenario: scenarioSimulation.readinessScore,
            unit: '%',
            color: COLORS.accents.cyan,
            maxValue: 100,
        },
        {
            name: 'Placement',
            base: baseSimulation.placementProbability,
            scenario: scenarioSimulation.placementProbability,
            unit: '%',
            color: COLORS.accents.success,
            maxValue: 100,
        },
        {
            name: 'Timeline',
            base: baseSimulation.jobReadyWeeks,
            scenario: scenarioSimulation.jobReadyWeeks,
            unit: 'w',
            color: COLORS.accents.warning,
            maxValue: 52,
            invert: true, // For timeline, lower is better
        },
        {
            name: 'Confidence',
            base: baseSimulation.confidenceLevel,
            scenario: scenarioSimulation.confidenceLevel,
            unit: '%',
            color: COLORS.accents.primary,
            maxValue: 100,
        },
    ]

    const hasChanges = metrics.some((m) => m.base !== m.scenario)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-gray-900/60 border border-gray-800 rounded-lg p-6"
        >
            <h3 className="text-sm font-bold text-white mb-6">Impact Comparison</h3>

            {!hasChanges ? (
                <div className="flex items-center justify-center h-40 text-gray-500">
                    <p className="text-sm">Adjust scenarios above to see impact</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {metrics.map((metric, idx) => {
                        const delta = metric.scenario - metric.base
                        const percentage = (metric.scenario / metric.maxValue) * 100
                        const basePercentage = (metric.base / metric.maxValue) * 100

                        return (
                            <motion.div
                                key={metric.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + idx * 0.1 }}
                                className="space-y-2"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-400">{metric.name}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500">Scenario</div>
                                            <div
                                                className="font-bold text-sm"
                                                style={{ color: metric.color }}
                                            >
                                                {metric.scenario.toFixed(0)}
                                                <span className="text-xs">{metric.unit}</span>
                                            </div>
                                        </div>
                                        <div
                                            className="text-sm font-bold px-2 py-1 rounded"
                                            style={{
                                                backgroundColor:
                                                    delta > 0 && !metric.invert
                                                        ? COLORS.accents.success + '20'
                                                        : delta < 0 && !metric.invert
                                                          ? COLORS.accents.error + '20'
                                                          : delta > 0 && metric.invert
                                                            ? COLORS.accents.error + '20'
                                                            : delta < 0 && metric.invert
                                                              ? COLORS.accents.success + '20'
                                                              : 'transparent',
                                                color:
                                                    delta > 0 && !metric.invert
                                                        ? COLORS.accents.success
                                                        : delta < 0 && !metric.invert
                                                          ? COLORS.accents.error
                                                          : delta > 0 && metric.invert
                                                            ? COLORS.accents.error
                                                            : delta < 0 && metric.invert
                                                              ? COLORS.accents.success
                                                              : COLORS.text.secondary,
                                            }}
                                        >
                                            {delta > 0 && !metric.invert ? '↑' : delta < 0 ? '↓' : '→'}
                                            {Math.abs(delta).toFixed(1)}
                                        </div>
                                    </div>
                                </div>

                                {/* Bar chart comparison */}
                                <div className="space-y-1">
                                    {/* Base bar */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-600 w-8">Base</span>
                                        <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${basePercentage}%` }}
                                                transition={{ duration: 0.8, delay: 0.4 + idx * 0.1 }}
                                                className="h-full rounded-full"
                                                style={{
                                                    backgroundColor: metric.color + '40',
                                                }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-gray-600 w-10 text-right">
                                            {metric.base.toFixed(0)}{metric.unit}
                                        </span>
                                    </div>

                                    {/* Scenario bar */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-600 w-8">New</span>
                                        <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: 0.5 + idx * 0.1,
                                                }}
                                                className="h-full rounded-full"
                                                style={{
                                                    backgroundColor: metric.color,
                                                }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-gray-600 w-10 text-right">
                                            {metric.scenario.toFixed(0)}{metric.unit}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </motion.div>
    )
}
