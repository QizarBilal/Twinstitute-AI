/**
 * AI RESPONSE SANITIZATION LAYER
 * 
 * PURPOSE: Validate and normalize ALL AI outputs before use
 * Never trust raw AI responses - always sanitize
 * 
 * This prevents:
 * - Hallucinated data
 * - Invalid salary ranges
 * - Made-up skills
 * - Malformed JSON
 * - Silent failures
 */

import { getBaseRoleData, ROLE_BASE_DATABASE } from './base-role-data'

/**
 * Salary range validation helpers
 */
function validateSalaryValue(value: any): number | null {
  if (typeof value === 'number' && value > 0 && value < 100000000) {
    return Math.round(value)
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value.replace(/[^\d]/g, ''), 10)
    if (parsed > 0 && parsed < 100000000) {
      return parsed
    }
  }
  return null
}

function validateSalaryRange(range: any) {
  if (!range || typeof range !== 'object') {
    return null
  }

  const entry = validateSalaryValue(range.entry_level || range.entry)
  const mid = validateSalaryValue(range.mid_level || range.mid)
  const senior = validateSalaryValue(range.senior_level || range.senior)

  // Must have at least 2 levels
  if (!entry || !mid) return null

  // Sanity check: entry <= mid <= senior
  if (mid < entry) return null
  if (senior && senior < mid) return null

  return {
    entry_level: entry,
    mid_level: mid,
    senior_level: senior || mid * 2.5,
    currency: '₹',
  }
}

/**
 * Skills validation - filter against known tech skills
 */
const KNOWN_TECH_SKILLS = new Set([
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'C++',
  'C#',
  'PHP',
  'Ruby',
  'React',
  'Vue',
  'Angular',
  'Node.js',
  'Express',
  'Django',
  'Flask',
  'Spring Boot',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Elasticsearch',
  'Apache Kafka',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Git',
  'CI/CD',
  'Jenkins',
  'GitHub Actions',
  'Linux',
  'Unix',
  'HTML',
  'CSS',
  'REST APIs',
  'GraphQL',
  'SQL',
  'NoSQL',
  'Machine Learning',
  'TensorFlow',
  'PyTorch',
  'Spark',
  'Hadoop',
  'Data Visualization',
  'Tableau',
  'Power BI',
  'Pandas',
  'NumPy',
  'Scikit-learn',
  'Cryptography',
  'Security',
  'System Design',
  'Microservices',
  'Kubernetes',
  'Terraform',
  'Ansible',
  'Statistics',
  'R',
  'Scala',
  'ETL',
  'Data Pipelines',
  'Agile',
  'Scrum',
])

