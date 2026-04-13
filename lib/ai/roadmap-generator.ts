/**
 * ROADMAP GENERATOR
 * 
 * Converts a selected role into a detailed, personalized learning roadmap
 * 
 * Key insight: 
 * Roadmaps are NOT one-size-fits-all
 * Adapt timing, difficulty, and path based on user's current level
 */

import { ROLE_DATABASE } from './role-intelligence-db'

// ============================================================================
// TYPES
// ============================================================================

export interface RoadmapNode {
  phase: number
  name: string
  duration: number // weeks
  description: string
  focusAreas: string[]
  expectedOutcome: string
  checkpointSkills: string[]
  difficulty: number // 1-10
  prerequisitePhase?: number
}

export interface RoadmapGeneratorInput {
  role: string
  domain: string
  interests: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  availableHours: number // per week
}

export interface GeneratedRoadmap {
  role: string
  domain: string
  phases: RoadmapNode[]
  totalWeeks: number
  milestones: string[]
  estimatedHoursPerWeek: number
  alternativePaths: string[]
  accelerationStrategy?: string
}

// ============================================================================
// MAIN ROADMAP GENERATOR
// ============================================================================

export async function generateRoadmap(input: RoadmapGeneratorInput): Promise<GeneratedRoadmap> {
  const roleData = ROLE_DATABASE[input.role]

  if (!roleData) {
    throw new Error(`Unknown role: ${input.role}`)
  }

  // Generate base phases
  let phases = generateBasePhases(input.role, roleData)

  // Adapt to skill level
  phases = adaptToSkillLevel(phases, input.skillLevel)

  // Adjust duration based on available hours
  phases = adjustForAvailableHours(phases, input.availableHours)

  // Personalize based on interests
  phases = personalizeByInterests(phases, input.interests)

  // Calculate total weeks
  const totalWeeks = phases.reduce((sum, phase) => sum + phase.duration, 0)

  // Generate milestones
  const milestones = generateMilestones(input.role, phases)

  // Determine acceleration strategy
  const accelerationStrategy = input.availableHours >= 40 
    ? 'Full-time acceleration: 80% path compression'
    : input.availableHours >= 20
    ? 'Half-time steady: Standard timeline'
    : 'Flexible pace: Extended timeline, high leverage'

  return {
    role: input.role,
    domain: input.domain,
    phases,
    totalWeeks,
    milestones,
    estimatedHoursPerWeek: input.availableHours,
    alternativePaths: generateAlternativePaths(input.role),
    accelerationStrategy,
  }
}

// ============================================================================
// PHASE GENERATION
// ============================================================================

