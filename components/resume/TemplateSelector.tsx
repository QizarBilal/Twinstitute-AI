'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutTemplate, Check, Award, Code2,
  Briefcase, GraduationCap, Sparkles,
  ChevronRight, Zap, Building2, Scale
} from 'lucide-react'
import { ResumeTemplate } from '@/types/resume'

interface TemplateSelectorProps {
  selectedTemplate: ResumeTemplate
  onTemplateChange: (template: ResumeTemplate) => void
}

interface TemplateOption {
  id: ResumeTemplate
  name: string
  description: string
  category: 'modern' | 'traditional' | 'tech' | 'creative' | 'academic' | 'executive' | 'minimal' | 'compact'
  atsScore: number
  features: string[]
  icon: React.ReactNode
  color: { from: string; to: string }
  bestFor: string[]
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'modern-ats',
    name: 'Modern ATS Professional',
    description: 'Clean, modern design optimized for ATS parsing with excellent readability',
    category: 'modern',
    atsScore: 98,
    features: ['Clean layout', 'ATS optimized', 'Professional look', 'Easy to scan'],
    icon: <LayoutTemplate size={24} />,
    color: { from: 'from-cyan-600', to: 'to-blue-600' },
    bestFor: ['Tech roles', 'Startups', 'Fast-paced roles'],
  },
  {
    id: 'classic-corporate',
    name: 'Classic Corporate',
    description: 'Traditional professional format with the highest ATS compatibility rating',
    category: 'traditional',
    atsScore: 100,
    features: ['Maximum ATS compatibility', 'Timeless design', 'Corporate trusted', 'All systems'],
    icon: <Briefcase size={24} />,
    color: { from: 'from-slate-600', to: 'to-gray-600' },
    bestFor: ['Fortune 500s', 'Finance', 'Law firms', 'Government'],
  },
  {
    id: 'tech-focused',
    name: 'Tech Focused',
    description: 'Designed specifically for engineering and technology positions',
    category: 'tech',
    atsScore: 97,
    features: ['Code-friendly', 'Github integration', 'Tech keywords', 'Modern aesthetics'],
    icon: <Code2 size={24} />,
    color: { from: 'from-purple-600', to: 'to-pink-600' },
    bestFor: ['Software engineers', 'DevOps', 'Data science', 'AI/ML roles'],
  },
  {
    id: 'academic',
    name: 'Academic & Research',
    description: 'Optimized for academic positions and research roles',
    category: 'academic',
    atsScore: 98,
    features: ['Publication focused', 'Research emphasis', 'Academic format', 'Citation style'],
    icon: <GraduationCap size={24} />,
    color: { from: 'from-emerald-600', to: 'to-green-600' },
    bestFor: ['Academia', 'Research', 'PhD positions', 'Universities'],
  },
  {
    id: 'startup',
    name: 'Startup Culture',
    description: 'Modern and creative design for innovative and startup environments',
    category: 'creative',
    atsScore: 94,
    features: ['Creative layout', 'Trendy design', 'Personality', 'Stand out focus'],
    icon: <Sparkles size={24} />,
    color: { from: 'from-rose-600', to: 'to-red-600' },
    bestFor: ['Startups', 'Creative roles', 'Design positions', 'Innovation'],
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    description: 'Boardroom-grade layout for senior leadership and C-suite positions',
    category: 'executive',
    atsScore: 99,
    features: ['Leadership grade', 'Premium layout', 'Executive style', 'Highest impact'],
    icon: <Building2 size={24} />,
    color: { from: 'from-slate-900', to: 'to-blue-900' },
    bestFor: ['C-suite roles', 'Senior management', 'Board positions', 'Executive search'],
  },
  {
    id: 'minimal-edge',
    name: 'Minimal Edge',
    description: 'Noise-free minimalist design with maximum focus on content and clarity',
    category: 'minimal',
    atsScore: 99,
    features: ['Clean minimal', 'Maximum clarity', 'Content focused', 'Distraction-free'],
    icon: <Scale size={24} />,
    color: { from: 'from-gray-900', to: 'to-slate-700' },
    bestFor: ['Consultants', 'Professionals', 'Premium positions', 'Quality focus'],
  },
  {
    id: 'compact-professional',
    name: 'Compact Professional',
    description: 'One-page optimized format for concise, impactful resumes',
    category: 'compact',
    atsScore: 98,
    features: ['One-page fit', 'Concise format', 'High impact', 'Space efficient'],
    icon: <Zap size={24} />,
    color: { from: 'from-blue-600', to: 'to-indigo-600' },
    bestFor: ['Recent grads', 'Career changers', 'Quick apply', 'One-page focus'],
  },
  {
    id: 'technical-specialist',
    name: 'Technical Specialist',
    description: 'Two-column design with integrated skills sidebar for tech professionals',
    category: 'tech',
    atsScore: 99,
    features: ['Skills sidebar', 'Two-column', 'Tech focused', 'Code-friendly'],
    icon: <Code2 size={24} />,
    color: { from: 'from-violet-600', to: 'to-purple-600' },
    bestFor: ['Software engineers', 'Data scientists', 'Tech leads', 'Full-stack devs'],
  },
  {
    id: 'consulting-elite',
    name: 'Consulting Elite',
    description: 'Metrics-driven structured format emphasizing results and strategic achievements',
    category: 'executive',
    atsScore: 98,
    features: ['Metrics focused', 'Results driven', 'Strategic layout', 'Impact emphasis'],
    icon: <Award size={24} />,
    color: { from: 'from-red-600', to: 'to-rose-600' },
    bestFor: ['Consultants', 'Strategy roles', 'Results-driven', 'Executive search'],
  },
]

