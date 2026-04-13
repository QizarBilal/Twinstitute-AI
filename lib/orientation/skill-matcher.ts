/**
 * SKILL MATCHER
 * Analyzes user skills against role requirements
 * Calculates skill gaps and learning paths
 */

import { type Role } from './role-database'

export interface SkillMatch {
  matchPercentage: number
  matchedSkills: string[]
  missingSkills: string[]
  gapAnalysis: GapAnalysis[]
  readinessLevel: 'expert' | 'ready' | 'learning' | 'beginner'
  estimatedTimeToReady: string
}

export interface GapAnalysis {
  skillName: string
  required: 'basic' | 'intermediate' | 'advanced'
  userLevel: 'none' | 'basic' | 'intermediate' | 'advanced'
  priority: 'critical' | 'high' | 'medium' | 'low'
}

/**
 * Calculate skill match between user skills and role requirements
 */
export function calculateSkillMatch(
  role: Role,
  userSkills: Array<{ name: string; level: 'basic' | 'intermediate' | 'advanced' }>
): SkillMatch {
  // Normalize user skills map
  const userSkillMap = new Map<string, string>()
  userSkills.forEach(skill => {
    userSkillMap.set(skill.name.toLowerCase(), skill.level)
  })

  // Calculate matches
  const matchedSkills: string[] = []
  const gapAnalysis: GapAnalysis[] = []
  let matchCount = 0

  role.requiredSkills.forEach(requiredSkill => {
    const skillKey = requiredSkill.name.toLowerCase()
    const userLevel = userSkillMap.get(skillKey) || 'none'

    const gap: GapAnalysis = {
      skillName: requiredSkill.name,
      required: requiredSkill.level,
      userLevel: userLevel as any,
      priority: calculatePriority(requiredSkill.level, userLevel as string),
    }

    gapAnalysis.push(gap)

    // Check if skill is matched
    if (userLevel !== 'none' && isSkillLevelMatch(userLevel, requiredSkill.level)) {
      matchedSkills.push(requiredSkill.name)
      matchCount++
    }
  })

  const matchPercentage = (matchCount / role.requiredSkills.length) * 100

  return {
    matchPercentage: Math.round(matchPercentage),
    matchedSkills,
    missingSkills: gapAnalysis.filter(g => g.userLevel === 'none').map(g => g.skillName),
    gapAnalysis: gapAnalysis.sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority)),
    readinessLevel: getReadinessLevel(matchPercentage),
    estimatedTimeToReady: estimateTimeToReady(gapAnalysis),
  }
}

/**
 * Analyze skill gaps for a role
 */
export function analyzeSkillGap(
  role: Role,
  userSkills: Array<{ name: string; level: 'basic' | 'intermediate' | 'advanced' }>
): GapAnalysis[] {
  const match = calculateSkillMatch(role, userSkills)
  return match.gapAnalysis
}

/**
 * Suggest learning path for bridging skill gaps
 */
export function generateLearningPath(role: Role, gapAnalysis: GapAnalysis[]): LearningPlan[] {
  const criticalGaps = gapAnalysis.filter(g => g.priority === 'critical')
  const highGaps = gapAnalysis.filter(g => g.priority === 'high')
  const mediumGaps = gapAnalysis.filter(g => g.priority === 'medium')

  const plan: LearningPlan[] = []

  // Phase 1: Critical skills
  if (criticalGaps.length > 0) {
    plan.push({
      phase: 1,
      name: 'Foundation Phase',
      duration: '2-3 months',
      skills: criticalGaps.map(g => ({
        name: g.skillName,
        target: g.required,
        resources: getResourcesForSkill(g.skillName),
      })),
      milestones: ['Build basics', 'Practice fundamentals', 'Complete first project'],
    })
  }

  // Phase 2: High priority skills
  if (highGaps.length > 0) {
    plan.push({
      phase: 2,
      name: 'Core Development Phase',
      duration: '3-4 months',
      skills: highGaps.map(g => ({
        name: g.skillName,
        target: g.required,
        resources: getResourcesForSkill(g.skillName),
      })),
      milestones: ['Solve real problems', 'Build portfolio projects', 'Contribute to open source'],
    })
  }

  // Phase 3: Polish & optional skills
  if (mediumGaps.length > 0 || role.optionalSkills.length > 0) {
    plan.push({
      phase: 3,
      name: 'Specialization Phase',
      duration: '2-3 months',
      skills: [
        ...mediumGaps.map(g => ({
          name: g.skillName,
          target: g.required,
          resources: getResourcesForSkill(g.skillName),
        })),
        ...role.optionalSkills.slice(0, 3).map(skill => ({
          name: skill,
          target: 'intermediate' as const,
          resources: getResourcesForSkill(skill),
        })),
      ],
      milestones: ['Deep specialization', 'Advanced patterns', 'Ready for interviews'],
    })
  }

  return plan
}

