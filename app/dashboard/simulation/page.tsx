'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'
import {
    simulateCareerOutcome,
    SimulationContext,
    SimulationResult,
    SkillProfile,
} from '@/lib/ai/simulationEngine'
import PredictionCard from '@/components/dashboard/simulation/PredictionCard'
import RiskAnalysis from '@/components/dashboard/simulation/RiskAnalysis'
import ScenarioSimulator from '@/components/dashboard/simulation/ScenarioSimulator'
import ImpactGraph from '@/components/dashboard/simulation/ImpactGraph'
import ActionRecommendations from '@/components/dashboard/simulation/ActionRecommendations'

export default function SimulationPage() {
    const [scenarioSimulation, setScenarioSimulation] = useState<SimulationResult | null>(null)

    // Fetch required data
    const { data: twinData, loading: twinLoading } = useDataFetch('/api/user/twin')
    const { data: genomeData, loading: genomeLoading } = useDataFetch('/api/genome')
    const { data: performanceData } = useDataFetch('/api/user/recent-performance')
    const { data: roadmapData } = useDataFetch('/api/roadmap')
    const { data: labsData } = useDataFetch('/api/labs/progress')

    // Build simulation context and generate base prediction
    const { baseSimulation, simulationContext } = useMemo(() => {
        if (!twinData || !genomeData || !performanceData) {
            return { baseSimulation: null, simulationContext: null }
        }

        // Build skill profiles from genome
        const skillProfiles: SkillProfile[] = (genomeData.nodes || []).map((node: any) => ({
            skillId: node.id,
            name: node.name || 'Skill',
            proficiency: node.proficiency || 50,
            targetProficiency: 80,
            category: node.category || 'General',
            importance: node.importance || 70,
            developmentRate: node.developmentRate || 1,
        }))

        const context: SimulationContext = {
            targetRole: twinData.targetRole || 'Full Stack Developer',
            currentScore: twinData.overallScore || 50,
            averageScore: performanceData.averageScore || 50,
            consistency: performanceData.consistency || 50,
            completionRate: performanceData.completionRate || 0.5,
            learningVelocity: twinData.formationVelocity || 1,
            roadmapProgress: performanceData.completionRate * 100,
            labsCompleted: labsData?.completedCount || 0,
            tasksCompleted: performanceData.tasksCompleted || 0,
            burnoutRisk: twinData.burnoutRisk || 30,
            skillProfiles,
        }

        const result = simulateCareerOutcome(context)

        return {
            baseSimulation: result,
            simulationContext: context,
        }
    }, [twinData, genomeData, performanceData, labsData])

    // Loading state
    if (twinLoading || genomeLoading || !baseSimulation || !simulationContext) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-800/50 rounded animate-pulse" />
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 h-96 bg-gray-800/50 rounded animate-pulse" />
                    <div className="h-96 bg-gray-800/50 rounded animate-pulse" />
                </div>
            </div>
        )
    }

    const displaySimulation = scenarioSimulation || baseSimulation

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h1 className="text-3xl font-bold text-white">Career Outcome Simulator</h1>
                <p className="text-gray-400">
                    Predict your job readiness and explore what-if scenarios based on your current trajectory
                </p>
            </motion.div>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                {/* Target Role */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Target Role</div>
                    <div className="text-lg font-bold text-white">{simulationContext.targetRole}</div>
                </div>

                {/* Current Score */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Current Score</div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-lg font-bold text-cyan-400">
                            {simulationContext.currentScore.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">/ 100</div>
                    </div>
                </div>

                {/* Learning Velocity */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Velocity</div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-lg font-bold text-green-400">
                            {simulationContext.learningVelocity.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">pts/week</div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Prediction + Risk */}
                <motion.div className="lg:col-span-1 space-y-6">
                    <PredictionCard
                        simulation={displaySimulation}
                        isLoading={!baseSimulation}
                    />
                    <RiskAnalysis
                        simulation={displaySimulation}
                        isLoading={!baseSimulation}
                    />
                </motion.div>

                {/* Middle Column: Scenario Simulator + Impact */}
                <motion.div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-6">
                        <ScenarioSimulator
                            baseContext={simulationContext}
                            baseSimulation={baseSimulation}
                            onScenarioChange={setScenarioSimulation}
                        />
                    </div>
                    <ImpactGraph
                        baseSimulation={baseSimulation}
                        scenarioSimulation={displaySimulation}
                        isLoading={!baseSimulation}
                    />
                </motion.div>

                {/* Right Column: Recommendations */}
                <motion.div className="lg:col-span-1">
                    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-6 sticky top-24">
                        <ActionRecommendations
                            simulation={displaySimulation}
                            isLoading={!baseSimulation}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Insights Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-lg p-6"
            >
                <h3 className="text-sm font-bold text-purple-300 mb-4">🔮 AI-Powered Insights</h3>
                <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex gap-3">
                        <span className="text-purple-300 font-bold">•</span>
                        <span>
                            Based on your current trajectory, you will reach job-ready status in{' '}
                            <span className="font-semibold text-white">
                                {baseSimulation.jobReadyWeeks} weeks
                            </span>
                            {' '}({baseSimulation.jobReadyDate})
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-purple-300 font-bold">•</span>
                        <span>
                            Your placement probability is{' '}
                            <span className="font-semibold text-white">
                                {baseSimulation.placementProbability}%
                            </span>
                            , indicating a{' '}
                            {baseSimulation.placementProbability >= 70
                                ? 'strong'
                                : baseSimulation.placementProbability >= 50
                                  ? 'moderate'
                                  : 'developing'}
                            {' '}competitive position
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-purple-300 font-bold">•</span>
                        <span>
                            Your biggest leverage point is improving{' '}
                            <span className="font-semibold text-white">
                                {simulationContext.skillProfiles.length > 0
                                    ? simulationContext.skillProfiles
                                        .sort((a, b) => a.proficiency - b.proficiency)
                                        .slice(0, 1)[0]?.name
                                    : 'your weaker skills'}
                            </span>
                            , which could accelerate your timeline by 4-6 weeks
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-purple-300 font-bold">•</span>
                        <span>
                            {baseSimulation.riskLevel === 'high'
                                ? 'Critical risk factors detected. Address these immediately to improve outcomes.'
                                : baseSimulation.riskLevel === 'medium'
                                  ? 'Monitor risk factors below. They could impact your timeline.'
                                  : 'Your trajectory is solid. Maintain consistency and continue focused learning.'}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="border-t border-gray-800 pt-6 text-xs text-gray-500 space-y-2"
            >
                <div>
                    <span className="font-semibold text-gray-400">How It Works:</span> This simulator uses your actual
                    performance data (skill proficiency, lab scores, consistency, learning velocity) to predict job
                    readiness and placement probability. Adjust the sliders to see how different actions impact your
                    outcome.
                </div>
                <div>
                    <span className="font-semibold text-gray-400">Confidence Level:</span> {baseSimulation.confidenceLevel}%
                    — Higher values mean more predictable outcomes based on consistent data.
                </div>
            </motion.div>
        </div>
    )
}
