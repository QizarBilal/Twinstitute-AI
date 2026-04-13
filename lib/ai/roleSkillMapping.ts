/**
 * Role to Skills Mapping
 * Defines required and desirable skills for each role
 */

interface RoleProfile {
  domain: string
  jobTitle: string
  requiredSkills: string[]
  desirableSkills: string[]
  coreCompetencies: string[]
  difficulty: number // 1-10 baseline
  description: string
}

export const ROLE_SKILL_MAP: Record<string, RoleProfile> = {
  // ─── BACKEND ENGINEER ────────────────────────────────────────────────────
  'backend-engineer': {
    domain: 'Backend Development',
    jobTitle: 'Backend Engineer',
    requiredSkills: [
      'Node.js',
      'Express.js',
      'REST APIs',
      'SQL',
      'Database Design',
      'Authentication',
      'Error Handling',
      'Git',
    ],
    desirableSkills: [
      'Docker',
      'Microservices',
      'Redis',
      'Message Queues',
      'Load Balancing',
      'System Design',
      'Performance Optimization',
    ],
    coreCompetencies: [
      'Problem Solving',
      'Code Quality',
      'Testing',
      'Debugging',
      'Documentation',
    ],
    difficulty: 6,
    description:
      'Build scalable, reliable backend systems with focus on APIs, databases, and system design',
  },

  // ─── FRONTEND ENGINEER ───────────────────────────────────────────────────
  'frontend-engineer': {
    domain: 'Frontend Development',
    jobTitle: 'Frontend Engineer',
    requiredSkills: [
      'React',
      'JavaScript',
      'HTML/CSS',
      'Component Design',
      'State Management',
      'API Integration',
      'Git',
      'Responsive Design',
    ],
    desirableSkills: [
      'TypeScript',
      'Testing (Jest, Cypress)',
      'Performance Optimization',
      'Accessibility',
      'DevTools',
      'Build Tools (Webpack)',
      'Design Systems',
    ],
    coreCompetencies: [
      'UI/UX Thinking',
      'Problem Solving',
      'Code Quality',
      'Debugging',
      'Collaboration',
    ],
    difficulty: 5,
    description:
      'Create engaging, performant user interfaces with React and modern web technologies',
  },

  // ─── FULL-STACK ENGINEER ────────────────────────────────────────────────
  'fullstack-engineer': {
    domain: 'Full-Stack Development',
    jobTitle: 'Full-Stack Engineer',
    requiredSkills: [
      'React',
      'Node.js',
      'JavaScript',
      'SQL',
      'REST APIs',
      'Database Design',
      'Git',
      'HTML/CSS',
    ],
    desirableSkills: [
      'TypeScript',
      'Docker',
      'Redis',
      'Testing',
      'Performance Optimization',
      'System Design',
      'DevOps Basics',
    ],
    coreCompetencies: [
      'Problem Solving',
      'Code Quality',
      'Architecture',
      'Testing',
      'Debugging',
    ],
    difficulty: 7,
    description:
      'Build complete applications end-to-end with both frontend and backend expertise',
  },

  // ─── DATA SCIENTIST ─────────────────────────────────────────────────────
  'data-scientist': {
    domain: 'Data Science',
    jobTitle: 'Data Scientist',
    requiredSkills: [
      'Python',
      'Pandas',
      'NumPy',
      'Scikit-learn',
      'SQL',
      'Statistics',
      'Data Visualization',
      'Jupyter',
    ],
    desirableSkills: [
      'Deep Learning',
      'TensorFlow',
      'PyTorch',
      'NLP',
      'Feature Engineering',
      'A/B Testing',
      'Big Data Tools',
    ],
    coreCompetencies: [
      'Statistical Thinking',
      'Problem Solving',
      'Data Analysis',
      'Communication',
      'Experimentation',
    ],
    difficulty: 7,
    description:
      'Analyze complex datasets and build predictive models to drive business decisions',
  },

  // ─── ML ENGINEER ────────────────────────────────────────────────────────
  'ml-engineer': {
    domain: 'Machine Learning',
    jobTitle: 'ML Engineer',
    requiredSkills: [
      'Python',
      'TensorFlow',
      'PyTorch',
      'Machine Learning',
      'Statistics',
      'SQL',
      'Git',
      'Jupyter',
    ],
    desirableSkills: [
      'Deep Learning',
      'NLP',
      'Computer Vision',
      'MLOps',
      'Kubernetes',
      'Docker',
      'Model Deployment',
    ],
    coreCompetencies: [
      'Mathematical Thinking',
      'Experimentation',
      'Problem Solving',
      'Systems Thinking',
      'Research',
    ],
    difficulty: 8,
    description:
      'Design, train, and deploy machine learning models for production systems',
  },

  // ─── DEVOPS ENGINEER ────────────────────────────────────────────────────
  'devops-engineer': {
    domain: 'DevOps & Infrastructure',
    jobTitle: 'DevOps Engineer',
    requiredSkills: [
      'Docker',
      'Kubernetes',
      'Linux',
      'CI/CD',
      'Cloud Platforms',
      'Bash',
      'Git',
      'Monitoring',
    ],
    desirableSkills: [
      'Infrastructure as Code',
      'Terraform',
      'Jenkins',
      'AWS/GCP/Azure',
      'Container Orchestration',
      'Database Administration',
    ],
    coreCompetencies: [
      'Systems Thinking',
      'Problem Solving',
      'Automation',
      'Documentation',
      'Reliability',
    ],
    difficulty: 7,
    description:
      'Build and maintain scalable infrastructure and deployment pipelines',
  },
}

export const DOMAIN_TO_ROLES: Record<string, string[]> = {
  'Backend Development': ['backend-engineer', 'fullstack-engineer'],
  'Frontend Development': ['frontend-engineer', 'fullstack-engineer'],
  'Full-Stack Development': ['fullstack-engineer'],
  'Data Science': ['data-scientist'],
  'Machine Learning': ['ml-engineer', 'data-scientist'],
  'DevOps & Infrastructure': ['devops-engineer', 'backend-engineer'],
}

/**
 * Get required skills for a given role
 */
export function getRequiredSkillsForRole(roleId: string): string[] {
  return ROLE_SKILL_MAP[roleId]?.requiredSkills || []
}

/**
 * Get all skills (required + desirable) for a role
 */
export function getAllSkillsForRole(roleId: string): string[] {
  const profile = ROLE_SKILL_MAP[roleId]
  if (!profile) return []
  return [...new Set([...profile.requiredSkills, ...profile.desirableSkills])]
}

/**
 * Calculate skill gap for a user against a role
 */
export function calculateSkillGap(
  userSkills: Map<string, number>,
  roleId: string
): {
  gapSkills: string[]
  gapPercentage: number
  strengthSkills: string[]
} {
  const requiredSkills = getRequiredSkillsForRole(roleId)

  const gapSkills: string[] = []
  const strengthSkills: string[] = []

  for (const skill of requiredSkills) {
    const userProficiency = userSkills.get(skill) || 0
    if (userProficiency < 50) {
      gapSkills.push(skill)
    } else {
      strengthSkills.push(skill)
    }
  }

  const gapPercentage = (gapSkills.length / requiredSkills.length) * 100

  return { gapSkills, gapPercentage, strengthSkills }
}
