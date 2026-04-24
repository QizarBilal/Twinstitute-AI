'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Module {
  id: string
  name: string
  phase: string
  totalTasks: number
  completedTasks: number
  status: 'not_started' | 'in_progress' | 'completed'
  progress: number
  startedAt: string | null
  completedAt: string | null
  timeSpent: number
}

interface PhaseData {
  count: number
  completed: number
  progress: number
}

interface MilestoneData {
  totalModules: number
  completedModules: number
  inProgressModules: number
  notStartedModules: number
  overallProgress: number
  modules: Module[]
  phases: Record<string, PhaseData>
}

export default function MilestonesPage() {
  const [data, setData] = useState<MilestoneData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  useEffect(() => {
    fetchMilestones()
  }, [])

  const fetchMilestones = async () => {
    try {
      const res = await fetch('/api/milestones/progress')
      const result = await res.json()
      setData(result.data)
    } catch (error) {
      console.error('Failed to fetch milestones:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading milestones...</span>
        </div>
      </div>
    )
  }

  const filteredModules = selectedPhase
    ? data.modules.filter(m => m.phase === selectedPhase)
    : data.modules

  const phases = Object.entries(data.phases)

  return (
    <div className="px-8 py-8 space-y-6 min-h-screen bg-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Your Milestones</h1>
        <p className="text-gray-400">Track your roadmap modules and learning progress</p>
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Total Modules</div>
          <div className="text-3xl font-bold text-slate-200">{data.totalModules}</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Completed</div>
          <div className="text-3xl font-bold text-emerald-400">{data.completedModules}</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">In Progress</div>
          <div className="text-3xl font-bold text-blue-400">{data.inProgressModules}</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Not Started</div>
          <div className="text-3xl font-bold text-slate-500">{data.notStartedModules}</div>
        </div>
      </motion.div>

      {/* Overall Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
          <span className="text-2xl font-bold text-cyan-400">{data.overallProgress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.overallProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
          />
        </div>
      </motion.div>

      {/* Phase Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-2"
      >
        <button
          onClick={() => setSelectedPhase(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedPhase === null
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900/50 border border-slate-700/50 text-slate-300 hover:border-slate-600'
          }`}
        >
          All Phases
        </button>
        {phases.map(([phase]) => (
          <button
            key={phase}
            onClick={() => setSelectedPhase(phase)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPhase === phase
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900/50 border border-slate-700/50 text-slate-300 hover:border-slate-600'
            }`}
          >
            {phase}
          </button>
        ))}
      </motion.div>

      {/* Milestones Timeline */}
      <div className="space-y-3">
        {filteredModules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-white font-semibold">{module.name}</h4>
                <p className="text-gray-500 text-sm">{module.phase}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  module.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  module.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-600/20 text-gray-400'
                }`}>
                  {module.status === 'not_started' ? 'Not Started' :
                   module.status === 'in_progress' ? 'In Progress' :
                   'Completed'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{module.completedTasks}/{module.totalTasks} tasks</span>
                <span className="text-xs text-cyan-400 font-semibold">{module.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${module.progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                />
              </div>
            </div>

            {/* Module Stats */}
            <div className="grid grid-cols-3 gap-3 text-xs text-gray-500">
              <div>
                <span className="text-gray-600">Started:</span>
                <p className="text-gray-400">
                  {module.startedAt ? new Date(module.startedAt).toLocaleDateString() : 'Not started'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Time Spent:</span>
                <p className="text-gray-400">
                  {module.timeSpent > 60 ? `${Math.round(module.timeSpent / 60)}h ${module.timeSpent % 60}m` : `${module.timeSpent}m`}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Completed:</span>
                <p className="text-gray-400">
                  {module.completedAt ? new Date(module.completedAt).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Phase Summary */}
      {phases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 backdrop-blur-sm"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Progress by Phase</h3>
          <div className="space-y-4">
            {phases.map(([phase, stats]) => (
              <div key={phase}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{phase}</span>
                  <span className="text-sm text-cyan-400">{stats.completed}/{stats.count} completed</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
