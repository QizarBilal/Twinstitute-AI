'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface WeakSkillsPanelProps {
  loading?: boolean
}

export default function WeakSkillsPanel({ loading }: WeakSkillsPanelProps) {
  const { data: genome } = useDataFetch('/api/genome')

  const weakSkillsData = useMemo(() => {
    if (!genome) return []

    // Get skills marked as weak or with low proficiency
    const weakSkills = [
      ...genome.nodes.filter((n: any) => n.type === 'weak'),
      ...(genome.gaps || []),
    ]
      .slice(0, 6)

    return weakSkills
  }, [genome])

  if (loading || weakSkillsData.length === 0) {
    return (
      <div
        className="rounded-lg border p-6 h-full flex items-center justify-center"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.background.tertiary,
        }}
      >
        <div className="text-center">
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            ✅ No critical skill gaps identified
          </p>
        </div>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444', text: '#FCA5A5' }
      case 'important':
        return { bg: 'rgba(249, 115, 22, 0.1)', border: '#F97316', text: '#FED7AA' }
      default:
        return { bg: 'rgba(59, 130, 246, 0.1)', border: '#3B82F6', text: '#93C5FD' }
    }
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
          ⚠️ Weak Skills
        </h3>
        <p className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
          Focus areas for improvement
        </p>
      </div>

      {/* Skills List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {weakSkillsData.map((skill: any, i: number) => {
          const skillName = skill.label || skill.skill
          const priority =
            skill.priority ||
            (skill.proficiency < 30 ? 'critical' : skill.proficiency < 60 ? 'important' : 'optional')
          const proficiency = skill.proficiency || 0
          const priorityStyle = getPriorityColor(priority)

          return (
            <motion.div
              key={skillName}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: priorityStyle.bg,
                borderColor: priorityStyle.border,
              }}
            >
              {/* Skill name and priority */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: COLORS.text.primary }}
                  >
                    {skillName}
                  </p>
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {skill.reason || `Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}`}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded flex-shrink-0"
                  style={{
                    backgroundColor: priorityStyle.border,
                    color: COLORS.background.primary,
                  }}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </span>
              </div>

              {/* Progress bar */}
              {proficiency > 0 && (
                <div
                  className="w-full h-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: COLORS.background.tertiary }}
                >
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: priorityStyle.border }}
                    initial={{ width: 0 }}
                    animate={{ width: `${proficiency}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              )}

              {/* Suggested action */}
              {skill.learningTime && (
                <p
                  className="text-xs mt-2"
                  style={{ color: COLORS.text.tertiary }}
                >
                  💡 Est. {skill.learningTime}h to master
                </p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* CTA */}
      <motion.button
        className="mt-4 w-full py-2 px-3 rounded border transition-colors hover:opacity-80"
        style={{
          backgroundColor: COLORS.background.tertiary,
          borderColor: COLORS.background.tertiary,
          color: COLORS.accent.primary,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <p className="text-xs font-semibold">Create Learning Plan</p>
      </motion.button>
    </motion.div>
  )
}
