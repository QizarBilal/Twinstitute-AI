'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader, AlertCircle, FileText, Zap, BarChart3, Download,
  Settings, ChevronRight, ChevronDown, Sparkles, Search,
  X, Plus, Minus, ZoomIn, ZoomOut, LayoutTemplate,
  Save, Eye, User, Briefcase, GraduationCap, Code2,
  Award, Target, PanelRight, Pencil, Check, RefreshCw,
  Globe, Mail, Phone, MapPin, Link, Github
} from 'lucide-react'
import { ResumeData, ResumeTemplate, ATSScanResult, SkillsAnalysisResult, ExportFormat } from '@/types/resume'
import { ResumePreview } from '@/components/resume/ResumePreview'
import { ATSScannerUI } from '@/components/resume/ATSScannerUI'
import { SkillsAnalyzerUI } from '@/components/resume/SkillsAnalyzerUI'
import { ExportOptions } from '@/components/resume/ExportOptions'
import { JDComparisonUI } from '@/components/resume/JDComparisonUI'

type ToolPanel = 'none' | 'ai-generate' | 'ats-scan' | 'skills-match' | 'jd-compare' | 'insights' | 'export'
type EditSection = 'none' | 'contact' | 'summary' | 'experience' | 'projects' | 'skills' | 'education'

const TEMPLATES: { id: ResumeTemplate; name: string; tag: string; color: string }[] = [
  { id: 'modern-ats', name: 'Modern ATS', tag: 'Recommended', color: '#06b6d4' },
  { id: 'professional-classic', name: 'Professional', tag: 'Corporate', color: '#6366f1' },
  { id: 'creative-tech', name: 'Creative Tech', tag: 'Design', color: '#f59e0b' },
  { id: 'academic', name: 'Academic', tag: 'Research', color: '#10b981' },
  { id: 'startup', name: 'Startup', tag: 'Minimal', color: '#ec4899' },
]