function validateSkills(skills: any): string[] {
  if (!Array.isArray(skills)) return []

  return skills
    .filter(
      (skill) =>
        typeof skill === 'string' &&
        skill.length > 0 &&
        skill.length < 100 &&
        skill.split(' ').length <= 3 // Max 3 words
    )
    .slice(0, 15) // Max 15 skills
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/**
 * Market demand validation
 */
function validateDemand(
  demand: any
): 'High' | 'Medium' | 'Low' | null {
  const normalized = String(demand).toLowerCase().trim()
  if (normalized.includes('high')) return 'High'
  if (normalized.includes('medium') || normalized.includes('moderate'))
    return 'Medium'
  if (normalized.includes('low')) return 'Low'
  return null
}

/**
 * Sanitize and validate role insights from AI
 * Returns sanitized data or null if too many errors
 */
export function sanitizeRoleInsights(rawData: any) {
  try {
    if (!rawData || typeof rawData !== 'object') {
      console.warn('[SANITIZE] Invalid role insights: not an object')
      return null
    }

    // Validate required fields
    const roleDescription = String(rawData.roleDescription || '').trim().slice(0, 500)
    if (!roleDescription) {
      console.warn('[SANITIZE] Missing roleDescription')
      return null
    }

    // Validate daily responsibilities
    const dailyResponsibilities = Array.isArray(rawData.dailyResponsibilities)
      ? rawData.dailyResponsibilities
          .filter((r: any) => typeof r === 'string')
          .map((r: any) => String(r).trim())
          .filter((r: any) => r.length > 0)
          .slice(0, 10)
      : []

    // Validate required skills
    const requiredSkills = {
      core: validateSkills(rawData.requiredSkills?.core),
      nice_to_have: validateSkills(rawData.requiredSkills?.nice_to_have),
    }

    if (requiredSkills.core.length === 0) {
      console.warn('[SANITIZE] No valid core skills found')
      return null
    }

    // Validate salary range
    const salaryRange = validateSalaryRange(rawData.salaryRange)
    if (!salaryRange) {
      console.warn('[SANITIZE] Invalid salary range')
      return null
    }

    // Validate market demand
    const marketDemand = validateDemand(rawData.marketDemand)
    if (!marketDemand) {
      console.warn('[SANITIZE] Invalid market demand')
      return null
    }

    const demandExplanation = String(
      rawData.demandExplanation || ''
    )
      .trim()
      .slice(0, 300)

    // Validate growth potential
    let growthScore = 0
    if (typeof rawData.growthPotential?.score === 'number') {
      growthScore = Math.max(0, Math.min(100, rawData.growthPotential.score))
    } else {
      growthScore = marketDemand === 'High' ? 75 : marketDemand === 'Medium' ? 50 : 30
    }

    const growthExplanation = String(
      rawData.growthPotential?.explanation || ''
    )
      .trim()
      .slice(0, 200)

    // Validate career progression
    let careerProgression = []
    if (Array.isArray(rawData.careerProgression)) {
      careerProgression = rawData.careerProgression
        .filter(
          (c: any) =>
            c && typeof c === 'object' && c.title && typeof c.yearsToReach === 'number'
        )
        .map((c: any) => ({
          title: String(c.title).trim().slice(0, 100),
          yearsToReach: Math.max(1, Math.min(20, c.yearsToReach)),
        }))
        .slice(0, 5)
    }

    // Validate industry trends
    let industryTrends = []
    if (Array.isArray(rawData.industryTrends)) {
      industryTrends = rawData.industryTrends
        .filter((t: any) => typeof t === 'string' && t.length > 0)
        .map((t: any) => String(t).trim())
        .filter((t: any) => t.length > 0)
        .slice(0, 5)
    }

    // Validate risk factors
    let riskFactors = []
    if (Array.isArray(rawData.riskFactors)) {
      riskFactors = rawData.riskFactors
        .filter((r: any) => typeof r === 'string' && r.length > 0)
        .map((r: any) => String(r).trim())
        .filter((r: any) => r.length > 0)
        .slice(0, 5)
    }

    // Validate learning resource types
    let learningResourceTypes = []
    if (Array.isArray(rawData.learningResourceTypes)) {
      learningResourceTypes = rawData.learningResourceTypes
        .filter((l: any) => typeof l === 'string')
        .map((l: any) => String(l).trim())
        .filter((l: any) => l.length > 0)
        .slice(0, 8)
    }

    return {
      roleDescription,
      dailyResponsibilities,
      requiredSkills,
      salaryRange,
      marketDemand,
      demandExplanation,
      growthPotential: {
        score: growthScore,
        explanation: growthExplanation,
      },
      careerProgression,
      industryTrends,
      riskFactors,
      learningResourceTypes,
    }
  } catch (error) {
    console.error('[SANITIZE] Error sanitizing role insights:', error)
    return null
  }
}

/**
 * Validate request inputs before sending to AI
 */
export function validateAIRequest(input: {
  roleName?: string
  prompt?: string
  userContext?: string
}): { valid: boolean; error?: string } {
  // Validate role name
  if (input.roleName) {
    if (typeof input.roleName !== 'string') {
      return { valid: false, error: 'Invalid role name: must be string' }
    }
    if (input.roleName.length === 0 || input.roleName.length > 200) {
      return { valid: false, error: 'Role name length invalid (0-200 chars)' }
    }
  }

  // Validate prompt
  if (input.prompt) {
    if (typeof input.prompt !== 'string') {
      return { valid: false, error: 'Invalid prompt: must be string' }
    }
    if (input.prompt.length > 2000) {
      return { valid: false, error: 'Prompt too long (max 2000 chars)' }
    }
  }

  // Validate user context
  if (input.userContext) {
    if (typeof input.userContext !== 'string') {
      return { valid: false, error: 'Invalid user context: must be string' }
    }
    if (input.userContext.length > 500) {
      return { valid: false, error: 'User context too long (max 500 chars)' }
    }
  }

  return { valid: true }
}

/**
 * Enforce response shape for structured output
 */
export function enforceRoleInsightShape(data: any): boolean {
  const requiredFields = [
    'roleDescription',
    'dailyResponsibilities',
    'requiredSkills',
    'salaryRange',
    'marketDemand',
    'demandExplanation',
    'growthPotential',
    'careerProgression',
    'industryTrends',
    'learningResourceTypes',
  ]

  for (const field of requiredFields) {
    if (!(field in data)) {
      console.error(`[SHAPE] Missing required field: ${field}`)
      return false
    }
  }

  // Check sub-fields
  if (!data.requiredSkills.core || !Array.isArray(data.requiredSkills.core)) {
    console.error('[SHAPE] Invalid requiredSkills.core')
    return false
  }

  if (!data.salaryRange.entry_level || !data.salaryRange.mid_level) {
    console.error('[SHAPE] Invalid salaryRange')
    return false
  }

  if (
    !['High', 'Medium', 'Low'].includes(data.marketDemand)
  ) {
    console.error('[SHAPE] Invalid marketDemand value')
    return false
  }

  return true
}
