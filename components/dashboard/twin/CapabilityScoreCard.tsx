'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface CapabilityScoreCardProps {
  loading?: boolean
}

export default function CapabilityScoreCard({ loading }: CapabilityScoreCardProps) {
  const { data: twin } = useDataFetch('/api/user/twin')

  const scoreData = useMemo(() => {
    if (!twin) return null

    const score = twin.overallScore || 0
    const prevScore = twin.previousSnapshot?.overallScore || score
    const trend = score > prevScore ? 'up' : score < prevScore ? 'down' : 'stable'
    const trendValue = Math.abs(score - prevScore)

    let level = 'Foundation'
    if (score >= 80) level = 'Advanced'
    else if (score >= 60) level = 'Intermediate'

    return {
      score: Math.round(score),
      level,
      trend,
      trendValue: trendValue.toFixed(1),
      improvementSlope: twin.improvementSlope || 0,
    }
  }, [twin])

  if (loading || !scoreData) {
    return (
      <div
        className="rounded-lg border p-8 h-full flex flex-col items-center justify-center"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.background.tertiary,
        }}
      >
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-gray-700 rounded w-1/2 mx-auto" />
          <div className="h-20 bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  const getTrendIcon = () => {
    if (scoreData.trend === 'up') return '📈'
    if (scoreData.trend === 'down') return '📉'
    return '➡️'
  }

  const getTrendColor = () => {
    if (scoreData.trend === 'up') return '#22C55E'
    if (scoreData.trend === 'down') return '#EF4444'
    return COLORS.accent.primary
  }

  const levelColor =
    scoreData.score >= 80
      ? '#10B981'
      : scoreData.score >= 60
        ? COLORS.accent.primary
        : '#F59E0B'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border p-8 h-full flex flex-col items-center justify-center"
      style={{
        backgroundColor: COLORS.background.secondary,
        borderColor: COLORS.background.tertiary,
      }}
    >
      {/* Title */}
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-6"
        style={{ color: COLORS.text.secondary }}
      >
        Your Capability
      </p>

      {/* Large Score Circle */}
      <motion.div
        className="relative w-40 h-40 mb-8"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* Background circle */}
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          style={{}}
        >
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={COLORS.background.tertiary}
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={COLORS.accent.primary}
            strokeWidth="8"
            strokeDasharray={`${4.398 * scoreData.score} ${439.8}`}
            strokeLinecap="round"
            initial={{ strokeDasharray: '0 439.8' }}
            animate={{ strokeDasharray: `${4.398 * scoreData.score} ${439.8}` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="text-5xl font-bold"
            style={{ color: COLORS.accent.primary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {scoreData.score}
          </motion.div>
          <p className="text-xs" style={{ color: COLORS.text.secondary }}>
            /100
          </p>
        </div>
      </motion.div>

      {/* Level Badge */}
      <motion.div
        className="px-4 py-2 rounded-full border mb-6"
        style={{
          backgroundColor: `${levelColor}20`,
          borderColor: levelColor,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p
          className="text-sm font-semibold"
          style={{ color: levelColor }}
        >
          {scoreData.level}
        </p>
      </motion.div>

      {/* Trend */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span className="text-xl">{getTrendIcon()}</span>
        <div>
          <p
            className="text-xs font-semibold"
            style={{ color: getTrendColor() }}
          >
            {scoreData.trend === 'up'
              ? 'Improving'
              : scoreData.trend === 'down'
                ? 'Declining'
                : 'Stable'}
          </p>
          <p
            className="text-xs"
            style={{ color: COLORS.text.secondary }}
          >
            {scoreData.trendValue} pts change
          </p>
        </div>
      </motion.div>

      {/* Improvement Rate */}
      {scoreData.improvementSlope !== 0 && (
        <motion.div
          className="mt-6 pt-6 border-t w-full text-center"
          style={{ borderColor: COLORS.background.tertiary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs" style={{ color: COLORS.text.secondary }}>
            Growth Rate
          </p>
          <p
            className="text-sm font-semibold mt-1"
            style={{ color: COLORS.accent.primary }}
          >
            {scoreData.improvementSlope.toFixed(2)} pts/week
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
