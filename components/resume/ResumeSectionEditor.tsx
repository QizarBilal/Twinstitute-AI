'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Plus, Trash2, Wand2, User, Briefcase, GraduationCap, Award,
  Code2, Globe, Check, Loader, Stars, BadgeInfo, GripVertical, ChevronDown,
} from 'lucide-react'
import { ResumeData, SkillLevel } from '@/types/resume'
import { useResumeAIEnhancement } from '@/hooks/useResumeAIEnhancement'
import { LanguagesEditor, AchievementsEditor } from './SectionEditorsLanguagesAchievements'

type EditorSection = 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'achievements'

interface ResumeSectionEditorProps {
  section: EditorSection
  resume: ResumeData
  onChange: (resume: ResumeData) => void
}

const EMPTY_SUMMARY = {
  headline: '',
  description: '',
  keyHighlights: [] as string[],
}

const SKILL_LEVELS: SkillLevel[] = ['verified', 'developing', 'weak']

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function createEmptyExperience() {
  return {
    id: createId('exp'),
    company: '',
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    achievements: [],
    skills: [],
  }
}

function createEmptyEducation() {
  return {
    id: createId('edu'),
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    gpa: undefined,
    description: '',
    achievements: [],
    relatedLabs: [],
  }
}

function createEmptyProject() {
  return {
    id: createId('proj'),
    title: '',
    description: '',
    skills: [],
    startDate: '',
    endDate: '',
    achievements: [],
    visibility: 'public' as const,
    isFromLab: false,
  }
}

function createEmptyCertification() {
  return {
    id: createId('cert'),
    name: '',
    issuer: '',
    credentialId: '',
    credentialUrl: '',
    issueDate: '',
    expirationDate: '',
  }
}

