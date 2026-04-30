'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface ScenarioAdjustments {
  consistencyBoost: number
  skillFocusLevel: number
  weeklyHours: number
}

type SimulationTab = 'trajectory' | 'skills' | 'scenarios' | 'insights'

const tabLabels: Record<SimulationTab, string> = {
    trajectory: 'Trajectory',
    skills: 'Skills',
    scenarios: 'Scenarios',
    insights: 'Insights',
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.12 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

const panelClass = 'bg-gray-900/50 border border-gray-800 rounded-2xl backdrop-blur-sm'
const pillClass = 'inline-flex items-center rounded-full border border-gray-800 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400'

export default function SimulationPage() {
  const [adjustments, setAdjustments] = useState<ScenarioAdjustments>({
    consistencyBoost: 0,
    skillFocusLevel: 0,
    weeklyHours: 0,
  })
    const [activeTab, setActiveTab] = useState<SimulationTab>('trajectory')

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
            <div className="min-h-screen bg-black px-6 py-8 text-white">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="h-44 rounded-3xl border border-gray-800 bg-gray-950/70 animate-pulse" />
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-36 rounded-2xl border border-gray-800 bg-gray-950/70 animate-pulse" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="h-[540px] rounded-3xl border border-gray-800 bg-gray-950/70 animate-pulse lg:col-span-8" />
                        <div className="h-[540px] rounded-3xl border border-gray-800 bg-gray-950/70 animate-pulse lg:col-span-4" />
                    </div>
                </div>
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
        <motion.div
            className="min-h-screen bg-black px-6 py-8 text-white"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Hero Section */}
                <motion.section variants={itemVariants} className="relative overflow-hidden rounded-[2rem] border border-gray-800 bg-gray-950/80 p-8 shadow-2xl shadow-black/40">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_28%)]" />
                    <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                        <div className="space-y-5">
                            <span className={pillClass}>Simulation Labs</span>
                            <div className="space-y-3">
                                <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                                    Capability Simulation Labs
                                </h1>
                                <p className="max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
                                    Explore how your capability score, learning velocity, and weekly commitment shape your job readiness. This page turns your roadmap into an interactive lab for planning, tradeoffs, and outcome simulation.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <div className="rounded-full border border-gray-800 bg-black/40 px-4 py-2 text-xs text-gray-300">Role: {simulationData.targetRole}</div>
                                <div className="rounded-full border border-gray-800 bg-black/40 px-4 py-2 text-xs text-gray-300">Readiness: {simulationData.projectedReadiness}%</div>
                                <div className="rounded-full border border-gray-800 bg-black/40 px-4 py-2 text-xs text-gray-300">Weeks to ready: {simulationData.weeksToReady}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <motion.div variants={itemVariants} className={`${panelClass} p-5`}>
                                <div className="text-[11px] uppercase tracking-[0.22em] text-gray-500">Current Readiness</div>
                                <div className="mt-3 text-4xl font-bold text-blue-400">{simulationData.currentReadiness}%</div>
                                <div className="mt-4 h-2 rounded-full bg-black/60 overflow-hidden">
                                    <motion.div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400" initial={{ width: 0 }} animate={{ width: `${simulationData.currentReadiness}%` }} transition={{ duration: 1.1 }} />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className={`${panelClass} p-5`}>
                                <div className="text-[11px] uppercase tracking-[0.22em] text-gray-500">Projected Readiness</div>
                                <div className="mt-3 text-4xl font-bold text-purple-400">{simulationData.projectedReadiness}%</div>
                                <div className="mt-4 h-2 rounded-full bg-black/60 overflow-hidden">
                                    <motion.div className="h-full bg-gradient-to-r from-purple-600 to-blue-500" initial={{ width: 0 }} animate={{ width: `${simulationData.projectedReadiness}%` }} transition={{ duration: 1.1 }} />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className={`${panelClass} p-5`}>
                                <div className="text-[11px] uppercase tracking-[0.22em] text-gray-500">Placement Probability</div>
                                <div className="mt-3 text-4xl font-bold text-cyan-400">{simulationData.placementProbability}%</div>
                                <div className="mt-4 h-2 rounded-full bg-black/60 overflow-hidden">
                                    <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" initial={{ width: 0 }} animate={{ width: `${simulationData.placementProbability}%` }} transition={{ duration: 1.1 }} />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className={`${panelClass} p-5`}>
                                <div className="text-[11px] uppercase tracking-[0.22em] text-gray-500">Weeks to Ready</div>
                                <div className="mt-3 text-4xl font-bold text-amber-400">{simulationData.weeksToReady}</div>
                                <p className="mt-4 text-xs text-gray-500">Targeting 75% readiness</p>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* Tab Navigation */}
                <motion.div variants={itemVariants} className="inline-flex rounded-full border border-gray-800 bg-gray-950/70 p-1">
                    {(Object.keys(tabLabels) as SimulationTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                activeTab === tab
                                    ? 'bg-white text-black shadow-lg'
                                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                            }`}
                        >
                            {tabLabels[tab]}
                        </button>
                    ))}
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'trajectory' && (
                        <motion.div
                            key="trajectory"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 gap-6 lg:grid-cols-12"
                        >
                            <div className={`${panelClass} p-6 lg:col-span-8`}>
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Trajectory Overview</h2>
                                        <p className="mt-1 text-sm text-gray-500">How your capability signals combine into placement readiness</p>
                                    </div>
                                    <span className={pillClass}>Live simulation</span>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    {[
                                        { label: 'Base Score', value: simulationData.baseScore, tone: 'text-blue-400' },
                                        { label: 'Avg Score', value: simulationData.avgScore, tone: 'text-cyan-400' },
                                        { label: 'Learning Velocity', value: simulationData.velocity.toFixed(1), tone: 'text-purple-400' },
                                        { label: 'Completion Rate', value: `${simulationData.completionRate}%`, tone: 'text-emerald-400' },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-2xl border border-gray-800 bg-black/30 p-4">
                                            <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">{item.label}</div>
                                            <div className={`mt-3 text-3xl font-bold ${item.tone}`}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 rounded-2xl border border-gray-800 bg-black/30 p-5">
                                    <div className="mb-4 text-sm font-semibold text-gray-300">Journey to readiness</div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {[
                                            { title: 'Current', value: simulationData.currentReadiness, tone: 'from-blue-600 to-cyan-400' },
                                            { title: 'Projected', value: simulationData.projectedReadiness, tone: 'from-purple-600 to-blue-500' },
                                            { title: 'Placement', value: simulationData.placementProbability, tone: 'from-cyan-500 to-emerald-400' },
                                        ].map((stage) => (
                                            <div key={stage.title} className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
                                                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-gray-500">
                                                    <span>{stage.title}</span>
                                                    <span>{stage.value}%</span>
                                                </div>
                                                <div className="mt-3 h-2 rounded-full bg-black/60 overflow-hidden">
                                                    <div className={`h-full bg-gradient-to-r ${stage.tone}`} style={{ width: `${stage.value}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={`${panelClass} p-6 lg:col-span-4`}>
                                <h2 className="text-xl font-bold text-white">Risk Signals</h2>
                                <p className="mt-1 text-sm text-gray-500">Potential blockers to readiness</p>

                                <div className="mt-6 space-y-3">
                                    {simulationData.riskFactors.length > 0 ? simulationData.riskFactors.map((risk) => (
                                        <div key={risk} className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-200">
                                            {risk}
                                        </div>
                                    )) : (
                                        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
                                            No major risk factors detected.
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 rounded-2xl border border-gray-800 bg-black/30 p-5">
                                    <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Institution Fit</div>
                                    <div className="mt-3 text-4xl font-bold text-white">{simulationData.institutionFit}%</div>
                                    <p className="mt-2 text-xs text-gray-500">Alignment with your current institution profile</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'skills' && (
                        <motion.div
                            key="skills"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-[2rem] border border-gray-800 bg-gray-950/80 p-6"
                        >
                            <div className="mb-6 flex items-end justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Skill Development Matrix</h3>
                                    <p className="mt-1 text-sm text-gray-500">Your current strengths and the gap to target performance</p>
                                </div>
                                <span className={pillClass}>10 focus skills</span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {simulationData.skills.map((skill, idx) => (
                                    <motion.div
                                        key={skill.name}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="rounded-2xl border border-gray-800 bg-black/35 p-5"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-lg font-semibold text-white">{skill.name}</div>
                                                <div className="text-xs text-gray-500">Target {skill.target}% · {skill.category}</div>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${skill.trend === 'up' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                                                {skill.trend === 'up' ? 'Trending up' : 'Stable'}
                                            </span>
                                        </div>
                                        <div className="mt-4 h-2 rounded-full bg-black/60 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${skill.proficiency}%` }}
                                                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 + idx * 0.04 }}
                                                className={`h-full ${skill.proficiency >= 80 ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : skill.proficiency >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`}
                                            />
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Current</span>
                                            <span className={`font-bold ${skill.proficiency >= 80 ? 'text-emerald-400' : skill.proficiency >= 60 ? 'text-blue-400' : 'text-amber-400'}`}>
                                                {skill.proficiency.toFixed(0)}%
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'scenarios' && (
                        <motion.div
                            key="scenarios"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-[2rem] border border-gray-800 bg-gray-950/80 p-6"
                        >
                            <div className="mb-6 flex items-end justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Scenario Planning</h3>
                                    <p className="mt-1 text-sm text-gray-500">Compare learning intensity against placement outcomes</p>
                                </div>
                                <span className={pillClass}>3 plans</span>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {[
                                    { name: 'Baseline', description: 'Maintain current pace', readiness: simulationData.currentReadiness, weeks: simulationData.weeksToReady + 8, placement: Math.max(30, simulationData.placementProbability - 15), accent: 'from-gray-500 to-gray-600' },
                                    { name: 'Focused Growth', description: 'Structured improvement with consistency', readiness: simulationData.projectedReadiness, weeks: simulationData.weeksToReady, placement: simulationData.placementProbability, accent: 'from-blue-500 to-cyan-400', featured: true },
                                    { name: 'Acceleration', description: 'High-intensity learning mode', readiness: Math.min(100, simulationData.projectedReadiness + 12), weeks: Math.max(2, simulationData.weeksToReady - 4), placement: Math.min(96, simulationData.placementProbability + 12), accent: 'from-emerald-500 to-teal-400' },
                                ].map((scenario, idx) => (
                                    <motion.div
                                        key={scenario.name}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className={`relative rounded-2xl border p-6 ${scenario.featured ? 'border-blue-500/40 bg-blue-500/5' : 'border-gray-800 bg-black/35'}`}
                                    >
                                        {scenario.featured && <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase text-black">Recommended</span>}
                                        <h4 className="text-xl font-bold text-white">{scenario.name}</h4>
                                        <p className="mt-1 text-sm text-gray-500">{scenario.description}</p>
                                        <div className="mt-6 space-y-4">
                                            <div>
                                                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-500">
                                                    <span>Projected readiness</span>
                                                    <span>{scenario.readiness}%</span>
                                                </div>
                                                <div className="mt-3 h-2 rounded-full bg-black/60 overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${scenario.readiness}%` }} transition={{ duration: 0.9, delay: 0.2 + idx * 0.08 }} className={`h-full bg-gradient-to-r ${scenario.accent}`} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="rounded-xl border border-gray-800 bg-black/30 p-3">
                                                    <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Timeline</div>
                                                    <div className="mt-2 text-2xl font-bold text-white">{scenario.weeks}w</div>
                                                </div>
                                                <div className="rounded-xl border border-gray-800 bg-black/30 p-3">
                                                    <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Success</div>
                                                    <div className="mt-2 text-2xl font-bold text-white">{scenario.placement}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'insights' && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                                <div className="rounded-[2rem] border border-gray-800 bg-gray-950/80 p-6 lg:col-span-7">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">Risk Assessment</h3>
                                            <p className="mt-1 text-sm text-gray-500">Primary blockers that could slow placement readiness</p>
                                        </div>
                                        <div className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${simulationData.riskLevel === 'elevated' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                                            {simulationData.riskLevel}
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        {simulationData.riskFactors.length > 0 ? simulationData.riskFactors.map((factor) => (
                                            <div key={factor} className="rounded-xl border border-amber-900/40 bg-amber-950/15 px-4 py-3 text-sm text-amber-100">
                                                {factor}
                                            </div>
                                        )) : (
                                            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/15 px-4 py-3 text-sm text-emerald-100">
                                                All metrics are currently in a healthy range.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-[2rem] border border-gray-800 bg-gray-950/80 p-6 lg:col-span-5">
                                    <h3 className="text-2xl font-bold text-white">Progress Summary</h3>
                                    <p className="mt-1 text-sm text-gray-500">Snapshot of your simulation outcomes</p>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                                        {[
                                            { label: 'Tasks completed', value: simulationData.tasksCompleted, tone: 'text-blue-400' },
                                            { label: 'Institution fit', value: `${simulationData.institutionFit}%`, tone: 'text-emerald-400' },
                                            { label: 'Industry readiness', value: `${simulationData.industryReadiness}%`, tone: 'text-amber-400' },
                                        ].map((item) => (
                                            <div key={item.label} className="rounded-2xl border border-gray-800 bg-black/35 p-4 text-center sm:text-left">
                                                <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">{item.label}</div>
                                                <div className={`mt-2 text-3xl font-bold ${item.tone}`}>{item.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 rounded-2xl border border-gray-800 bg-black/35 p-5">
                                        <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Next best action</div>
                                        <div className="mt-2 text-lg font-semibold text-white">Increase weekly consistency by 10-15% and revisit the scenario simulator after your next lab cycle.</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
