'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface ScenarioAdjustments {
  consistencyBoost: number
  skillFocusLevel: number
  weeklyHours: number
}

export default function SimulationPage() {
  const [adjustments, setAdjustments] = useState<ScenarioAdjustments>({
    consistencyBoost: 0,
    skillFocusLevel: 0,
    weeklyHours: 0,
  })
  const [activeTab, setActiveTab] = useState<'trajectory' | 'skills' | 'scenarios' | 'insights'>('trajectory')

  // Fetch required data
  const { data: twinData, loading: twinLoading } = useDataFetch('/api/user/twin')
  const { data: genomeData, loading: genomeLoading } = useDataFetch('/api/genome')
  const { data: performanceData, loading: perfLoading } = useDataFetch('/api/user/recent-performance')
  const { data: labsData, loading: labsLoading } = useDataFetch('/api/labs/progress')

    // Calculate simulation metrics
    const simulationData = useMemo(() => {
        if (!twinData || !genomeData || !performanceData || !labsData) {
            return null
        }

        const baseScore = twinData.overallScore || 65
        const consistency = performanceData.consistency || 72
        const avgScore = performanceData.averageScore || 68
        const velocity = twinData.formationVelocity || 2.4
        const completionRate = performanceData.completionRate || 0.65

        // Apply scenario adjustments
        const consistencyAdjusted = Math.min(100, consistency + adjustments.consistencyBoost)
        const velocityAdjusted = velocity + (adjustments.weeklyHours * 0.25)
        const skillBoost = adjustments.skillFocusLevel * 1.2

        // Calculate readiness projection
        const currentReadiness = (baseScore * 0.4) + (consistency * 0.3) + (completionRate * 100 * 0.3)
        const projectedReadiness = Math.min(100, currentReadiness + skillBoost + (adjustments.consistencyBoost * 0.6))
        
        // Calculate weeks to job-ready (75+ readiness)
        const readinessGap = Math.max(0, 75 - projectedReadiness)
        const improvementPerWeek = velocityAdjusted * 3
        const weeksToReady = readinessGap <= 0 ? 0 : Math.ceil(readinessGap / improvementPerWeek)

        // Calculate placement probability with realistic ranges
        const basePlacementProb = projectedReadiness > 80 ? 88 : projectedReadiness > 70 ? 72 : projectedReadiness > 60 ? 52 : 35
        const placementProbability = Math.min(96, basePlacementProb + (consistencyAdjusted > 75 ? 8 : 0))

        // Get skills from genome
        const skills = (genomeData.nodes || []).slice(0, 10).map((node: any) => ({
            name: node.label || node.name || 'Skill',
            proficiency: Math.min(100, Math.max(20, (node.proficiency || 45) + skillBoost)),
            category: node.category || 'Core',
            target: 85,
            trend: Math.random() > 0.4 ? 'up' : 'stable'
        }))

        // Risk assessment
        let riskFactors: string[] = []
        if (consistency < 60) riskFactors.push('Inconsistent engagement patterns')
        if (velocity < 1.5) riskFactors.push('Below-average learning velocity')
        if (projectedReadiness < 65) riskFactors.push('Readiness gap requires focus')

        const riskLevel = riskFactors.length >= 2 ? 'elevated' : 'normal'

        return {
          baseScore,
          consistency,
          avgScore,
          velocity: velocityAdjusted,
          completionRate: (completionRate * 100).toFixed(1),
          currentReadiness: Math.round(currentReadiness),
          projectedReadiness: Math.round(projectedReadiness),
          weeksToReady,
          placementProbability,
          skills,
          riskFactors,
          riskLevel,
          targetRole: twinData.targetRole || 'Full Stack Developer',
          tasksCompleted: labsData.completedCount || 12,
          industryReadiness: Math.min(100, Math.max(30, (twinData.industryReadiness || 58))),
          institutionFit: twinData.institutionFit || 88,
          tasksTotal: labsData.totalAttempts || 32,
        }
    }, [twinData, genomeData, performanceData, labsData, adjustments])

    // Loading state
    if (twinLoading || genomeLoading || perfLoading || !simulationData) {
        return (
            <div className="min-h-screen space-y-8">
                <div className="h-12 bg-slate-800/50 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-slate-800/50 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="h-96 bg-slate-800/50 rounded-2xl animate-pulse" />
            </div>
        )
    }

    const readinessColor = simulationData.projectedReadiness >= 80 ? 'text-emerald-400' : 
                          simulationData.projectedReadiness >= 70 ? 'text-blue-400' : 
                          'text-amber-400'

    const placementColor = simulationData.placementProbability >= 85 ? 'text-emerald-400' :
                          simulationData.placementProbability >= 70 ? 'text-blue-400' :
                          'text-amber-400'

    return (
        <div className="min-h-screen pb-16 space-y-8">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div>
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 mb-3">
                        Career Trajectory Simulator
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Visualize your professional growth path and discover how your learning decisions impact your job readiness and placement opportunities
                    </p>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Current Readiness */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="group bg-gradient-to-br from-slate-900/80 to-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur hover:border-cyan-500/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Readiness</span>
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                                <span className="text-cyan-400 text-sm">â†’</span>
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-cyan-400 mb-2">{simulationData.currentReadiness}%</div>
                        <div className="w-full bg-slate-900/70 rounded-full h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${simulationData.currentReadiness}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-3">Based on current performance</p>
                    </motion.div>

                    {/* Projected Readiness */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="group bg-gradient-to-br from-slate-900/80 to-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur hover:border-emerald-500/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projected Readiness</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                <span className="text-emerald-400 text-sm">â†‘</span>
                            </div>
                        </div>
                        <div className={`text-4xl font-bold mb-2 ${readinessColor}`}>{simulationData.projectedReadiness}%</div>
                        <div className="w-full bg-slate-900/70 rounded-full h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${simulationData.projectedReadiness}%` }}
                                transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-3">With scenario adjustments</p>
                    </motion.div>

                    {/* Placement Probability */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="group bg-gradient-to-br from-slate-900/80 to-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur hover:border-blue-500/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Placement Probability</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                                <span className="text-blue-400 text-sm">âœ“</span>
                            </div>
                        </div>
                        <div className={`text-4xl font-bold mb-2 ${placementColor}`}>{simulationData.placementProbability}%</div>
                        <div className="w-full bg-slate-900/70 rounded-full h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${simulationData.placementProbability}%` }}
                                transition={{ duration: 1.3, ease: 'easeOut', delay: 0.3 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-3">Success likelihood</p>
                    </motion.div>

                    {/* Timeline to Ready */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="group bg-gradient-to-br from-slate-900/80 to-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur hover:border-amber-500/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job-Ready Timeline</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                <span className="text-amber-400 text-sm">â±</span>
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-amber-400 mb-2">{simulationData.weeksToReady}</div>
                        <p className="text-xs text-slate-500 mb-2">weeks</p>
                        <p className="text-xs text-slate-600">Target: 75% readiness</p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex gap-1 bg-slate-900/30 border border-slate-700/30 rounded-xl p-1 backdrop-blur w-fit"
            >
                {(['trajectory', 'skills', 'scenarios', 'insights'] as const).map((tab, idx) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            activeTab === tab
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-black shadow-lg shadow-blue-500/25'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {/* Trajectory Tab */}
                {activeTab === 'trajectory' && (
                    <motion.div
                        key="trajectory"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Main Chart Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur">
                                <h3 className="text-2xl font-bold text-white mb-1">Growth Trajectory</h3>
                                <p className="text-slate-400 text-sm mb-8">Your predicted readiness evolution</p>
                                
                                <div className="space-y-8">
                                    {/* Week 0 - Current */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 text-right">
                                            <div className="text-sm text-slate-400">Now</div>
                                            <div className="text-2xl font-bold text-cyan-400">Week 0</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-700/50">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${simulationData.currentReadiness}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut' }}
                                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-300">{simulationData.currentReadiness}%</div>
                                    </div>

                                    {/* Mid Point */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 text-right">
                                            <div className="text-sm text-slate-400">Midpoint</div>
                                            <div className="text-2xl font-bold text-blue-400">Week {Math.floor(simulationData.weeksToReady / 2)}</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-700/50">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, simulationData.currentReadiness + ((simulationData.projectedReadiness - simulationData.currentReadiness) / 2))}%` }}
                                                    transition={{ duration: 1.1, ease: 'easeOut', delay: 0.3 }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-300">{Math.round(simulationData.currentReadiness + ((simulationData.projectedReadiness - simulationData.currentReadiness) / 2))}%</div>
                                    </div>

                                    {/* Target - Job Ready */}
                                    <div className="flex items-center gap-4 pb-4 border-b border-slate-700/50">
                                        <div className="w-24 text-right">
                                            <div className="text-sm text-slate-400">Job-Ready</div>
                                            <div className={`text-2xl font-bold ${readinessColor}`}>Week {simulationData.weeksToReady}</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-700/50">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, 75)}%` }}
                                                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-300">75%</div>
                                    </div>

                                    {/* Final Target */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 text-right">
                                            <div className="text-sm text-slate-400">Peak</div>
                                            <div className={`text-2xl font-bold ${readinessColor}`}>Week {Math.ceil(simulationData.weeksToReady * 1.3)}</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-700/50">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${simulationData.projectedReadiness}%` }}
                                                    transition={{ duration: 1.3, ease: 'easeOut', delay: 0.7 }}
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-300">{simulationData.projectedReadiness}%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar - Key Metrics */}
                            <div className="space-y-4">
                                {/* Learning Velocity */}
                                <div className="bg-gradient-to-br from-blue-900/20 to-slate-900/40 border border-blue-500/20 rounded-2xl p-6 backdrop-blur">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-slate-400 uppercase">Learning Velocity</span>
                                        <div className="text-blue-400 text-lg">â†—</div>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-400">{simulationData.velocity.toFixed(2)}</div>
                                    <p className="text-xs text-slate-500 mt-2">points per week</p>
                                </div>

                                {/* Consistency Score */}
                                <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900/40 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-slate-400 uppercase">Consistency</span>
                                        <div className="text-emerald-400 text-lg">âœ“</div>
                                    </div>
                                    <div className="text-3xl font-bold text-emerald-400">{simulationData.consistency}%</div>
                                    <p className="text-xs text-slate-500 mt-2">Performance stability</p>
                                </div>

                                {/* Average Score */}
                                <div className="bg-gradient-to-br from-amber-900/20 to-slate-900/40 border border-amber-500/20 rounded-2xl p-6 backdrop-blur">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-slate-400 uppercase">Avg Score</span>
                                        <div className="text-amber-400 text-lg">â­</div>
                                    </div>
                                    <div className="text-3xl font-bold text-amber-400">{simulationData.avgScore.toFixed(0)}</div>
                                    <p className="text-xs text-slate-500 mt-2">Typical submission</p>
                                </div>

                                {/* Target Role */}
                                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/50 rounded-2xl p-6 backdrop-blur">
                                    <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Target Role</div>
                                    <div className="text-lg font-bold text-slate-200">{simulationData.targetRole}</div>
                                    <div className="text-xs text-slate-500 mt-2">Industry demand: High</div>
                                </div>
                            </div>
                        </div>

                        {/* Adjustments Section */}
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur">
                            <h4 className="text-xl font-bold text-white mb-6">Scenario Adjustments</h4>
                            <p className="text-slate-400 text-sm mb-6">Fine-tune your learning plan to see impact on readiness</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Consistency Boost */}
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between">
                                        <span className="text-slate-300 font-medium">Consistency Boost</span>
                                        <span className="text-blue-400 font-bold">{adjustments.consistencyBoost}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={25}
                                        value={adjustments.consistencyBoost}
                                        onChange={(e) => setAdjustments({...adjustments, consistencyBoost: parseFloat(e.target.value)})}
                                        className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <p className="text-xs text-slate-500">Improve engagement consistency</p>
                                </div>

                                {/* Skill Focus */}
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between">
                                        <span className="text-slate-300 font-medium">Skill Focus Level</span>
                                        <span className="text-emerald-400 font-bold">{adjustments.skillFocusLevel}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={10}
                                        value={adjustments.skillFocusLevel}
                                        onChange={(e) => setAdjustments({...adjustments, skillFocusLevel: parseFloat(e.target.value)})}
                                        className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <p className="text-xs text-slate-500">Intensity of skill development</p>
                                </div>

                                {/* Weekly Hours */}
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between">
                                        <span className="text-slate-300 font-medium">Weekly Hours</span>
                                        <span className="text-amber-400 font-bold">{adjustments.weeklyHours}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={15}
                                        value={adjustments.weeklyHours}
                                        onChange={(e) => setAdjustments({...adjustments, weeklyHours: parseFloat(e.target.value)})}
                                        className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500"
                                    />
                                    <p className="text-xs text-slate-500">Dedicated learning time</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                    <motion.div
                        key="skills"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur"
                    >
                        <h3 className="text-2xl font-bold text-white mb-2">Skill Development Matrix</h3>
                        <p className="text-slate-400 text-sm mb-8">Your technical capabilities and growth trajectory</p>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {simulationData.skills.map((skill, idx) => (
                                <motion.div
                                    key={skill.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 hover:border-slate-600/50 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-slate-200 font-semibold">{skill.name}</span>
                                        <span className={`text-xs px-3 py-1 rounded-full ${skill.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                            {skill.trend === 'up' ? 'â†— Trending' : 'â†’ Stable'}
                                        </span>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Current</span>
                                            <span className={`font-semibold ${skill.proficiency >= 80 ? 'text-emerald-400' : skill.proficiency >= 60 ? 'text-blue-400' : 'text-amber-400'}`}>
                                                {skill.proficiency.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-900/70 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${skill.proficiency}%` }}
                                                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 + idx * 0.05 }}
                                                className={`h-full ${skill.proficiency >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : skill.proficiency >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Target: {skill.target}%</span>
                                        <span className="text-slate-500">{skill.category}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Scenarios Tab */}
                {activeTab === 'scenarios' && (
                    <motion.div
                        key="scenarios"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    name: 'Baseline',
                                    description: 'Continue current pace',
                                    readiness: simulationData.currentReadiness,
                                    weeks: simulationData.weeksToReady + 8,
                                    placement: Math.max(30, simulationData.placementProbability - 15),
                                    color: 'from-slate-500 to-slate-600'
                                },
                                {
                                    name: 'Focused Growth',
                                    description: 'Increase effort and consistency',
                                    readiness: simulationData.projectedReadiness,
                                    weeks: simulationData.weeksToReady,
                                    placement: simulationData.placementProbability,
                                    color: 'from-blue-500 to-cyan-500',
                                    recommended: true
                                },
                                {
                                    name: 'Acceleration',
                                    description: 'Intensive learning mode',
                                    readiness: Math.min(100, simulationData.projectedReadiness + 12),
                                    weeks: Math.max(2, simulationData.weeksToReady - 4),
                                    placement: Math.min(96, simulationData.placementProbability + 12),
                                    color: 'from-emerald-500 to-teal-500'
                                },
                            ].map((scenario, idx) => (
                                <motion.div
                                    key={scenario.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`relative bg-gradient-to-br from-slate-900/80 to-slate-800/40 border-2 rounded-2xl p-6 backdrop-blur transition-all cursor-pointer group hover:border-opacity-100 ${
                                        scenario.recommended ? 'border-blue-500/80 ring-2 ring-blue-500/20' : 'border-slate-700/50 hover:border-slate-600/80'
                                    }`}
                                >
                                    {scenario.recommended && (
                                        <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                                            RECOMMENDED
                                        </div>
                                    )}
                                    
                                    <h4 className="text-xl font-bold text-white mb-2">{scenario.name}</h4>
                                    <p className="text-slate-400 text-sm mb-6">{scenario.description}</p>
                                    
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-slate-400 text-sm">Projected Readiness</span>
                                                <span className="text-slate-200 font-bold">{scenario.readiness}%</span>
                                            </div>
                                            <div className="w-full bg-slate-900/70 rounded-full h-3 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${scenario.readiness}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + idx * 0.2 }}
                                                    className={`h-full bg-gradient-to-r ${scenario.color}`}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                                            <div>
                                                <div className="text-slate-500 text-xs mb-1">Timeline</div>
                                                <div className="text-2xl font-bold text-slate-200">{scenario.weeks}w</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 text-xs mb-1">Success Rate</div>
                                                <div className="text-2xl font-bold text-slate-200">{scenario.placement}%</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button className={`w-full py-3 rounded-lg font-semibold transition-all ${
                                        scenario.recommended
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-black hover:shadow-lg hover:shadow-blue-500/25'
                                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                                    }`}>
                                        {scenario.recommended ? 'Activate Plan' : 'Explore'}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Insights Tab */}
                {activeTab === 'insights' && (
                    <motion.div
                        key="insights"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Risk Assessment */}
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-2xl font-bold text-white">Risk Assessment</h4>
                                <div className={`text-sm font-bold px-4 py-2 rounded-lg ${
                                    simulationData.riskLevel === 'elevated' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                    {simulationData.riskLevel.toUpperCase()}
                                </div>
                            </div>

                            {simulationData.riskFactors.length > 0 ? (
                                <div className="space-y-3">
                                    {simulationData.riskFactors.map((factor, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-amber-500/20"
                                        >
                                            <div className="text-amber-400 text-lg mt-1">âš </div>
                                            <div>
                                                <p className="text-slate-200 font-medium">{factor}</p>
                                                <p className="text-slate-500 text-sm mt-1">Focus on this area to improve outcomes</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                                    <div className="text-emerald-400 text-lg">âœ“</div>
                                    <p className="text-emerald-300 font-medium">All metrics are within healthy ranges</p>
                                </div>
                            )}
                        </div>

                        {/* Key Recommendations */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[
                                {
                                    title: 'Boost Learning Velocity',
                                    description: 'Increase weekly study hours and focus depth',
                                    impact: '+8% readiness',
                                    icon: 'âš¡'
                                },
                                {
                                    title: 'Improve Consistency',
                                    description: 'Build regular submission habits and reduce gaps',
                                    impact: '+12% placement chance',
                                    icon: 'âœ“'
                                },
                                {
                                    title: 'Expand Skill Portfolio',
                                    description: 'Target 8-10 core skills for competitive advantage',
                                    impact: '+15% market value',
                                    icon: 'ðŸŽ¯'
                                },
                                {
                                    title: 'Practice Mock Interviews',
                                    description: 'Prepare for recruiter conversations early',
                                    impact: '+20% confidence',
                                    icon: 'ðŸ’¬'
                                },
                            ].map((rec, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <h5 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">{rec.title}</h5>
                                        <span className="text-2xl">{rec.icon}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4">{rec.description}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                        <span className="text-xs text-slate-500">Estimated Impact</span>
                                        <span className="text-sm font-bold text-blue-400">{rec.impact}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Progress Summary */}
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur">
                            <h4 className="text-2xl font-bold text-white mb-6">Progress Summary</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-400 mb-2">{simulationData.tasksCompleted}</div>
                                    <p className="text-slate-400">Tasks Completed</p>
                                    <p className="text-xs text-slate-600 mt-1">{simulationData.tasksTotal} total available</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-emerald-400 mb-2">{simulationData.institutionFit}%</div>
                                    <p className="text-slate-400">Institution Fit</p>
                                    <p className="text-xs text-slate-600 mt-1">Program compatibility</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-amber-400 mb-2">{simulationData.industryReadiness}%</div>
                                    <p className="text-slate-400">Industry Readiness</p>
                                    <p className="text-xs text-slate-600 mt-1">Market competitiveness</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
