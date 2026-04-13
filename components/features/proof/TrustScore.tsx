'use client'

import { motion } from 'framer-motion'

interface TrustScoreProps {
  score: number
  level: 'High' | 'Medium' | 'Low'
  details?: {
    difficultyScore: number
    consistencyScore: number
    qualityScore: number
  }
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
}

const getTrustConfig = (level: string) => {
  switch (level) {
    case 'High':
      return {
        icon: '🛡️',
        color: 'text-emerald-400',
        bgColor: 'from-emerald-600/20 to-emerald-600/5',
        borderColor: 'border-emerald-500/30',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      }
    case 'Medium':
      return {
        icon: '⚖️',
        color: 'text-blue-400',
        bgColor: 'from-blue-600/20 to-blue-600/5',
        borderColor: 'border-blue-500/30',
        badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      }
    case 'Low':
      return {
        icon: '⚠️',
        color: 'text-amber-400',
        bgColor: 'from-amber-600/20 to-amber-600/5',
        borderColor: 'border-amber-500/30',
        badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      }
    default:
      return {
        icon: '❓',
        color: 'text-gray-400',
        bgColor: 'from-gray-600/20 to-gray-600/5',
        borderColor: 'border-gray-500/30',
        badgeColor: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      }
  }
}

export default function TrustScore({
  score,
  level,
  details,
  size = 'md',
  showDetails = true,
}: TrustScoreProps) {
  const config = getTrustConfig(level)

  const sizeClasses = {
    sm: {
      scoreSize: 'text-2xl',
      textSize: 'text-sm',
      padding: 'p-3',
      iconSize: 'text-lg',
    },
    md: {
      scoreSize: 'text-3xl',
      textSize: 'text-base',
      padding: 'p-4',
      iconSize: 'text-2xl',
    },
    lg: {
      scoreSize: 'text-4xl',
      textSize: 'text-lg',
      padding: 'p-6',
      iconSize: 'text-3xl',
    },
  }[size]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${config.bgColor} border ${config.borderColor} rounded-lg ${sizeClasses.padding} overflow-hidden relative`}
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#00D9FF_1px,transparent_1px)] bg-[length:20px_20px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={`${sizeClasses.textSize} text-gray-400 uppercase tracking-wider font-medium mb-1`}>
              Trust Score
            </div>
            <div className="flex items-baseline gap-2">
              <div className={`${sizeClasses.scoreSize} font-bold ${config.color}`}>
                {Math.round(score)}
              </div>
              <div className={`${sizeClasses.textSize} ${config.color} opacity-75`}>
                / 100
              </div>
            </div>
          </div>
          <div className={`${sizeClasses.iconSize} ${config.color}`}>
            {config.icon}
          </div>
        </div>

        {/* Trust level badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-1 text-xs font-semibold border rounded-full ${config.badgeColor}`}>
            {level} Trust Level
          </span>
        </div>

        {/* Details breakdown */}
        {showDetails && details && (
          <div className="space-y-2 pt-4 border-t border-gray-700/30">
            <div className="space-y-2">
              {[
                { label: 'Difficulty Score', value: details.difficultyScore, max: 30 },
                { label: 'Consistency Score', value: details.consistencyScore, max: 25 },
                { label: 'Quality Score', value: details.qualityScore, max: 30 },
              ].map(({ label, value, max }) => (
                <div key={label} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-300 font-medium">
                      {Math.round(value)}/{max}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(value / max) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${config.bgColor.split(' ')[0]}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Interpretation */}
            <div className="pt-2 text-xs text-gray-400 italic">
              {score >= 70 && "✓ High confidence in proof authenticity and execution quality"}
              {score >= 40 && score < 70 && "⚖ Moderate confidence — some concerns about consistency or quality"}
              {score < 40 && "⚠ Low confidence — focus on increasing task difficulty and consistency"}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
