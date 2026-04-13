/**
 * CAPABILITY BASELINE
 * 
 * Creates initial capability metrics for a user based on role + skill level + traits
 * This becomes the "before" snapshot as they journey through the system
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CapabilityBaseline {
  userId: string
  roleName: string
  createdAt: Date
  
  // Current state
  currentLevel: {
    technicalBar: number // 0-100
    communicationBar: number
    leadershipBar: number
  }
  
  // What they're good at
  strengths: string[]
  
  // What they need to learn
  capabilityGaps: string[]
  
  // Target metrics for job readiness
  targetMetrics: {
    name: string
    current: number
    target: number
    unit: string
  }[]
  
  // Personalized development areas
  developmentPriorities: string[]
  
  // Estimated timeline to proficiency
  estimatedWeeksToTarget: number
}

// ============================================================================
// BASELINE CREATOR
// ============================================================================

export function createCapabilityBaseline(input: {
  userId: string
  role: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  interests: string[]
  traits: string[]
}): CapabilityBaseline {
  // Get skill mapping for role
  const skillMapping = getRoleSkillMapping(input.role)

  // Assess current state based on skill level
  const currentState = assessCurrentState(input.skillLevel, skillMapping)

  // Identify gaps
  const gaps = identifyCapabilityGaps(currentState, skillMapping, input.traits)

  // Set targets
  const targets = setTargetMetrics(input.role, skillMapping)

  // Create priorities
  const priorities = createDevelopmentPriorities(
    gaps,
    input.interests,
    input.traits,
    skillMapping
  )

  // Estimate timeline
  const estimatedWeeks = estimateTimelineToTarget(input.skillLevel, gaps.length)

  return {
    userId: input.userId,
    roleName: input.role,
    createdAt: new Date(),
    currentLevel: currentState,
    strengths: currentState,
    capabilityGaps: gaps,
    targetMetrics: targets,
    developmentPriorities: priorities,
    estimatedWeeksToTarget: estimatedWeeks,
  }
}

// ============================================================================
// SKILL MAPPING BY ROLE
// ============================================================================

function getRoleSkillMapping(role: string): Record<string, { importance: number; difficulty: number }> {
  const mappings: Record<string, Record<string, { importance: number; difficulty: number }>> = {
    'Backend Engineer': {
      'API Design': { importance: 9, difficulty: 7 },
      'Database Design': { importance: 9, difficulty: 6 },
      'System Design': { importance: 8, difficulty: 8 },
      'Testing': { importance: 8, difficulty: 5 },
      'Authentication & Security': { importance: 9, difficulty: 7 },
      'Performance Optimization': { importance: 7, difficulty: 7 },
      'Code Quality': { importance: 8, difficulty: 4 },
      'Debugging': { importance: 8, difficulty: 6 },
      'Deployment & DevOps': { importance: 7, difficulty: 6 },
      'Mentoring Others': { importance: 6, difficulty: 6 },
    },

    'Frontend Engineer': {
      'React/Vue': { importance: 10, difficulty: 6 },
      'CSS & Styling': { importance: 9, difficulty: 5 },
      'JavaScript': { importance: 10, difficulty: 5 },
      'State Management': { importance: 8, difficulty: 7 },
      'Performance Optimization': { importance: 8, difficulty: 7 },
      'Testing': { importance: 7, difficulty: 5 },
      'Accessibility (a11y)': { importance: 7, difficulty: 5 },
      'Web APIs': { importance: 8, difficulty: 6 },
      'Build Tools': { importance: 6, difficulty: 5 },
      'Design Collaboration': { importance: 7, difficulty: 4 },
    },

    'Data Scientist': {
      'Python': { importance: 9, difficulty: 5 },
      'SQL': { importance: 8, difficulty: 5 },
      'Statistics': { importance: 9, difficulty: 7 },
      'Data Cleaning': { importance: 10, difficulty: 3 },
      'Exploratory Analysis': { importance: 8, difficulty: 4 },
      'Machine Learning': { importance: 8, difficulty: 8 },
      'Visualization': { importance: 7, difficulty: 4 },
      'A/B Testing': { importance: 8, difficulty: 6 },
      'Communication': { importance: 8, difficulty: 5 },
      'Problem Scoping': { importance: 8, difficulty: 6 },
    },

    'DevOps Engineer': {
      'Linux/Unix': { importance: 10, difficulty: 5 },
      'Cloud Platforms': { importance: 9, difficulty: 7 },
      'Containerization': { importance: 9, difficulty: 6 },
      'Kubernetes': { importance: 8, difficulty: 8 },
      'Scripting': { importance: 9, difficulty: 5 },
      'Monitoring & Logging': { importance: 8, difficulty: 6 },
      'Infrastructure as Code': { importance: 8, difficulty: 6 },
      'Security': { importance: 9, difficulty: 7 },
      'Incident Response': { importance: 8, difficulty: 7 },
      'Cost Optimization': { importance: 7, difficulty: 6 },
    },

    'Product Manager': {
      'Data Analysis': { importance: 8, difficulty: 5 },
      'User Research': { importance: 9, difficulty: 5 },
      'Strategic Thinking': { importance: 9, difficulty: 7 },
      'Communication': { importance: 10, difficulty: 6 },
      'Prioritization': { importance: 9, difficulty: 6 },
      'Business Acumen': { importance: 8, difficulty: 6 },
      'Negotiation': { importance: 8, difficulty: 6 },
      'Technical Literacy': { importance: 7, difficulty: 6 },
      'Leadership': { importance: 8, difficulty: 7 },
      'Planning & Execution': { importance: 9, difficulty: 6 },
    },
  }

  return mappings[role] || {}
}

// ============================================================================
// CURRENT STATE ASSESSMENT
// ============================================================================

function assessCurrentState(
  skillLevel: string,
  skillMapping: Record<string, { importance: number; difficulty: number }>
): { technicalBar: number; communicationBar: number; leadershipBar: number } {
  const levels: Record<string, { technical: number; communication: number; leadership: number }> = {
    beginner: { technical: 15, communication: 20, leadership: 10 },
    intermediate: { technical: 50, communication: 50, leadership: 35 },
    advanced: { technical: 75, communication: 70, leadership: 60 },
  }

  const level = levels[skillLevel] || levels.beginner

  return {
    technicalBar: level.technical,
    communicationBar: level.communication,
    leadershipBar: level.leadership,
  }
}

// ============================================================================
// GAP IDENTIFICATION
// ============================================================================

function identifyCapabilityGaps(
  currentState: { technicalBar: number; communicationBar: number; leadershipBar: number },
  skillMapping: Record<string, { importance: number; difficulty: number }>,
  traits: string[]
): string[] {
  const gaps: string[] = []

  // Identify technical gaps
  const highImportanceSkills = Object.entries(skillMapping)
    .filter(([, skill]) => skill.importance >= 8)
    .map(([name]) => name)

  if (currentState.technicalBar < 60) {
    gaps.push(...highImportanceSkills.slice(0, 3))
  }

  // Identify communication gaps
  if (currentState.communicationBar < 50) {
    if (traits.some((t) => t.includes('introvert') || t.includes('quiet'))) {
      gaps.push('Communication & Presentation')
    }
  }

  // Identify leadership gaps
  if (currentState.leadershipBar < 40) {
    gaps.push('Leadership & Mentoring')
  }

  return gaps
}

// ============================================================================
// TARGET METRICS
// ============================================================================

function setTargetMetrics(
  role: string,
  skillMapping: Record<string, { importance: number; difficulty: number }>
): Array<{ name: string; current: number; target: number; unit: string }> {
  const topSkills = Object.entries(skillMapping)
    .filter(([, skill]) => skill.importance >= 8)
    .slice(0, 4)
    .map(([name]) => ({
      name: `${name} Proficiency`,
      current: 20,
      target: 85,
      unit: '%',
    }))

  return [
    {
      name: 'Portfolio Projects Completed',
      current: 0,
      target: 3,
      unit: 'projects',
    },
    {
      name: 'Labs Completed',
      current: 0,
      target: 15,
      unit: 'labs',
    },
    ...topSkills,
    {
      name: 'Interview Ready',
      current: 0,
      target: 100,
      unit: '%',
    },
  ]
}

// ============================================================================
// DEVELOPMENT PRIORITIES
// ============================================================================

function createDevelopmentPriorities(
  gaps: string[],
  interests: string[],
  traits: string[],
  skillMapping: Record<string, { importance: number; difficulty: number }>
): string[] {
  const priorities: string[] = []

  // Prioritize by importance and difficulty
  const skillsByValue = Object.entries(skillMapping)
    .map(([name, skill]) => ({
      name,
      value: skill.importance * (1 - skill.difficulty / 10), // High importance, lower difficulty = higher value
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((s) => s.name)

  priorities.push(...skillsByValue)

  // Add interest-aligned priorities
  const interestAligned = Object.keys(skillMapping).filter((skill) =>
    interests.some((i) => skill.toLowerCase().includes(i.toLowerCase()))
  )
  priorities.push(...interestAligned)

  // Add trait-specific priorities
  if (traits.some((t) => t.includes('detail'))) {
    priorities.push('Testing & Code Quality')
  }

  if (traits.some((t) => t.includes('creative'))) {
    priorities.push('Novel Problem Solving')
  }

  return [...new Set(priorities)].slice(0, 5) // Remove duplicates, limit to 5
}

// ============================================================================
// TIMELINE ESTIMATION
// ============================================================================

function estimateTimelineToTarget(skillLevel: string, gapCount: number): number {
  const baseTimeline: Record<string, number> = {
    beginner: 24,
    intermediate: 16,
    advanced: 12,
  }

  const base = baseTimeline[skillLevel] || 24
  const gapPenalty = gapCount * 2 // Each gap adds 2 weeks

  return base + gapPenalty
}

// ============================================================================
// STRENGTHS ASSESSMENT
// ============================================================================

function assessStrengths(
  skillLevel: string,
  _interests: string[],
  traits: string[]
): string[] {
  const strengthMap: Record<string, string[]> = {
    beginner: [
      'Willingness to learn',
      'Fresh perspective',
      'Enthusiasm for growth',
    ],
    intermediate: [
      'Foundational knowledge',
      'Real project experience',
      'Problem-solving ability',
    ],
    advanced: [
      'Deep technical expertise',
      'Teaching ability',
      'System-level thinking',
    ],
  }

  const baseStrengths = strengthMap[skillLevel] || []

  // Add trait-based strengths
  const traitStrengths: Record<string, string> = {
    'detail-oriented': 'Attention to detail',
    'pragmatic': 'Practical problem solving',
    'creative': 'Innovative thinking',
    'analytical': 'Data-driven decision making',
    'collaborative': 'Team communication',
  }

  const matchedTraitStrengths = traits
    .map((trait) => {
      for (const [key, value] of Object.entries(traitStrengths)) {
        if (trait.toLowerCase().includes(key)) {
          return value
        }
      }
      return null
    })
    .filter((s): s is string => s !== null)

  return [...baseStrengths, ...matchedTraitStrengths]
}
