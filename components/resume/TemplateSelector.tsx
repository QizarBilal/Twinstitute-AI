'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Sparkles } from 'lucide-react'
import { TemplateConfig } from '@/types/resume'
import { getAllTemplates } from '@/lib/resume/templates'

interface TemplateSelectorProps {
  selectedTemplate: string
  onTemplateSelect: (templateId: string) => void
}

export function TemplateSelector({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) {
  const templates = getAllTemplates()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <motion.div
          key={template.id}
          whileHover={{ y: -4 }}
          onClick={() => onTemplateSelect(template.id)}
          className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
            selectedTemplate === template.id
              ? 'border-cyan-500 bg-slate-800/50 shadow-lg shadow-cyan-500/20'
              : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
          }`}
        >
          {/* Selected Indicator */}
          {selectedTemplate === template.id && (
            <div className="absolute top-3 right-3 bg-cyan-500 rounded-full p-1">
              <Check size={16} className="text-white" />
            </div>
          )}

          {/* Template Info */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-200 mb-2">{template.name}</h3>
            <p className="text-sm text-slate-400">{template.description}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {template.atsOptimized && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded-full border border-green-700/50">
                <Zap size={12} />
                ATS Optimized
              </span>
            )}
            {template.isCreative && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full border border-blue-700/50">
                <Sparkles size={12} />
                Creative
              </span>
            )}
          </div>

          {/* Layout & Details */}
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span>{template.layout === 'single-column' ? 'Single Column' : 'Two Column'}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(template.sections)
                .filter(([_, enabled]) => enabled)
                .slice(0, 4)
                .map(([section]) => (
                  <span key={section} className="px-2 py-1 bg-slate-800/50 rounded text-slate-300">
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </span>
                ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