export default function ResumePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('modern-ats')
  const [activeToolPanel, setActiveToolPanel] = useState<ToolPanel>('none')
  const [activeEditSection, setActiveEditSection] = useState<EditSection>('none')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [zoom, setZoom] = useState(85)
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)

  // ATS / Skills state
  const [isATSScanning, setIsATSScanning] = useState(false)
  const [atsScanResult, setAtsScanResult] = useState<ATSScanResult | null>(null)
  const [isSkillsAnalyzing, setIsSkillsAnalyzing] = useState(false)
  const [skillsAnalysisResult, setSkillsAnalysisResult] = useState<SkillsAnalysisResult | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Resume title
  const [resumeTitle, setResumeTitle] = useState('My Professional Resume')
  const [editingTitle, setEditingTitle] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const atsScore = atsScanResult?.score ?? 78

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/resume/fetch-data')
        const data = await response.json()
        if (!data.success) throw new Error(data.error || 'Failed to fetch resume data')
        const resumeData: ResumeData = {
          userId: 'current-user',
          templateId: 'modern-ats',
          contact: data.data.contact,
          skills: data.data.skills || [],
          capabilities: data.data.capabilities || [],
          projects: data.data.projects || [],
          experience: data.data.experience || [],
          education: data.data.education || [],
          certifications: [],
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }
        setResume(resumeData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resume data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchResumeData()
  }, [])

  const handleATSScan = async () => {
    if (!resume) return
    try {
      setIsATSScanning(true)
      const resumeText = generateResumeText(resume)
      const response = await fetch('/api/resume/ats-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      })
      const data = await response.json()
      if (data.success) setAtsScanResult(data.data)
    } catch (err) {
      console.error('ATS scan error:', err)
    } finally {
      setIsATSScanning(false)
    }
  }

  const handleSkillsAnalysis = async () => {
    if (!resume || resume.skills.length === 0) return
    try {
      setIsSkillsAnalyzing(true)
      const response = await fetch('/api/resume/analyze-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: resume.skills, targetRole: resume.contact.title }),
      })
      const data = await response.json()
      if (data.success) setSkillsAnalysisResult(data.data)
    } catch (err) {
      console.error('Skills analysis error:', err)
    } finally {
      setIsSkillsAnalyzing(false)
    }
  }

  const handleExport = async (format: ExportFormat) => {
    if (!resume) return
    try {
      setIsExporting(true)
      const response = await fetch('/api/resume/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, format, filename: `${resume.contact.name}_Resume` }),
      })
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const ext = format === 'pdf-styled' || format === 'pdf-plain' ? '.pdf' : format === 'docx' ? '.docx' : format === 'txt' ? '.txt' : '.json'
      a.download = `${resume.contact.name}_Resume${ext}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setIsSaving(false)
    setSavedOk(true)
    setTimeout(() => setSavedOk(false), 2200)
  }

  const toggleToolPanel = (panel: ToolPanel) => {
    setActiveToolPanel(prev => prev === panel ? 'none' : panel)
    setActiveEditSection('none')
  }

  const openEditSection = (section: EditSection) => {
    setActiveEditSection(prev => prev === section ? 'none' : section)
    setActiveToolPanel('none')
  }

  const scoreColor = atsScore >= 80 ? '#22c55e' : atsScore >= 60 ? '#f59e0b' : '#ef4444'

  // ─── Loading state ───────────────────────────────────────────
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #040810 0%, #0f172a 50%, #000 100%)' }}
      >
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" />
            <FileText className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto" />
          </div>
          <p className="text-slate-400 text-sm">Preparing your workspace…</p>
        </div>
      </motion.div>
    )
  }

  if (error || !resume) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen w-full flex items-center justify-center p-8"
        style={{ background: 'linear-gradient(135deg, #040810 0%, #0f172a 50%, #000 100%)' }}
      >
        <div className="max-w-md w-full bg-red-950/30 border border-red-700/40 rounded-2xl p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-red-300">Unable to Load Resume</h2>
          <p className="text-red-200/70 text-sm">{error || 'Failed to load resume data'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </motion.div>
    )
  }

  // ─── Main workspace ──────────────────────────────────────────
  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #040810 0%, #0a1628 40%, #000 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full opacity-8 blur-3xl" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
      </div>

      {/* ── TOP BAR ──────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-40 flex items-center gap-3 px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(9,18,40,0.85)', backdropFilter: 'blur(20px)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)' }}>
            <FileText className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Resume title */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {editingTitle ? (
            <input
              ref={titleRef}
              value={resumeTitle}
              onChange={e => setResumeTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
              autoFocus
              className="bg-white/5 border border-white/20 rounded-md px-3 py-1 text-sm text-white outline-none focus:border-cyan-500/60 max-w-xs"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-white group"
            >
              {resumeTitle}
              <Pencil className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </button>
          )}
        </div>

        {/* Template selector pill */}
        <button
          onClick={() => setShowTemplateModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:border-white/20"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">
            {TEMPLATES.find(t => t.id === selectedTemplate)?.name ?? 'Template'}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </button>

        {/* ATS Score badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:scale-105"
          style={{ background: `${scoreColor}15`, border: `1px solid ${scoreColor}40` }}
          onClick={() => toggleToolPanel('ats-scan')}
          title="Open ATS Scanner"
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: scoreColor }} />
          <span style={{ color: scoreColor }}>ATS {atsScore}%</span>
        </div>

        <div className="h-5 w-px bg-white/10 mx-1" />

        {/* Action buttons */}
        <button
          onClick={() => toggleToolPanel('ai-generate')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,182,212,0.15))', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Enhance
        </button>

        <button
          onClick={() => toggleToolPanel('export')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)', color: '#fff' }}
        >
          {isSaving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : savedOk ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {savedOk ? 'Saved!' : 'Save'}
        </button>
      </motion.header>

      {/* ── BODY (left panel + canvas + right panel) ─────────── */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* ── LEFT PANEL ──────────────────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-[270px] shrink-0 flex flex-col border-r overflow-y-auto"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(9,18,40,0.6)', backdropFilter: 'blur(16px)' }}
        >
          {/* Resume Sections */}
          <div className="p-4">
            <SectionHeader label="Resume Sections" />
            <nav className="space-y-1 mt-2">
              {[
                { id: 'contact' as EditSection, icon: User, label: 'Contact', count: resume.contact.name ? 1 : 0 },
                { id: 'summary' as EditSection, icon: FileText, label: 'Summary', count: resume.summary ? 1 : 0 },
                { id: 'experience' as EditSection, icon: Briefcase, label: 'Experience', count: resume.experience.length },
                { id: 'projects' as EditSection, icon: Code2, label: 'Projects', count: resume.projects.length },
                { id: 'skills' as EditSection, icon: Award, label: 'Skills', count: resume.skills.length },
                { id: 'education' as EditSection, icon: GraduationCap, label: 'Education', count: resume.education.length },
              ].map(item => {
                const Icon = item.icon
                const isActive = activeEditSection === item.id
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => openEditSection(item.id)}
                    whileHover={{ x: 2 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{
                      background: isActive ? 'rgba(6,182,212,0.12)' : 'transparent',
                      border: isActive ? '1px solid rgba(6,182,212,0.3)' : '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: isActive ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.06)' }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: isActive ? '#06b6d4' : '#94a3b8' }} />
                    </div>
                    <span className="flex-1 text-sm font-medium" style={{ color: isActive ? '#e2e8f0' : '#94a3b8' }}>{item.label}</span>
                    {item.count > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(6,182,212,0.15)', color: '#67e8f9' }}>
                        {item.count}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  </motion.button>
                )
              })}
            </nav>
          </div>

          <div className="mx-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

          {/* AI Tools */}
          <div className="p-4">
            <SectionHeader label="AI Tools" />
            <nav className="space-y-1 mt-2">
              {[
                { id: 'ai-generate' as ToolPanel, icon: Sparkles, label: 'AI Generate', color: '#a5b4fc' },
                { id: 'ats-scan' as ToolPanel, icon: BarChart3, label: 'ATS Scan', color: '#34d399' },
                { id: 'skills-match' as ToolPanel, icon: Target, label: 'Skills Match', color: '#fbbf24' },
                { id: 'jd-compare' as ToolPanel, icon: Search, label: 'JD Compare', color: '#f472b6' },
              ].map(item => {
                const Icon = item.icon
                const isActive = activeToolPanel === item.id
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => toggleToolPanel(item.id)}
                    whileHover={{ x: 2 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{
                      background: isActive ? `${item.color}15` : 'transparent',
                      border: isActive ? `1px solid ${item.color}35` : '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: isActive ? `${item.color}25` : 'rgba(255,255,255,0.06)' }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: isActive ? item.color : '#94a3b8' }} />
                    </div>
                    <span className="flex-1 text-sm font-medium" style={{ color: isActive ? '#e2e8f0' : '#94a3b8' }}>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  </motion.button>
                )
              })}
            </nav>
          </div>

          <div className="mx-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

          {/* Insights */}
          <div className="p-4">
            <SectionHeader label="Insights" />
            <div className="mt-3 space-y-3">
              {/* ATS score ring */}
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">ATS Score</span>
                  <span className="text-lg font-bold" style={{ color: scoreColor }}>{atsScore}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/8">
                  <motion.div
                    className="h-1.5 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}aa)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${atsScore}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {atsScore >= 80 ? 'Excellent — ATS Optimized' : atsScore >= 60 ? 'Good — Minor improvements needed' : 'Needs work — Run ATS scan'}
                </p>
              </div>

              {/* Missing sections */}
              {[!resume.summary && 'Professional Summary', resume.experience.length === 0 && 'Work Experience'].filter(Boolean).length > 0 && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-xs font-semibold text-amber-400 mb-1.5">Missing Sections</p>
                  {!resume.summary && <p className="text-xs text-amber-300/70">• Professional Summary</p>}
                  {resume.experience.length === 0 && <p className="text-xs text-amber-300/70">• Work Experience</p>}
                </div>
              )}

              {/* Quick tips */}
              <div className="rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p className="text-xs font-semibold text-indigo-400 mb-1.5">Quick Tips</p>
                <p className="text-xs text-indigo-300/70">• Use action verbs in experience</p>
                <p className="text-xs text-indigo-300/70">• Quantify achievements with metrics</p>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* ── MAIN CANVAS ─────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden" style={{ background: 'rgba(4,8,16,0.4)' }}>
          {/* Canvas toolbar */}
          <div
            className="flex items-center justify-between px-5 py-2.5 border-b shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(4,8,16,0.5)' }}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">Live Preview</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(6,182,212,0.12)', color: '#67e8f9' }}
              >
                {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(z => Math.max(50, z - 10))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-slate-400 w-10 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(130, z + 10))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                Change Template
              </button>
            </div>
          </div>

          {/* Scrollable preview area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center py-8 px-4">
            <motion.div
              animate={{ scale: zoom / 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ transformOrigin: 'top center', width: '794px' }}
              className="shrink-0"
            >
              <div
                className="bg-white rounded-xl shadow-2xl overflow-hidden"
                style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)' }}
              >
                <ResumePreview resume={resume} template={selectedTemplate} />
              </div>
            </motion.div>
          </div>
        </main>

        {/* ── RIGHT FLOATING PANEL (Edit Section) ─────────────── */}
        <AnimatePresence>
          {activeEditSection !== 'none' && (
            <motion.aside
              key="edit-panel"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              className="w-[340px] shrink-0 flex flex-col border-l overflow-y-auto"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: 'rgba(9,18,40,0.92)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div>
                  <h3 className="text-sm font-bold text-white capitalize">Edit {activeEditSection}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Changes reflect instantly in preview</p>
                </div>
                <button
                  onClick={() => setActiveEditSection('none')}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-5 overflow-y-auto">
                <EditPanelContent
                  section={activeEditSection}
                  resume={resume}
                  onChange={(updated) => setResume(updated)}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── RIGHT FLOATING PANEL (Tool) ─────────────────────── */}
        <AnimatePresence>
          {activeToolPanel !== 'none' && activeEditSection === 'none' && (
            <motion.aside
              key="tool-panel"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              className="w-[360px] shrink-0 flex flex-col border-l overflow-y-auto"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: 'rgba(9,18,40,0.92)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <h3 className="text-sm font-bold text-white">
                  {activeToolPanel === 'ai-generate' && 'AI Content Generator'}
                  {activeToolPanel === 'ats-scan' && 'ATS Compatibility Scan'}
                  {activeToolPanel === 'skills-match' && 'Skills Match Analysis'}
                  {activeToolPanel === 'jd-compare' && 'Job Description Compare'}
                  {activeToolPanel === 'export' && 'Export Resume'}
                </h3>
                <button
                  onClick={() => setActiveToolPanel('none')}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-5 overflow-y-auto">
                {activeToolPanel === 'ai-generate' && (
                  <FileUploadComponent onAnalyze={(data) => console.log('Analysis:', data)} />
                )}
                {activeToolPanel === 'ats-scan' && (
                  <ATSScannerUI
                    resume={resume}
                    isScanning={isATSScanning}
                    onScan={handleATSScan}
                    scanResult={atsScanResult || undefined}
                  />
                )}
                {activeToolPanel === 'skills-match' && (
                  <SkillsAnalyzerUI
                    skills={resume.skills}
                    targetRole={resume.contact.title}
                    isAnalyzing={isSkillsAnalyzing}
                    onAnalyze={handleSkillsAnalysis}
                    analysisResult={skillsAnalysisResult || undefined}
                  />
                )}
                {activeToolPanel === 'jd-compare' && (
                  <JDComparisonUI
                    resumeContent={generateResumeText(resume)}
                    targetRole={resume.contact.title}
                  />
                )}
                {activeToolPanel === 'export' && (
                  <ExportOptions
                    resume={resume}
                    onExport={handleExport}
                    isExporting={isExporting}
                  />
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── TEMPLATE PICKER MODAL ───────────────────────────── */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowTemplateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="w-full max-w-2xl rounded-2xl overflow-hidden"
              style={{ background: 'rgba(9,18,40,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div>
                  <h2 className="text-base font-bold text-white">Choose Template</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Select a design — preview updates instantly</p>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Template grid */}
              <div className="p-6 grid grid-cols-3 gap-4">
                {TEMPLATES.map(tmpl => {
                  const isSelected = selectedTemplate === tmpl.id
                  return (
                    <motion.button
                      key={tmpl.id}
                      onClick={() => {
                        setSelectedTemplate(tmpl.id)
                        setResume({ ...resume, templateId: tmpl.id })
                        setShowTemplateModal(false)
                      }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative rounded-xl overflow-hidden text-left"
                      style={{
                        border: isSelected ? `2px solid ${tmpl.color}` : '2px solid rgba(255,255,255,0.08)',
                        background: isSelected ? `${tmpl.color}10` : 'rgba(255,255,255,0.03)',
                        boxShadow: isSelected ? `0 0 20px ${tmpl.color}30` : 'none',
                      }}
                    >
                      {/* Template preview mock */}
                      <div className="h-32 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.97)' }}>
                        <TemplateMockPreview color={tmpl.color} id={tmpl.id} />
                        {isSelected && (
                          <div
                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: tmpl.color }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold text-white">{tmpl.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: tmpl.color }}>{tmpl.tag}</p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.6)' }}>
      {label}
    </p>
  )
}

/** Minimal mock SVG preview of each template style */
function TemplateMockPreview({ color, id }: { color: string; id: ResumeTemplate }) {
  const isAcademic = id === 'academic'
  const isCreative = id === 'creative-tech'
  const isStartup = id === 'startup'
  const isTwoCol = id === 'professional-classic'

  return (
    <svg viewBox="0 0 160 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {isTwoCol ? (
        <>
          <rect x="0" y="0" width="55" height="120" fill={`${color}18`} />
          <rect x="8" y="10" width="38" height="5" rx="2" fill={color} opacity="0.7" />
          <rect x="8" y="20" width="28" height="2.5" rx="1" fill="#aaa" opacity="0.6" />
          <rect x="8" y="25" width="32" height="2" rx="1" fill="#aaa" opacity="0.5" />
          <rect x="8" y="30" width="24" height="2" rx="1" fill="#aaa" opacity="0.5" />
          <rect x="8" y="42" width="36" height="3" rx="1" fill={color} opacity="0.4" />
          {[0,1,2,3].map(i => <rect key={i} x="8" y={48 + i * 7} width="34" height="5" rx="1.5" fill={`${color}30`} />)}
          <rect x="65" y="8" width="80" height="7" rx="2" fill={color} opacity="0.8" />
          <rect x="65" y="18" width="55" height="3" rx="1" fill="#bbb" opacity="0.5" />
          <rect x="65" y="30" width="80" height="2" rx="1" fill={color} opacity="0.3" />
          {[0,1,2].map(i => <rect key={i} x="65" y={36 + i * 12} width="78" height="9" rx="2" fill="#ddd" opacity="0.5" />)}
        </>
      ) : isAcademic ? (
        <>
          <rect x="20" y="6" width="120" height="6" rx="2" fill={color} opacity="0.8" />
          <rect x="35" y="15" width="90" height="3" rx="1" fill="#bbb" opacity="0.6" />
          <rect x="10" y="22" width="140" height="0.8" fill={color} opacity="0.5" />
          <rect x="10" y="28" width="60" height="3" rx="1" fill={color} opacity="0.5" />
          {[0,1,2].map(i => <rect key={i} x="10" y={34 + i * 10} width="140" height="7" rx="1.5" fill="#e5e5e5" opacity="0.8" />)}
          <rect x="10" y="68" width="60" height="3" rx="1" fill={color} opacity="0.5" />
          {[0,1].map(i => <rect key={i} x="10" y={74 + i * 10} width="140" height="7" rx="1.5" fill="#e5e5e5" opacity="0.6" />)}
        </>
      ) : isStartup ? (
        <>
          <rect x="0" y="0" width="160" height="30" fill={`${color}20`} />
          <rect x="8" y="7" width="80" height="7" rx="2" fill={color} opacity="0.8" />
          <rect x="8" y="17" width="55" height="3" rx="1" fill={color} opacity="0.5" />
          <rect x="8" y="36" width="30" height="2.5" rx="1" fill={color} opacity="0.6" />
          {[0,1,2,3].map(i => <rect key={i} x="8" y={42 + i * 10} width="144" height="7" rx="1.5" fill="#e5e5e5" opacity="0.7" />)}
          <rect x="8" y="86" width="30" height="2.5" rx="1" fill={color} opacity="0.6" />
          <rect x="8" y="92" width="140" height="4" rx="1" fill="#e5e5e5" opacity="0.6" />
        </>
      ) : (
        // modern-ats / creative-tech default
        <>
          <rect x="0" y="0" width="160" height="28" fill={`${color}22`} />
          <rect x="10" y="7" width="90" height="7" rx="2" fill={color} opacity="0.85" />
          <rect x="10" y="18" width="60" height="3" rx="1" fill={color} opacity="0.5" />
          <rect x="10" y="32" width="140" height="1.5" fill={color} opacity="0.4" />
          <rect x="10" y="38" width="50" height="3" rx="1" fill={color} opacity="0.6" />
          {[0,1,2].map(i => <rect key={i} x="10" y={44 + i * 12} width="140" height="9" rx="2" fill="#e8e8e8" opacity="0.8" />)}
          <rect x="10" y="84" width="50" height="3" rx="1" fill={color} opacity="0.6" />
          <div />
          <rect x="10" y="90" width="140" height="22" rx="2" fill="#eeeeee" opacity="0.7" />
        </>
      )}
    </svg>
  )
}

/** Contextual form panel rendered for each section */
function EditPanelContent({
  section,
  resume,
  onChange,
}: {
  section: EditSection
  resume: ResumeData
  onChange: (r: ResumeData) => void
}) {
  if (section === 'contact') {
    const c = resume.contact
    const field = (label: string, key: keyof typeof c, icon: React.ReactNode, placeholder?: string) => (
      <label className="block space-y-1" key={key}>
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="text-slate-500">{icon}</span>
          <input
            className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder-slate-600"
            style={{ caretColor: '#06b6d4' }}
            placeholder={placeholder || label}
            value={(c[key] as string) ?? ''}
            onChange={e => onChange({ ...resume, contact: { ...c, [key]: e.target.value } })}
          />
        </div>
      </label>
    )
    return (
      <div className="space-y-4">
        {field('Full Name', 'name', <User className="w-3.5 h-3.5" />, 'John Doe')}
        {field('Professional Title', 'title', <Briefcase className="w-3.5 h-3.5" />, 'Software Engineer')}
        {field('Email', 'email', <Mail className="w-3.5 h-3.5" />, 'you@example.com')}
        {field('Phone', 'phone', <Phone className="w-3.5 h-3.5" />, '+1 (555) 000-0000')}
        {field('Location', 'location', <MapPin className="w-3.5 h-3.5" />, 'New York, NY')}
        {field('LinkedIn', 'linkedin', <Link className="w-3.5 h-3.5" />, 'linkedin.com/in/...')}
        {field('GitHub', 'github', <Github className="w-3.5 h-3.5" />, 'github.com/...')}
        {field('Portfolio', 'portfolio', <Globe className="w-3.5 h-3.5" />, 'yoursite.com')}
      </div>
    )
  }

  if (section === 'summary') {
    const summary = resume.summary
    return (
      <div className="space-y-4">
        <label className="block space-y-1">
          <span className="text-xs text-slate-500 font-medium">Headline</span>
          <input
            className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#06b6d4' }}
            placeholder="e.g. Full-Stack Engineer with 5 years…"
            value={summary?.headline ?? ''}
            onChange={e => onChange({ ...resume, summary: { ...(summary ?? { headline: '', description: '' }), headline: e.target.value } })}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-slate-500 font-medium">Summary</span>
          <textarea
            rows={6}
            className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#06b6d4' }}
            placeholder="Write a compelling 3–5 sentence professional summary…"
            value={summary?.description ?? ''}
            onChange={e => onChange({ ...resume, summary: { ...(summary ?? { headline: '', description: '' }), description: e.target.value } })}
          />
        </label>
      </div>
    )
  }

  if (section === 'experience') {
    return (
      <div className="space-y-4">
        {resume.experience.length === 0 ? (
          <EmptyState icon={<Briefcase />} label="No experience added yet" />
        ) : (
          resume.experience.map((exp, idx) => (
            <div key={exp.id} className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">{exp.title || `Experience ${idx + 1}`}</span>
                <span className="text-xs text-slate-500">{exp.company}</span>
              </div>
              <EditInput
                label="Job Title"
                value={exp.title}
                onChange={v => {
                  const updated = [...resume.experience]
                  updated[idx] = { ...exp, title: v }
                  onChange({ ...resume, experience: updated })
                }}
              />
              <EditInput
                label="Company"
                value={exp.company}
                onChange={v => {
                  const updated = [...resume.experience]
                  updated[idx] = { ...exp, company: v }
                  onChange({ ...resume, experience: updated })
                }}
              />
              <EditInput
                label="Description"
                value={exp.description}
                textarea
                onChange={v => {
                  const updated = [...resume.experience]
                  updated[idx] = { ...exp, description: v }
                  onChange({ ...resume, experience: updated })
                }}
              />
            </div>
          ))
        )}
      </div>
    )
  }

  if (section === 'skills') {
    return (
      <div className="space-y-3">
        {resume.skills.length === 0 ? (
          <EmptyState icon={<Award />} label="No skills added yet" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#67e8f9' }}
              >
                {skill.name}
                <button
                  onClick={() => {
                    const updated = resume.skills.filter((_, i) => i !== idx)
                    onChange({ ...resume, skills: updated })
                  }}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <AddSkillInput resume={resume} onChange={onChange} />
      </div>
    )
  }

  if (section === 'education') {
    return (
      <div className="space-y-4">
        {resume.education.length === 0 ? (
          <EmptyState icon={<GraduationCap />} label="No education added yet" />
        ) : (
          resume.education.map((edu, idx) => (
            <div key={edu.id} className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <EditInput
                label="Degree"
                value={edu.degree}
                onChange={v => {
                  const updated = [...resume.education]
                  updated[idx] = { ...edu, degree: v }
                  onChange({ ...resume, education: updated })
                }}
              />
              <EditInput
                label="Institution"
                value={edu.institution}
                onChange={v => {
                  const updated = [...resume.education]
                  updated[idx] = { ...edu, institution: v }
                  onChange({ ...resume, education: updated })
                }}
              />
              <EditInput
                label="Field"
                value={edu.field}
                onChange={v => {
                  const updated = [...resume.education]
                  updated[idx] = { ...edu, field: v }
                  onChange({ ...resume, education: updated })
                }}
              />
            </div>
          ))
        )}
      </div>
    )
  }

  if (section === 'projects') {
    return (
      <div className="space-y-4">
        {resume.projects.length === 0 ? (
          <EmptyState icon={<Code2 />} label="No projects added yet" />
        ) : (
          resume.projects.map((proj, idx) => (
            <div key={proj.id} className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <EditInput
                label="Project Title"
                value={proj.title}
                onChange={v => {
                  const updated = [...resume.projects]
                  updated[idx] = { ...proj, title: v }
                  onChange({ ...resume, projects: updated })
                }}
              />
              <EditInput
                label="Description"
                value={proj.description}
                textarea
                onChange={v => {
                  const updated = [...resume.projects]
                  updated[idx] = { ...proj, description: v }
                  onChange({ ...resume, projects: updated })
                }}
              />
            </div>
          ))
        )}
      </div>
    )
  }

  return null
}

function EditInput({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  textarea?: boolean
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          className="w-full px-3 py-2 rounded-lg text-xs text-slate-200 outline-none resize-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#06b6d4' }}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full px-3 py-2 rounded-lg text-xs text-slate-200 outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#06b6d4' }}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </label>
  )
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {icon}
      </div>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

function AddSkillInput({ resume, onChange }: { resume: ResumeData; onChange: (r: ResumeData) => void }) {
  const [val, setVal] = useState('')
  const add = () => {
    const trimmed = val.trim()
    if (!trimmed) return
    onChange({
      ...resume,
      skills: [...resume.skills, { name: trimmed, level: 'developing', strength: 0.5 }],
    })
    setVal('')
  }
  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        className="flex-1 px-3 py-2 rounded-lg text-xs text-slate-200 outline-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#06b6d4' }}
        placeholder="Add skill…"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && add()}
      />
      <button
        onClick={add}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-all"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}

// Helper — resume to plaintext
function generateResumeText(resume: ResumeData): string {
  const lines: string[] = []
  lines.push(resume.contact.name, resume.contact.title, '')
  if (resume.summary) { lines.push(resume.summary.description, '') }
  if (resume.experience.length > 0) {
    lines.push('EXPERIENCE')
    resume.experience.forEach(exp => {
      lines.push(`${exp.title} at ${exp.company}`, exp.description)
      exp.achievements.forEach(a => lines.push(`• ${a}`))
      lines.push('')
    })
  }
  if (resume.skills.length > 0) {
    lines.push('SKILLS', resume.skills.map(s => s.name).join(', '), '')
  }
  return lines.join('\n')
}
