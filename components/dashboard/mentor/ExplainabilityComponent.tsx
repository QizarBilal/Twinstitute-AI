'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface ExplainabilityData {
  reason: string
  basedOn: Array<{
    metric: string
    value: string | number
    unit?: string
    impact: 'positive' | 'negative' | 'neutral'
  }>
  alternativeActions: string[]
  confidence: number
  lastUpdated: Date
}

interface ExplainabilityComponentProps {
  suggestion?: string
  agentResponses?: Array<{
    agentName: string
    emoji: string
    perspective: string
    recommendation: string
    confidence: number
  }>
}

export default function ExplainabilityComponent({
  suggestion,
  agentResponses,
}: ExplainabilityComponentProps) {
  const { data: twin } = useDataFetch('/api/user/twin')
  const { data: genome } = useDataFetch('/api/genome')
  const [expanded, setExpanded] = useState(false)

  // Generate explainability data based on available agents
  const generateExplainability = (): ExplainabilityData | null => {
    if (!agentResponses || agentResponses.length === 0) return null

    const basedOnMetrics: Array<{
      metric: string
      value: string | number
      unit?: string
      impact: 'positive' | 'negative' | 'neutral'
    }> = []

    if (twin) {
      basedOnMetrics.push({
        metric: 'Capability Score',
        value: twin.overallScore || 0,
        unit: '/100',
        impact: (twin.overallScore || 0) > 70 ? 'positive' : 'negative',
      })
      basedOnMetrics.push({
        metric: 'Burnout Risk',
        value: twin.burnoutRisk || 0,
        unit: '%',
        impact: (twin.burnoutRisk || 0) < 40 ? 'positive' : 'negative',
      })
      basedOnMetrics.push({
        metric: 'Learning Velocity',
        value: twin.formationVelocity || 0,
        unit: 'pts/week',
        impact: 'neutral' as const,
      })
    }

    if (genome) {
      basedOnMetrics.push({
        metric: 'Weak Skills',
        value: (genome as any)?.weakSkills || 0,
        impact: ((genome as any)?.weakSkills || 0) === 0 ? 'positive' : 'negative',
      })
      basedOnMetrics.push({
        metric: 'Core Strength',
        value: (genome as any)?.coreStrength || 0,
        unit: '/100',
        impact: ((genome as any)?.coreStrength || 0) > 75 ? 'positive' : 'negative',
      })
    }

    const avgConfidence =
      agentResponses.reduce((sum, r) => sum + (r.confidence || 0), 0) /
      agentResponses.length

    return {
      reason: `This suggestion combines insights from ${agentResponses.length} mentor perspectives to guide your optimal next action.`,
      basedOn: basedOnMetrics as typeof basedOnMetrics,
      alternativeActions: [
        'Wait and observe trends before acting',
        'Take a different learning approach',
        'Combine multiple recommendations',
        'Prioritize differently based on urgency',
      ],
      confidence: avgConfidence,
      lastUpdated: new Date(),
    }
  }

  const explainability = generateExplainability()

  if (!explainability || !agentResponses) {
    return null
  }

  return (
    <div
      className="rounded-lg border p-4"
      style={{
        backgroundColor: COLORS.background.secondary,
        borderColor: COLORS.background.tertiary,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 cursor-pointer transition-all"
      >
        <h4
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: COLORS.text.primary }}
        >
          🔍 Why This Suggestion?
        </h4>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: COLORS.accent.primary }}
        >
          ▼
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-4 border-t pt-3"
            style={{ borderColor: COLORS.background.tertiary }}
          >
            {/* Main Reason */}
            <div>
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: COLORS.accent.primary }}
              >
                Reasoning
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: COLORS.text.secondary }}
              >
                {explainability.reason}
              </p>
            </div>

            {/* Agent Inputs */}
            <div>
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: COLORS.accent.primary }}
              >
                Agent Perspectives
              </p>
              <div className="space-y-2">
                {agentResponses.map(agent => (
                  <motion.div
                    key={agent.agentName}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-2 rounded border"
                    style={{
                      backgroundColor: COLORS.background.tertiary,
                      borderColor: COLORS.background.tertiary,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 text-base">{agent.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold">
                            {agent.agentName}
                          </p>
                          <span
                            className="text-xs"
                            style={{ color: COLORS.accent.primary }}
                          >
                            {(agent.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: COLORS.text.secondary }}
                        >
                          {agent.perspective}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Based On - Key Metrics */}
            <div>
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: COLORS.accent.primary }}
              >
                Based On Your Data
              </p>
              <div className="grid grid-cols-2 gap-2">
                {explainability.basedOn.map((item, i) => {
                  const impactColor =
                    item.impact === 'positive'
                      ? '#22C55E'
                      : item.impact === 'negative'
                        ? '#EF4444'
                        : COLORS.accent.primary

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-2 rounded border"
                      style={{
                        backgroundColor: COLORS.background.tertiary,
                        borderColor: COLORS.background.tertiary,
                      }}
                    >
                      <p
                        className="text-xs"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {item.metric}
                      </p>
                      <p
                        className="text-sm font-bold mt-0.5"
                        style={{ color: impactColor }}
                      >
                        {item.value}
                        {item.unit}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Confidence Score */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.accent.primary }}
                >
                  Confidence Level
                </p>
                <p
                  className="text-sm font-bold"
                  style={{ color: COLORS.accent.primary }}
                >
                  {(explainability.confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: COLORS.background.tertiary }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${explainability.confidence * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: COLORS.accent.primary }}
                />
              </div>
              <p
                className="text-xs mt-1"
                style={{ color: COLORS.text.tertiary }}
              >
                {explainability.confidence > 0.85
                  ? '✅ High confidence recommendation'
                  : explainability.confidence > 0.7
                    ? '🟡 Moderate confidence'
                    : '⚠️ Lower confidence - use context judgement'}
              </p>
            </div>

            {/* Alternative Actions */}
            <div>
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: COLORS.accent.primary }}
              >
                Alternative Approaches
              </p>
              <ul className="space-y-1">
                {explainability.alternativeActions.map((action, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-xs flex items-start gap-2"
                    style={{ color: COLORS.text.secondary }}
                  >
                    <span className="flex-shrink-0 mt-0.5">•</span>
                    <span>{action}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Last Updated */}
            <p
              className="text-xs text-right pt-2"
              style={{ color: COLORS.text.tertiary }}
            >
              Updated {new Date().toLocaleTimeString()}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