export function ResumeSectionEditor({ section, resume, onChange }: ResumeSectionEditorProps) {
  const [newSkill, setNewSkill] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [newLanguageLevel, setNewLanguageLevel] = useState<'Elementary' | 'Intermediate' | 'Advanced' | 'Fluent' | 'Native'>('Intermediate')
  const { enhanceContent, generateContent, isLoading, error, enhanced, suggestions, atsScore, keywords, clearState } = useResumeAIEnhancement()

  const sectionLabel = useMemo(() => {
    switch (section) {
      case 'contact': return 'Contact Information'
      case 'summary': return 'Professional Summary'
      case 'experience': return 'Work Experience'
      case 'education': return 'Education'
      case 'skills': return 'Skills'
      case 'projects': return 'Projects'
      case 'certifications': return 'Certifications'
      case 'languages': return 'Languages'
      case 'achievements': return 'Achievements'
    }
  }, [section])

  const sectionDescription = useMemo(() => {
    switch (section) {
      case 'contact': return 'Keep this accurate and ATS-friendly. This is the first thing recruiters see.'
      case 'summary': return 'Use one strong headline and a sharp summary aligned to the finalized role.'
      case 'experience': return 'Add measurable impact, responsibilities, and results for every role.'
      case 'education': return 'Include degrees, programs, and relevant academic outcomes.'
      case 'skills': return 'Balance core skills, tools, and role-specific strengths.'
      case 'projects': return 'Highlight proof of work, outcomes, and technologies used.'
      case 'certifications': return 'Add relevant credentials that support your target role.'
      case 'languages': return 'List languages only if they help your target role or market.'
      case 'achievements': return 'Showcase awards, recognitions, publications, speaking engagements and major accomplishments.'
    }
  }, [section])

  const updateResume = (next: ResumeData) => onChange({ ...next, lastUpdated: new Date().toISOString() })

  const enhanceSection = async () => {
    clearState()

    if (section === 'summary') {
      const years = Math.max(resume.experience.length, 1)
      const result = await generateContent(
        resume.contact.title || 'Professional',
        resume.contact.title || 'Target Role',
        years,
        resume.skills.map(skill => skill.name)
      )
      if (result) {
        updateResume({
          ...resume,
          summary: {
            ...(resume.summary ?? EMPTY_SUMMARY),
            headline: result.summary.split('.')[0] || result.summary.slice(0, 90),
            description: result.summary,
            keyHighlights: result.keywords.slice(0, 4),
          },
        })
      }
      return
    }

    if (section === 'experience' && resume.experience.length > 0) {
      const target = resume.experience[0]
      const result = await enhanceContent('experience', target.description || `${target.title} at ${target.company}`, {
        role: resume.contact.title,
        targetRole: resume.contact.title,
        yearsOfExperience: resume.experience.length,
      })
      if (result?.enhanced) {
        updateResume({
          ...resume,
          experience: resume.experience.map((item, idx) => idx === 0 ? { ...item, description: result.enhanced } : item),
        })
      }
      return
    }

    if (section === 'education' && resume.education.length > 0) {
      const target = resume.education[0]
      const result = await enhanceContent('education', target.description || `${target.degree} at ${target.institution}`, {
        role: resume.contact.title,
        targetRole: resume.contact.title,
      })
      if (result?.enhanced) {
        updateResume({
          ...resume,
          education: resume.education.map((item, idx) => idx === 0 ? { ...item, description: result.enhanced } : item),
        })
      }
      return
    }

    if (section === 'projects' && resume.projects.length > 0) {
      const target = resume.projects[0]
      const result = await enhanceContent('projects', target.description || target.title, {
        role: resume.contact.title,
        targetRole: resume.contact.title,
      })
      if (result?.enhanced) {
        updateResume({
          ...resume,
          projects: resume.projects.map((item, idx) => idx === 0 ? { ...item, description: result.enhanced } : item),
        })
      }
      return
    }

    if (section === 'skills') {
      const currentSkills = resume.skills.map((skill) => skill.name).join(', ')
      const result = await enhanceContent('skills', currentSkills, {
        role: resume.contact.title,
        targetRole: resume.contact.title,
      })

      if (result?.keywords?.length) {
        const existing = new Set(resume.skills.map((skill) => skill.name.toLowerCase()))
        const additions = result.keywords
          .filter((keyword) => keyword && !existing.has(keyword.toLowerCase()))
          .slice(0, 5)
          .map((keyword) => ({ name: keyword, level: 'developing' as const, strength: 0.55 }))

        if (additions.length > 0) {
          updateResume({
            ...resume,
            skills: [...resume.skills, ...additions],
          })
        }
      }
      return
    }

    if (section === 'contact') {
      const result = await enhanceContent(
        'summary',
        `${resume.contact.name} | ${resume.contact.title}`,
        {
          role: resume.contact.title,
          targetRole: resume.contact.title,
        }
      )

      if (result?.keywords?.length) {
        const best = result.keywords.find((keyword) => keyword.length > 3)
        if (best && !resume.contact.title.toLowerCase().includes(best.toLowerCase())) {
          updateResume({
            ...resume,
            contact: {
              ...resume.contact,
              title: `${resume.contact.title} | ${best}`,
            },
          })
        }
      }
      return
    }

    if (section === 'certifications') {
      const content = resume.certifications.map((certification) => `${certification.name} by ${certification.issuer}`).join('; ')
      await enhanceContent('skills', content || 'Professional certifications', {
        role: resume.contact.title,
        targetRole: resume.contact.title,
      })
      return
    }

    if (section === 'languages') {
      const content = (resume.languages ?? []).map((lang) => `${lang.language} (${lang.proficiency})`).join(', ')
      await enhanceContent('skills', content || 'Professional communication languages', {
        role: resume.contact.title,
        targetRole: resume.contact.title,
      })
    }
  }

  const addExperience = () => updateResume({ ...resume, experience: [...resume.experience, createEmptyExperience()] })
  const addEducation = () => updateResume({ ...resume, education: [...resume.education, createEmptyEducation()] })
  const addProject = () => updateResume({ ...resume, projects: [...resume.projects, createEmptyProject()] })
  const addCertification = () => updateResume({ ...resume, certifications: [...resume.certifications, createEmptyCertification()] })
  const addLanguage = () => {
    if (!newLanguage.trim()) return
    updateResume({
      ...resume,
      languages: [...(resume.languages ?? []), { language: newLanguage.trim(), proficiency: newLanguageLevel }],
    })
    setNewLanguage('')
  }

  const isEmptySection =
    (section === 'experience' && resume.experience.length === 0) ||
    (section === 'education' && resume.education.length === 0) ||
    (section === 'projects' && resume.projects.length === 0) ||
    (section === 'certifications' && resume.certifications.length === 0) ||
    (section === 'languages' && (resume.languages?.length ?? 0) === 0) ||
    (section === 'achievements' && (resume.achievements?.length ?? 0) === 0)

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-950/80 to-slate-900/70 p-5 shadow-xl shadow-black/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-3 border border-cyan-500/20">
              <BadgeInfo size={12} />
              {sectionLabel}
            </div>
            <h4 className="text-lg font-semibold text-white">Edit {sectionLabel}</h4>
            <p className="text-sm text-slate-400 mt-1">{sectionDescription}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={enhanceSection}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/15 transition-colors text-sm font-medium disabled:opacity-60"
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              AI Assist
            </button>
            {(section === 'experience' || section === 'education' || section === 'projects') && (
              <button
                onClick={() => {
                  if (section === 'experience') addExperience()
                  if (section === 'education') addEducation()
                  if (section === 'projects') addProject()
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-slate-200 border border-white/10 hover:bg-white/8 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-950/25 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm text-blue-200 font-medium">
            <span>AI Suggestions</span>
            <span className="text-blue-300">ATS {atsScore}%</span>
          </div>
          <div className="space-y-2">
            {suggestions.slice(0, 4).map((item, index) => (
              <div key={index} className="flex gap-2 text-xs text-blue-100/90">
                <Check className="w-3.5 h-3.5 text-cyan-300 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {keywords.slice(0, 6).map((keyword, index) => (
                <span key={`${keyword}-${index}`} className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-200 text-[11px] border border-cyan-500/15">
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {section === 'contact' && (
        <div className="grid grid-cols-1 gap-3">
          {[
            ['name', 'Name'],
            ['title', 'Title'],
            ['email', 'Email'],
            ['phone', 'Phone'],
            ['location', 'Location'],
            ['linkedin', 'LinkedIn'],
            ['github', 'GitHub'],
            ['portfolio', 'Portfolio'],
          ].map(([key, label]) => (
            <label key={key} className="space-y-1">
              <span className="text-xs font-medium text-slate-400">{label}</span>
              <input
                value={(resume.contact as any)[key] ?? ''}
                onChange={e => updateResume({ ...resume, contact: { ...resume.contact, [key]: e.target.value } })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
              />
            </label>
          ))}
        </div>
      )}

      {section === 'summary' && (
        <div className="space-y-4">
          <label className="space-y-1 block">
            <span className="text-xs font-medium text-slate-400">Headline</span>
            <input
              value={resume.summary?.headline ?? ''}
              onChange={e => updateResume({ ...resume, summary: { ...(resume.summary ?? EMPTY_SUMMARY), headline: e.target.value } })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
              placeholder="Senior Software Engineer | AI and Platform Systems"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs font-medium text-slate-400">Summary</span>
            <textarea
              rows={7}
              value={resume.summary?.description ?? ''}
              onChange={e => updateResume({ ...resume, summary: { ...(resume.summary ?? EMPTY_SUMMARY), description: e.target.value } })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 resize-none focus:border-cyan-500/40"
              placeholder="Write a focused, ATS-friendly summary aligned to your target role."
            />
          </label>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
            <span>Use AI Assist to generate a role-aligned summary.</span>
            <Sparkles className="w-4 h-4 text-cyan-300" />
          </div>
        </div>
      )}

      {section === 'experience' && (
        <div className="space-y-4">
          {isEmptySection && (
            <button
              onClick={addExperience}
              className="w-full rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/5 px-4 py-8 text-center text-sm text-cyan-200 hover:bg-cyan-500/10 transition-colors"
            >
              Add your first experience
            </button>
          )}
          <AnimatePresence>
            {resume.experience.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-white/10 bg-white/4 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <GripVertical className="w-4 h-4 text-slate-500" />
                    <span>Experience {index + 1}</span>
                  </div>
                  <button
                    onClick={() => updateResume({ ...resume, experience: resume.experience.filter(e => e.id !== item.id) })}
                    className="text-slate-500 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="Title" value={item.title} onChange={v => updateItem('experience', item.id, { title: v })} />
                  <Field label="Company" value={item.company} onChange={v => updateItem('experience', item.id, { company: v })} />
                  <Field label="Location" value={item.location ?? ''} onChange={v => updateItem('experience', item.id, { location: v })} />
                  <Field label="Start Date" value={item.startDate} onChange={v => updateItem('experience', item.id, { startDate: v })} />
                  <Field label="End Date" value={item.endDate ?? ''} onChange={v => updateItem('experience', item.id, { endDate: v })} />
                  <label className="space-y-1 block">
                    <span className="text-xs font-medium text-slate-400">Current Role</span>
                    <button
                      onClick={() => updateItem('experience', item.id, { isCurrent: !item.isCurrent })}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm transition-colors ${item.isCurrent ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-300'}`}
                    >
                      {item.isCurrent ? 'Current position' : 'Mark as current'}
                    </button>
                  </label>
                </div>
                <Field label="Description" value={item.description} multiline onChange={v => updateItem('experience', item.id, { description: v })} />
                <ItemFooter
                  onAI={() => enhanceItem('experience', item.id, item.description || `${item.title} at ${item.company}`)}
                  onAddBullet={() => updateItem('experience', item.id, { achievements: [...item.achievements, ''] })}
                  label="Enhance description with AI"
                />
                {item.achievements.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-400">Achievements</div>
                    {item.achievements.map((achievement, achievementIndex) => (
                      <div key={achievementIndex} className="flex gap-2">
                        <input
                          value={achievement}
                          onChange={e => updateAchievement('experience', item.id, achievementIndex, e.target.value)}
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/40"
                          placeholder="Add a measurable achievement"
                        />
                        <button
                          onClick={() => removeAchievement('experience', item.id, achievementIndex)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 text-slate-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {section === 'education' && (
        <div className="space-y-4">
          {isEmptySection && (
            <button onClick={addEducation} className="w-full rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/5 px-4 py-8 text-center text-sm text-cyan-200 hover:bg-cyan-500/10 transition-colors">
              Add your education
            </button>
          )}
          <AnimatePresence>
            {resume.education.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl border border-white/10 bg-white/4 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Education {index + 1}</span>
                  <button onClick={() => updateResume({ ...resume, education: resume.education.filter(e => e.id !== item.id) })} className="text-slate-500 hover:text-red-300 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="Institution" value={item.institution} onChange={v => updateItem('education', item.id, { institution: v })} />
                  <Field label="Degree" value={item.degree} onChange={v => updateItem('education', item.id, { degree: v })} />
                  <Field label="Field" value={item.field} onChange={v => updateItem('education', item.id, { field: v })} />
                  <Field label="Start Date" value={item.startDate} onChange={v => updateItem('education', item.id, { startDate: v })} />
                  <Field label="End Date" value={item.endDate ?? ''} onChange={v => updateItem('education', item.id, { endDate: v })} />
                  <Field label="GPA" value={item.gpa?.toString() ?? ''} onChange={v => updateItem('education', item.id, { gpa: v ? Number(v) : undefined })} />
                </div>
                <Field label="Description" value={item.description ?? ''} multiline onChange={v => updateItem('education', item.id, { description: v })} />
                <ItemFooter onAI={() => enhanceItem('education', item.id, item.description || `${item.degree} at ${item.institution}`)} label="Enhance education entry" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {section === 'projects' && (
        <div className="space-y-4">
          {isEmptySection && (
            <button onClick={addProject} className="w-full rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/5 px-4 py-8 text-center text-sm text-cyan-200 hover:bg-cyan-500/10 transition-colors">
              Add your first project
            </button>
          )}
          <AnimatePresence>
            {resume.projects.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl border border-white/10 bg-white/4 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Project {index + 1}</span>
                  <button onClick={() => updateResume({ ...resume, projects: resume.projects.filter(p => p.id !== item.id) })} className="text-slate-500 hover:text-red-300 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Field label="Title" value={item.title} onChange={v => updateItem('projects', item.id, { title: v })} />
                <Field label="Description" value={item.description} multiline onChange={v => updateItem('projects', item.id, { description: v })} />
                <Field label="Skills (comma-separated)" value={item.skills.join(', ')} onChange={v => updateItem('projects', item.id, { skills: v.split(',').map(s => s.trim()).filter(Boolean) })} />
                <ItemFooter onAI={() => enhanceItem('projects', item.id, item.description || item.title)} label="Enhance project copy" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {section === 'skills' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/4 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Current Skills</span>
              <span className="text-xs text-slate-500">{resume.skills.length} total</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {resume.skills.map((skill, index) => (
                <div key={`${skill.name}-${index}`} className="rounded-xl border border-white/10 bg-slate-950/30 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      value={skill.name}
                      onChange={e => updateSkill(index, { name: e.target.value })}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-slate-100 outline-none"
                    />
                    <button onClick={() => updateResume({ ...resume, skills: resume.skills.filter((_, i) => i !== index) })} className="text-slate-500 hover:text-red-300 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={skill.level} onChange={e => updateSkill(index, { level: e.target.value as SkillLevel })} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-200 outline-none">
                      {SKILL_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                    <input type="range" min="0" max="1" step="0.05" value={skill.strength} onChange={e => updateSkill(index, { strength: Number(e.target.value) })} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill and press Enter"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600"
              />
              <button onClick={addSkill} className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 text-cyan-200 hover:bg-cyan-500/15">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {section === 'certifications' && (
        <div className="space-y-4">
          {isEmptySection && (
            <button onClick={addCertification} className="w-full rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/5 px-4 py-8 text-center text-sm text-cyan-200 hover:bg-cyan-500/10 transition-colors">
              Add a certification
            </button>
          )}
          <AnimatePresence>
            {resume.certifications.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl border border-white/10 bg-white/4 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Certification {index + 1}</span>
                  <button onClick={() => updateResume({ ...resume, certifications: resume.certifications.filter(c => c.id !== item.id) })} className="text-slate-500 hover:text-red-300 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Field label="Name" value={item.name} onChange={v => updateCertification(item.id, { name: v })} />
                <Field label="Issuer" value={item.issuer} onChange={v => updateCertification(item.id, { issuer: v })} />
                <Field label="Issue Date" value={item.issueDate} onChange={v => updateCertification(item.id, { issueDate: v })} />
                <Field label="Credential URL" value={item.credentialUrl ?? ''} onChange={v => updateCertification(item.id, { credentialUrl: v })} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {section === 'languages' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/4 p-4 space-y-4">
            {(resume.languages ?? []).map((item, index) => (
              <div key={`${item.language}-${index}`} className="grid grid-cols-[1fr_160px_auto] gap-2 items-center">
                <input
                  value={item.language}
                  onChange={e => updateLanguage(index, { language: e.target.value })}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none"
                />
                <select
                  value={item.proficiency}
                  onChange={e => updateLanguage(index, { proficiency: e.target.value as any })}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none"
                >
                  {['Elementary', 'Intermediate', 'Advanced', 'Fluent', 'Native'].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <button onClick={() => updateResume({ ...resume, languages: (resume.languages ?? []).filter((_, i) => i !== index) })} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_160px_auto] gap-2 items-center">
              <input value={newLanguage} onChange={e => setNewLanguage(e.target.value)} placeholder="Add language" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600" />
              <select value={newLanguageLevel} onChange={e => setNewLanguageLevel(e.target.value as any)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none">
                {['Elementary', 'Intermediate', 'Advanced', 'Fluent', 'Native'].map(option => (<option key={option} value={option}>{option}</option>))}
              </select>
              <button onClick={addLanguage} className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-cyan-200 hover:bg-cyan-500/15">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {section === 'achievements' && (
        <AchievementsEditor
          achievements={resume.achievements ?? []}
          onAddAchievement={achievement => updateResume({ ...resume, achievements: [...(resume.achievements ?? []), achievement] })}
          onUpdateAchievement={(id, achievement) => updateResume({ ...resume, achievements: (resume.achievements ?? []).map(a => a.id === id ? achievement : a) })}
          onDeleteAchievement={id => updateResume({ ...resume, achievements: (resume.achievements ?? []).filter(a => a.id !== id) })}
        />
      )}
    </div>
  )

  function updateItem(sectionName: 'experience' | 'education' | 'projects', id: string, patch: Record<string, any>) {
    if (sectionName === 'experience') {
      updateResume({ ...resume, experience: resume.experience.map(item => item.id === id ? { ...item, ...patch } : item) })
    }
    if (sectionName === 'education') {
      updateResume({ ...resume, education: resume.education.map(item => item.id === id ? { ...item, ...patch } : item) })
    }
    if (sectionName === 'projects') {
      updateResume({ ...resume, projects: resume.projects.map(item => item.id === id ? { ...item, ...patch } : item) })
    }
  }

  function updateAchievement(sectionName: 'experience' | 'education', id: string, achievementIndex: number, value: string) {
    if (sectionName === 'experience') {
      updateResume({
        ...resume,
        experience: resume.experience.map(item => item.id === id ? { ...item, achievements: item.achievements.map((achievement, idx) => idx === achievementIndex ? value : achievement) } : item),
      })
    }
    if (sectionName === 'education') {
      updateResume({
        ...resume,
        education: resume.education.map(item => item.id === id ? { ...item, achievements: (item.achievements ?? []).map((achievement, idx) => idx === achievementIndex ? value : achievement) } : item),
      })
    }
  }

  function removeAchievement(sectionName: 'experience' | 'education', id: string, achievementIndex: number) {
    if (sectionName === 'experience') {
      updateResume({
        ...resume,
        experience: resume.experience.map(item => item.id === id ? { ...item, achievements: item.achievements.filter((_, idx) => idx !== achievementIndex) } : item),
      })
    }
    if (sectionName === 'education') {
      updateResume({
        ...resume,
        education: resume.education.map(item => item.id === id ? { ...item, achievements: (item.achievements ?? []).filter((_, idx) => idx !== achievementIndex) } : item),
      })
    }
  }

  function updateSkill(index: number, patch: Partial<ResumeData['skills'][number]>) {
    updateResume({ ...resume, skills: resume.skills.map((item, idx) => idx === index ? { ...item, ...patch } : item) })
  }

  function addSkill() {
    if (!newSkill.trim()) return
    updateResume({ ...resume, skills: [...resume.skills, { name: newSkill.trim(), level: 'developing', strength: 0.55 }] })
    setNewSkill('')
  }

  function updateCertification(id: string, patch: Record<string, any>) {
    updateResume({ ...resume, certifications: resume.certifications.map(item => item.id === id ? { ...item, ...patch } : item) })
  }

  function updateLanguage(index: number, patch: Record<string, any>) {
    updateResume({
      ...resume,
      languages: (resume.languages ?? []).map((item, idx) => idx === index ? { ...item, ...patch } : item),
    })
  }

  async function enhanceItem(sectionName: 'experience' | 'education' | 'projects', id: string, currentContent: string) {
    const result = await enhanceContent(sectionName, currentContent, {
      role: resume.contact.title,
      targetRole: resume.contact.title,
      yearsOfExperience: resume.experience.length,
    })

    if (!result?.enhanced) return

    updateItem(sectionName, id, {
      description: result.enhanced,
      ...(sectionName === 'projects' ? { skills: Array.from(new Set([...(resume.projects.find(project => project.id === id)?.skills ?? []), ...result.keywords])) } : {}),
    })
  }
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return (
    <label className="space-y-1 block">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none resize-none placeholder:text-slate-600 focus:border-cyan-500/40"
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
        />
      )}
    </label>
  )
}

function ItemFooter({ onAI, onAddBullet, label }: { onAI: () => void; onAddBullet?: () => void; label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={onAI} className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-200 hover:bg-cyan-500/15 transition-colors">
        <Wand2 className="w-3.5 h-3.5" />
        {label}
      </button>
      {onAddBullet && (
        <button onClick={onAddBullet} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/8 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Add bullet
        </button>
      )}
    </div>
  )
}
