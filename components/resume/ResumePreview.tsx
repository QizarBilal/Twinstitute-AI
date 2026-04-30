'use client'

import React from 'react'
import { ResumeData, ResumeTemplate } from '@/types/resume'
import {
  Template1ModernATS,
  Template2ClassicCorporate,
  Template3TechFocused,
  Template4Academic,
  Template5Startup,
  Template6ExecutivePremium,
  Template7MinimalEdge,
  Template8CompactProfessional,
  Template9TechnicalSpecialist,
  Template10ConsultingElite,
} from './TemplateComponents'
import {
  Template11CreativeDesigner,
  Template12SalesProfessional,
  Template13Researcher,
  Template14CareerChanger,
  Template15StartupFounder,
} from './TemplateComponentsPart2'

interface ResumePreviewProps {
  resume: ResumeData
  template: ResumeTemplate
  enabledSections?: {
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
  pageSize?: 'a4' | 'letter'
}

const DEFAULT_ENABLED_SECTIONS = {
  contact: true,
  summary: true,
  experience: true,
  projects: true,
  skills: true,
  education: true,
  certifications: false,
  languages: false,
  achievements: false,
}

const PAGE_DIMENSIONS = {
  a4: { width: 794, height: 1122 },
  letter: { width: 850, height: 1100 },
}

export function ResumePreview({
  resume,
  template,
  enabledSections = DEFAULT_ENABLED_SECTIONS,
  pageSize = 'a4',
}: ResumePreviewProps) {
  const sections = { ...DEFAULT_ENABLED_SECTIONS, ...enabledSections }

  const templateMap: Record<ResumeTemplate, React.ComponentType<{ resume: ResumeData; enabledSections: typeof sections }>> = {
    'modern-ats': Template1ModernATS,
    'classic-corporate': Template2ClassicCorporate,
    'tech-focused': Template3TechFocused,
    'academic': Template4Academic,
    'startup': Template5Startup,
    'executive-premium': Template6ExecutivePremium,
    'minimal-edge': Template7MinimalEdge,
    'compact-professional': Template8CompactProfessional,
    'technical-specialist': Template9TechnicalSpecialist,
    'consulting-elite': Template10ConsultingElite,
    'creative-designer': Template11CreativeDesigner,
    'sales-professional': Template12SalesProfessional,
    'researcher': Template13Researcher,
    'career-changer': Template14CareerChanger,
    'startup-founder': Template15StartupFounder,
  }

  const SelectedTemplate = templateMap[template]

  if (!SelectedTemplate) {
    return <div className="p-8 text-red-500">Invalid template selected: {template}</div>
  }

  return (
    <div
      id="resume-preview"
      className="font-sans mx-auto"
      style={{
        width: `${PAGE_DIMENSIONS[pageSize].width}px`,
        minHeight: `${PAGE_DIMENSIONS[pageSize].height}px`,
        overflow: 'visible',
      }}
    >
      <SelectedTemplate resume={resume} enabledSections={sections} />
    </div>
  )
}
