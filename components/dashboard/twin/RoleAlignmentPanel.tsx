'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface RoleAlignmentPanelProps {
  loading?: boolean
}

export default function RoleAlignmentPanel({ loading }: RoleAlignmentPanelProps) {
  const { data: twin } = useDataFetch('/api/user/twin')
  const { data: genome } = useDataFetch('/api/genome')

  const alignmentData = useMemo(() => {
    if (!twin || !genome) return null

    const targetRole = twin.targetRole || 'Not Set'
    const readinessScore = twin.readinessScore || 0

    // Mock role requirements (in production, would come from backend)
    const roleRequirements = [
      { skill: 'Communication', critical: true, current: 65 },
      { skill: 'Problem Solving', critical: true, current: 78 },
      { skill: 'Technical Depth', critical: true, current: 55 },
      { skill: 'Leadership', critical: false, current: 42 },
    ]

    const criticalMet = roleRequirements
      .filter((r) => r.critical)
      .filter((r) => r.current >= 70).length
    const totalCritical = roleRequirements.filter((r) => r.critical).length

    return {
      targetRole,
      readinessScore: Math.round(readinessScore),
      requirements: roleRequirements,
      criticalMet,
      totalCritical,
    }
  }, [twin, genome])

  if (loading || !alignmentData) {
    return (
      <div
        className="rounded-lg border p-6 h-full flex items-center justify-center"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.background.tertiary,
        }}
      >
        <div className="animate-pulse">Loading role alignment...</div>
      </div>
    )
  }

  const completionPercentage = (alignmentData.criticalMet / alignmentData.totalCritical) * 100

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
      {/* Title & Role */}
      <div className="mb-4">
        <h3
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: COLORS.text.primary }}
        >
          🎯 Target Role Alignment
        </h3>
        <motion.p
          className="text-lg font-bold mt-2"
          style={{ color: COLORS.accent.primary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {alignmentData.targetRole}
        </motion.p>
      </div>

      {/* Main Match Percentage */}
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
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Readiness Score
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: COLORS.accent.primary }}
          >
            {alignmentData.readinessScore}%
          </p>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: COLORS.background.tertiary }}
        >
          <motion.div
            className="h-full"
            style={{ backgroundColor: COLORS.accent.primary }}
            initial={{ width: 0 }}
            animate={{ width: `${alignmentData.readinessScore}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Critical Skills */}
      <div className="mb-4">
        <p
          className="text-xs font-semibold uppercase mb-2"
          style={{ color: COLORS.text.secondary }}
        >
          Critical Skills ({alignmentData.criticalMet}/{alignmentData.totalCritical} Met)
        </p>
        <div className="space-y-2">
          {alignmentData.requirements
            .filter((r) => r.critical)
            .map((requirement) => (
              <motion.div
                key={requirement.skill}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs" style={{ color: COLORS.text.secondary }}>
                    {requirement.current >= 70 ? '✅' : '⚠️'} {requirement.skill}
                  </p>
                  <p
                    className="text-xs font-semibold"
                    style={{
                      color:
                        requirement.current >= 70
                          ? '#10B981'
                          : '#F59E0B',
                    }}
                  >
                    {requirement.current}/100
                  </p>
                </div>
                <div
                  className="w-full h-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: COLORS.background.tertiary }}
                >
                  <motion.div
                    className="h-full"
                    style={{
                      backgroundColor:
                        requirement.current >= 70 ? '#10B981' : '#F59E0B',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${requirement.current}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Optional Skills */}
      <div className="flex-1 overflow-y-auto">
        <p
          className="text-xs font-semibold uppercase mb-2"
          style={{ color: COLORS.text.tertiary }}
        >
          Optional Strengths
        </p>
        <div className="space-y-1">
          {alignmentData.requirements
            .filter((r) => !r.critical)
            .map((requirement) => (
              <div
                key={requirement.skill}
                className="flex items-center justify-between text-xs"
              >
                <p style={{ color: COLORS.text.secondary }}>{requirement.skill}</p>
                <p style={{ color: COLORS.accent.primary }}>
                  {requirement.current}%
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Status */}
      <motion.div
        className="mt-4 pt-4 border-t text-center"
        style={{ borderColor: COLORS.background.tertiary }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {alignmentData.readinessScore >= 80 && (
          <p
            className="text-xs font-semibold"
            style={{ color: '#10B981' }}
          >
            🎉 Ready for your target role!
          </p>
        )}
        {alignmentData.readinessScore >= 60 && alignmentData.readinessScore < 80 && (
          <p
            className="text-xs font-semibold"
            style={{ color: COLORS.accent.primary }}
          >
            📈 On track. Close the gaps below.
          </p>
        )}
        {alignmentData.readinessScore < 60 && (
          <p
            className="text-xs font-semibold"
            style={{ color: '#F59E0B' }}
          >
            ⏳ Build more skills before applying.
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
