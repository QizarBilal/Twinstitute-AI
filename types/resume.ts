/**
 * Resume Builder Types & Interfaces
 * Comprehensive type system for dynamic resume generation
 */

export type ResumeTemplate = 
  | 'modern-ats' 
  | 'classic-corporate' 
  | 'tech-focused' 
  | 'academic' 
  | 'startup' 
  | 'executive-premium' 
  | 'minimal-edge' 
  | 'compact-professional' 
  | 'technical-specialist' 
  | 'consulting-elite'
  | 'creative-designer'
  | 'sales-professional'
  | 'researcher'
  | 'career-changer'
  | 'startup-founder'

export type SkillLevel = 'verified' | 'developing' | 'weak'

export type ExportFormat = 'pdf-styled' | 'pdf-plain' | 'docx' | 'txt' | 'json'

// User Contact Information
export interface ContactInfo {
  name: string
  title: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  portfolio?: string
  website?: string
}

// Professional Summary/Overview
export interface ProfessionalSummary {
  headline: string
  description: string
  keyHighlights?: string[]
}

// Work Experience
export interface WorkExperience {
  id: string
  company: string
  title: string
  location?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description: string
  achievements: string[]
  skills: string[]
  labId?: string // Reference to Twinstitute lab
  creditsEarned?: number
}

// Education & Formation
export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  gpa?: number
  description?: string
  achievements?: string[]
  relatedLabs?: string[]
}

// Skills with levels
export interface Skill {
  id?: string
  name: string
  level: SkillLevel
  strength: number // 0-1 (0.7+ = verified, 0.4-0.69 = developing, <0.4 = weak)
  yearsOfExperience?: number
  endorsements?: number
  category?: 'Core' | 'Technical' | 'Soft' | 'Tools'
}

// Proven Capabilities (from Twinstitute system)
export interface ProvenCapability {
  id: string
  name: string
  description: string
  level: 'Basic' | 'Intermediate' | 'Advanced'
  demoProject?: string
  creditsEarned: number
  proofArtifacts: string[]
  dateAchieved: string
  isVerified: boolean
}

// Projects & Achievements
export interface Project {
  id: string
  title: string
  description: string
  skills: string[]
  link?: string
  github?: string
  startDate: string
  endDate?: string
  impact?: string
  achievements: string[]
  visibility: 'public' | 'private'
  isFromLab: boolean
  labId?: string
}

// Certifications
export interface Certification {
  id: string
  name: string
  issuer: string
  credentialId?: string
  credentialUrl?: string
  issueDate: string
  expirationDate?: string
}

// Languages
export interface Language {
  id: string
  language: string
  proficiency: 'Elementary' | 'Intermediate' | 'Advanced' | 'Fluent' | 'Native'
}

// Achievements
export interface Achievement {
  id: string
  title: string
  description: string
  date: string
  category?: 'Award' | 'Recognition' | 'Publication' | 'Speaking' | 'Other'
}

// Complete Resume Data Structure
export interface ResumeData {
  id?: string
  userId: string
  templateId: ResumeTemplate
  contact: ContactInfo
  summary?: ProfessionalSummary
  experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  capabilities: ProvenCapability[]
  projects: Project[]
  certifications: Certification[]
  achievements: Achievement[]
  languages: Language[]
  customSections?: {
    title: string
    content: string
    order: number
  }[]
  lastUpdated: string
  createdAt: string
}

// Form State for editing
export interface ResumeFormState {
  activeSection: 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'capabilities' | 'projects' | 'certifications'
  editingId?: string
  isDirty: boolean
  errors: Record<string, string[]>
}

// ATS Scan Result
export interface ATSScanResult {
  score: number // 0-100
  timestamp: string
  jobDescription?: string
  missingKeywords: string[]
  foundKeywords: string[]
  suggestions: {
    priority: 'high' | 'medium' | 'low'
    suggestion: string
    section: string
  }[]
  formatting: {
    atsCompatible: boolean
    issues: string[]
    recommendations: string[]
  }
  readabilityScore: number // 0-100
  competencyMatch: {
    skill: string
    resumeLevel: SkillLevel
    jobRequiredLevel: string
    gap: 'exceed' | 'meet' | 'below'
  }[]
}

// Skills Analysis Result
export interface SkillsAnalysisResult {
  timestamp: string
  totalSkills: number
  byLevel: {
    verified: number
    developing: number
    weak: number
  }
  topSkills: Array<{
    name: string
    level: SkillLevel
    strength: number
  }>
  skillGaps: {
    category: string
    currentLevel: string
    recommendedLevel: string
    suggestions: string[]
  }[]
  industryBenchmark: {
    averageSkillsForRole: number
    yourSkillCount: number
    comparison: string
  }
  recommendations: string[]
}

// Export Options
export interface ExportOptions {
  format: ExportFormat
  filename: string
  includeContactInfo: boolean
  includePhotoIfAvailable: boolean
  pageSize: 'A4' | 'Letter'
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

// API Response Types
export interface ResumeAPIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface FetchResumeDataResponse {
  contact: ContactInfo
  skills: Skill[]
  capabilities: ProvenCapability[]
  projects: Project[]
  experience: WorkExperience[]
  education: Education[]
  certifications?: Certification[]
}

// Template Configuration
export interface TemplateConfig {
  id: ResumeTemplate
  name: string
  description: string
  atsOptimized: boolean
  isCreative: boolean
  sections: {
    contact: boolean
    summary: boolean
    experience: boolean
    education: boolean
    skills: boolean
    capabilities: boolean
    projects: boolean
    certifications: boolean
    languages: boolean
  }
  colors: {
    primary: string
    accent: string
    text: string
    background: string
  }
  layout: 'single-column' | 'two-column'
  previewImage?: string
}

// Resume Meta (for listing/management)
export interface ResumeMeta {
  id: string
  userId: string
  name: string
  template: ResumeTemplate
  lastUpdated: string
  createdAt: string
  isPrimary: boolean
  exportCount: number
}
