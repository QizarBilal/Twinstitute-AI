'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Target, TrendingUp, Zap } from 'lucide-react'

interface CapabilityData {
  capabilityScore: number
  capabilityLevel: string
  percentToNextLevel: number
  components: {
    skillProgress: number
    moduleCompletion: number
    taskCompletion: number
    consistency: number
  }
  skillsAnalysis: any
  moduleAnalysis: any
  taskAnalysis: any
  consistencyAnalysis: any
  strengthsWeaknesses: any
  growthMetrics: any
}

export default function TwinPage() {
    const [capabilityData, setCapabilityData] = useState<CapabilityData | null>(null)
    const [pageLoading, setPageLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'growth'>('overview')

    useEffect(() => {
        fetchCapabilityTwin()
    }, [])

    const fetchCapabilityTwin = async () => {
        try {
            const res = await fetch('/api/capability-twin/scoring')
            const data = await res.json()
            setCapabilityData(data?.data || null)
        } catch (error) {
            console.error('Error fetching capability twin:', error)
        } finally {
            setPageLoading(false)
        }
    }

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm">Loading your capability profile...</span>
                </div>
            </div>
        )
    }

    if (!capabilityData) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-gray-400">Unable to load capability data</p>
                </div>
            </div>
        )
    }

    const levelColors: Record<string, { bg: string; text: string; border: string }> = {
        foundation: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
        building: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
        advancing: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
        expert: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' }
    }

    const levelColor = levelColors[capabilityData.capabilityLevel] || levelColors.foundation

    return (
        <div className="px-8 py-8 space-y-6 min-h-screen bg-black">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl"
            >
                <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">🧬 Capability Twin</h1>
                    <p className="text-gray-400 text-sm mt-1">Your real-time capability profile & growth tracking</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'overview'
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('skills')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'skills'
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        Skills
                    </button>
                    <button
                        onClick={() => setActiveTab('growth')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'growth'
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        Growth
                    </button>
                </div>
                </div>
            </motion.div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Main Capability Score Card */}
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-800 rounded-2xl p-8"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-300 mb-2">Overall Capability Score</h2>
                                <p className="text-sm text-gray-500">Based on skills, modules, tasks, and consistency</p>
                            </div>
                            <div className={`px-4 py-2 rounded-full border ${levelColor.bg} ${levelColor.border}`}>
                                <span className={`text-sm font-bold ${levelColor.text} uppercase`}>
                                    {capabilityData.capabilityLevel}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            {/* Large Circular Score */}
                            <div className="relative w-48 h-48">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                                    {/* Background circle */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="90"
                                        fill="none"
                                        stroke="#374151"
                                        strokeWidth="8"
                                    />
                                    {/* Progress circle */}
                                    <motion.circle
                                        initial={{ strokeDashoffset: 565 }}
                                        animate={{ strokeDashoffset: 565 - (565 * capabilityData.capabilityScore / 100) }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                        cx="100"
                                        cy="100"
                                        r="90"
                                        fill="none"
                                        stroke={
                                            capabilityData.capabilityScore >= 80
                                                ? '#10b981'
                                                : capabilityData.capabilityScore >= 60
                                                ? '#a855f7'
                                                : capabilityData.capabilityScore >= 40
                                                ? '#06b6d4'
                                                : '#3b82f6'
                                        }
                                        strokeWidth="8"
                                        strokeDasharray="565"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-5xl font-bold text-white">{capabilityData.capabilityScore}</div>
                                    <div className="text-gray-400 text-xs mt-1">/100</div>
                                </div>
                            </div>

                            {/* Component Breakdown */}
                            <div className="space-y-4 flex-1 ml-12">
                                {[
                                    { label: 'Skill Progress', value: capabilityData.components.skillProgress, color: 'from-blue-500 to-cyan-500' },
                                    { label: 'Module Completion', value: capabilityData.components.moduleCompletion, color: 'from-purple-500 to-pink-500' },
                                    { label: 'Task Completion', value: capabilityData.components.taskCompletion, color: 'from-orange-500 to-red-500' },
                                    { label: 'Consistency', value: capabilityData.components.consistency, color: 'from-green-500 to-emerald-500' }
                                ].map((component) => (
                                    <div key={component.label} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-300">{component.label}</span>
                                            <span className="text-sm font-bold text-white">{component.value}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${component.value}%` }}
                                                transition={{ duration: 1, delay: 0.3 }}
                                                className={`h-full bg-gradient-to-r ${component.color}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Top Strengths */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                        >
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="text-emerald-400" size={20} />
                                Top Strengths
                            </h3>
                            <div className="space-y-3">
                                {capabilityData.strengthsWeaknesses.topStrengths.slice(0, 3).map((strength: any, idx: number) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                        className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-white">{strength.name}</p>
                                            <p className="text-xs text-gray-400">{strength.area}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ArrowUp size={16} className="text-emerald-400" />
                                            <span className="text-sm font-bold text-emerald-400">{strength.score}%</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Areas to Improve */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                        >
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Target className="text-orange-400" size={20} />
                                Areas to Improve
                            </h3>
                            <div className="space-y-3">
                                {capabilityData.strengthsWeaknesses.topWeaknesses.slice(0, 3).map((weakness: any, idx: number) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + idx * 0.1 }}
                                        className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-white">{weakness.name}</p>
                                            <p className="text-xs text-gray-400">{weakness.area}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ArrowDown size={16} className="text-orange-400" />
                                            <span className="text-sm font-bold text-orange-400">{weakness.score}%</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Recommendations */}
                    {capabilityData.strengthsWeaknesses.recommendedFocus.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6"
                        >
                            <h3 className="text-lg font-semibold text-cyan-400 mb-4">💡 Recommended Focus Areas</h3>
                            <div className="space-y-2">
                                {capabilityData.strengthsWeaknesses.recommendedFocus.map((rec: string, idx: number) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + idx * 0.05 }}
                                        className="flex items-start gap-3 text-sm text-cyan-200"
                                    >
                                        <span className="text-cyan-400 font-bold mt-0.5">→</span>
                                        <span>{rec}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* SKILLS TAB */}
            {activeTab === 'skills' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Core Skills */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-blue-400 mb-4">🎯 Core Skills ({capabilityData.skillsAnalysis.coreSkills.length})</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {capabilityData.skillsAnalysis.coreSkills.map((skill: any, idx: number) => (
                                <div key={idx} className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-medium text-sm">{skill.name}</span>
                                        <span className="text-blue-400 font-bold text-sm">{Math.round(skill.progress)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${skill.progress}%` }}
                                            transition={{ duration: 0.8 }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Support Skills */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-cyan-400 mb-4">🔧 Support Skills ({capabilityData.skillsAnalysis.supportSkills.length})</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {capabilityData.skillsAnalysis.supportSkills.map((skill: any, idx: number) => (
                                <div key={idx} className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-medium text-sm">{skill.name}</span>
                                        <span className="text-cyan-400 font-bold text-sm">{Math.round(skill.progress)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${skill.progress}%` }}
                                            transition={{ duration: 0.8 }}
                                            className="h-full bg-cyan-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Skills */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-purple-400 mb-4">⚡ Advanced Skills ({capabilityData.skillsAnalysis.advancedSkills.length})</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {capabilityData.skillsAnalysis.advancedSkills.map((skill: any, idx: number) => (
                                <div key={idx} className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-medium text-sm">{skill.name}</span>
                                        <span className="text-purple-400 font-bold text-sm">{Math.round(skill.progress)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${skill.progress}%` }}
                                            transition={{ duration: 0.8 }}
                                            className="h-full bg-purple-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skill Summary Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'Total Skills', value: capabilityData.skillsAnalysis.totalSkills, color: 'text-white' },
                            { label: 'Mastered', value: capabilityData.skillsAnalysis.masteredSkills, color: 'text-emerald-400' },
                            { label: 'Proficient', value: capabilityData.skillsAnalysis.proficientSkills, color: 'text-blue-400' },
                            { label: 'Developing', value: capabilityData.skillsAnalysis.developingSkills, color: 'text-orange-400' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                                <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                                <div className="text-xs text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* GROWTH TAB */}
            {activeTab === 'growth' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Growth Metrics Cards */}
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { label: 'Formation Velocity', value: capabilityData.growthMetrics.formationVelocity, unit: 'pts/week', color: 'from-emerald-500 to-green-500' },
                            { label: 'Readiness Score', value: capabilityData.growthMetrics.readinessScore, unit: '%', color: 'from-blue-500 to-cyan-500' },
                            { label: 'Improvement Slope', value: capabilityData.growthMetrics.improvementSlope, unit: 'pts/month', color: 'from-purple-500 to-pink-500' },
                            { label: 'Burnout Risk', value: Math.round(capabilityData.growthMetrics.burnoutRisk * 100) / 100, unit: '(lower=better)', color: 'from-orange-500 to-red-500' }
                        ].map((metric, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`bg-gradient-to-br ${metric.color}/10 border border-gray-800 rounded-xl p-6`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-300 text-sm font-medium">{metric.label}</span>
                                    <span className="text-xs text-gray-500">{metric.unit}</span>
                                </div>
                                <div className="text-3xl font-bold text-white">{metric.value}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Target & Current Status */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-sm font-semibold text-gray-300 mb-4">📍 Target Role</h3>
                            <p className="text-2xl font-bold text-cyan-400">{capabilityData.growthMetrics.targetRole}</p>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-sm font-semibold text-gray-300 mb-4">🎯 Target Domain</h3>
                            <p className="text-2xl font-bold text-purple-400">{capabilityData.growthMetrics.targetDomain}</p>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">📊 Recent Task Attempts</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {capabilityData.taskAnalysis.recentTasks.length > 0 ? (
                                capabilityData.taskAnalysis.recentTasks.map((task: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                        <div>
                                            <p className="text-sm text-white">{task.taskTitle}</p>
                                            <p className="text-xs text-gray-500">{new Date(task.submittedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs rounded font-medium ${
                                                task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-300'
                                            }`}>
                                                {task.status}
                                            </span>
                                            {task.score !== undefined && (
                                                <span className={`text-sm font-bold ${task.score >= 70 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                                    {Math.round(task.score)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm text-center py-4">No recent task attempts</p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
