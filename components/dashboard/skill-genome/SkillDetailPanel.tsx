/**
 * SKILL DETAIL SIDE PANEL
 * 
 * Shows comprehensive information about selected skill:
 * - Name and category
 * - Importance and usage frequency
 * - Role-specific context
 * - Learning resources
 * - Related modules
 */

'use client'

import React from 'react'
import { SkillNode } from '@/lib/ai/skill-genome-system'
import { X } from 'lucide-react'

interface SkillDetailPanelProps {
  skill: SkillNode | null
  onClose?: () => void
}

export const SkillDetailPanel: React.FC<SkillDetailPanelProps> = ({
  skill,
  onClose,
}) => {
  if (!skill) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-500">Click a skill node to see details</p>
      </div>
    )
  }

  const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
    core: { bg: 'bg-cyan-950', border: 'border-cyan-700', text: 'text-cyan-400' },
    support: { bg: 'bg-blue-950', border: 'border-blue-700', text: 'text-blue-400' },
    advanced: { bg: 'bg-purple-950', border: 'border-purple-700', text: 'text-purple-400' },
    optional: { bg: 'bg-orange-950', border: 'border-orange-700', text: 'text-orange-400' },
  }

  const categoryStyle = categoryColors[skill.category] || categoryColors.core

  const importanceStars = Array.from({ length: 5 }).map((_, i) => (
    <span key={i} className={i < skill.importance ? 'text-yellow-400' : 'text-gray-600'}>
      ★
    </span>
  ))

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-black border border-gray-800 rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      <div className={`${categoryStyle.bg} border-b ${categoryStyle.border} p-6`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {skill.category} Skill
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{skill.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Importance:</span>
              <div className="flex gap-1">{importanceStars}</div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-200">Current Progress</span>
            <span className={`${categoryStyle.text} font-bold text-lg`}>{skill.progress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div
              className={`h-full background-gradient-to-r transition-all duration-700`}
              style={{
                width: `${skill.progress}%`,
                backgroundColor: skill.color,
                boxShadow: `0 0 10px ${skill.color}`,
              }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-400 font-medium mb-2">Used in Modules</div>
            <div className="text-2xl font-bold text-white">{skill.frequency}</div>
          </div>
          <div className={`${categoryStyle.bg} border ${categoryStyle.border} rounded-lg p-4`}>
            <div className="text-xs text-gray-300 font-medium mb-2">Category</div>
            <div className="text-lg font-bold capitalize" style={{ color: skill.color }}>
              {skill.category}
            </div>
          </div>
        </div>

        {/* Description */}
        {skill.description && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-200">Description</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{skill.description}</p>
          </div>
        )}

        {/* Why It Matters */}
        {skill.relative_to_role && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <span className="text-cyan-400">→</span> Why This Matters
            </h3>
            <div className="bg-cyan-950/30 border border-cyan-700/30 rounded-lg p-4">
              <p className="text-sm text-gray-300 leading-relaxed">{skill.relative_to_role}</p>
            </div>
          </div>
        )}

        {/* Application */}
        {skill.importance_reason && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <span style={{ color: skill.color }}>→</span> How It's Applied
            </h3>
            <div className={`${categoryStyle.bg} border ${categoryStyle.border} rounded-lg p-4`}>
              <p className="text-sm text-gray-300 leading-relaxed">{skill.importance_reason}</p>
            </div>
          </div>
        )}

        {/* Learning Resources */}
        {skill.learning_resources && skill.learning_resources.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-200">Learning Resources</h3>
            <div className="space-y-2">
              {skill.learning_resources.map((resource, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-gray-900/50 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors"
                >
                  <span className="text-xs font-bold text-gray-500 min-w-[20px] mt-0.5">{idx + 1}</span>
                  <span className="text-sm text-gray-300">{resource}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-200">Quick Tips</h3>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex gap-2 items-start">
              <span className="text-cyan-400 font-bold mt-0.5">•</span>
              <span className="text-sm text-gray-400">
                This skill appears in {skill.frequency} module{skill.frequency !== 1 ? 's' : ''} of your roadmap
              </span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-cyan-400 font-bold mt-0.5">•</span>
              <span className="text-sm text-gray-400">
                Priority level: <span className="font-semibold text-gray-300">{skill.importance}/5</span>
              </span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-cyan-400 font-bold mt-0.5">•</span>
              <span className="text-sm text-gray-400">
                Focus on mastering this skill before moving to advanced topics
              </span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <button className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50">
          View Related Modules
        </button>
      </div>
    </div>
  )
}

export default SkillDetailPanel
