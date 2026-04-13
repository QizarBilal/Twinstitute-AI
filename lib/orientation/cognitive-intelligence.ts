/**
 * COGNITIVE INTELLIGENCE
 * Detects user cognitive types and traits
 * Matches users to suitable roles based on their thinking patterns
 */

export type CognitiveType = 
  | 'Builder'
  | 'Analyst'
  | 'Creator'
  | 'Systems Thinker'
  | 'Problem Solver'
  | 'Collaborator'

export interface UserProfile {
  cognitiveType?: CognitiveType
  primaryStyle: 'creative' | 'analytical' | 'system-focused' | 'collaborative' | 'independent'
  secondaryStyle: 'creative' | 'analytical' | 'system-focused' | 'collaborative' | 'independent'
  interests: {
    coding: number // 0-10
    creativity: number
    systems: number
    collaboration: number
    learning: number
  }
  strengths: string[]
  workPreferences: string[]
}

/**
 * Detect user cognitive type based on interests and answers
 */
export function detectCognitiveType(interests: Record<string, number>): UserProfile {
  const scores = {
    builder: 0,
    analyst: 0,
    creator: 0,
    systems: 0,
    problemSolver: 0,
  }

  // Score based on interests (these come from user input)
  if (interests.coding) {
    scores.builder += interests.coding * 2
    scores.problemSolver += interests.coding
  }
  if (interests.creativity) {
    scores.creator += interests.creativity * 2
    scores.problemSolver += interests.creativity
  }
  if (interests.systems) {
    scores.systems += interests.systems * 2
    scores.analyst += interests.systems
  }
  if (interests.collaboration) {
    scores.problemSolver += interests.collaboration
  }
  if (interests.mathematics) {
    scores.analyst += interests.mathematics * 1.5
  }
  if (interests.design) {
    scores.creator += interests.design * 2
  }

  // Find dominant type
  const sortedTypes = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const dominantType = sortedTypes[0][0]

  return classifyCognitiveProfile(dominantType, interests)
}

/**
 * Classify cognitive profile and suggest work style
 */
function classifyCognitiveProfile(
  dominantType: string,
  interests: Record<string, number>
): UserProfile {
  let cognitiveType: CognitiveType = 'Problem Solver'
  let primaryStyle: UserProfile['primaryStyle'] = 'analytical'
  let secondaryStyle: UserProfile['secondaryStyle'] = 'collaborative'
  let strengths: string[] = []
  let workPreferences: string[] = []

  switch (dominantType) {
    case 'builder':
      cognitiveType = 'Builder'
      primaryStyle = 'independent'
      secondaryStyle = 'analytical'
      strengths = [
        'Turning ideas into reality',
        'Fast execution',
        'Problem-solving mindset',
        'Learning by doing',
      ]
      workPreferences = [
        'Ownership of projects',
        'Rapid feedback loops',
        'Autonomous decision-making',
        'Shipped products matter',
      ]
      break

    case 'analyst':
      cognitiveType = 'Analyst'
      primaryStyle = 'analytical'
      secondaryStyle = 'system-focused'
      strengths = [
        'Deep reasoning',
        'Pattern recognition',
        'Data-driven decisions',
        'Systematic thinking',
      ]
      workPreferences = [
        'Well-defined problems',
        'Data and metrics',
        'Rigorous testing',
        'Long-term thinking',
      ]
      break

    case 'creator':
      cognitiveType = 'Creator'
      primaryStyle = 'creative'
      secondaryStyle = 'collaborative'
      strengths = [
        'Novel solutions',
        'Communication',
        'Aesthetic sense',
        'Empathy and design',
      ]
      workPreferences = [
        'Freedom to experiment',
        'User feedback',
        'Collaborative teams',
        'Impact on users',
      ]
      break

    case 'systems':
      cognitiveType = 'Systems Thinker'
      primaryStyle = 'system-focused'
      secondaryStyle = 'analytical'
      strengths = [
        'Understanding complexity',
        'Designing scalable systems',
        'Architecture thinking',
        'Long-term design',
      ]
      workPreferences = [
        'Large-scale challenges',
        'Infrastructure focus',
        'Reliability and safety',
        'System optimization',
      ]
      break

    case 'problemSolver':
      cognitiveType = 'Problem Solver'
      primaryStyle = 'analytical'
      secondaryStyle = 'collaborative'
      strengths = [
        'Quick thinking',
        'Creative solutions',
        'Adaptability',
        'Cross-domain thinking',
      ]
      workPreferences = [
        'Variety of problems',
        'Collaboration',
        'Learning opportunities',
        'Impact potential',
      ]
      break
  }

  return {
    cognitiveType,
    primaryStyle,
    secondaryStyle,
    interests: {
      coding: interests.coding || 0,
      creativity: interests.creativity || 0,
      systems: interests.systems || 0,
      collaboration: interests.collaboration || 0,
      learning: interests.learning || 5,
    },
    strengths,
    workPreferences,
  }
}