function generateBasePhases(role: string, roleData: any): RoadmapNode[] {
  const phaseTemplates: Record<string, RoadmapNode[]> = {
    'Backend Engineer': [
      {
        phase: 1,
        name: 'Foundation Building',
        duration: 4,
        description: 'Master the fundamentals: JavaScript/Python, SQL, APIs',
        focusAreas: ['Core language', 'Database basics', 'API design intro'],
        expectedOutcome: 'Can build a simple REST API with database',
        checkpointSkills: ['Variables, functions, loops', 'SQL basics', 'HTTP/REST concepts'],
        difficulty: 2,
      },
      {
        phase: 2,
        name: 'Backend Architecture',
        duration: 6,
        description: 'Learn system design, databases, authentication, scaling',
        focusAreas: ['Database design', 'Authentication', 'API versioning', 'Caching'],
        expectedOutcome: 'Can architect a multi-tier API system',
        checkpointSkills: ['Schema design', 'Auth flows', 'N+1 query awareness', 'Cache strategies'],
        difficulty: 6,
        prerequisitePhase: 1,
      },
      {
        phase: 3,
        name: 'Production Readiness',
        duration: 4,
        description: 'Logging, monitoring, testing, deployment',
        focusAreas: ['Unit testing', 'Integration testing', 'Deployment pipelines', 'Monitoring'],
        expectedOutcome: 'Can deploy code to production safely',
        checkpointSkills: ['Test writing', 'CI/CD setup', 'Error tracking', 'Performance profiling'],
        difficulty: 7,
        prerequisitePhase: 2,
      },
      {
        phase: 4,
        name: 'Portfolio Projects',
        duration: 6,
        description: 'Build 2-3 real projects end-to-end',
        focusAreas: ['Full-stack building', 'Real data handling', 'Scalability challenges', 'Code review'],
        expectedOutcome: 'Portfolio-ready backend projects',
        checkpointSkills: ['Independent shipping', 'Problem solving', 'Code quality', 'Documentation'],
        difficulty: 8,
        prerequisitePhase: 3,
      },
      {
        phase: 5,
        name: 'Interview Preparation',
        duration: 4,
        description: 'System design, algorithms, behavioral prep',
        focusAreas: ['System design', 'Algorithm problems', 'Behavior questions', 'Mock interviews'],
        expectedOutcome: 'Ready for backend engineer interviews',
        checkpointSkills: ['Design thinking', 'Algorithm fluency', 'Communication', 'Confidence'],
        difficulty: 8,
        prerequisitePhase: 4,
      },
    ],

    'Frontend Engineer': [
      {
        phase: 1,
        name: 'Web Fundamentals',
        duration: 3,
        description: 'HTML, CSS, JavaScript basics',
        focusAreas: ['HTML semantics', 'CSS layouts', 'JavaScript fundamentals'],
        expectedOutcome: 'Can build a static website',
        checkpointSkills: ['HTML structure', 'CSS positioning', 'DOM manipulation'],
        difficulty: 2,
      },
      {
        phase: 2,
        name: 'Modern Frontend',
        duration: 6,
        description: 'React/Vue, component architecture, state management',
        focusAreas: ['React fundamentals', 'Component design', 'Hooks/lifecycle', 'State management'],
        expectedOutcome: 'Can build interactive React applications',
        checkpointSkills: ['JSX fluency', 'Component composition', 'State patterns', 'API integration'],
        difficulty: 6,
        prerequisitePhase: 1,
      },
      {
        phase: 3,
        name: 'HTTP & Data',
        duration: 4,
        description: 'API integration, data fetching, caching',
        focusAreas: ['REST APIs', 'Async/await', 'Data caching', 'Error handling'],
        expectedOutcome: 'Can handle complex data flows',
        checkpointSkills: ['API layer building', 'Promise chains', 'Caching strategies', 'Error UX'],
        difficulty: 6,
        prerequisitePhase: 2,
      },
      {
        phase: 4,
        name: 'Performance & Polish',
        duration: 5,
        description: 'Code splitting, lazy loading, accessibility, testing',
        focusAreas: ['Performance metrics', 'Accessibility (a11y)', 'Testing patterns', 'Optimization'],
        expectedOutcome: 'Can optimize user experience',
        checkpointSkills: ['Lighthouse scores', 'A11y compliance', 'Test writing', 'Bundle analysis'],
        difficulty: 7,
        prerequisitePhase: 3,
      },
      {
        phase: 5,
        name: 'Portfolio & Interviews',
        duration: 4,
        description: 'Build portfolio projects, interview prep',
        focusAreas: ['Project building', 'Code review prep', 'Design systems', 'Behavioral'],
        expectedOutcome: 'Ready for frontend interviews',
        checkpointSkills: ['Portfolio quality', 'Design thinking', 'Communication', 'System design'],
        difficulty: 8,
        prerequisitePhase: 4,
      },
    ],

    'Data Scientist': [
      {
        phase: 1,
        name: 'Python & Data Basics',
        duration: 4,
        description: 'Python syntax, pandas, numpy, basic analysis',
        focusAreas: ['Python fundamentals', 'Data structures', 'Pandas basics', 'Data loading'],
        expectedOutcome: 'Can load and explore datasets',
        checkpointSkills: ['Python syntax', 'DataFrame manipulation', 'Basic plotting', 'CSV handling'],
        difficulty: 2,
      },
      {
        phase: 2,
        name: 'Data Cleaning & Exploration',
        duration: 6,
        description: '90% of the job: cleaning, validating, exploring data',
        focusAreas: ['Missing values', 'Outlier detection', 'Feature engineering', 'EDA'],
        expectedOutcome: 'Can prepare data for analysis',
        checkpointSkills: ['Data validation', 'Cleaning pipelines', 'Visualization', 'Statistical thinking'],
        difficulty: 5,
        prerequisitePhase: 1,
      },
      {
        phase: 3,
        name: 'Statistical Analysis',
        duration: 5,
        description: 'Statistics, hypothesis testing, A/B testing',
        focusAreas: ['Probability', 'Hypothesis testing', 'A/B testing', 'Causality'],
        expectedOutcome: 'Can validate hypotheses with data',
        checkpointSkills: ['Statistical literacy', 'Experiment design', 'P-values', 'Effect sizes'],
        difficulty: 7,
        prerequisitePhase: 2,
      },
      {
        phase: 4,
        name: 'Machine Learning Basics',
        duration: 6,
        description: 'Supervised learning, model evaluation, validation',
        focusAreas: ['Classification', 'Regression', 'Cross-validation', 'Model selection'],
        expectedOutcome: 'Can train and evaluate ML models',
        checkpointSkills: ['sklearn fluency', 'Train/test split', 'Metrics understanding', 'Intuition'],
        difficulty: 8,
        prerequisitePhase: 3,
      },
      {
        phase: 5,
        name: 'Projects & Communication',
        duration: 5,
        description: 'Real datasets, modeling, storytelling, presentation',
        focusAreas: ['End-to-end projects', 'Data visualization', 'Reporting', 'Communication'],
        expectedOutcome: 'Can deliver insights from data',
        checkpointSkills: ['Project delivery', 'Data storytelling', 'Presentation', 'Recommendation making'],
        difficulty: 8,
        prerequisitePhase: 4,
      },
    ],

    'DevOps Engineer': [
      {
        phase: 1,
        name: 'Linux & Networking',
        duration: 4,
        description: 'Linux command line, SSH, networking basics',
        focusAreas: ['Linux CLI', 'File systems', 'Users & permissions', 'Networking basics'],
        expectedOutcome: 'Comfortable in Linux terminal',
        checkpointSkills: ['CLI mastery', 'Bash scripting', 'SSH usage', 'TCP/IP basics'],
        difficulty: 3,
      },
      {
        phase: 2,
        name: 'Infrastructure Basics',
        duration: 5,
        description: 'Servers, deployment, version control, CI/CD intro',
        focusAreas: ['Web servers (Nginx)', 'Git/GitHub', 'SSH keys', 'Basic CI/CD'],
        expectedOutcome: 'Can deploy basic applications',
        checkpointSkills: ['Server setup', 'Git workflows', 'Key management', 'Build pipelines'],
        difficulty: 5,
        prerequisitePhase: 1,
      },
      {
        phase: 3,
        name: 'Containerization',
        duration: 5,
        description: 'Docker, container orchestration, Kubernetes intro',
        focusAreas: ['Docker images', 'Docker compose', 'Container registries', 'K8s concepts'],
        expectedOutcome: 'Can containerize and orchestrate applications',
        checkpointSkills: ['Dockerfile writing', 'Image optimization', 'K8s basics', 'Pod management'],
        difficulty: 7,
        prerequisitePhase: 2,
      },
      {
        phase: 4,
        name: 'Cloud Platforms',
        duration: 5,
        description: 'AWS/GCP/Azure fundamentals, infrastructure as code',
        focusAreas: ['Cloud services', 'Networking', 'Storage', 'Infrastructure as code (Terraform)'],
        expectedOutcome: 'Can deploy to cloud platforms',
        checkpointSkills: ['VPC setup', 'IAM understanding', 'Terraform syntax', 'Cost optimization'],
        difficulty: 8,
        prerequisitePhase: 3,
      },
      {
        phase: 5,
        name: 'Reliability & Monitoring',
        duration: 5,
        description: 'Monitoring, logging, alerting, disaster recovery',
        focusAreas: ['Prometheus/Grafana', 'ELK stack', 'Alerting rules', 'Backup/recovery'],
        expectedOutcome: 'Can monitor and maintain systems',
        checkpointSkills: ['Metrics collection', 'Log aggregation', 'Alert design', 'Incident response'],
        difficulty: 8,
        prerequisitePhase: 4,
      },
    ],

    'Product Manager': [
      {
        phase: 1,
        name: 'Product Fundamentals',
        duration: 3,
        description: 'Product strategy, user needs, discovery',
        focusAreas: ['Product thinking', 'User research', 'Problem statements', 'Discovery'],
        expectedOutcome: 'Understand product fundamentals',
        checkpointSkills: ['Problem definition', 'User empathy', 'Competitive analysis', 'Vision clarity'],
        difficulty: 3,
      },
      {
        phase: 2,
        name: 'Metrics & Analytics',
        duration: 4,
        description: 'North Star metrics, funnels, analytics,data-driven decisions',
        focusAreas: ['OKRs', 'Funnels', 'Analytics', 'Metrics design'],
        expectedOutcome: 'Can define and track success metrics',
        checkpointSkills: ['OKR writing', 'Funnel analysis', 'Analytics reading', 'Data interpretation'],
        difficulty: 5,
        prerequisitePhase: 1,
      },
      {
        phase: 3,
        name: 'Roadmap & Prioritization',
        duration: 4,
        description: 'Planning, prioritization frameworks, roadmapping',
        focusAreas: ['Roadmap planning', 'RICE/MoSCoW', 'Tradeoff analysis', 'Release planning'],
        expectedOutcome: 'Can build product roadmaps',
        checkpointSkills: ['Prioritization', 'Roadmap communication', 'Trade-off thinking', 'Planning'],
        difficulty: 6,
        prerequisitePhase: 2,
      },
      {
        phase: 4,
        name: 'Execution & Communication',
        duration: 4,
        description: 'Requirements writing, stakeholder management, launches',
        focusAreas: ['PRD writing', 'Stakeholder management', 'Cross-functional leadership', 'Launch planning'],
        expectedOutcome: 'Can execute full product cycles',
        checkpointSkills: ['PRD clarity', 'Leadership', 'Communication', 'Launch strategy'],
        difficulty: 7,
        prerequisitePhase: 3,
      },
      {
        phase: 5,
        name: 'Strategy & Leadership',
        duration: 4,
        description: 'Product strategy, vision setting, building teams',
        focusAreas: ['Strategy development', 'Vision creation', 'Team building', 'Mentoring'],
        expectedOutcome: 'Can lead product direction',
        checkpointSkills: ['Strategic thinking', 'Vision communication', 'Team leadership', 'Culture building'],
        difficulty: 8,
        prerequisitePhase: 4,
      },
    ],
  }

  return phaseTemplates[role] || []
}