export function TemplateSelector({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<ResumeTemplate | null>(null)
  const [filterCategory, setFilterCategory] = useState<TemplateOption['category'] | 'all'>('all')

  const categories = ['all', ...Array.from(new Set(TEMPLATES.map(t => t.category)))] as const

  const filteredTemplates = filterCategory === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === filterCategory)

  const selectedTemplateData = TEMPLATES.find(t => t.id === selectedTemplate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <LayoutTemplate className="w-6 h-6 text-cyan-400" />
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Choose Your Template
          </h3>
        </div>
        <p className="text-sm text-slate-400">Select a professionally designed template optimized for ATS systems</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filterCategory === cat
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/50'
                : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600/50'
            }`}
          >
            {cat === 'all' ? '✨ All Templates' : `${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
          </motion.button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredTemplates.map((template, idx) => (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              onClick={() => onTemplateChange(template.id)}
              className={`relative p-5 rounded-xl border-2 text-left transition-all overflow-hidden group ${
                selectedTemplate === template.id
                  ? `border-cyan-500/50 bg-gradient-to-br ${template.color.from} ${template.color.to}/20 shadow-lg shadow-cyan-500/20`
                  : 'border-slate-700/50 bg-slate-900/30 hover:border-slate-600/50 hover:bg-slate-800/30'
              }`}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${template.color.from} ${template.color.to} transition-opacity`}
              />

              {/* Selected indicator */}
              {selectedTemplate === template.id && (
                <motion.div
                  layoutId="selectedBorder"
                  className="absolute inset-0 border-2 border-cyan-500/50 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              <div className="relative space-y-3">
                {/* Icon and Header */}
                <div className="flex items-start justify-between">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                      selectedTemplate === template.id
                        ? `bg-gradient-to-br ${template.color.from} ${template.color.to} text-white shadow-lg`
                        : 'bg-slate-800/50 text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {template.icon}
                  </div>

                  {selectedTemplate === template.id && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-5 h-5 text-cyan-400" />
                    </motion.div>
                  )}
                </div>

                {/* Title and Description */}
                <div>
                  <h4 className="font-semibold text-slate-100 text-base mb-1">{template.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{template.description}</p>
                </div>

                {/* ATS Score */}
                <div className="flex items-center gap-2 pt-2">
                  <Award size={16} className="text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">ATS Score: {template.atsScore}</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${template.atsScore}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    />
                  </div>
                </div>

                {/* Features - Show on hover or selected */}
                <AnimatePresence>
                  {(selectedTemplate === template.id || hoveredTemplate === template.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-2 border-t border-slate-700/50"
                    >
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature) => (
                          <span key={feature} className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Best for: </span>
                        {template.bestFor.join(', ')}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                {selectedTemplate === template.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between pt-2 border-t border-cyan-700/30 text-cyan-400 text-xs font-medium"
                  >
                    <span>Selected</span>
                    <ChevronRight size={14} />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Current Selection Info */}
      {selectedTemplateData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-700/50 rounded-xl p-5"
        >
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-cyan-300 mb-1">{selectedTemplateData.name}</h5>
              <p className="text-sm text-cyan-200">
                This template is optimized with an ATS score of {selectedTemplateData.atsScore}/100. Your resume will be automatically formatted to match this template as you edit your content.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tips */}
      <div className="bg-slate-900/30 border border-slate-700/30 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Sparkles size={16} className="text-amber-400 flex-shrink-0" />
          <span>
            <strong>Pro Tip:</strong> ATS score indicates how well each template parses through automated systems. Higher scores = better compatibility.
          </span>
        </div>
      </div>
    </div>
  )
}
