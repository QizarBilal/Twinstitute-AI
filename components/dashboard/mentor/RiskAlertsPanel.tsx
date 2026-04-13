'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface RiskAlert {
  id: string
  type: 'burnout' | 'skill-gap' | 'consistency' | 'stagnation' | 'overload'
  severity: 'critical' | 'high' | 'medium'
  title: string
  message: string
  recommendation: string
  metric?: {
    label: string
    current: number
    warning: number
    unit?: string
  }
  action?: {
    label: string
    action: string
  }
}

export default function RiskAlertsPanel() {
  const { data: twin } = useDataFetch('/api/user/twin')
  const { data: recentPerformance } = useDataFetch('/api/user/recent-performance')
  const { data: genome } = useDataFetch('/api/genome')

  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (twin && recentPerformance && genome) {
      generateAlerts()
    }
  }, [twin, recentPerformance, genome])

  const generateAlerts = () => {
    const newAlerts: RiskAlert[] = []

    // Burnout Risk Alert
    if (twin?.burnoutRisk && twin.burnoutRisk > 40) {
      newAlerts.push({
        id: 'burnout',
        type: 'burnout',
        severity: twin.burnoutRisk > 60 ? 'critical' : 'high',
        title: '⚠️ Burnout Risk Alert',
        message: `Your burnout risk is elevated at ${twin.burnoutRisk}%.${twin.burnoutRisk > 60 ? ' Immediate action needed.' : ' Monitor closely.'}`,
        recommendation: `${twin.burnoutRisk > 60 ? 'URGENT: ' : ''}Take ${twin.burnoutRisk > 60 ? '2-3 days' : '1-2 days'} off. Reduce intensity. Prioritize recovery.`,
        metric: {
          label: 'Burnout Risk',
          current: twin.burnoutRisk,
          warning: 40,
          unit: '%',
        },
        action: {
          label: 'View Recovery Plan',
          action: 'recovery-plan',
        },
      })
    }

    // Consistency Alert
    if (twin?.consistency && twin.consistency < 60) {
      newAlerts.push({
        id: 'consistency',
        type: 'consistency',
        severity: 'medium',
        title: '📊 Consistency Issue',
        message: 'Your practice consistency is irregular. Sporadic effort reduces learning effectiveness.',
        recommendation: 'Build daily practice habits. Start with 30-minute daily sessions to establish consistency.',
        metric: {
          label: 'Consistency Score',
          current: twin.consistency,
          warning: 60,
        },
      })
    }

    // Skill Gap Alert
    if (genome?.gaps && genome.gaps.length > 0) {
      const criticalGaps = genome.gaps.filter((g: any) => g.priority === 'critical')
      if (criticalGaps.length > 0) {
        newAlerts.push({
          id: 'skill-gaps',
          type: 'skill-gap',
          severity: 'high',
          title: `🔴 Critical Skill Gaps (${criticalGaps.length})`,
          message: `${criticalGaps.length} critical skill gap${criticalGaps.length > 1 ? 's' : ''} blocking your progress.`,
          recommendation: `Prioritize: ${criticalGaps.slice(0, 2).map((g: any) => g.skill).join(', ')}`,
          action: {
            label: 'View Skill Plan',
            action: 'skill-plan',
          },
        })
      }
    }

    // Performance Decline Alert
    if (recentPerformance?.improvementTrend === 'down') {
      newAlerts.push({
        id: 'performance-decline',
        type: 'stagnation',
        severity: 'high',
        title: '📉 Performance Declining',
        message: 'Your recent performance shows a downward trend. Immediate intervention needed.',
        recommendation: 'Review recent work. Identify blockers. Consider reducing task complexity to rebuild confidence.',
        metric: {
          label: 'Recent Avg Score',
          current: recentPerformance.avgScore || 0,
          warning: 70,
        },
        action: {
          label: 'Review Performance',
          action: 'performance-review',
        },
      })
    }

    // Learning Overload Alert
    if (twin?.learningSpeed && twin.learningSpeed > 85) {
      newAlerts.push({
        id: 'overload',
        type: 'overload',
        severity: 'medium',
        title: '⚡ Potential Overload',
        message: 'You might be trying to learn too much too fast.',
        recommendation: 'Slow down. Depth over breadth. Ensure mastery before moving on.',
        metric: {
          label: 'Learning Speed',
          current: twin.learningSpeed,
          warning: 80,
        },
      })
    }

    setAlerts(newAlerts)
  }

  const getSeverityStyles = (severity: string) => {
    const styles = {
      critical: {
        bg: 'rgba(239, 68, 68, 0.15)',
        border: '#EF4444',
        icon: '🔴',
      },
      high: {
        bg: 'rgba(249, 115, 22, 0.15)',
        border: '#F97316',
        icon: '🟠',
      },
      medium: {
        bg: 'rgba(59, 130, 246, 0.15)',
        border: '#3B82F6',
        icon: '🔵',
      },
    }
    return styles[severity as keyof typeof styles] || styles.medium
  }

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.has(a.id))

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
          ⚠️ Risk Alerts
        </h3>
        {visibleAlerts.length > 0 && (
          <span
            className="text-xs px-2 py-1 rounded font-semibold"
            style={{
              backgroundColor: '#EF4444',
              color: 'white',
            }}
          >
            {visibleAlerts.length}
          </span>
        )}
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {visibleAlerts.length > 0 ? (
            visibleAlerts.map((alert, index) => {
              const severityStyle = getSeverityStyles(alert.severity)

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: severityStyle.bg,
                    borderColor: severityStyle.border,
                  }}
                >
                  {/* Alert Title */}
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-xs font-semibold"
                      style={{ color: COLORS.text.primary }}
                    >
                      {alert.title}
                    </p>
                    <button
                      onClick={() =>
                        setDismissedAlerts(prev => new Set([...prev, alert.id]))
                      }
                      className="flex-shrink-0 text-xs opacity-50 hover:opacity-100 transition-opacity"
                      style={{ color: COLORS.text.secondary }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Alert Message */}
                  <p
                    className="text-xs mt-1"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {alert.message}
                  </p>

                  {/* Metric (if available) */}
                  {alert.metric && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-xs"
                          style={{ color: COLORS.text.secondary }}
                        >
                          {alert.metric.label}
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: severityStyle.border }}
                        >
                          {alert.metric.current}
                          {alert.metric.unit}
                        </span>
                      </div>
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: COLORS.background.tertiary }}
                      >
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${Math.min((alert.metric.current / 100) * 100, 100)}%`,
                            backgroundColor: severityStyle.border,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Recommendation */}
                  <p
                    className="text-xs mt-2 italic"
                    style={{ color: COLORS.text.secondary }}
                  >
                    💡 {alert.recommendation}
                  </p>

                  {/* Action Button */}
                  {alert.action && (
                    <button
                      onClick={() => {
                        // Handle action
                      }}
                      className="w-full mt-2 py-1.5 px-2 rounded text-xs font-semibold transition-colors"
                      style={{
                        backgroundColor: severityStyle.border,
                        color: COLORS.background.primary,
                      }}
                    >
                      {alert.action.label}
                    </button>
                  )}
                </motion.div>
              )
            })
          ) : (
            <div
              className="flex items-center justify-center h-24"
              style={{ color: COLORS.text.secondary }}
            >
              <span className="text-xs">✅ No active risk alerts</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      {visibleAlerts.length > 0 && (
        <div
          className="mt-4 pt-4 border-t text-xs"
          style={{
            borderColor: COLORS.background.tertiary,
            color: COLORS.text.secondary,
          }}
        >
          <p>Review alerts regularly. Act on critical items first.</p>
        </div>
      )}
    </div>
  )
}
