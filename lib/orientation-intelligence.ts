/**
 * ORIENTATION INTELLIGENCE SYSTEM
 * 
 * Core logic for:
 * - Signal interpretation (traits, skills, interests)
 * - Domain scoring and generation
 * - Role scoring and generation
 * - Confidence calculation
 * 
 * All logic is deterministic (no AI decisions).
 * AI used only for explanation enrichment.
 */

// ============================================================================
// TRAIT & INTEREST DICTIONARIES
// ============================================================================

const TRAIT_KEYWORDS = {
  Builder: [
    'build', 'create', 'construct', 'develop', 'make', 'craft',
    'implement', 'design', 'architecture', 'product', 'shipping',
    'tangible', 'prototype', 'launch', 'deploy', 'release',
    'hands-on', 'engineering', 'infrastructure'
  ],
  Analytical: [
    'analyze', 'optimize', 'solve', 'debug', 'problem', 'logic',
    'algorithm', 'data', 'pattern', 'metrics', 'math', 'system',
    'process', 'complex', 'deep', 'technical', 'precision',
    'investigate', 'research', 'understand'
  ],
  Creative: [
    'design', 'aesthetic', 'visual', 'ui', 'ux', 'experience',
    'beautiful', 'elegant', 'art', 'creative', 'innovative',
    'novel', 'original', 'style', 'user', 'interface',
    'color', 'typography', 'motion'
  ],
  SystemsThinker: [
    'system', 'architecture', 'scale', 'infrastructure', 'reliability',
    'performance', 'efficiency', 'distributed', 'cloud', 'devops',
    'integration', 'framework', 'design', 'infrastructure',
    'orchestration', 'automation'
  ],
  Leader: [
    'lead', 'manage', 'team', 'people', 'mentor', 'guide', 'coach',
    'strategy', 'vision', 'direction', 'decision', 'communicate',
    'influence', 'collaborate', 'delegate', 'motivate'
  ],
  Independent: [
    'solo', 'own', 'autonomy', 'independent', 'freedom', 'startup',
    'entrepreneur', 'self', 'individual', 'personal', 'control'
  ]
}

const INTEREST_CLUSTERS = {
  systems: ['DevOps', 'Infrastructure', 'Cloud', 'Kubernetes', 'Terraform', 'AWS'],
  data: ['Data', 'Analytics', 'Machine Learning', 'Statistics', 'Data Science', 'BigData'],
  design: ['Design', 'UI', 'UX', 'Visual', 'User Experience', 'Aesthetic'],
  frontend: ['Frontend', 'React', 'UI', 'Web', 'HTML', 'CSS', 'JavaScript', 'Visual'],
  backend: ['Backend', 'API', 'Database', 'Server', 'Logic', 'Performance'],
  infra: ['Infrastructure', 'DevOps', 'Cloud', 'Deployment', 'Reliability'],
  product: ['Product', 'Strategy', 'User', 'Management', 'Vision', 'Leadership'],
  security: ['Security', 'Privacy', 'Encryption', 'Protection', 'Risk', 'Compliance']
}