// ============================================================================
// ADAPTATION FUNCTIONS
// ============================================================================

function adaptToSkillLevel(phases: RoadmapNode[], skillLevel: string): RoadmapNode[] {
  return phases.map((phase) => {
    const multiplier = skillLevel === 'advanced' ? 0.6 : skillLevel === 'intermediate' ? 0.8 : 1.0
    const durationAdjustment = skillLevel === 'advanced'
      ? Math.ceil(phase.duration * multiplier)
      : skillLevel === 'intermediate'
      ? Math.ceil(phase.duration * multiplier)
      : phase.duration

    return {
      ...phase,
      duration: Math.max(durationAdjustment, 2), // Minimum 2 weeks per phase
      difficulty: skillLevel === 'advanced'
        ? Math.min(phase.difficulty + 1, 10)
        : phase.difficulty,
    }
  })
}

function adjustForAvailableHours(phases: RoadmapNode[], hours: number): RoadmapNode[] {
  if (hours >= 40) {
    // Full-time: compress timeline by 30%
    return phases.map((p) => ({
      ...p,
      duration: Math.ceil(p.duration * 0.7),
    }))
  } else if (hours >= 20) {
    // Part-time: slight compression
    return phases.map((p) => ({
      ...p,
      duration: Math.ceil(p.duration * 0.85),
    }))
  } else {
    // Flexible: extend slightly for sustainable pace
    return phases.map((p) => ({
      ...p,
      duration: Math.ceil(p.duration * 1.2),
    }))
  }
}

