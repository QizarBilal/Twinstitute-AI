'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader, Wand2, Target, CheckCircle2, Brain, ArrowRight } from 'lucide-react'
import { ResumeData } from '@/types/resume'
import { useResumeAIEnhancement } from '@/hooks/useResumeAIEnhancement'

interface ResumeAIGeneratorPanelProps {
  resume: ResumeData
  onApplySummary: (summary: { headline: string; description: string; keyHighlights?: string[] }) => void
}

export function ResumeAIGeneratorPanel({ resume, onApplySummary }: ResumeAIGeneratorPanelProps) {
  const [targetRole, setTargetRole] = useState(resume.contact.title || '')
  const [targetPosition, setTargetPosition] = useState(resume.contact.title || '')
  const [yearsExperience, setYearsExperience] = useState(Math.max(resume.experience.length, 1))
  const [skillsText, setSkillsText] = useState(resume.skills.map(skill => skill.name).join(', '))
  const [generated, setGenerated] = useState<{ summary: string; keywords: string[] } | null>(null)
  const { generateContent, isLoading, error, keywords } = useResumeAIEnhancement()

  const handleGenerate = async () => {
    const result = await generateContent(
      targetRole || resume.contact.title || 'Professional',
      targetPosition || resume.contact.title || 'Target Role',
      yearsExperience,
      skillsText.split(',').map(skill => skill.trim()).filter(Boolean)
    )

    if (result) {
      setGenerated({ summary: result.summary, keywords: result.keywords })
    }
  }

  const applySummary = () => {
    if (!generated) return

    onApplySummary({
      headline: generated.summary.split('.')[0] || targetRole || resume.contact.title,
      description: generated.summary,
      keyHighlights: generated.keywords.slice(0, 4),
    })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-950/80 to-slate-900/70 p-5 shadow-xl shadow-black/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-3 border border-cyan-500/20">
              <Sparkles size={12} />
              AI Generator
            </div>
            <h4 className="text-lg font-semibold text-white">Draft a role-aligned summary</h4>
            <p className="text-sm text-slate-400 mt-1">Generate ATS-friendly summary content from your finalized role and skills.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Brain className="w-4 h-4 text-cyan-300" />
            Claude-first AI
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Input label="Target Role" value={targetRole} onChange={setTargetRole} placeholder="Senior Frontend Engineer" />
        <Input label="Target Position" value={targetPosition} onChange={setTargetPosition} placeholder="Lead Software Engineer" />
        <Input
          label="Years of Experience"
          value={String(yearsExperience)}
          onChange={value => setYearsExperience(Number(value) || 1)}
          placeholder="5"
          type="number"
        />
        <label className="space-y-1 block">
          <span className="text-xs font-medium text-slate-400">Skills</span>
          <textarea
            rows={4}
            value={skillsText}
            onChange={e => setSkillsText(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none resize-none placeholder:text-slate-600 focus:border-cyan-500/40"
            placeholder="React, TypeScript, Node.js, System Design"
          />
        </label>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-400 transition-colors disabled:opacity-60"
      >
        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        Generate Summary
      </button>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {(generated || keywords.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Generated Content</span>
            <span className="text-cyan-300">ATS-ready</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200 leading-6">
            {generated?.summary}
          </div>
          {generated?.keywords?.length ? (
            <div className="flex flex-wrap gap-2">
              {generated.keywords.map((keyword, index) => (
                <span key={`${keyword}-${index}`} className="rounded-full border border-cyan-500/15 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-200">
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={applySummary}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-200 hover:bg-cyan-500/15 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Apply to Summary
            </button>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
              <Target className="w-3.5 h-3.5" />
              Keywords: {keywords.length}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="space-y-1 block">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
      />
    </label>
  )
}
