'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Brain, Target, Zap } from 'lucide-react'

interface CapabilityStateCardsProps {
  score: number
  executionReliability: number
  learningSpeed: number
  problemSolving: number
  readiness: number
  stage: string
  loading: boolean
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 }
  })
}

export default function CapabilityStateCards({
  score,
  executionReliability,
  learningSpeed,
  problemSolving,
  readiness,
  loading
}: CapabilityStateCardsProps) {
  const cards = [
    {
      title: 'Capability Score',
      value: score,
      interpretation:
        score === 0 ? 'Not yet initialized' :
        score < 30 ? 'Foundation building' :
        score < 50 ? 'Steady progress' :
        score < 70 ? 'Strong progress' :
        score < 85 ? 'Expert level' :
        'Mastery',
      subtext:
        score === 0 ? 'Complete a lab task to start' :
        `You are ${score}% ready for your selected role`,
      icon: <Target size={18} />,
      color: 'from-blue-600/30 to-blue-700/20',
      accent: 'text-blue-400'
    },
    {
      title: 'Execution Reliability',
      value: executionReliability,
      interpretation:
        executionReliability === 0 ? 'No data yet' :
        executionReliability < 50 ? 'Building consistency' :
        executionReliability < 75 ? 'Good progress' :
        'Highly reliable',
      subtext:
        `You complete tasks ${executionReliability}% consistently with expected quality`,
      icon: <Zap size={18} />,
      color: 'from-purple-600/30 to-purple-700/20',
      accent: 'text-purple-400'
    },
    {
      title: 'Learning Speed',
      value: learningSpeed,
      interpretation:
        learningSpeed === 0 ? 'Baseline pending' :
        learningSpeed < 40 ? 'Building foundation' :
        learningSpeed < 60 ? `Faster than ${learningSpeed}% peers` :
        learningSpeed < 80 ? `Faster than ${learningSpeed}% peers` :
        `Exceptional learner`,
      subtext:
        learningSpeed === 0 
          ? 'Data will populate after first few labs'
          : `You learn ${learningSpeed < 50 ? 'steadily' : 'quickly'} compared to peers`,
      icon: <Brain size={18} />,
      color: 'from-emerald-600/30 to-emerald-700/20',
      accent: 'text-emerald-400'
    },
    {
      title: 'Problem Solving Depth',
      value: problemSolving,
      interpretation:
        problemSolving === 0 ? 'No assessment yet' :
        problemSolving < 40 ? 'Entry level problems' :
        problemSolving < 60 ? 'Can solve medium tasks' :
        problemSolving < 80 ? 'Handles complex scenarios' :
        'Solves expert problems',
      subtext:
        problemSolving === 0 
          ? 'Ability level determined by task submissions'
          : problemSolving < 40
          ? 'Focus on foundational problem types'
          : problemSolving < 60
          ? `Solve medium-level problems independently`
          : `Ready for advanced challenges`,
      icon: <TrendingUp size={18} />,
      color: 'from-amber-600/30 to-amber-700/20',
      accent: 'text-amber-400'
    },
  ]

  return (
    <div>
      <div className="mb-4">
        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Capability State</p>
        <h3 className="text-lg font-black text-white">Your Real Metrics</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${card.color} border border-gray-800/60 backdrop-blur-sm hover:border-gray-700/60 transition-colors`}
          >
            {/* Accent line */}
            <div className={`absolute top-0 left-0 h-1 w-12 ${card.accent.replace('text-', 'bg-')}`} />

            {/* Header with icon */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">{card.title}</p>
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-black ${card.accent} leading-none`}>
                    {loading ? '—' : card.value}
                  </span>
                  {!loading && card.value > 0 && (
                    <span className="text-gray-500 text-xs font-semibold mb-1">%</span>
                  )}
                </div>
              </div>
              <div className={`${card.accent} opacity-40`}>{card.icon}</div>
            </div>

            {/* Progress bar */}
            {!loading && card.value > 0 && (
              <div className="h-1.5 w-full bg-gray-900/40 rounded-full overflow-hidden mb-4">
                <motion.div
                  className={`h-full ${card.accent.replace('text-', 'bg-')} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${card.value}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              </div>
            )}

            {/* Interpretation */}
            <div className="mb-3">
              <p className={`text-[13px] font-bold ${card.accent}`}>
                {loading ? '...' : card.interpretation}
              </p>
            </div>

            {/* Subtext */}
            <p className="text-[12px] text-gray-500 leading-relaxed">
              {loading ? '...' : card.subtext}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
