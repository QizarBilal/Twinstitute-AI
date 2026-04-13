'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface GrowthTimelineProps {
  loading?: boolean
}

export default function GrowthTimeline({ loading }: GrowthTimelineProps) {
  const { data: twin } = useDataFetch('/api/user/twin')

  const snapshots = useMemo(() => {
    if (!twin || !twin.capabilitySnapshots) return []

    // Get last 12 weeks of snapshots
    const allSnapshots = JSON.parse(twin.capabilitySnapshots || '[]')
    return allSnapshots.slice(-12)
  }, [twin])

  if (loading || snapshots.length === 0) {
    return (
      <div
        className="rounded-lg border p-6 h-full flex items-center justify-center"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.background.tertiary,
        }}
      >
        <div className="animate-pulse w-full space-y-2">
          <div className="h-32 bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  const maxScore = Math.max(...snapshots.map((s: any) => s.score || 0), 100)
  const minScore = Math.min(
    ...snapshots.map((s: any) => s.score || 0),
    0
  )
  const range = maxScore - minScore
  const chartHeight = 120
  const chartWidth = 300

  // Generate SVG path for area chart
  const points = snapshots.map((snapshot: any, i: number) => {
    const x = (i / (snapshots.length - 1 || 1)) * chartWidth
    const y =
      chartHeight -
      ((snapshot.score - minScore) / (range || 100)) * chartHeight
    return { x, y, score: snapshot.score }
  })

  const pathData = points.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath =
    pathData +
    ` L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`

  // Milestones
  const milestones = [
    { score: 25, emoji: '🌱', label: 'Foundation' },
    { score: 50, emoji: '🏗️', label: 'Building' },
    { score: 75, emoji: '🚀', label: 'Advancing' },
    { score: 90, emoji: '⭐', label: 'Expert' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border p-6 h-full flex flex-col"
      style={{
        backgroundColor: COLORS.background.secondary,
        borderColor: COLORS.background.tertiary,
      }}
    >
      {/* Title */}
      <div className="mb-4">
        <h3
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: COLORS.text.primary }}
        >
          📈 Growth Timeline
        </h3>
        <p className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
          Last 12 weeks of capability progression
        </p>
      </div>

      {/* Chart Area */}
      <div className="flex-1 flex flex-col justify-end">
        {/* Area Chart */}
        <div className="h-32 mb-4 relative">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((level) => {
              const y = chartHeight - (level / 100) * chartHeight
              return (
                <g key={`grid-${level}`}>
                  <line
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke={COLORS.background.tertiary}
                    strokeWidth="0.5"
                    opacity="0.5"
                  />
                  <text
                    x="-5"
                    y={y}
                    textAnchor="end"
                    dy="0.3em"
                    className="text-xs"
                    style={{ fill: COLORS.text.tertiary }}
                  >
                    {level}
                  </text>
                </g>
              )
            })}

            {/* Area */}
            <motion.path
              d={areaPath}
              fill={COLORS.accent.primary}
              fillOpacity="0.1"
              stroke={COLORS.accent.primary}
              strokeWidth="2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            />

            {/* Data points */}
            {points.map((point: any, i: number) => (
              <motion.circle
                key={`point-${i}`}
                cx={point.x}
                cy={point.y}
                r="2"
                fill={COLORS.accent.primary}
                initial={{ r: 0 }}
                animate={{ r: 2 }}
                transition={{ delay: i * 0.05 }}
              />
            ))}
          </svg>
        </div>

        {/* Milestone Markers */}
        <div className="flex justify-between px-2 mb-4">
          {milestones.map((milestone) => (
            <div key={milestone.score} className="text-center">
              <p className="text-lg">{milestone.emoji}</p>
              <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                {milestone.score}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: COLORS.text.secondary }}
              >
                {milestone.label}
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-2 pt-4 border-t"
          style={{ borderColor: COLORS.background.tertiary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <p
              className="text-xs"
              style={{ color: COLORS.text.secondary }}
            >
              Start
            </p>
            <p
              className="text-sm font-bold"
              style={{ color: COLORS.accent.primary }}
            >
              {snapshots[0]?.score || 0}
            </p>
          </div>
          <div>
            <p
              className="text-xs"
              style={{ color: COLORS.text.secondary }}
            >
              Peak
            </p>
            <p
              className="text-sm font-bold"
              style={{ color: '#10B981' }}
            >
              {maxScore}
            </p>
          </div>
          <div>
            <p
              className="text-xs"
              style={{ color: COLORS.text.secondary }}
            >
              Current
            </p>
            <p
              className="text-sm font-bold"
              style={{ color: COLORS.accent.primary }}
            >
              {snapshots[snapshots.length - 1]?.score || 0}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