const DOMAIN_DEFINITIONS = {
  'Frontend Development': {
    id: 'frontend',
    skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript', 'Design'],
    traits: ['Creative', 'Builder', 'Analytical'],
    interests: ['design', 'frontend', 'user'],
    salaryRange: { entry: 400000, mid: 800000, senior: 1500000 },
    difficulty: 'Intermediate',
    growthTrend: 'High',
    description: 'Create beautiful, interactive web experiences'
  },
  'Backend Development': {
    id: 'backend',
    skills: ['Node.js', 'Python', 'SQL', 'API', 'Database', 'System Design'],
    traits: ['Analytical', 'SystemsThinker', 'Builder'],
    interests: ['backend', 'data', 'systems'],
    salaryRange: { entry: 500000, mid: 1000000, senior: 1800000 },
    difficulty: 'Advanced',
    growthTrend: 'High',
    description: 'Build the invisible infrastructure that powers applications'
  },
  'Full-Stack Development': {
    id: 'fullstack',
    skills: ['React', 'Node.js', 'Database', 'API', 'DevOps', 'All'],
    traits: ['Builder', 'Analytical', 'Independent'],
    interests: ['frontend', 'backend', 'systems'],
    salaryRange: { entry: 480000, mid: 950000, senior: 1700000 },
    difficulty: 'Advanced',
    growthTrend: 'High',
    description: 'Handle the entire application stack'
  },
  'Data Science': {
    id: 'data-science',
    skills: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'TensorFlow'],
    traits: ['Analytical', 'SystemsThinker'],
    interests: ['data', 'systems'],
    salaryRange: { entry: 600000, mid: 1200000, senior: 2000000 },
    difficulty: 'Advanced',
    growthTrend: 'High',
    description: 'Extract meaningful insights from data'
  },
  'DevOps Engineering': {
    id: 'devops',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Python'],
    traits: ['SystemsThinker', 'Analytical', 'Builder'],
    interests: ['systems', 'infra'],
    salaryRange: { entry: 700000, mid: 1400000, senior: 2200000 },
    difficulty: 'Advanced',
    growthTrend: 'High',
    description: 'Bridge development and operations'
  },
  'Product Management': {
    id: 'product-management',
    skills: ['Strategy', 'Communication', 'Metrics', 'User Research'],
    traits: ['Leader', 'Builder'],
    interests: ['product'],
    salaryRange: { entry: 800000, mid: 1500000, senior: 2500000 },
    difficulty: 'Intermediate',
    growthTrend: 'High',
    description: 'Shape the future of products'
  },
  'UX/UI Design': {
    id: 'design',
    skills: ['Figma', 'Design', 'User Research', 'Prototyping'],
    traits: ['Creative', 'Builder'],
    interests: ['design'],
    salaryRange: { entry: 350000, mid: 700000, senior: 1300000 },
    difficulty: 'Intermediate',
    growthTrend: 'Medium',
    description: 'Make products beautiful and usable'
  },
  'Cybersecurity': {
    id: 'security',
    skills: ['Security', 'Networking', 'Encryption', 'Python'],
    traits: ['Analytical', 'SystemsThinker'],
    interests: ['systems', 'security'],
    salaryRange: { entry: 600000, mid: 1300000, senior: 2200000 },
    difficulty: 'Advanced',
    growthTrend: 'High',
    description: 'Protect systems and data'
  },
  'Mobile Development': {
    id: 'mobile',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
    traits: ['Builder', 'Creative'],
    interests: ['frontend'],
    salaryRange: { entry: 450000, mid: 900000, senior: 1600000 },
    difficulty: 'Intermediate',
    growthTrend: 'High',
    description: 'Create apps that millions use'
  },
  'Cloud Architecture': {
    id: 'cloud-architecture',
    skills: ['AWS', 'GCP', 'Azure', 'System Design'],
    traits: ['SystemsThinker', 'Analytical'],
    interests: ['systems', 'infra'],
    salaryRange: { entry: 750000, mid: 1600000, senior: 2400000 },
    difficulty: 'Advanced',
    growthTrend: 'High',
    description: 'Design scalable cloud systems'
  }
}

const ROLE_DATABASE = {
  frontend: [
    { name: 'React Developer', minSkills: ['React', 'JavaScript'] },
    { name: 'UI Engineer', minSkills: ['CSS', 'Design'] },
    { name: 'Frontend Architect', minSkills: ['React', 'System Design'] }
  ],
  backend: [
    { name: 'Backend Engineer', minSkills: ['Node.js or Python', 'Database'] },
    { name: 'API Developer', minSkills: ['API Design', 'Node.js or Python'] },
    { name: 'Database Engineer', minSkills: ['SQL', 'System Design'] }
  ],
  fullstack: [
    { name: 'Full-Stack Developer', minSkills: ['React', 'Node.js'] },
    { name: 'Full-Stack Engineer', minSkills: ['React', 'Node.js', 'DevOps basics'] }
  ],
  'data-science': [
    { name: 'Data Scientist', minSkills: ['Python', 'Statistics'] },
    { name: 'Machine Learning Engineer', minSkills: ['Python', 'TensorFlow'] },
    { name: 'Analytics Engineer', minSkills: ['SQL', 'Analytics'] }
  ],
  devops: [
    { name: 'DevOps Engineer', minSkills: ['Docker', 'Kubernetes'] },
    { name: 'Site Reliability Engineer', minSkills: ['System Design', 'Monitoring'] }
  ],
  'product-management': [
    { name: 'Product Manager', minSkills: ['Strategy', 'Communication'] },
    { name: 'Technical Product Manager', minSkills: ['Technical', 'Strategy'] }
  ],
  design: [
    { name: 'UX Designer', minSkills: ['Figma', 'User Research'] },
    { name: 'UI Designer', minSkills: ['Design', 'Figma'] },
    { name: 'Product Designer', minSkills: ['Design', 'Product Thinking'] }
  ],
  security: [
    { name: 'Security Engineer', minSkills: ['Security', 'Networking'] },
    { name: 'Security Architect', minSkills: ['System Design', 'Security'] }
  ],
  mobile: [
    { name: 'Mobile Developer', minSkills: ['React Native or Flutter'] },
    { name: 'iOS Developer', minSkills: ['Swift'] },
    { name: 'Android Developer', minSkills: ['Kotlin'] }
  ],
  'cloud-architecture': [
    { name: 'Cloud Architect', minSkills: ['AWS or GCP', 'System Design'] },
    { name: 'Cloud Engineer', minSkills: ['AWS or GCP'] }
  ]
}

