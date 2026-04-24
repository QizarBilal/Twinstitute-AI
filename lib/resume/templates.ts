/**
 * Resume Template Configurations
 * Defines 5 ATS-friendly resume templates with specific styling
 */

import { TemplateConfig } from '@/types/resume'

export const RESUME_TEMPLATES: Record<string, TemplateConfig> = {
  'modern-ats': {
    id: 'modern-ats',
    name: 'Modern ATS',
    description: 'Clean, ATS-optimized template focusing on content clarity and parser compatibility',
    atsOptimized: true,
    isCreative: false,
    sections: {
      contact: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      capabilities: true,
      projects: true,
      certifications: true,
      languages: true,
    },
    colors: {
      primary: '#3B82F6',
      accent: '#1E40AF',
      text: '#1F2937',
      background: '#FFFFFF',
    },
    layout: 'single-column',
  },

  'professional-classic': {
    id: 'professional-classic',
    name: 'Professional Classic',
    description: 'Traditional corporate resume format with proven effectiveness',
    atsOptimized: true,
    isCreative: false,
    sections: {
      contact: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      capabilities: false,
      projects: true,
      certifications: true,
      languages: true,
    },
    colors: {
      primary: '#1F2937',
      accent: '#374151',
      text: '#111827',
      background: '#FFFFFF',
    },
    layout: 'single-column',
  },

  'creative-tech': {
    id: 'creative-tech',
    name: 'Creative Tech',
    description: 'Modern design emphasizing technical achievements with visual hierarchy',
    atsOptimized: false,
    isCreative: true,
    sections: {
      contact: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      capabilities: true,
      projects: true,
      certifications: true,
      languages: false,
    },
    colors: {
      primary: '#00D9FF',
      accent: '#3B82F6',
      text: '#1F2937',
      background: '#F9FAFB',
    },
    layout: 'two-column',
  },

  'academic': {
    id: 'academic',
    name: 'Academic',
    description: 'Education-focused format highlighting formation and learning achievements',
    atsOptimized: true,
    isCreative: false,
    sections: {
      contact: true,
      summary: true,
      education: true,
      experience: true,
      capabilities: true,
      projects: true,
      skills: true,
      certifications: true,
      languages: true,
    },
    colors: {
      primary: '#2563EB',
      accent: '#1E40AF',
      text: '#1F2937',
      background: '#FFFFFF',
    },
    layout: 'single-column',
  },

  'startup': {
    id: 'startup',
    name: 'Startup',
    description: 'Concise achievement-focused format perfect for fast-moving environments',
    atsOptimized: true,
    isCreative: false,
    sections: {
      contact: true,
      summary: true,
      experience: true,
      projects: true,
      skills: true,
      capabilities: true,
      education: true,
      certifications: false,
      languages: false,
    },
    colors: {
      primary: '#10B981',
      accent: '#059669',
      text: '#1F2937',
      background: '#FFFFFF',
    },
    layout: 'single-column',
  },

  'tech-modern': {
    id: 'tech-modern',
    name: 'Tech Modern',
    description: 'Two-column design with integrated skills sidebar, perfect for tech professionals',
    atsOptimized: true,
    isCreative: false,
    sections: {
      contact: true,
      summary: false,
      experience: true,
      education: true,
      skills: true,
      capabilities: false,
      projects: false,
      certifications: false,
      languages: false,
    },
    colors: {
      primary: '#00D9FF',
      accent: '#3B82F6',
      text: '#1F2937',
      background: '#FFFFFF',
    },
    layout: 'two-column',
  },
}

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): TemplateConfig | undefined {
  return RESUME_TEMPLATES[templateId]
}

/**
 * Get all templates
 */
export function getAllTemplates(): TemplateConfig[] {
  return Object.values(RESUME_TEMPLATES)
}

/**
 * Get ATS-optimized templates only
 */
export function getATSTemplates(): TemplateConfig[] {
  return Object.values(RESUME_TEMPLATES).filter((t) => t.atsOptimized)
}

/**
 * Get creative templates only
 */
export function getCreativeTemplates(): TemplateConfig[] {
  return Object.values(RESUME_TEMPLATES).filter((t) => t.isCreative)
}
