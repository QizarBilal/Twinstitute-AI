/**
 * ROLE INTELLIGENCE DATABASE
 * 
 * Ground truth for all careers/roles/domains
 * This gives the agent REAL KNOWLEDGE to work with
 * AI is explanation layer ONLY, not truth layer
 */

export interface RoleData {
  id: string
  name: string
  domain: string
  level: 'entry' | 'mid' | 'senior'
  
  // What they actually do
  dailyWork: {
    focus: string[]
    typicalTasks: string[]
    tools: string[]
    timeDistribution: Record<string, number> // e.g., { "coding": 50, "meetings": 30 }
  }
  
  // Market reality
  market: {
    demandLevel: 'Very High' | 'High' | 'Medium' | 'Low'
    salaryRange: {
      low: number
      mid: number
      high: number
    }
    growthTrend: 'Accelerating' | 'Stable' | 'Declining'
  }
  
  // What you need
  requirements: {
    coreTechnologies: string[]
    softSkills: string[]
    minimumExperience: number // years
    educationPath: string[]
  }
  
  // Where it goes
  growthPath: Array<{
    title: string
    yearsToReach: number
    description: string
  }>
  
  // What makes it hard/easy
  difficulty: {
    technicalBar: number // 1-10
    competitionLevel: number // 1-10
    burnoutRisk: number // 1-10
    satisfactionScore: number // 1-10
  }
  
  // Personality alignment
  bestFor: {
    traits: string[]
    workStyle: string[]
    learningStyle: string[]
  }
  
  // Real counter-points
  tradeoffs: string[]
  
  // How to get started
  bootcampReady: boolean
  selfTeachable: boolean
  mentorDependent: boolean
  projectsToProve: string[]
}

export interface DomainData {
  id: string
  name: string
  description: string
  
  keyRoles: string[] // References to role IDs
  primaryLanguages: string[]
  tools: string[]
  
  market: {
    demandLevel: 'Very High' | 'High' | 'Medium' | 'Low'
    growthTrend: 'Accelerating' | 'Stable' | 'Declining'
    topCompanies: string[]
  }
  
  entryBarrier: 'Low' | 'Medium' | 'High'
  averageTimeToProficiency: number // months
  
  relatedDomains: string[]
  commonTransitions: string[]
}

// ============================================================================
// ROLE DATABASE (GROUND TRUTH)
// ============================================================================

