'use client'

import { motion } from 'framer-motion'

interface CapabilityScoreProps {
  overallScore: number
  skillBreakdown: Record<
    string,
    {
      strength: number
      level: 'verified' | 'developing' | 'weak'
      proofCount: number
    }
  >
  summary?: {
    totalProofs: number
    totalSubmissions: number
    verifiedSkillsCount: number
    developingSkillsCount: number
    weakSkillsCount: number
  }
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'verified':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        bar: 'bg-emerald-500',
      }
    case 'developing':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        bar: 'bg-blue-500',
      }
    case 'weak':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        bar: 'bg-red-500',
      }
    default:
      return {
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
        bar: 'bg-gray-500',
      }
  }
}

export default function CapabilityScore({
  overallScore,
  skillBreakdown,
  summary,
}: CapabilityScoreProps) {
  const sortedSkills = Object.entries(skillBreakdown)
    .sort(([, a], [, b]) => b.strength - a.strength)
    .slice(0, 8)

  const scorePercentage = (overallScore / 100) * 100

  return (
    <div className="space-y-6">
      {/* Main score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-cyan-600/20 to-blue-600/10 border border-cyan-500/30 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-400 uppercase tracking-wider font-medium mb-2">
              Overall Capability Score
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-cyan-400">
                {Math.round(overallScore)}
              </div>
              <div className="text-lg text-gray-400">/100</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-2">
              {overallScore >= 80 ? '🚀' : overallScore >= 60 ? '⬆️' : '📈'}
            </div>
            <div className="text-xs text-gray-400">
              {overallScore >= 80 && 'Advanced'}
              {overallScore >= 60 && overallScore < 80 && 'Intermediate'}
              {overallScore < 60 && 'Foundation'}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
          />
        </div>
      </motion.div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-5 gap-3">
          {[
            {
              label: 'Total Proofs',
              value: summary.totalProofs,
              icon: '📜',
              color: 'from-blue-600/20',
            },
            {
              label: 'Verified',
              value: summary.verifiedSkillsCount,
              icon: '✅',
              color: 'from-emerald-600/20',
            },
            {
              label: 'Developing',
              value: summary.developingSkillsCount,
              icon: '⚠️',
              color: 'from-amber-600/20',
            },
            {
              label: 'Evaluations',
              value: summary.totalSubmissions,
              icon: '📊',
              color: 'from-purple-600/20',
            },
            {
              label: 'Weak Areas',
              value: summary.weakSkillsCount,
              icon: '🔴',
              color: 'from-red-600/20',
            },
          ].map(({ label, value, icon, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${color} border border-gray-700 rounded-lg p-3 text-center hover:border-gray-600 transition-colors`}
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Skill breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
            Skill Breakdown
          </h4>
          <span className="text-xs text-gray-500">
            Top {sortedSkills.length} skills
          </span>
        </div>

        <div className="space-y-2">
          {sortedSkills.map(([skillName, skillData]) => {
            const config = getLevelColor(skillData.level)
            return (
              <motion.div
                key={skillName}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${config.bg} border ${config.border} rounded-lg p-3`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{skillName}</div>
                    <div className="text-xs text-gray-500">
                      {skillData.proofCount} proof document{skillData.proofCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${config.text}`}>
                    {Math.round(skillData.strength * 100)}%
                  </div>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skillData.strength * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.05 }}
                    className={`h-full rounded-full ${config.bar}`}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
