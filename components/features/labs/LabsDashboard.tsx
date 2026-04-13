'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader, Play, BookOpen, CheckCircle2, Clock, Zap, Award } from 'lucide-react'

interface LabTask {
  id: string
  title: string
  description: string
  taskType: string
  difficulty: number
  domain: string
  skills: string[]
  timeEstimateMin: number
  creditReward: number
  userProgress?: {
    status: string
    score: number
    submittedAt: Date
  }
}

interface LabsDashboardProps {
  tasks?: LabTask[]
  loading?: boolean
  onSelectTask?: (taskId: string) => void
}

export function LabsDashboard({ tasks = [], loading = false, onSelectTask }: LabsDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed' | 'not-started'>('all')

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: BookOpen, color: 'text-blue-400' },
    { label: 'Completed', value: tasks.filter(t => t.userProgress?.status === 'passed').length, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'In Progress', value: tasks.filter(t => t.userProgress?.status === 'evaluated').length, icon: Clock, color: 'text-cyan-400' },
  ]

  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed') return t.userProgress?.status === 'passed'
    if (filter === 'in-progress') return t.userProgress?.status === 'evaluated'
    if (filter === 'not-started') return !t.userProgress
    return true
  })

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    if (difficulty <= 5) return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    return 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Beginner'
    if (difficulty <= 5) return 'Intermediate'
    return 'Advanced'
  }

  const getStatusBadge = (taskProgress: LabTask['userProgress']) => {
    if (!taskProgress) return { label: 'Start', color: 'bg-gray-600 hover:bg-gray-700', icon: Play }
    if (taskProgress.status === 'passed') return { label: 'Completed', color: 'bg-emerald-600/40', icon: CheckCircle2 }
    if (taskProgress.status === 'evaluated') return { label: 'In Progress', color: 'bg-cyan-600/40', icon: Clock }
    return { label: 'Pending', color: 'bg-gray-600/40', icon: Clock }
  }

  return (
    <div className="space-y-6">
      {/* STATS HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-blue-600/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-60`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'not-started', 'in-progress', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* TASKS GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400">No tasks found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTasks.map((task, i) => {
            const status = getStatusBadge(task.userProgress)
            const StatusIcon = status.icon

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelectTask?.(task.id)}
                className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 hover:border-blue-600/50 hover:bg-gray-900/70 transition-all cursor-pointer group"
              >
                {/* HEADER */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors flex-1">
                    {task.title}
                  </h3>
                  <div className={`px-2 py-1 rounded text-xs font-bold border ${getDifficultyColor(task.difficulty)}`}>
                    {getDifficultyLabel(task.difficulty)}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{task.description}</p>

                {/* SKILLS */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {task.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="text-xs bg-gray-800/50 text-gray-300 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {task.skills.length > 3 && (
                    <span className="text-xs text-gray-500">+{task.skills.length - 3}</span>
                  )}
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {task.timeEstimateMin}m
                  </div>

                  {task.userProgress?.score ? (
                    <div className="flex items-center gap-2">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span className="text-xs font-bold text-amber-400">{task.userProgress.score}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs font-bold text-yellow-400">+{task.creditReward}</span>
                    </div>
                  )}

                  <button
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                      status.color
                    } text-white`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