// ============================================================================
// INTELLIGENCE FUNCTIONS
// ============================================================================

export interface InterpretedSignals {
  dominantTrait: string
  secondaryTrait: string
  traits: string[]
  skills: {
    source: string
    normalized: string
    domain: string
    category: string
  }[]
  interestClusters: string[]
  confidentScore: number
  summary: string
}

/**
 * INTERPRET SIGNALS - Main intelligence function
 * 
 * Takes raw user input and extracts:
 * - Cognitive traits
 * - Normalized skills
 * - Interest clusters
 * - Confidence score
 */
export function interpretSignals(input: {
  goal?: string
  interests?: string[]
  skills?: Array<{ name: string; level: string }>
}): InterpretedSignals {
  // Combine all text for trait detection
  const fullText = [
    input.goal || '',
    ...(input.interests || []),
    ...(input.skills?.map(s => s.name) || [])
  ]
    .join(' ')
    .toLowerCase()

  // DETECT TRAITS
  const traitScores: Record<string, number> = {}
  
  Object.entries(TRAIT_KEYWORDS).forEach(([trait, keywords]) => {
    const matches = keywords.filter(kw => fullText.includes(kw.toLowerCase())).length
    traitScores[trait] = matches
  })

  const sortedTraits = Object.entries(traitScores)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, score]) => score > 0)
    .map(([trait]) => trait)

  const dominantTrait = sortedTraits[0] || 'Explorer'
  const secondaryTrait = sortedTraits[1] || 'Learner'

  // NORMALIZE SKILLS
  const normalizedSkills = (input.skills || []).map(skill => {
    const normalized = normalizeSkill(skill.name)
    return {
      source: skill.name,
      normalized: normalized,
      domain: getSkillDomain(normalized),
      category: getSkillCategory(normalized)
    }
  })

  // CLUSTER INTERESTS
  const interestClusters = detectInterestClusters(input.interests || [])

  // CALCULATE CONFIDENCE
  const signalCount = (input.skills?.length || 0) + (input.interests?.length || 0) + (input.goal ? 1 : 0)
  const confidenceScore = Math.min(85, 50 + signalCount * 10)

  // BUILD SUMMARY
  const summary = buildSummary(dominantTrait, secondaryTrait, interestClusters)

  return {
    dominantTrait,
    secondaryTrait,
    traits: sortedTraits,
    skills: normalizedSkills,
    interestClusters,
    confidentScore: confidenceScore,
    summary
  }
}

/**
 * GENERATE DOMAINS - Signal-driven domain scoring
 * 
 * Scores each domain against user signals and returns top 6
 */
export function generateDomains(signals: {
  skills: string[]
  interests: string[]
  traits: string[]
}): Array<{
  id: string
  name: string
  score: number
  matchReason: string
}> {
  const results = Object.entries(DOMAIN_DEFINITIONS).map(([name, domain]) => {
    // SKILL MATCH (0.4 weight)
    const skillMatches = signals.skills.filter(skill => {
      const normalized = normalizeSkill(skill)
      return domain.skills.some(ds => ds.toLowerCase().includes(normalized.toLowerCase()))
    }).length
    const skillScore = Math.min(1, skillMatches / (domain.skills.length * 0.5)) * 0.4

    // TRAIT MATCH (0.3 weight)
    const traitMatches = signals.traits.filter(trait =>
      domain.traits.some(dt => dt.toLowerCase().includes(trait.toLowerCase()))
    ).length
    const traitScore = Math.min(1, traitMatches / domain.traits.length) * 0.3

    // INTEREST MATCH (0.3 weight)
    const interestMatches = signals.interests.filter(interest => {
      const lowerInterest = interest.toLowerCase()
      return domain.interests.some(di => di.toLowerCase().includes(lowerInterest) || lowerInterest.includes(di))
    }).length
    const interestScore = Math.min(1, interestMatches / domain.interests.length) * 0.3

    const totalScore = skillScore + traitScore + interestScore
    
    // Generate match reason
    const reasons: string[] = []
    if (traitMatches > 0) reasons.push(`matches your ${domain.traits[0]} nature`)
    if (skillMatches > 0) reasons.push(`aligns with your skills`)
    if (interestMatches > 0) reasons.push(`fits your interests`)
    const matchReason = reasons.length > 0 ? reasons.join(', ') : 'Good exploration option'

    return {
      id: domain.id,
      name,
      score: Math.round(totalScore * 100),
      matchReason
    }
  })

  // Return top 6, sorted by score descending
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
}

/**
 * GENERATE ROLES - For selected domain, score and return top 3-5 roles
 */
