'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface Suggestion {
  id: string
  category: 'task' | 'skill' | 'strategy' | 'mindset'
  title: string
  description: string
  reasoning: string
  difficulty?: 'easy' | 'medium' | 'hard'
  estimatedTime?: string
  impact?: 'quick-win' | 'high-impact' | 'strategic'
  actionLabel?: string
}

export default function SuggestionsPanel() {
  const { data: twin } = useDataFetch('/api/user/twin')
  const { data: genome } = useDataFetch('/api/genome')
  const { data: recentPerformance } = useDataFetch('/api/user/recent-performance')

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null)

  useEffect(() => {
    if (twin && genome && recentPerformance) {
      generateSuggestions()
    }
  }, [twin, genome, recentPerformance])

  const generateSuggestions = () => {
    const newSuggestions: Suggestion[] = []

    // Quick Win - Easy task
    if (recentPerformance?.avgScore && recentPerformance.avgScore > 70) {
      newSuggestions.push({
        id: 'quick-win',
        category: 'task',
        title: '🚀 Quick Project Win',
        description: 'Take on a medium difficulty task to build momentum and confidence.',
        reasoning: 'Your recent performance is strong. A quick win maintains morale and builds execution confidence.',
        difficulty: 'medium',
        estimatedTime: '2-4 hours',
        impact: 'quick-win',
        actionLabel: 'Find Projects',
      })
    }

    // Strategic Skill Development
    if (genome?.gaps && genome.gaps.length > 0) {
      const topGap = genome.gaps[0]
      newSuggestions.push({
        id: 'strategic-skill',
        category: 'skill',
        title: `📚 Focus on ${topGap.skill}`,
        description: `Master ${topGap.skill} to unlock related opportunities in your target role.`,
        reasoning: `This skill is critical for your ${twin?.targetRole || 'career'} path. High strategic impact.`,
        estimatedTime: `${topGap.learningTime || 20}-30 hours`,
        impact: 'high-impact',
        actionLabel: 'Start Learning Path',
      })
    }

    // Strategy Suggestion
    if (twin && twin.formationVelocity && twin.formationVelocity < 2) {
      newSuggestions.push({
        id: 'acceleration-strategy',
        category: 'strategy',
        title: '📈 Accelerate Your Growth',
        description: 'Increase practice frequency by 20-30% to hit optimal learning velocity.',
        reasoning: `You're progressing at ${twin.formationVelocity} pts/week. Ramping up to 2-2.5 pts/week accelerates capability growth without burnout risk.`,
        estimatedTime: 'Ongoing',
        impact: 'strategic',
        actionLabel: 'View Growth Plan',
      })
    }

    // Mindset/Balance Suggestion
    if (twin?.burnoutRisk && twin.burnoutRisk > 30) {
      newSuggestions.push({
        id: 'mindset-recovery',
        category: 'mindset',
        title: '🧘 Invest in Recovery',
        description: 'Balanced effort is sustainable effort. Recovery is not wasted time—it\'s essential for long-term growth.',
        reasoning: 'Burnout impairs learning and decision-making. Strategic rest actually accelerates progress.',
        estimatedTime: 'Daily',
        impact: 'high-impact',
        actionLabel: 'Mindfulness Resources',
      })
    }

    // Depth vs Breadth
    if (genome?.breadthScore && genome.depthScore) {
      if (genome.breadthScore > genome.depthScore + 15) {
        newSuggestions.push({
          id: 'deepen-expertise',
          category: 'strategy',
          title: '🎯 Deepen Core Expertise',
          description: 'You have broad skills. Pick 3 core skills and go deep on mastery.',
          reasoning: 'Specialization increases market value. Depth is more valuable than breadth for senior roles.',
          estimatedTime: '4-6 weeks',
          impact: 'strategic',
          actionLabel: 'Plan Depth Path',
        })
      }
    }

    // Learning Style Optimization
    if (recentPerformance?.completionRate && recentPerformance.completionRate < 80) {
      newSuggestions.push({
        id: 'optimize-learning',
        category: 'mindset',
        title: '🧠 Optimize Your Learning Style',
        description: 'Experiment with different learning methods to maximize engagement and completion.',
        reasoning: `Your completion rate is ${recentPerformance.completionRate}%. Finding your learning rhythm improves consistency.`,
        actionLabel: 'Explore Methods',
      })
    }

    setSuggestions(newSuggestions)
  }

  const getCategoryStyles = (category: string) => {
    const styles = {
      task: {
        bg: 'rgba(59, 130, 246, 0.1)',
        border: '#3B82F6',
        emoji: '📋',
      },
      skill: {
        bg: 'rgba(139, 92, 246, 0.1)',
        border: '#8B5CF6',
        emoji: '📚',
      },
      strategy: {
        bg: 'rgba(34, 197, 94, 0.1)',
        border: '#22C55E',
        emoji: '🎯',
      },
      mindset: {
        bg: 'rgba(249, 115, 22, 0.1)',
        border: '#F97316',
        emoji: '🧠',
      },
    }
    return styles[category as keyof typeof styles] || styles.task
  }

  const getImpactBadge = (impact?: string) => {
    const badges = {
      'quick-win': '⚡ Quick Win',
      'high-impact': '🔥 High Impact',
      strategic: '🎯 Strategic',
    }
    return badges[impact as keyof typeof badges] || ''
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
          💡 Smart Suggestions
        </h3>
        <span
          className="text-xs px-2 py-1 rounded"
          style={{
            backgroundColor: COLORS.background.tertiary,
            color: COLORS.text.secondary,
          }}
        >
          {suggestions.length} items
        </span>
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => {
              const categoryStyle = getCategoryStyles(suggestion.category)

              return (
                <motion.button
                  key={suggestion.id}
                  onClick={() =>
                    setActiveSuggestion(
                      activeSuggestion === suggestion.id ? null : suggestion.id
                    )
                  }
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full text-left p-3 rounded-lg border transition-all hover:border-opacity-100"
                  style={{
                    backgroundColor: categoryStyle.bg,
                    borderColor: categoryStyle.border,
                  }}
                >
                  {/* Collapsed View */}
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{categoryStyle.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: COLORS.text.primary }}
                      >
                        {suggestion.title}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestion.impact && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: categoryStyle.border,
                              color: COLORS.background.primary,
                            }}
                          >
                            {getImpactBadge(suggestion.impact)}
                          </span>
                        )}
                        {suggestion.difficulty && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: COLORS.background.tertiary,
                              color: COLORS.text.secondary,
                            }}
                          >
                            {suggestion.difficulty.charAt(0).toUpperCase() +
                              suggestion.difficulty.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded View */}
                  <AnimatePresence>
                    {activeSuggestion === suggestion.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 pt-2 border-t"
                        style={{ borderColor: categoryStyle.border }}
                      >
                        <p
                          className="text-xs leading-relaxed mb-2"
                          style={{ color: COLORS.text.secondary }}
                        >
                          {suggestion.description}
                        </p>
                        <p
                          className="text-xs italic mb-2"
                          style={{ color: COLORS.text.tertiary }}
                        >
                          <span
                            style={{ color: categoryStyle.border }}
                          >
                            Why:
                          </span>{' '}
                          {suggestion.reasoning}
                        </p>

                        {suggestion.estimatedTime && (
                          <p
                            className="text-xs mb-2"
                            style={{ color: COLORS.text.secondary }}
                          >
                            ⏱️ {suggestion.estimatedTime}
                          </p>
                        )}

                        {suggestion.actionLabel && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              // Handle action
                            }}
                            className="w-full py-1.5 px-2 rounded text-xs font-semibold transition-colors"
                            style={{
                              backgroundColor: categoryStyle.border,
                              color: COLORS.background.primary,
                            }}
                          >
                            {suggestion.actionLabel}
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })
          ) : (
            <div
              className="flex items-center justify-center h-24"
              style={{ color: COLORS.text.secondary }}
            >
              <span className="text-xs">Generating personalized suggestions...</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div
        className="mt-4 pt-3 border-t text-xs"
        style={{
          borderColor: COLORS.background.tertiary,
          color: COLORS.text.secondary,
        }}
      >
        <p>✨ Suggestions are personalized based on your data</p>
      </div>
    </div>
  )
}