export const ROLE_DATABASE: Record<string, RoleData> = {
  'Backend Engineer': {
    id: 'backend-engineer',
    name: 'Backend Engineer',
    domain: 'Software Engineering',
    level: 'mid',
    
    dailyWork: {
      focus: [
        'Building and maintaining APIs',
        'Database design and optimization',
        'System architecture',
        'Code reviews and mentoring',
      ],
      typicalTasks: [
        'Write production code (50-60%)',
        'Debug and fix issues (15-20%)',
        'Design and planning (10-15%)',
        'Code review and collaboration (15-20%)',
      ],
      tools: ['Node.js/Python/Go', 'PostgreSQL/MongoDB', 'Docker', 'AWS/GCP', 'Git'],
      timeDistribution: {
        coding: 50,
        meetings: 25,
        debugging: 15,
        planning: 10,
      },
    },
    
    market: {
      demandLevel: 'Very High',
      salaryRange: { low: 80000, mid: 130000, high: 200000 },
      growthTrend: 'Accelerating',
    },
    
    requirements: {
      coreTechnologies: [
        'Programming language (Python/JS/Go)',
        'SQL and database design',
        'REST APIs',
        'Git',
      ],
      softSkills: [
        'Problem-solving',
        'Communication',
        'System thinking',
        'Collaboration',
      ],
      minimumExperience: 2,
      educationPath: [
        'Computer Science/Engineering degree (preferred)',
        'Or bootcamp + 1-2 years projects',
      ],
    },
    
    growthPath: [
      {
        title: 'Senior Backend Engineer',
        yearsToReach: 5,
        description: 'Lead architectural decisions, mentor juniors',
      },
      {
        title: 'Staff Engineer',
        yearsToReach: 8,
        description: 'Organization-wide impact, system design',
      },
      {
        title: 'Engineering Manager',
        yearsToReach: 7,
        description: 'Lead teams and hiring',
      },
    ],
    
    difficulty: {
      technicalBar: 7,
      competitionLevel: 8,
      burnoutRisk: 6,
      satisfactionScore: 8,
    },
    
    bestFor: {
      traits: ['Problem-solver', 'Detail-oriented', 'System thinker', 'Patient debugger'],
      workStyle: ['Deep focus', 'Collaborative', 'Asynchronous-friendly'],
      learningStyle: ['Hands-on building', 'Reading code', 'Mentorship'],
    },
    
    tradeoffs: [
      'Lowest visibility in product (frontend gets credit)',
      'On-call responsibilities (depending on company)',
      'Steep learning curve early',
      'Constant tech debt pressure',
    ],
    
    bootcampReady: true,
    selfTeachable: true,
    mentorDependent: false,
    projectsToProve: [
      'Build a REST API with database',
      'Implement authentication and authorization',
      'Scale an API to handle 10k requests/min',
      'Deploy and monitor production service',
    ],
  },

  'Frontend Engineer': {
    id: 'frontend-engineer',
    name: 'Frontend Engineer',
    domain: 'Software Engineering',
    level: 'mid',
    
    dailyWork: {
      focus: [
        'Building user interfaces',
        'Performance optimization',
        'Cross-browser compatibility',
        'User experience implementation',
      ],
      typicalTasks: [
        'Component development (50%)',
        'Styling and design implementation (15%)',
        'Testing and debugging (15%)',
        'Performance optimization (10%)',
        'Collaboration with design (10%)',
      ],
      tools: ['React/Vue/Angular', 'TypeScript', 'CSS/Tailwind', 'Webpack', 'Git'],
      timeDistribution: {
        development: 55,
        meetings: 20,
        design_collaboration: 15,
        testing: 10,
      },
    },
    
    market: {
      demandLevel: 'Very High',
      salaryRange: { low: 75000, mid: 125000, high: 190000 },
      growthTrend: 'Stable',
    },
    
    requirements: {
      coreTechnologies: [
        'HTML/CSS/JavaScript',
        'React or similar framework',
        'TypeScript',
        'Git and version control',
      ],
      softSkills: [
        'Eye for design',
        'Attention to detail',
        'User empathy',
        'Communication with design',
      ],
      minimumExperience: 2,
      educationPath: [
        'Bootcamp specific to frontend',
        'Self-taught with portfolio projects',
        'CS degree with focus on web',
      ],
    },
    
    growthPath: [
      {
        title: 'Senior Frontend Engineer',
        yearsToReach: 5,
        description: 'Style guide ownership, performance leadership',
      },
      {
        title: 'Design Systems Lead',
        yearsToReach: 7,
        description: 'Component library, design specs',
      },
      {
        title: 'Frontend Architect',
        yearsToReach: 8,
        description: 'Technical strategy, framework decisions',
      },
    ],
    
    difficulty: {
      technicalBar: 6,
      competitionLevel: 9,
      burnoutRisk: 7,
      satisfactionScore: 8,
    },
    
    bestFor: {
      traits: ['Creative', 'Detail-oriented', 'User-empathetic', 'Visual thinker'],
      workStyle: ['Design collaboration', 'Visual feedback loops', 'Iteration-friendly'],
      learningStyle: ['Building visible things', 'Design patterns', 'Community learning'],
    },
    
    tradeoffs: [
      'Most competitive market (lots of bootcamp grads)',
      'Slower compilation/feedback loops',
      'Browser compatibility complexity',
      'Design pressure (looks = quality perception)',
      'High burnout from polish demands',
    ],
    
    bootcampReady: true,
    selfTeachable: true,
    mentorDependent: false,
    projectsToProve: [
      'Build responsive landing page',
      'Create interactive React component',
      'Implement dark mode system',
      'Optimize performance (lighthouse 90+)',
    ],
  },

  'Data Scientist': {
    id: 'data-scientist',
    name: 'Data Scientist',
    domain: 'Data & AI',
    level: 'mid',
    
    dailyWork: {
      focus: [
        'Statistical analysis',
        'Model building and training',
        'Data visualization',
        'Insight communication',
      ],
      typicalTasks: [
        'Data exploration (20%)',
        'Model development (40%)',
        'Analysis and experimentation (20%)',
        'Reporting insights (15%)',
        'Meetings (5%)',
      ],
      tools: ['Python', 'SQL', 'Pandas/NumPy', 'TensorFlow/PyTorch', 'Tableau'],
      timeDistribution: {
        coding: 40,
        experimentation: 30,
        analysis: 20,
        communication: 10,
      },
    },
    
    market: {
      demandLevel: 'Very High',
      salaryRange: { low: 90000, mid: 145000, high: 220000 },
      growthTrend: 'Accelerating',
    },
    
    requirements: {
      coreTechnologies: [
        'Python',
        'SQL',
        'Statistics',
        'Machine Learning basics',
      ],
      softSkills: [
        'Communication of insights',
        'Curiosity',
        'Patience with data',
        'Cross-functional collaboration',
      ],
      minimumExperience: 2,
      educationPath: [
        'MS Statistics/CS/Math (preferred)',
        'BS + bootcamp',
        'Self-taught with Kaggle portfolio',
      ],
    },
    
    growthPath: [
      {
        title: 'Senior Data Scientist',
        yearsToReach: 5,
        description: 'Lead analysis, mentor juniors',
      },
      {
        title: 'ML Engineering',
        yearsToReach: 7,
        description: 'Deploy models, productionize ML',
      },
      {
        title: 'Data Science Manager',
        yearsToReach: 7,
        description: 'Lead data team',
      },
    ],
    
    difficulty: {
      technicalBar: 8,
      competitionLevel: 7,
      burnoutRisk: 5,
      satisfactionScore: 8,
    },
    
    bestFor: {
      traits: ['Curious', 'Mathematical', 'Patient', 'Story teller'],
      workStyle: ['Exploratory', 'Thoughtful', 'Experimental'],
      learningStyle: ['Papers and theory', 'Hands-on experiments', 'Kaggle competitions'],
    },
    
    tradeoffs: [
      ' "90% data cleaning, 10% modeling" reality',
      'Hard to show value (slow feedback)',
      'Politics around what to measure',
      'Requires stronger math foundation',
      'Can feel siloed from users',
    ],
    
    bootcampReady: false,
    selfTeachable: false,
    mentorDependent: true,
    projectsToProve: [
      'Win a Kaggle competition (or top 10%)',
      'Build end-to-end prediction model',
      'Create data storytelling visualization',
      'Publish analysis with statistical rigor',
    ],
  },

  'DevOps Engineer': {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    domain: 'Infrastructure & Systems',
    level: 'mid',
    
    dailyWork: {
      focus: [
        'Infrastructure automation',
        'CI/CD pipeline maintenance',
        'System reliability',
        'Performance monitoring',
      ],
      typicalTasks: [
        'Infrastructure coding (40%)',
        'On-call incident response (25%)',
        'Automation and optimization (20%)',
        'Documentation (10%)',
        'Collaboration (5%)',
      ],
      tools: ['Docker', 'Kubernetes', 'AWS/GCP/Azure', 'Terraform', 'GitOps'],
      timeDistribution: {
        infrastructure_code: 40,
        incident_response: 25,
        automation: 20,
        documentation: 15,
      },
    },
    
    market: {
      demandLevel: 'Very High',
      salaryRange: { low: 95000, mid: 150000, high: 230000 },
      growthTrend: 'Accelerating',
    },
    
    requirements: {
      coreTechnologies: [
        'Linux',
        'Containerization (Docker)',
        'Cloud platforms (AWS/GCP)',
        'Infrastructure as Code',
      ],
      softSkills: [
        'Problem-solving under pressure',
        'Communication',
        'Patience with complex systems',
        'On-call responsibility',
      ],
      minimumExperience: 3,
      educationPath: [
        'Backend engineer transition',
        'Systems admin + upskilling',
        'Specialized bootcamp',
      ],
    },
    
    growthPath: [
      {
        title: 'Senior DevOps Engineer',
        yearsToReach: 5,
        description: 'Architecture decisions, team lead',
      },
      {
        title: 'Site Reliability Engineer',
        yearsToReach: 6,
        description: 'System reliability focus',
      },
      {
        title: 'Infrastructure Lead',
        yearsToReach: 7,
        description: 'Cloud strategy and architecture',
      },
    ],
    
    difficulty: {
      technicalBar: 8,
      competitionLevel: 6,
      burnoutRisk: 8,
      satisfactionScore: 7,
    },
    
    bestFor: {
      traits: ['System thinker', 'Reliable', 'On-call tolerant', 'Automation-driven'],
      workStyle: ['Infrastructure thinking', 'Automation-first', 'Documentation-heavy'],
      learningStyle: ['Hands-on infrastructure', 'Through incidents', 'Build automation'],
    },
    
    tradeoffs: [
      'Highest on-call burden',
      '3am incidents are real',
      'Thankless (nobody notices when things work)',
      'Requires broad knowledge',
      'High burnout risk in startups',
    ],
    
    bootcampReady: false,
    selfTeachable: true,
    mentorDependent: true,
    projectsToProve: [
      'Deploy a full application infrastructure',
      'Set up CI/CD pipeline',
      'Create disaster recovery system',
      'Reduce deployment times by 10x',
    ],
  },

  'Product Manager': {
    id: 'product-manager',
    name: 'Product Manager',
    domain: 'Product & Strategy',
    level: 'mid',
    
    dailyWork: {
      focus: [
        'Feature prioritization',
        'Stakeholder alignment',
        'User research',
        'Market analysis',
      ],
      typicalTasks: [
        'Meetings and stakeholder management (40%)',
        'Data analysis and research (20%)',
        'Strategy and planning (20%)',
        'Communication and design feedback (15%)',
        'Execution and shipping (5%)',
      ],
      tools: ['Figma', 'Analytics tools', 'Jira', 'Confluence', 'SQL'],
      timeDistribution: {
        meetings: 40,
        analysis: 20,
        strategy: 20,
        communication: 20,
      },
    },
    
    market: {
      demandLevel: 'High',
      salaryRange: { low: 100000, mid: 150000, high: 250000 },
      growthTrend: 'Stable',
    },
    
    requirements: {
      coreTechnologies: [
        'Product thinking',
        'Data analysis',
        'User research',
        'Strategy frameworks',
      ],
      softSkills: [
        'Communication excellence',
        'Leadership without authority',
        'Stakeholder management',
        'Ambiguity tolerance',
      ],
      minimumExperience: 0,
      educationPath: [
        'Any discipline',
        'Product bootcamp',
        'Transition from engineering/design',
      ],
    },
    
    growthPath: [
      {
        title: 'Senior Product Manager',
        yearsToReach: 4,
        description: 'Portfolio ownership, strategy',
      },
      {
        title: 'Principal Product Manager',
        yearsToReach: 8,
        description: 'Cross-org impact',
      },
      {
        title: 'VP Product',
        yearsToReach: 10,
        description: 'Product leadership',
      },
    ],
    
    difficulty: {
      technicalBar: 4,
      competitionLevel: 8,
      burnoutRisk: 7,
      satisfactionScore: 7,
    },
    
    bestFor: {
      traits: ['Strategic thinker', 'Communicator', 'User empathetic', 'Ambitious'],
      workStyle: ['Cross-functional', 'Strategy-driven', 'Highly visible'],
      learningStyle: ['Mentorship', 'User interviews', 'Reading', 'War stories'],
    },
    
    tradeoffs: [
      'No direct execution power',
      'Success depends on others',
      'Very meeting-heavy',
      'Most competitive role to get',
      'Hard to prove ROI of work',
    ],
    
    bootcampReady: true,
    selfTeachable: true,
    mentorDependent: true,
    projectsToProve: [
      'Lead a feature from concept to launch',
      'Analyze user data and recommend strategy',
      'Write PRD (Product Requirements Doc)',
      'Grow a product metric by 50%',
    ],
  },
}

