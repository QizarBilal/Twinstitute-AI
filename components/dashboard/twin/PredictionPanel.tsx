'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface PredictionPanelProps {
  loading?: boolean
}

export default function PredictionPanel({ loading }: PredictionPanelProps) {
  const { data: twin } = useDataFetch('/api/user/twin')
  const { data: genome } = useDataFetch('/api/genome')

  const predictionData = useMemo(() => {
    if (!twin || !genome) return null

    // Calculate predictions based on current trajectory
    const currentScore = twin.overallScore || 0
    const improvementSlope = twin.improvementSlope || 1.5
    const burnoutRisk = twin.burnoutRisk || 0
    const readinessScore = twin.readinessScore || 0

    // Estimate weeks to job-ready (80+ score)
    const scoreGap = Math.max(80 - currentScore, 0)
    const weeksToJobReady = Math.ceil(scoreGap / (improvementSlope || 1))

    // Placement probability (based on readiness and burnout)
    const placementProbability = Math.max(
      0,
      Math.min(
        100,
        readinessScore * 0.7 - burnoutRisk * 0.3
      )
    )

    return {
      currentScore: Math.round(currentScore),
      improvementSlope: improvementSlope.toFixed(2),
      weeksToJobReady: weeksToJobReady,
      placementProbability: Math.round(placementProbability),
      readinessScore: Math.round(readinessScore),
      burnoutRisk: Math.round(burnoutRisk),
      targetScore: 80,
      estimatedDate: new Date(Date.now() + weeksToJobReady * 7 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    }
  }, [twin, genome])

  if (loading || !predictionData) {
    return (
      <div
        className="rounded-lg border p-6 h-full flex items-center justify-center"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.background.tertiary,
        }}
      >
        <div className="animate-pulse">Calculating predictions...</div>
      </div>
    )
  }

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
          🔮 Outcome Predictions
        </h3>
        <p className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
          Based on current trajectory
        </p>
      </div>

      {/* Main Prediction Card */}
      <motion.div
        className="mb-4 p-4 rounded-lg border"
        style={{
          backgroundColor: `${COLORS.accent.primary}15`,
          borderColor: COLORS.accent.primary,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-xs" style={{ color: COLORS.text.secondary }}>
          Job-Ready Timeline
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <p
            className="text-3xl font-bold"
            style={{ color: COLORS.accent.primary }}
          >
            {predictionData.weeksToJobReady}
          </p>
          <p style={{ color: COLORS.text.secondary }}>weeks</p>
        </div>
        <p
          className="text-xs mt-2"
          style={{ color: COLORS.text.tertiary }}
        >
          Target by: <span style={{ color: COLORS.accent.primary }}>
            {predictionData.estimatedDate}
          </span>
        </p>
      </motion.div>

      {/* Placement Probability */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
            Placement Probability
          </p>
          <p
            className="text-lg font-bold"
            style={{ color: COLORS.accent.primary }}
          >
            {predictionData.placementProbability}%
          </p>
        </div>
        <div
          className="w-full h-2.5 rounded-full overflow-hidden"
          style={{ backgroundColor: COLORS.background.tertiary }}
        >
          <motion.div
            className="h-full"
            style={{ backgroundColor: COLORS.accent.primary }}
            initial={{ width: 0 }}
            animate={{ width: `${predictionData.placementProbability}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Readiness Score */}
        <motion.div
          className="p-3 rounded border"
          style={{
            backgroundColor: COLORS.background.tertiary,
            borderColor: COLORS.background.tertiary,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs" style={{ color: COLORS.text.secondary }}>
            Readiness
          </p>
          <p
            className="text-xl font-bold mt-1"
            style={{ color: COLORS.accent.primary }}
          >
            {predictionData.readinessScore}%
          </p>
        </motion.div>

        {/* Improvement Rate */}
        <motion.div
          className="p-3 rounded border"
          style={{
            backgroundColor: COLORS.background.tertiary,
            borderColor: COLORS.background.tertiary,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-xs" style={{ color: COLORS.text.secondary }}>
            Growth Rate
          </p>
          <p
            className="text-xl font-bold mt-1"
            style={{ color: '#10B981' }}
          >
            +{predictionData.improvementSlope}
            <span className="text-xs">/wk</span>
          </p>
        </motion.div>
      </div>

      {/* Risk Factor */}
      <motion.div
        className="p-3 rounded border mb-4"
        style={{
          backgroundColor:
            predictionData.burnoutRisk > 50
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(34, 197, 94, 0.1)',
          borderColor:
            predictionData.burnoutRisk > 50 ? '#EF4444' : '#22C55E',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: COLORS.text.secondary }}>
            Burnout Risk
          </p>
          <p
            className="text-sm font-bold"
            style={{
              color:
                predictionData.burnoutRisk > 50 ? '#FCA5A5' : '#86EFAC',
            }}
          >
            {predictionData.burnoutRisk}%
          </p>
        </div>
        <div
          className="w-full h-1 rounded-full overflow-hidden mt-2"
          style={{ backgroundColor: COLORS.background.tertiary }}
        >
          <motion.div
            className="h-full"
            style={{
              backgroundColor:
                predictionData.burnoutRisk > 50 ? '#EF4444' : '#22C55E',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${predictionData.burnoutRisk}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </motion.div>

      {/* Recommendation */}
      <motion.div
        className="pt-4 border-t text-center"
        style={{ borderColor: COLORS.background.tertiary }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {predictionData.weeksToJobReady <= 4 && (
          <p className="text-xs" style={{ color: '#10B981' }}>
            ✨ <strong>Almost there!</strong> Push for the finish line.
          </p>
        )}
        {predictionData.weeksToJobReady > 4 &&
          predictionData.weeksToJobReady <= 12 && (
            <p className="text-xs" style={{ color: COLORS.accent.primary }}>
              📈 <strong>On track.</strong> Maintain momentum.
            </p>
          )}
        {predictionData.weeksToJobReady > 12 && (
          <p className="text-xs" style={{ color: '#F59E0B' }}>
            ⏱️ <strong>Long runway.</strong> Accelerate learning.
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
