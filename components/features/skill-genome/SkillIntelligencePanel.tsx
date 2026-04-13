'use client'

import { motion } from 'framer-motion'
import { X, TrendingUp, Users, Lightbulb, ArrowRight, Code } from 'lucide-react'
import { SkillAnalysis, SkillNode } from '@/types/genome'

interface SkillIntelligencePanelProps {
  skill: SkillAnalysis | null
  onClose: () => void
}

export function SkillIntelligencePanel({ skill, onClose }: SkillIntelligencePanelProps) {
  if (!skill) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 flex items-center justify-center min-h-[500px]"
      >
        <p className="text-gray-500 text-center">
          Click on a skill node to view detailed analysis
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex items-start justify-between bg-gray-800/30">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{skill.name}</h3>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.proficiency}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  skill.proficiency >= 70
                    ? 'bg-emerald-500'
                    : skill.proficiency >= 40
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                }`}
              />
            </div>
            <span className="text-sm font-bold text-white min-w-12 text-right">
              {Math.round(skill.proficiency)}%
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Meaning */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
            Meaning
          </label>
          <p className="text-sm text-gray-300 leading-relaxed">{skill.meaning}</p>
        </div>

        {/* Work Context */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
            Work Context
          </label>
          <p className="text-sm text-gray-300 leading-relaxed">{skill.workContext}</p>
        </div>

        {/* Capability Analysis */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
            Capability Analysis
          </label>
          <p className="text-sm text-gray-300 leading-relaxed">{skill.capabilityAnalysis}</p>
        </div>

        {/* Growth Impact */}
        <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp size={16} className="text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                Growth Impact
              </label>
              <p className="text-sm text-blue-200 mt-1">{skill.growthImpact}</p>
            </div>
          </div>
        </div>

        {/* Strategic Insight */}
        <div className="p-3 bg-cyan-600/10 border border-cyan-600/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                Strategic Insight
              </label>
              <p className="text-sm text-cyan-200 mt-1">{skill.strategicInsight}</p>
            </div>
          </div>
        </div>

        {/* Dependencies */}
        {skill.dependencies.length > 0 && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Prerequisites ({skill.dependencies.length})
            </label>
            <div className="space-y-1">
              {skill.dependencies.map((dep, idx) => (
                <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                  <ArrowRight size={12} className="text-gray-600" />
                  {dep}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dependents */}
        {skill.dependents.length > 0 && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Synergies ({skill.dependents.length})
            </label>
            <div className="space-y-1">
              {skill.dependents.map((dep, idx) => (
                <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                  <ArrowRight size={12} className="text-gray-600" />
                  {dep}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Skills */}
        {skill.relatedSkills.length > 0 && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Related Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {skill.relatedSkills.map((related) => (
                <span
                  key={related.id}
                  className="text-xs px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-gray-300 hover:border-blue-600/30 transition-colors cursor-pointer"
                >
                  {related.label} · {related.proficiency}%
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {skill.nextSteps.length > 0 && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Next Steps
            </label>
            <ol className="space-y-2">
              {skill.nextSteps.map((step, idx) => (
                <li key={idx} className="text-xs text-gray-300 flex gap-2">
                  <span className="font-bold text-cyan-400">{idx + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="border-t border-gray-800 p-4 bg-gray-800/20">
        <button className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
          <Code size={16} />
          Start Practice Lab
        </button>
      </div>
    </motion.div>
  )
}