export interface LearningPlan {
  phase: number
  name: string
  duration: string
  skills: Array<{
    name: string
    target: 'basic' | 'intermediate' | 'advanced'
    resources: string[]
  }>
  milestones: string[]
}

/**
 * HELPER FUNCTIONS
 */

function isSkillLevelMatch(userLevel: string, requiredLevel: string): boolean {
  const levels = ['basic', 'intermediate', 'advanced']
  const userScore = levels.indexOf(userLevel)
  const requiredScore = levels.indexOf(requiredLevel)
  return userScore >= requiredScore
}

function calculatePriority(
  required: 'basic' | 'intermediate' | 'advanced',
  userLevel: string
): 'critical' | 'high' | 'medium' | 'low' {
  if (userLevel === 'none') {
    return required === 'advanced' ? 'critical' : required === 'intermediate' ? 'high' : 'medium'
  }

  if (!isSkillLevelMatch(userLevel, required)) {
    return required === 'advanced' ? 'high' : 'medium'
  }

  return 'low'
}

function priorityScore(priority: string): number {
  const scores: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }
  return scores[priority] || 0
}

function getReadinessLevel(
  matchPercentage: number
): 'expert' | 'ready' | 'learning' | 'beginner' {
  if (matchPercentage >= 80) return 'expert'
  if (matchPercentage >= 60) return 'ready'
  if (matchPercentage >= 40) return 'learning'
  return 'beginner'
}

function estimateTimeToReady(gapAnalysis: GapAnalysis[]): string {
  const criticalGaps = gapAnalysis.filter(g => g.priority === 'critical').length
  const highGaps = gapAnalysis.filter(g => g.priority === 'high').length

  if (criticalGaps === 0 && highGaps === 0) {
    return '1-2 months'
  } else if (criticalGaps <= 2) {
    return '3-6 months'
  } else if (criticalGaps <= 4) {
    return '6-12 months'
  }
  return '12+ months'
}

function getResourcesForSkill(skill: string): string[] {
  // Map skills to learning resources
  const resourceMap: Record<string, string[]> = {
    // Backend languages
    'Python': [
      'Real Python course',
      'Python official docs',
      'LeetCode problems',
      'Build 3 backend projects',
    ],
    'Java': [
      'Oracle Java tutorial',
      'Effective Java book',
      'Spring Framework guide',
      'Build REST API service',
    ],
    'Go': [
      'Tour of Go',
      'Go official docs',
      'Build web service in Go',
      'Performance optimization',
    ],
    'Node.js': [
      'Node.js official guides',
      'Express.js tutorial',
      'Async/await mastery',
      'Build API server',
    ],

    // Frontend
    'JavaScript': [
      'Eloquent JavaScript',
      'MDN Web Docs',
      'ES6+ features deep dive',
      'Build 5 projects',
    ],
    'TypeScript': [
      'TypeScript handbook',
      'Advanced types',
      'Refactor JS to TS',
      'Type safety patterns',
    ],
    'React': [
      'React docs + Hooks',
      'Building UIs with React',
      'State management',
      'Build 3 full apps',
    ],
    'Vue': [
      'Vue 3 guide',
      'Composition API',
      'Build SPA',
      'Ecosystem (Router, Pinia)',
    ],

    // Data
    'SQL': [
      'SQL tutorial',
      'Query optimization',
      'Database design',
      'Write 50+ queries',
    ],
    'Python': [
      'Data processing with Pandas',
      'NumPy fundamentals',
      'Matplotlib visualization',
      'Build data projects',
    ],
    'Spark': [
      'Apache Spark guide',
      'Distributed computing',
      'Optimization strategies',
      'Process large datasets',
    ],

    // DevOps
    'Docker': [
      'Docker official guide',
      'Containerization patterns',
      'Docker Compose',
      'Deploy 5 apps',
    ],
    'Kubernetes': [
      'Kubernetes official docs',
      'Architecture deep dive',
      'Helm charts',
      'Deploy complex apps',
    ],
    'AWS': [
      'AWS official tutorials',
      'EC2, S3, RDS mastery',
      'Serverless patterns',
      'Build 5 AWS projects',
    ],

    // Security
    'Networking': [
      'Networking basics',
      'TCP/IP fundamentals',
      'DNS, HTTP deep dive',
      'Packet analysis',
    ],
    'Cryptography': [
      'Cryptography concepts',
      'Encryption algorithms',
      'TLS/SSL',
      'Implement basic crypto',
    ],
  }

  return resourceMap[skill] || [
    `Master ${skill} fundamentals`,
    `Advanced ${skill} patterns`,
    'Build projects using the skill',
    'Contribute to open source',
  ]
}
