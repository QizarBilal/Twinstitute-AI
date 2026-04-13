'use client'

import { motion } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, Clock, Award, BookOpen } from 'lucide-react'

interface ProjectDetailsProps {
  task?: {
    id: string
    title: string
    description: string
    taskType: string
    difficulty: number
    domain: string
    skills: string[]
    timeEstimateMin: number
    instructions: string
    creditReward: number
  }
  onClose?: () => void
}

export function ProjectDetails({ task, onClose }: ProjectDetailsProps) {
  if (!task) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <BookOpen className="w-12 h-12 opacity-30 mr-4" />
        <p>Select a task to view details</p>
      </div>
    )
  }

  const taskTypeIcons: Record<string, string> = {
    coding: '💻',
    debugging: '🐛',
    system_design: '🏗️',
    integration: '🔗',
    optimization: '⚡',
    mini_project: '🎯',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full bg-gray-900/50 border border-gray-800 rounded-lg p-6 flex flex-col overflow-y-auto"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-800">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{taskTypeIcons[task.taskType] || '📝'}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{task.taskType}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{task.title}</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* META INFO */}
      <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-gray-800">
        <div className="bg-gray-800/30 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time Required</p>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">{task.timeEstimateMin} mins</span>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Credits</p>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">+{task.creditReward}</span>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-3 col-span-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Domain</p>
          <p className="font-semibold text-white">{task.domain}</p>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="mb-6 pb-6 border-b border-gray-800">
        <h3 className="text-sm font-bold text-white mb-3">Problem Statement</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{task.description}</p>
      </div>

      {/* INSTRUCTIONS */}
      <div className="mb-6 pb-6 border-b border-gray-800">
        <h3 className="text-sm font-bold text-white mb-3">Requirements</h3>
        <div className="space-y-2">
          {task.instructions.split('\n').filter(Boolean).map((line, i) => (
            <div key={i} className="flex gap-3 text-sm text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p>{line}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SKILLS */}
      <div className="mb-6 pb-6 border-b border-gray-800">
        <h3 className="text-sm font-bold text-white mb-3">Skills You'll Learn</h3>
        <div className="flex flex-wrap gap-2">
          {task.skills.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-600/20 text-blue-300 text-xs font-medium rounded-full border border-blue-600/30"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* TIPS */}
      <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300 mb-1">Pro Tips</p>
            <ul className="text-xs text-amber-200/80 space-y-1">
              <li>• Break the problem into smaller parts</li>
              <li>• Test your solution with edge cases</li>
              <li>• Write clean, readable code</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