/**
 * Generate personality-based role recommendations
 */
export function recommendRoleByPersonality(profile: UserProfile): {
  highMatch: string[]
  mediumMatch: string[]
  lowMatch: string[]
} {
  const rolePersonalityMap: Record<string, {
    primaryStyle: string[]
    secondaryStyle: string[]
    strengths: string[]
  }> = {
    'backend-engineer': {
      primaryStyle: ['system-focused', 'analytical'],
      secondaryStyle: ['independent', 'problem-solving'],
      strengths: ['scalability', 'design', 'optimization'],
    },
    'frontend-engineer': {
      primaryStyle: ['creative', 'collaborative'],
      secondaryStyle: ['analytical', 'independent'],
      strengths: ['user experience', 'design', 'performance'],
    },
    'full-stack-engineer': {
      primaryStyle: ['independent', 'system-focused'],
      secondaryStyle: ['analytical', 'creative'],
      strengths: ['ownership', 'breadth', 'problem-solving'],
    },
    'data-scientist': {
      primaryStyle: ['analytical', 'system-focused'],
      secondaryStyle: ['creative', 'problem-solving'],
      strengths: ['pattern recognition', 'statistics', 'innovation'],
    },
    'product-manager': {
      primaryStyle: ['collaborative', 'analytical'],
      secondaryStyle: ['creative', 'independent'],
      strengths: ['communication', 'strategy', 'decision-making'],
    },
    'ux-designer': {
      primaryStyle: ['creative', 'collaborative'],
      secondaryStyle: ['analytical', 'independent'],
      strengths: ['empathy', 'design', 'communication'],
    },
    'devops-engineer': {
      primaryStyle: ['system-focused', 'analytical'],
      secondaryStyle: ['independent', 'problem-solving'],
      strengths: ['reliability', 'automation', 'scalability'],
    },
    'security-engineer': {
      primaryStyle: ['analytical', 'system-focused'],
      secondaryStyle: ['independent', 'problem-solving'],
      strengths: ['critical thinking', 'defense mindset', 'detail-oriented'],
    },
    'ml-engineer': {
      primaryStyle: ['analytical', 'system-focused'],
      secondaryStyle: ['creative', 'problem-solving'],
      strengths: ['mathematics', 'optimization', 'experimentation'],
    },
    'game-developer': {
      primaryStyle: ['creative', 'independent'],
      secondaryStyle: ['system-focused', 'problem-solving'],
      strengths: ['creativity', 'optimization', 'physics'],
    },
  }

  const highMatch: string[] = []
  const mediumMatch: string[] = []
  const lowMatch: string[] = []

  for (const [role, traits] of Object.entries(rolePersonalityMap)) {
    let matchScore = 0

    // Primary style match (strongest)
    if (traits.primaryStyle.includes(profile.primaryStyle)) matchScore += 3

    // Secondary style match
    if (traits.secondaryStyle.includes(profile.secondaryStyle)) matchScore += 1

    // Map to arrays
    if (matchScore >= 3) {
      highMatch.push(role)
    } else if (matchScore >= 1) {
      mediumMatch.push(role)
    } else {
      lowMatch.push(role)
    }
  }

  return { highMatch, mediumMatch, lowMatch }
}

/**
 * Assess learning style
 */
export function assessLearningStyle(
  responses: Record<string, string>
): 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing' {
  // Parse responses and determine learning style
  // This is simplified - in reality would be more sophisticated

  const learningScores = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
    'reading-writing': 0,
  }

  // Scoring logic
  if (responses.preferDiagrams) learningScores.visual += 2
  if (responses.preferLectures) learningScores.auditory += 2
  if (responses.learningByDoing) learningScores.kinesthetic += 2
  if (responses.preferReading) learningScores['reading-writing'] += 2

  const styles = Object.entries(learningScores).sort((a, b) => b[1] - a[1])
  return styles[0][0] as any
}

/**
 * Estimate career trajectory based on personality
 */
export function estimateCareerTrajectory(profile: UserProfile): string[] {
  const trajectories: Record<string, string[]> = {
    'Builder': [
      'Freelance/Startup founder',
      'Senior engineer at startup',
      'Tech lead of product teams',
      'CTO/VP Engineering',
    ],
    'Analyst': [
      'Data scientist',
      'Security researcher',
      'Solutions architect',
      'Chief strategist',
    ],
    'Creator': [
      'Design-focused roles',
      'Product design lead',
      'Creative director',
      'Chief product officer',
    ],
    'Systems Thinker': [
      'Infrastructure engineer',
      'Architect',
      'System design expert',
      'Chief architect',
    ],
    'Problem Solver': [
      'Consulting engineer',
      'Technical lead',
      'Product manager',
      'Chief technical officer',
    ],
  }

  return trajectories[profile.cognitiveType || 'Problem Solver'] || [
    'Software engineer',
    'Senior engineer',
    'Staff engineer',
    'Engineering leader',
  ]
}
