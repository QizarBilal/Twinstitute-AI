// Type definitions for Skill Genome system

export interface SkillNode {
  id: string
  label: string
  proficiency: number // 0-100
  category: 'core' | 'supporting' | 'advanced' | 'emerging'
  type: 'strong' | 'medium' | 'weak'
  xp?: number
  lastPracticed?: Date
  endorsements?: number
}

export interface SkillEdge {
  from: string
  to: string
  strength: number // 0-1, relationship strength
  type: 'prerequisite' | 'synergy' | 'related'
}

export interface SkillGap {
  id: string
  skill: string
  category: string
  priority: 'critical' | 'important' | 'optional'
  impact: 'high' | 'medium' | 'low'
  reason: string
  learningTime: number // in hours
  suggestedPath?: string[]
}

export interface SkillAnalysis {
  skillId: string
  name: string
  proficiency: number
  meaning: string
  workContext: string
  capabilityAnalysis: string
  dependencies: string[]
  dependents: string[]
  growthImpact: string
  strategicInsight: string
  relatedSkills: SkillNode[]
  nextSteps: string[]
}

export interface GenomeData {
  nodes: SkillNode[]
  edges: SkillEdge[]
  breadthScore: number // 0-100, number of skills
  depthScore: number // 0-100, average proficiency
  coreStrength: number // 0-100, strength of core skills
  gaps: SkillGap[]
  skillAnalyses: Record<string, SkillAnalysis>
  lastUpdated: Date
  targetRole?: string
  targetDomain?: string
}

export interface GenomeStats {
  totalSkills: number
  strongSkills: number
  mediumSkills: number
  weakSkills: number
  criticality: number
  learningVelocity: number
  readinessScore: number
}
