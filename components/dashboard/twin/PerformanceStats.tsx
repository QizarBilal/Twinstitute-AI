'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface PerformanceStatsProps {
  loading?: boolean
}

export default function PerformanceStats({ loading }: PerformanceStatsProps) {
  const { data: twin } = useDataFetch('/api/user/twin')
  const { data: recentPerformance } = useDataFetch('/api/user/recent-performance')

  const statsData = useMemo(() => {
    if (!twin || !recentPerformance) return null

    return {
      tasksCompleted: recentPerformance.labCount || 0,
      averageScore: recentPerformance.avgScore || 0,
      consistency: twin.consistency || 0,
      executionReliability: twin.executionReliability || 0,
      completionRate: recentPerformance.completionRate || 0,
      learningVelocity: twin.formationVelocity || 0,
      problemSolvingDepth: twin.problemSolvingDepth || 0,
      designReasoningScore: twin.designReasoning || 0,
    }
  }, [twin, recentPerformance])

  if (loading || !statsData) {
    return (
      <div
        className="rounded-lg border p-6 h-full"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.background.tertiary,
        }}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Tasks Completed',
      value: statsData.tasksCompleted,
      icon: '✅',
      color: '#10B981',
      suffix: '',
    },
    {
      label: 'Average Score',
      value: statsData.averageScore,
      icon: '📊',
      color: COLORS.accent.primary,
      suffix: '/100',
    },
    {
      label: 'Consistency',
      value: statsData.consistency,
      icon: '📈',
      color: '#8B5CF6',
      suffix: '%',
    },
    {
      label: 'Execution Reliability',
      value: statsData.executionReliability,
      icon: '⚡',
      color: '#F59E0B',
      suffix: '%',
    },
    {
      label: 'Completion Rate',
      value: statsData.completionRate,
      icon: '🎯',
      color: '#10B981',
      suffix: '%',
    },
    {
      label: 'Learning Velocity',
      value: statsData.learningVelocity,
      icon: '🚀',
      color: COLORS.accent.primary,
      suffix: 'pts/wk',
    },
    {
      label: 'Problem Solving',
      value: statsData.problemSolvingDepth,
      icon: '🧠',
      color: '#8B5CF6',
      suffix: '%',
    },
    {
      label: 'Design Reasoning',
      value: statsData.designReasoningScore,
      icon: '🎨',
      color: '#F59E0B',
      suffix: '%',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
          📊 Performance Metrics
        </h3>
        <p className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
          Your performance snapshot
        </p>
      </div>

      {/* Stats Grid */}
      <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="p-3 rounded border"
            style={{
              backgroundColor: COLORS.background.tertiary,
              borderColor: COLORS.background.tertiary,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {/* Icon and Label */}
            <div className="flex items-start justify-between">
              <p
                className="text-xs"
                style={{ color: COLORS.text.secondary }}
              >
                {stat.label}
              </p>
              <span className="text-lg">{stat.icon}</span>
            </div>

            {/* Value */}
            <motion.p
              className="text-xl font-bold mt-1"
              style={{ color: stat.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 + 0.2 }}
            >
              {typeof stat.value === 'number' ? stat.value.toFixed(0) : stat.value}
              <span className="text-xs ml-1">{stat.suffix}</span>
            </motion.p>

            {/* Mini Progress Bar */}
            {stat.suffix === '%' && stat.value > 0 && (
              <div
                className="w-full h-1 rounded-full overflow-hidden mt-2"
                style={{ backgroundColor: COLORS.background.secondary }}
              >
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: stat.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div
        className="mt-4 pt-4 border-t"
        style={{ borderColor: COLORS.background.tertiary }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p
          className="text-xs font-semibold mb-2"
          style={{ color: COLORS.accent.primary }}
        >
          Overall Assessment
        </p>
        <p
          className="text-xs leading-relaxed"
          style={{ color: COLORS.text.secondary }}
        >
          {statsData.averageScore >= 80
            ? '✅ Excellent performance across all metrics. You\'re executing at a high level.'
            : statsData.averageScore >= 60
              ? '📈 Solid performance. Focus on consistency and problem-solving depth.'
              : '⚠️ Foundation building phase. Increase practice frequency and complexity.'}
        </p>
      </motion.div>
    </motion.div>
  )
}