// ============================================================================
// DOMAIN DATABASE (GROUND TRUTH)
// ============================================================================

export const DOMAIN_DATABASE: Record<string, DomainData> = {
  'Software Engineering': {
    id: 'software-engineering',
    name: 'Software Engineering',
    description: 'Building products and systems through code',
    
    keyRoles: ['Backend Engineer', 'Frontend Engineer', 'Full-Stack Engineer'],
    primaryLanguages: ['JavaScript', 'Python', 'Java', 'Go'],
    tools: ['Git', 'Docker', 'SQL', 'REST APIs'],
    
    market: {
      demandLevel: 'Very High',
      growthTrend: 'Accelerating',
      topCompanies: ['Google', 'Meta', 'Microsoft', 'Amazon', 'Apple'],
    },
    
    entryBarrier: 'Medium',
    averageTimeToProficiency: 18,
    
    relatedDomains: ['DevOps', 'Data Engineering'],
    commonTransitions: ['Product Management', 'Technical Founder'],
  },

  'Data & AI': {
    id: 'data-ai',
    name: 'Data & AI',
    description: 'Leverage data and machine learning for insights and automation',
    
    keyRoles: ['Data Scientist', 'Machine Learning Engineer', 'Analytics Engineer'],
    primaryLanguages: ['Python', 'SQL', 'R'],
    tools: ['Pandas', 'TensorFlow', 'SQL', 'Jupyter'],
    
    market: {
      demandLevel: 'Very High',
      growthTrend: 'Accelerating',
      topCompanies: ['Google', 'OpenAI', 'Meta', 'Databricks', 'Amazon'],
    },
    
    entryBarrier: 'High',
    averageTimeToProficiency: 24,
    
    relatedDomains: ['Software Engineering', 'Analytics'],
    commonTransitions: ['ML Engineering', 'Research'],
  },

  'Infrastructure & Systems': {
    id: 'infrastructure-systems',
    name: 'Infrastructure & Systems',
    description: 'Build and maintain systems that keep software running reliably',
    
    keyRoles: ['DevOps Engineer', 'Site Reliability Engineer', 'Cloud Architect'],
    primaryLanguages: ['Python', 'Go', 'Bash'],
    tools: ['Docker', 'Kubernetes', 'Terraform', 'AWS'],
    
    market: {
      demandLevel: 'Very High',
      growthTrend: 'Accelerating',
      topCompanies: ['Google', 'Meta', 'Microsoft', 'Amazon', 'Apple'],
    },
    
    entryBarrier: 'High',
    averageTimeToProficiency: 24,
    
    relatedDomains: ['Software Engineering', 'Security'],
    commonTransitions: ['Cloud Architecture', 'Platform Engineering'],
  },

  'Product & Strategy': {
    id: 'product-strategy',
    name: 'Product & Strategy',
    description: 'Shape what products get built and how they succeed',
    
    keyRoles: ['Product Manager', 'Product Strategist', 'Technical Product Manager'],
    primaryLanguages: ['None required'],
    tools: ['Figma', 'Analytics', 'SQL', 'Jira'],
    
    market: {
      demandLevel: 'High',
      growthTrend: 'Stable',
      topCompanies: ['Google', 'Meta', 'Microsoft', 'Amazon', 'Airbnb'],
    },
    
    entryBarrier: 'Medium',
    averageTimeToProficiency: 12,
    
    relatedDomains: ['Software Engineering', 'Design'],
    commonTransitions: ['Founder', 'Director', 'VP Product'],
  },
}

