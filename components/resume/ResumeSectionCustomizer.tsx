'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, Eye, EyeOff, Plus, Trash2, Wand2, ChevronDown,
  User, Briefcase, Code, Award, GraduationCap, BarChart3,
  Link as LinkIcon, FileText, Trophy
} from 'lucide-react'

interface ResumeSectionCustomizerProps {
  enabledSections: {
    contact: boolean
    summary: boolean
    experience: boolean
    projects: boolean
    skills: boolean
    education: boolean
    certifications: boolean
    languages: boolean
    achievements: boolean
  }
  onSectionToggle: (section: string, enabled: boolean) => void
  onSectionReorder?: (sections: string[]) => void
}

interface SectionConfig {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  category: 'essential' | 'standard' | 'optional'
  importance: 'high' | 'medium' | 'low'
}

const SECTION_CONFIGS: Record<string, SectionConfig> = {
  contact: {
    id: 'contact',
    name: 'Contact Information',
    icon: <User size={20} />,
    description: 'Name, email, phone, location',
    category: 'essential',
    importance: 'high',
  },
  summary: {
    id: 'summary',
    name: 'Professional Summary',
    icon: <FileText size={20} />,
    description: 'Career overview and key highlights',
    category: 'standard',
    importance: 'high',
  },
  experience: {
    id: 'experience',
    name: 'Work Experience',
    icon: <Briefcase size={20} />,
    description: 'Previous roles and responsibilities',
    category: 'essential',
    importance: 'high',
  },
  projects: {
    id: 'projects',
    name: 'Projects',
    icon: <Code size={20} />,
    description: 'Notable projects and portfolio items',
    category: 'standard',
    importance: 'medium',
  },
  skills: {
    id: 'skills',
    name: 'Skills',
    icon: <BarChart3 size={20} />,
    description: 'Technical and professional skills',
    category: 'essential',
    importance: 'high',
  },
  education: {
    id: 'education',
    name: 'Education',
    icon: <GraduationCap size={20} />,
    description: 'Degrees and academic achievements',
    category: 'standard',
    importance: 'medium',
  },
  certifications: {
    id: 'certifications',
    name: 'Certifications',
    icon: <Award size={20} />,
    description: 'Professional certifications and licenses',
    category: 'optional',
    importance: 'low',
  },
  languages: {
    id: 'languages',
    name: 'Languages',
    icon: <LinkIcon size={20} />,
    description: 'Languages you speak',
    category: 'optional',
    importance: 'low',
  },
  achievements: {
    id: 'achievements',
    name: 'Achievements',
    icon: <Trophy size={20} />,
    description: 'Awards, recognitions, and accomplishments',
    category: 'optional',
    importance: 'low',
  },
}