export function generateRolesForDomain(
  domainId: string,
  signals: {
    skills: string[]
    traits: string[]
    interests: string[]
  }
): Array<{
  name: string
  fitScore: number
  missingSkills: string[]
  strengths: string[]
  reasoning: string
}> {
  const rolesForDomain = Object.entries(ROLE_DATABASE)
    .find(([key]) => key === domainId)?.[1] || []

  return rolesForDomain.map(role => {
    // Calculate fit score based on skill overlap
    const skillMatches = role.minSkills.filter(reqSkill =>
      signals.skills.some(userSkill => 
        userSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    ).length

    const fitScore = Math.round(70 + (skillMatches / role.minSkills.length) * 20)
    
    const missingSkills = role.minSkills.filter(reqSkill =>
      !signals.skills.some(userSkill =>
        userSkill.toLowerCase().includes(reqSkill.toLowerCase())
      )
    )

    const strengths = signals.traits.slice(0, 2)

    const reasoning = `Your ${strengths.join(' and ')} nature, combined with your ${signals.skills.slice(0, 2).join(' and ')} skills, makes this a strong fit.`

    return {
      name: role.name,
      fitScore,
      missingSkills,
      strengths,
      reasoning
    }
  })
}

/**
 * Calculate role fit score for a specific role + user combination
 */
export function calculateRoleFitScore(
  roleName: string,
  userSignals: {
    skills: string[]
    traits: string[]
    interests: string[]
  }
): number {
  // Find role in database
  const role = Object.values(ROLE_DATABASE)
    .flat()
    .find(r => r.name.toLowerCase() === roleName.toLowerCase())

  if (!role) return 70 // Default if not found

  const skillMatches = role.minSkills.filter(reqSkill =>
    userSignals.skills.some(userSkill =>
      userSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
      reqSkill.toLowerCase().includes(userSkill.toLowerCase())
    )
  ).length

  const baseScore = 70
  const skillBonus = (skillMatches / role.minSkills.length) * 20
  const score = Math.min(95, Math.round(baseScore + skillBonus))

  return score
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function normalizeSkill(skill: string): string {
  const normalized = skill
    .toLowerCase()
    .replace(/\.js$/, '')
    .replace(/\.py$/, '')
    .trim()

  // Normalize common variations
  const aliases: Record<string, string> = {
    'node': 'node.js',
    'nodejs': 'node.js',
    'react': 'react',
    'reactjs': 'react',
    'angular': 'angular',
    'vue': 'vue',
    'python': 'python',
    'java': 'java',
    'cpp': 'c++',
    'csharp': 'c#',
    'typescript': 'typescript',
    'js': 'javascript',
    'sql': 'sql',
    'aws': 'aws',
    'gcp': 'gcp',
    'azure': 'azure',
    'docker': 'docker',
    'kubernetes': 'kubernetes',
    'k8s': 'kubernetes',
    'tensorflow': 'tensorflow',
    'pytorch': 'pytorch',
    'pandas': 'pandas',
    'figma': 'figma',
  }

  return aliases[normalized] || normalized
}

function getSkillDomain(skill: string): string {
  const s = skill.toLowerCase()
  
  if (['react', 'angular', 'vue', 'css', 'html', 'javascript', 'typescript'].some(x => s.includes(x))) {
    return 'Frontend'
  }
  if (['node.js', 'python', 'java', 'api', 'database', 'sql'].some(x => s.includes(x))) {
    return 'Backend'
  }
  if (['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'devops'].some(x => s.includes(x))) {
    return 'Infrastructure'
  }
  if (['tensorflow', 'pytorch', 'pandas', 'sklearn', 'data'].some(x => s.includes(x))) {
    return 'Data'
  }
  if (['figma', 'design', 'ui', 'ux'].some(x => s.includes(x))) {
    return 'Design'
  }

  return 'Other'
}

function getSkillCategory(skill: string): string {
  const s = skill.toLowerCase()
  return s.includes('language') || s.includes('framework') || s.includes('library') ? 'Technical' : 'Tool'
}

function detectInterestClusters(interests: string[]): string[] {
  const clusters = new Set<string>()

  interests.forEach(interest => {
    const lowerInterest = interest.toLowerCase()
    Object.entries(INTEREST_CLUSTERS).forEach(([cluster, keywords]) => {
      if (keywords.some(kw => lowerInterest.includes(kw.toLowerCase()) || kw.toLowerCase().includes(lowerInterest))) {
        clusters.add(cluster)
      }
    })
  })

  return Array.from(clusters)
}

function buildSummary(dominant: string, secondary: string, clusters: string[]): string {
  const clusterText = clusters.length > 0 ? `with interests in ${clusters.join(', ')}` : ''
  return `You are a ${dominant} ${secondary} ${clusterText}`.trim()
}