/**
 * Get a role by ID or name
 */
export function getRole(idOrName: string): RoleData | null {
  return ROLE_DATABASE[idOrName] || null
}

/**
 * Get roles in a domain
 */
export function getRolesInDomain(domainName: string): RoleData[] {
  const domain = DOMAIN_DATABASE[domainName]
  if (!domain) return []

  return domain.keyRoles
    .map((roleId) => ROLE_DATABASE[roleId])
    .filter((role) => role !== undefined)
}

/**
 * Get all roles
 */
export function getAllRoles(): RoleData[] {
  return Object.values(ROLE_DATABASE)
}

/**
 * Get all domains
 */
export function getAllDomains(): DomainData[] {
  return Object.values(DOMAIN_DATABASE)
}

/**
 * Search roles by criteria
 */
export function searchRoles(criteria: {
  domain?: string
  maxDifficulty?: number
  minDemand?: 'Low' | 'Medium' | 'High' | 'Very High'
}): RoleData[] {
  return getAllRoles().filter((role) => {
    if (criteria.domain && role.domain !== criteria.domain) return false
    if (criteria.maxDifficulty && role.difficulty.technicalBar > criteria.maxDifficulty)
      return false
    if (criteria.minDemand) {
      const demandOrder = { Low: 0, Medium: 1, High: 2, 'Very High': 3 }
      if (demandOrder[role.market.demandLevel] < demandOrder[criteria.minDemand]) return false
    }
    return true
  })
}