function personalizeByInterests(phases: RoadmapNode[], interests: string[]): RoadmapNode[] {
  // If user has specific interests, emphasize relevant phases
  return phases.map((phase) => {
    const hasRelevantInterest = interests.some((i) => 
      phase.focusAreas.some((f) => f.toLowerCase().includes(i.toLowerCase()))
    )

    if (hasRelevantInterest) {
      return {
        ...phase,
        // Add more detailed focus for interests
        focusAreas: [...phase.focusAreas, `(Your interest: ${interests.find(i => phase.focusAreas.some(f => f.toLowerCase().includes(i.toLowerCase())))}`],
      }
    }

    return phase
  })
}

// ============================================================================
// MILESTONE GENERATION
// ============================================================================

function generateMilestones(role: string, phases: RoadmapNode[]): string[] {
  return phases.map((phase, idx) => {
    const progressPercent = Math.round(((idx + 1) / phases.length) * 100)
    return `${progressPercent}% - ${phase.expectedOutcome}`
  })
}

// ============================================================================
// ALTERNATIVE PATHS
// ============================================================================

function generateAlternativePaths(role: string): string[] {
  const paths: Record<string, string[]> = {
    'Backend Engineer': [
      'Microservices specialization',
      'Real-time systems (sockets)',
      'Language switch (Go, Rust)',
      'GraphQL focus',
    ],
    'Frontend Engineer': [
      'Mobile frontend (React Native)',
      'Game development (Three.js)',
      'Desktop apps (Electron)',
      'Performance optimization',
    ],
    'Data Scientist': [
      'Deep learning specialization',
      'NLP focus',
      'Computer vision path',
      'MLOps/ML Engineering',
    ],
    'DevOps Engineer': [
      'Platform Engineering',
      'Site Reliability Engineering',
      'Security specialization',
      'Cost optimization focus',
    ],
    'Product Manager': [
      'Growth PM specialization',
      'Technical PM focus',
      'Design PM path',
      'Venture PM track',
    ],
  }

  return paths[role] || []
}
