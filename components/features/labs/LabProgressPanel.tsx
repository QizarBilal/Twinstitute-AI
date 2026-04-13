'use client'

import { motion } from 'framer-motion'
import { Clock, Award, TrendingUp, Zap, CheckCircle2 } from 'lucide-react'

interface LabProgressPanelProps {
  task?: {
    title: string
    timeEstimateMin: number
    creditReward: number
  }
  progress?: {
    timeSpent: number
    score: number
    status: 'idle' | 'in-progress' | 'completed'
    feedback?: string
  }
}

export function LabProgressPanel({ task, progress }: LabProgressPanelProps) {
  if (!task) {
    return (
      <div className="h-full bg-gray-900/50 border border-gray-800 rounded-lg p-6 flex items-center justify-center text-center">
        <p className="text-gray-500 text-sm">Select a task to track progress</p>
      </div>
    )
  }

  const timeRemaining = Math.max(task.timeEstimateMin - (progress?.timeSpent || 0), 0)
  const timePercentage = ((progress?.timeSpent || 0) / task.timeEstimateMin) * 100

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full bg-gray-900/50 border border-gray-800 rounded-lg p-6 flex flex-col space-y-6 overflow-y-auto"
    >
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Progress Tracker</h3>

        {/* TIME CARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-700/30 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">Time Spent</span>
            </div>
            <span className="text-xs text-cyan-400/60">
              {progress?.timeSpent || 0}m / {task.timeEstimateMin}m
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${timePercentage}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {timeRemaining > 0 ? `${timeRemaining}m remaining` : 'Time limit reached'}
          </p>
        </motion.div>

        {/* SCORE CARD */}
        {progress?.score !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold text-amber-300">Score</span>
              </div>
              <span className="text-xl font-bold text-amber-400">{progress.score}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.score}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            </div>
          </motion.div>
        )}

        {/* CREDITS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 border border-emerald-700/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">Credits Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-xl font-bold text-emerald-400">+{task.creditReward}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Complete the task to earn credits toward your capability score
          </p>
        </motion.div>
      </div>

      {/* STATUS */}
      <div className="pt-6 border-t border-gray-800">
        <h4 className="text-sm font-bold text-white mb-3">Status</h4>

        {progress?.status === 'completed' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-emerald-300">Task Completed</span>
            </div>
            {progress.feedback && (
              <p className="text-sm text-emerald-200/80 mt-2">{progress.feedback}</p>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm text-gray-400">In Progress</span>
            </div>
            <p className="text-xs text-gray-500">
              Submit your solution to see detailed feedback and score
            </p>
          </div>
        )}
      </div>

      {/* TIPS */}
      <div className="pt-6 border-t border-gray-800">
        <h4 className="text-sm font-bold text-white mb-3">Tips</h4>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs text-gray-400">
            <span className="text-blue-400 font-bold">→</span>
            <span>Break down the problem into smaller parts</span>
          </li>
          <li className="flex items-start gap-2 text-xs text-gray-400">
            <span className="text-blue-400 font-bold">→</span>
            <span>Test with edge cases and special inputs</span>
          </li>
          <li className="flex items-start gap-2 text-xs text-gray-400">
            <span className="text-blue-400 font-bold">→</span>
            <span>Write clean, readable code with comments</span>
          </li>
        </ul>
      </div>
    </motion.div>
  )
}
