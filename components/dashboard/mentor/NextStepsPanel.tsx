'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COLORS, SPACING } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface NextStep {
  id: string
  action: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimatedTime: string
  relatedSkill?: string
  description: string
  actionButton?: {
    label: string
    action: string
  }
}

export default function NextStepsPanel() {
  const { data: twin } = useDataFetch('/api/user/twin')
  const { data: genome } = useDataFetch('/api/genome')
  const { data: roadmap } = useDataFetch('/api/roadmap')

  const [nextSteps, setNextSteps] = useState<NextStep[]>([])
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  useEffect(() => {
    if (twin && genome && roadmap) {
      generateNextSteps()
    }
  }, [twin, genome, roadmap])

  const generateNextSteps = () => {
    const steps: NextStep[] = []

    // Step 1: Address critical skill gaps
    if (genome?.gaps && genome.gaps.length > 0) {
      const criticalGap = genome.gaps.find((g: any) => g.priority === 'critical')
      if (criticalGap) {
        steps.push({
          id: 'skill-gap',
          action: `Master ${criticalGap.skill}`,
          priority: 'critical',
          estimatedTime: `${criticalGap.learningTime || 20} hours`,
          description: `This skill is flagged as critical for your ${twin?.targetRole || 'career'} goal. It has high impact on your readiness.`,
          relatedSkill: criticalGap.skill,
          actionButton: {
            label: 'Start Learning',
            action: 'explore-skill',
          },
        })
      }
    }

    // Step 2: Next lab/task
    if (roadmap?.nextTask) {
      steps.push({
        id: 'next-task',
        action: `Complete: ${roadmap.nextTask.title}`,
        priority: 'high',
        estimatedTime: `${roadmap.nextTask.estimatedTime || 4} hours`,
        description: roadmap.nextTask.description,
        actionButton: {
          label: 'Start Task',
          action: 'start-task',
        },
      })
    }

    // Step 3: Increase skill depth
    if (genome?.breadthScore && genome.depthScore && genome.breadthScore > genome.depthScore) {
      steps.push({
        id: 'deepen-skills',
        action: 'Deepen your strongest skills',
        priority: 'high',
        estimatedTime: '1-2 weeks',
        description:
          'You have broad skills. Focus on deepening expertise in your top 3 core skills to increase specialization.',
        actionButton: {
          label: 'View Skills',
          action: 'view-genome',
        },
      })
    } else {
      steps.push({
        id: 'broaden-skills',
        action: 'Build breadth in supporting skills',
        priority: 'medium',
        estimatedTime: '2-3 weeks',
        description: 'Expand your skill foundation by learning adjacent skills that complement your core expertise.',
        actionButton: {
          label: 'Explore Skills',
          action: 'explore-skills',
        },
      })
    }

    // Step 4: Performance milestone
    if (twin?.overallScore && twin.overallScore < 80) {
      steps.push({
        id: 'improve-performance',
        action: `Reach ${Math.ceil(twin.overallScore / 10) * 10 + 10} capability score`,
        priority: 'medium',
        estimatedTime: `${Math.ceil((100 - twin.overallScore) / 10)} weeks`,
        description: `You're at ${twin.overallScore}/100. Push towards the next capability milestone.`,
      })
    }

    setNextSteps(steps)
  }

  const getPriorityStyles = (priority: string) => {
    const styles = {
      critical: {
        bg: 'rgba(239, 68, 68, 0.1)',
        border: '#EF4444',
        text: '#FCA5A5',
      },
      high: {
        bg: 'rgba(249, 115, 22, 0.1)',
        border: '#F97316',
        text: '#FED7AA',
      },
      medium: {
        bg: 'rgba(59, 130, 246, 0.1)',
        border: '#3B82F6',
        text: '#93C5FD',
      },
      low: {
        bg: 'rgba(34, 197, 94, 0.1)',
        border: '#22C55E',
        text: '#86EFAC',
      },
    }
    return styles[priority as keyof typeof styles] || styles.low
  }

  return (
    <div
      className="rounded-lg border p-5 h-full flex flex-col"
      style={{
        backgroundColor: COLORS.background.secondary,
        borderColor: COLORS.background.tertiary,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: COLORS.text.primary }}
        >
          🎯 Next Steps
        </h3>
        <span
          className="text-xs px-2 py-1 rounded"
          style={{
            backgroundColor: COLORS.background.tertiary,
            color: COLORS.text.secondary,
          }}
        >
          {nextSteps.length} items
        </span>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {nextSteps.map((step, index) => {
            const priorityStyle = getPriorityStyles(step.priority)

            return (
              <motion.button
                key={step.id}
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full text-left p-3 rounded-lg border transition-all hover:border-opacity-100"
                style={{
                  backgroundColor: priorityStyle.bg,
                  borderColor: priorityStyle.border,
                  borderWidth: '1px',
                }}
              >
                {/* Collapsed View */}
                <div className="flex items-start gap-2">
                  <div
                    className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                    style={{ backgroundColor: priorityStyle.border }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: priorityStyle.text }}
                    >
                      {step.action}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {step.estimatedTime}
                    </p>
                  </div>
                </div>

                {/* Expanded View */}
                <AnimatePresence>
                  {expandedStep === step.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 pt-2 border-t"
                      style={{ borderColor: priorityStyle.border }}
                    >
                      <p
                        className="text-xs leading-relaxed mb-2"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {step.description}
                      </p>
                      {step.actionButton && (
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            // Handle action
                          }}
                          className="w-full py-1.5 px-2 rounded text-xs font-semibold transition-colors"
                          style={{
                            backgroundColor: priorityStyle.border,
                            color: COLORS.background.primary,
                          }}
                        >
                          {step.actionButton.label}
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </AnimatePresence>

        {nextSteps.length === 0 && (
          <div
            className="flex items-center justify-center h-24"
            style={{ color: COLORS.text.secondary }}
          >
            <span className="text-xs">No immediate next steps</span>
          </div>
        )}
      </div>
    </div>
  )
}
