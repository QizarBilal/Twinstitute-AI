'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Clock, Zap, Target } from 'lucide-react'

interface NextActionCardProps {
  task: {
    title: string
    description: string
    reason: string
    timeRequired: number
    impact: {
      execution: number
      problemSolving: number
    }
  }
  targetRole: string
  targetDomain: string
  loading: boolean
}

export default function NextActionCard({ task, targetRole, loading }: NextActionCardProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl p-8 lg:p-10 bg-gradient-to-br from-blue-600/20 via-blue-600/5 to-purple-600/10 border border-blue-500/30 shadow-2xl shadow-blue-900/20"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full blur-3xl -z-10" />
      
      {/* Top label */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          className="w-2 h-2 bg-blue-400 rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[11px] text-blue-300 font-bold uppercase tracking-widest">
          Your Next Action
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
        {/* Left: Task Info */}
        <div className="lg:col-span-2">
          <motion.h2
            className="text-3xl lg:text-4xl font-black text-white leading-tight mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {loading ? 'Loading recommended task...' : task.title}
          </motion.h2>

          <motion.p
            className="text-[15px] text-gray-300 leading-relaxed mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {loading ? '...' : task.description}
          </motion.p>

          {/* Why */}
          <motion.div
            className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Target size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider mb-1">Why</p>
              <p className="text-[13px] text-gray-200 font-medium">
                {loading ? '...' : task.reason}
              </p>
            </div>
          </motion.div>

          {/* Impact metrics */}
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-[12px] text-gray-300">
                <span className="font-bold text-blue-300">+{loading ? '—' : task.impact.execution}</span> Execution
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <span className="text-[12px] text-gray-300">
                <span className="font-bold text-purple-300">+{loading ? '—' : task.impact.problemSolving}</span> Problem Solving
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right: Time + CTA */}
        <motion.div
          className="flex flex-col gap-5 lg:items-end"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Time Required */}
          <div className="flex flex-col items-start lg:items-end">
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-2">Time Required</p>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-amber-400" />
              <span className="text-xl font-black text-white">
                {loading ? '—' : task.timeRequired}
              </span>
              <span className="text-gray-500 text-sm font-semibold">min</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/dashboard/labs"
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/50 hover:shadow-blue-900/70 hover:-translate-y-0.5"
          >
            <Zap size={16} />
            START TASK
            <ArrowRight size={16} />
          </Link>

          {/* Confidence indicator */}
          <motion.div
            className="text-[11px] text-gray-500 font-semibold text-center"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Recommended for you
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom divider message */}
      <div className="pt-6 border-t border-blue-500/20 flex items-center justify-between">
        <p className="text-[12px] text-gray-500">
          This task is specifically selected to advance your <span className="text-blue-300 font-semibold">{targetRole || 'selected'}</span> role path.
        </p>
        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowRight size={16} className="text-blue-400" />
        </motion.div>
      </div>
    </motion.div>
  )
}
