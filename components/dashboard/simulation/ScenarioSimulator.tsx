'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { SimulationContext, simulateScenario, ScenarioModifier } from '@/lib/ai/simulationEngine'

interface ScenarioSimulatorProps {
    baseContext: SimulationContext
    baseSimulation: any // SimulationResult
    onScenarioChange?: (simulation: any) => void
}

export default function ScenarioSimulator({
    baseContext,
    baseSimulation,
    onScenarioChange,
}: ScenarioSimulatorProps) {
    const [skillImprovement, setSkillImprovement] = useState(0) // 0-20 points
    const [additionalTasks, setAdditionalTasks] = useState(0) // 0-50 additional tasks
    const [paceMultiplier, setPaceMultiplier] = useState(1) // 1-2x speed
    const [consistencyBoost, setConsistencyBoost] = useState(0) // 0-20 points

    // Calculate scenario based on current sliders
    const scenarioSimulation = useMemo(() => {
        const modifiers: ScenarioModifier[] = []

        if (skillImprovement > 0) {
            modifiers.push({
                type: 'skill_improvement',
                skillId: 'primary-skill',
                improvementPoints: skillImprovement,
            })
        }

        if (additionalTasks > 0) {
            modifiers.push({
                type: 'task_completion',
                additionalTasks: additionalTasks,
            })
        }

        if (paceMultiplier > 1) {
            modifiers.push({
                type: 'pace_increase',
                paaceMultiplier: paceMultiplier,
            })
        }

        if (consistencyBoost > 0) {
            modifiers.push({
                type: 'consistency_boost',
                consistencyBoost: consistencyBoost,
            })
        }

        if (modifiers.length === 0) {
            return baseSimulation
        }

        const result = simulateScenario(baseContext, modifiers)
        onScenarioChange?.(result)
        return result
    }, [skillImprovement, additionalTasks, paceMultiplier, consistencyBoost, baseContext, baseSimulation, onScenarioChange])

    // Calculate deltas
    const readinessDelta = scenarioSimulation.readinessScore - baseSimulation.readinessScore
    const timelineDelta = baseSimulation.jobReadyWeeks - scenarioSimulation.jobReadyWeeks
    const placementDelta =
        scenarioSimulation.placementProbability - baseSimulation.placementProbability

    const deltaColor = (delta: number) => {
        if (delta > 0) return COLORS.accents.success
        if (delta < 0) return COLORS.accents.error
        return COLORS.text.secondary
    }

    const deltaIcon = (delta: number) => {
        if (delta > 0) return '↑'
        if (delta < 0) return '↓'
        return '→'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-sm font-bold text-white mb-4">What-If Scenarios</h3>
                <p className="text-xs text-gray-500 mb-6">
                    Adjust the sliders below to simulate different outcomes
                </p>
            </div>

            {/* Skill Improvement Slider */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-400">
                        Improve Primary Skill by +{skillImprovement} points
                    </label>
                    <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                            backgroundColor: COLORS.accents.cyan + '20',
                            color: COLORS.accents.cyan,
                        }}
                    >
                        {skillImprovement === 0 ? 'Baseline' : `+${skillImprovement} impact`}
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="20"
                    value={skillImprovement}
                    onChange={(e) => setSkillImprovement(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600">
                    <span>No change</span>
                    <span>+20 points</span>
                </div>
            </div>

            {/* Additional Tasks Slider */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-400">
                        Complete +{additionalTasks} additional tasks
                    </label>
                    <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                            backgroundColor: COLORS.accents.cyan + '20',
                            color: COLORS.accents.cyan,
                        }}
                    >
                        {additionalTasks === 0 ? 'Baseline' : `+${additionalTasks} tasks`}
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={additionalTasks}
                    onChange={(e) => setAdditionalTasks(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600">
                    <span>Current pace</span>
                    <span>+50 tasks</span>
                </div>
            </div>

            {/* Learning Pace Multiplier */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-400">
                        Learning pace: {paceMultiplier.toFixed(1)}x
                    </label>
                    <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                            backgroundColor: COLORS.accents.cyan + '20',
                            color: COLORS.accents.cyan,
                        }}
                    >
                        {paceMultiplier === 1 ? 'Normal' : `${Math.round((paceMultiplier - 1) * 100)}% faster`}
                    </span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={paceMultiplier}
                    onChange={(e) => setPaceMultiplier(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600">
                    <span>Current pace</span>
                    <span>2x speed</span>
                </div>
            </div>

            {/* Consistency Boost */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-400">
                        Consistency bonus: +{consistencyBoost}%
                    </label>
                    <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                            backgroundColor: COLORS.accents.cyan + '20',
                            color: COLORS.accents.cyan,
                        }}
                    >
                        {consistencyBoost === 0 ? 'Current' : `+${consistencyBoost}% boost`}
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="20"
                    step="5"
                    value={consistencyBoost}
                    onChange={(e) => setConsistencyBoost(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600">
                    <span>Current level</span>
                    <span>+20% boost</span>
                </div>
            </div>

            {/* Impact Summary */}
            {(skillImprovement > 0 ||
                additionalTasks > 0 ||
                paceMultiplier > 1 ||
                consistencyBoost > 0) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-lg p-4 space-y-3"
                >
                    <div className="text-xs font-bold text-purple-300 uppercase">Predicted Impact</div>

                    <div className="grid grid-cols-3 gap-3">
                        {/* Readiness Impact */}
                        <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Readiness Score</div>
                            <div className="flex items-center justify-center gap-1">
                                <span
                                    style={{
                                        color: deltaColor(readinessDelta),
                                        fontWeight: 'bold',
                                    }}
                                    className="text-lg"
                                >
                                    {deltaIcon(readinessDelta)}
                                </span>
                                <span
                                    className="font-semibold"
                                    style={{ color: deltaColor(readinessDelta) }}
                                >
                                    {Math.abs(readinessDelta).toFixed(0)}
                                </span>
                            </div>
                        </div>

                        {/* Timeline Impact */}
                        <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Job Ready In</div>
                            <div className="flex items-center justify-center gap-1">
                                <span
                                    style={{
                                        color: deltaColor(timelineDelta),
                                        fontWeight: 'bold',
                                    }}
                                    className="text-lg"
                                >
                                    {deltaIcon(timelineDelta)}
                                </span>
                                <span
                                    className="font-semibold"
                                    style={{ color: deltaColor(timelineDelta) }}
                                >
                                    {Math.abs(timelineDelta).toFixed(0)}w
                                </span>
                            </div>
                        </div>

                        {/* Placement Impact */}
                        <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Placement %</div>
                            <div className="flex items-center justify-center gap-1">
                                <span
                                    style={{
                                        color: deltaColor(placementDelta),
                                        fontWeight: 'bold',
                                    }}
                                    className="text-lg"
                                >
                                    {deltaIcon(placementDelta)}
                                </span>
                                <span
                                    className="font-semibold"
                                    style={{ color: deltaColor(placementDelta) }}
                                >
                                    {Math.abs(placementDelta).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                        {readinessDelta > 0
                            ? 'This scenario would significantly improve your outcomes.'
                            : 'Continue with current strategy.'}
                    </p>
                </motion.div>
            )}

            {/* Reset Button */}
            {(skillImprovement > 0 ||
                additionalTasks > 0 ||
                paceMultiplier > 1 ||
                consistencyBoost > 0) && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        setSkillImprovement(0)
                        setAdditionalTasks(0)
                        setPaceMultiplier(1)
                        setConsistencyBoost(0)
                    }}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
                >
                    Reset to Baseline
                </motion.button>
            )}
        </motion.div>
    )
}