export function ResumeSectionCustomizer({
  enabledSections,
  onSectionToggle,
  onSectionReorder,
}: ResumeSectionCustomizerProps) {
  const [expandedCategory, setExpandedCategory] = useState<'essential' | 'standard' | 'optional'>('essential')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const sectionsByCategory = {
    essential: Object.values(SECTION_CONFIGS).filter(s => s.category === 'essential'),
    standard: Object.values(SECTION_CONFIGS).filter(s => s.category === 'standard'),
    optional: Object.values(SECTION_CONFIGS).filter(s => s.category === 'optional'),
  }

  const enabledCount = Object.values(enabledSections).filter(Boolean).length
  const totalCount = Object.keys(enabledSections).length

  const getCategoryColor = (category: 'essential' | 'standard' | 'optional') => {
    switch (category) {
      case 'essential':
        return { bg: 'from-red-600/20 to-rose-600/20', border: 'border-red-700/30', text: 'text-red-300', badge: 'bg-red-900/50' }
      case 'standard':
        return { bg: 'from-cyan-600/20 to-blue-600/20', border: 'border-cyan-700/30', text: 'text-cyan-300', badge: 'bg-cyan-900/50' }
      case 'optional':
        return { bg: 'from-amber-600/20 to-yellow-600/20', border: 'border-amber-700/30', text: 'text-amber-300', badge: 'bg-amber-900/50' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Customize Your Sections
          </h3>
        </div>
        <p className="text-sm text-slate-400">Choose which sections to include in your resume</p>
      </div>

      {/* Section Counter */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-cyan-400">{enabledCount}</div>
          <div className="text-sm text-slate-400">sections enabled</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-300">{totalCount}</div>
          <div className="text-sm text-slate-400">available sections</div>
        </div>
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">{Math.round((enabledCount / totalCount) * 100)}%</span>
        </div>
      </div>

      {/* Sections by Category */}
      <div className="space-y-4">
        {(['essential', 'standard', 'optional'] as const).map((category) => {
          const colors = getCategoryColor(category)
          const sections = sectionsByCategory[category]
          const categoryEnabled = sections.some(
            (s) => enabledSections[s.id as keyof typeof enabledSections]
          )

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border bg-gradient-to-br ${colors.bg} ${colors.border}`}
            >
              {/* Category Header */}
              <motion.button
                onClick={() =>
                  setExpandedCategory(expandedCategory === category ? undefined : category)
                }
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-lg ${colors.badge} ${colors.text} font-semibold text-xs uppercase tracking-wider`}
                  >
                    {category}
                  </div>
                  <span className="text-slate-200 font-semibold">{sections.length} sections</span>
                </div>
                <motion.div
                  animate={{ rotate: expandedCategory === category ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={20} className={colors.text} />
                </motion.div>
              </motion.button>

              {/* Category Sections */}
              <AnimatePresence>
                {expandedCategory === category && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-700/30 divide-y divide-slate-700/30"
                  >
                    {sections.map((section, idx) => {
                      const isEnabled = enabledSections[section.id as keyof typeof enabledSections]

                      return (
                        <motion.div
                          key={section.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="px-5 py-4 flex items-start gap-4 hover:bg-slate-800/20 transition-colors group"
                        >
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                              isEnabled
                                ? 'bg-gradient-to-br ' + colors.bg + ' text-cyan-300'
                                : 'bg-slate-800/50 text-slate-500'
                            }`}
                          >
                            {section.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`font-semibold ${
                                  isEnabled ? 'text-slate-100' : 'text-slate-400'
                                }`}
                              >
                                {section.name}
                              </h4>
                              {category === 'essential' && (
                                <span className="px-1.5 py-0.5 bg-red-900/40 text-red-300 text-xs rounded border border-red-700/50">
                                  Essential
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-xs mt-1 ${
                                isEnabled ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              {section.description}
                            </p>
                          </div>

                          {/* Toggle */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              onSectionToggle(
                                section.id,
                                !enabledSections[section.id as keyof typeof enabledSections]
                              )
                            }
                            className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                              isEnabled
                                ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={isEnabled ? 'on' : 'off'}
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 90 }}
                                transition={{ duration: 0.2 }}
                              >
                                {isEnabled ? <Eye size={20} /> : <EyeOff size={20} />}
                              </motion.div>
                            </AnimatePresence>
                          </motion.button>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* AI Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-xl p-5"
      >
        <div className="flex items-start gap-3">
          <Wand2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-purple-300 mb-2">💡 AI Recommendation</h5>
            <p className="text-sm text-purple-200">
              For maximum ATS compatibility and recruiter engagement, we recommend enabling all <strong>Essential</strong> sections
              and at least one <strong>Standard</strong> section. Customize based on your career stage and industry.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Section Tips */}
      <div className="bg-slate-900/30 border border-slate-700/30 rounded-xl p-4 space-y-3">
        <h5 className="font-semibold text-slate-300 text-sm flex items-center gap-2">
          <FileText size={16} className="text-cyan-400" />
          Section Tips
        </h5>
        <ul className="text-xs text-slate-400 space-y-2">
          <li className="flex gap-2">
            <span className="text-cyan-400 font-bold flex-shrink-0">✓</span>
            <span>Keep essential sections visible for all roles</span>
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400 font-bold flex-shrink-0">✓</span>
            <span>Add certifications for career-specific credentials</span>
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400 font-bold flex-shrink-0">✓</span>
            <span>Include languages if applying internationally</span>
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400 font-bold flex-shrink-0">✓</span>
            <span>Reorder sections based on what's most relevant</span>
          </li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            Object.keys(enabledSections).forEach((section) => {
              if (SECTION_CONFIGS[section].category !== 'essential') {
                onSectionToggle(section, false)
              }
            })
          }}
          className="flex-1 px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors"
        >
          Show Essentials Only
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            Object.keys(enabledSections).forEach((section) => {
              onSectionToggle(section, true)
            })
          }}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium text-sm hover:from-cyan-700 hover:to-blue-700 transition-colors"
        >
          Enable All Sections
        </motion.button>
      </div>
    </div>
  )
}
