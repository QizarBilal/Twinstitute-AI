'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, TrendingDown, Clock, Target, ChevronRight } from 'lucide-react'
import { SkillGap } from '@/types/genome'

interface GapAnalysisPanelProps {
  gaps: SkillGap[]
  selectedGapId?: string
  onSelectGap: (gap: SkillGap) => void
  loading: boolean
}

export function GapAnalysisPanel({
  gaps,
  selectedGapId,
  onSelectGap,
  loading,
}: GapAnalysisPanelProps) {
  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-1/2 mb-4" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (gaps.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 rounded-full bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center mb-4">
          <TrendingDown className="text-emerald-400" size={24} />
        </div>
        <h3 className="text-white font-semibold mb-2">No Gaps Detected</h3>
        <p className="text-sm text-gray-400 text-center">
          Your skill profile is strong. Keep practicing to maintain and advance.
        </p>
      </div>
    )
  }

  const criticalGaps = gaps.filter(g => g.priority === 'critical')
  const importantGaps = gaps.filter(g => g.priority === 'important')
  const optionalGaps = gaps.filter(g => g.priority === 'optional')

  const GapSection = ({
    title,
    items,
    badgeColor,
    borderColor,
  }: {
    title: string
    items: SkillGap[]
    badgeColor: string
    borderColor: string
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${badgeColor}`}>
          {title} ({items.length})
        </span>
      </div>
      <div className="space-y-2">
        {items.map((gap, idx) => (
          <motion.button
            key={gap.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectGap(gap)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all group ${
              selectedGapId === gap.id
                ? `border-cyan-500/50 bg-cyan-500/10`
                : `border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50`
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                  {gap.skill}
                </p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{gap.reason}</p>
              </div>
              <ChevronRight
                size={16}
                className={`text-gray-500 flex-shrink-0 ml-2 transition-transform ${
                  selectedGapId === gap.id ? 'text-cyan-400 rotate-90' : ''
                }`}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Clock size={12} className="text-gray-500" />
              <span className="text-xs text-gray-500">{gap.learningTime}h</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 space-y-4"
    >
      <div className="flex items-center gap-2">
        <AlertCircle size={18} className="text-amber-400" />
        <h3 className="text-white font-semibold">Skill Gaps</h3>
      </div>

      <div className="space-y-4">
        {criticalGaps.length > 0 && (
          <GapSection
            title="Critical"
            items={criticalGaps}
            badgeColor="bg-red-600/20 text-red-400 border border-red-600/30"
            borderColor="border-red-600"
          />
        )}

        {importantGaps.length > 0 && (
          <GapSection
            title="Important"
            items={importantGaps}
            badgeColor="bg-amber-600/20 text-amber-400 border border-amber-600/30"
            borderColor="border-amber-600"
          />
        )}

        {optionalGaps.length > 0 && (
          <GapSection
            title="Optional"
            items={optionalGaps}
            badgeColor="bg-blue-600/20 text-blue-400 border border-blue-600/30"
            borderColor="border-blue-600"
          />
        )}
      </div>

      <div className="pt-4 border-t border-gray-800">
        <button className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
          <Target size={16} />
          Start Learning Path
        </button>
      </div>
    </motion.div>
  )
}
