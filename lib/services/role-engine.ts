export interface RoleData {
  name: string
  responsibilities: string[]
  tools: string[]
  dailyTasks: string[]
  marketDemand: string
  payRange: string
  growthPath: string[]
  difficulty: number
  futureScope: string
  requiredSkills: string[]
  timeToLearn: string
}

const ROLE_DATABASE: Record<string, RoleData> = {
  'Full Stack Developer': {
    name: 'Full Stack Developer',
    responsibilities: [
      'Build and maintain web applications from frontend to backend',
      'Design database schemas and API architectures',
      'Implement user interfaces with modern frameworks',
      'Deploy and monitor production systems'
    ],
    tools: ['React', 'Node.js', 'PostgreSQL', 'Git', 'Docker', 'AWS'],
    dailyTasks: [
      'Write code for new features',
      'Review pull requests from teammates',
      'Debug production issues',
      'Participate in sprint planning meetings',
      'Optimize application performance'
    ],
    marketDemand: 'Very High - consistently top 3 most in-demand tech roles',
    payRange: '$60k-$150k depending on experience and location',
    growthPath: ['Junior Developer', 'Mid-level Developer', 'Senior Developer', 'Tech Lead', 'Engineering Manager'],
    difficulty: 7,
    futureScope: 'Excellent - web applications continue to dominate business software',
    requiredSkills: ['JavaScript/TypeScript', 'React/Vue', 'Node.js/Python', 'SQL', 'REST APIs', 'Git'],
    timeToLearn: '6-12 months for job-ready skills'
  },
  'Data Scientist': {
    name: 'Data Scientist',
    responsibilities: [
      'Analyze large datasets to extract business insights',
      'Build predictive models using machine learning',
      'Communicate findings to non-technical stakeholders',
      'Design and run experiments to test hypotheses'
    ],
    tools: ['Python', 'SQL', 'Jupyter', 'Pandas', 'scikit-learn', 'TensorFlow'],
    dailyTasks: [
      'Clean and prepare data for analysis',
      'Train and evaluate machine learning models',
      'Create data visualizations and dashboards',
      'Present insights to business teams',
      'Monitor model performance in production'
    ],
    marketDemand: 'High - data-driven decision making is critical for modern businesses',
    payRange: '$70k-$160k depending on industry and seniority',
    growthPath: ['Junior Data Analyst', 'Data Scientist', 'Senior Data Scientist', 'Lead Data Scientist', 'Head of Data'],
    difficulty: 8,
    futureScope: 'Excellent - AI and analytics are only growing in importance',
    requiredSkills: ['Python', 'Statistics', 'SQL', 'Machine Learning', 'Data Visualization', 'Business Acumen'],
    timeToLearn: '8-15 months with strong math background'
  },
  'UI/UX Designer': {
    name: 'UI/UX Designer',
    responsibilities: [
      'Design intuitive user interfaces for digital products',
      'Conduct user research and usability testing',
      'Create wireframes, prototypes, and high-fidelity mockups',
      'Collaborate with developers and product managers'
    ],
    tools: ['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Miro', 'UserTesting'],
    dailyTasks: [
      'Design new features based on user needs',
      'Run usability tests with real users',
      'Iterate on designs based on feedback',
      'Maintain design system consistency',
      'Present designs to stakeholders'
    ],
    marketDemand: 'High - good design is a competitive advantage',
    payRange: '$55k-$130k depending on portfolio and experience',
    growthPath: ['Junior Designer', 'UX Designer', 'Senior Designer', 'Design Lead', 'Head of Design'],
    difficulty: 6,
    futureScope: 'Strong - user experience remains critical to product success',
    requiredSkills: ['Design Tools', 'User Research', 'Visual Design', 'Prototyping', 'Communication', 'Empathy'],
    timeToLearn: '4-8 months with practice projects'
  },
  'AI/ML Engineer': {
    name: 'AI/ML Engineer',
    responsibilities: [
      'Develop and deploy machine learning models at scale',
      'Build AI systems that solve real-world problems',
      'Optimize model performance and efficiency',
      'Implement MLOps pipelines for production systems'
    ],
    tools: ['Python', 'PyTorch', 'TensorFlow', 'Docker', 'Kubernetes', 'AWS SageMaker'],
    dailyTasks: [
      'Train deep learning models on large datasets',
      'Tune hyperparameters for optimal performance',
      'Deploy models to production infrastructure',
      'Monitor and improve model accuracy',
      'Research new AI techniques and papers'
    ],
    marketDemand: 'Extremely High - AI adoption is accelerating across industries',
    payRange: '$90k-$200k+ for experienced practitioners',
    growthPath: ['ML Intern', 'ML Engineer', 'Senior ML Engineer', 'ML Architect', 'Head of AI'],
    difficulty: 9,
    futureScope: 'Exceptional - AI is transforming every industry',
    requiredSkills: ['Python', 'Deep Learning', 'Mathematics', 'Cloud Platforms', 'Model Deployment', 'Problem Solving'],
    timeToLearn: '12-18 months with strong programming foundation'
  },
  'Cloud Engineer': {
    name: 'Cloud Engineer',
    responsibilities: [
      'Design and manage cloud infrastructure',
      'Automate deployment and scaling of applications',
      'Ensure security and compliance of cloud resources',
      'Optimize cloud costs and performance'
    ],
    tools: ['AWS/Azure/GCP', 'Terraform', 'Kubernetes', 'Docker', 'CI/CD Tools', 'Monitoring Systems'],
    dailyTasks: [
      'Configure cloud resources and services',
      'Write infrastructure as code',
      'Monitor system health and performance',
      'Troubleshoot infrastructure issues',
      'Implement security best practices'
    ],
    marketDemand: 'Very High - cloud migration is a priority for most companies',
    payRange: '$75k-$170k based on certifications and experience',
    growthPath: ['Junior DevOps', 'Cloud Engineer', 'Senior Cloud Engineer', 'Cloud Architect', 'VP of Infrastructure'],
    difficulty: 7,
    futureScope: 'Excellent - cloud adoption continues to grow',
    requiredSkills: ['Cloud Platforms', 'Linux', 'Networking', 'Automation', 'Security', 'Scripting'],
    timeToLearn: '6-10 months with IT fundamentals'
  },
  'Cybersecurity Analyst': {
    name: 'Cybersecurity Analyst',
    responsibilities: [
      'Protect systems and data from cyber threats',
      'Monitor networks for security breaches',
      'Conduct security assessments and penetration testing',
      'Respond to security incidents'
    ],
    tools: ['Wireshark', 'Metasploit', 'Nmap', 'SIEM Tools', 'Firewalls', 'IDS/IPS'],
    dailyTasks: [
      'Analyze security logs and alerts',
      'Investigate potential security incidents',
      'Perform vulnerability scans',
      'Update security policies and procedures',
      'Train employees on security awareness'
    ],
    marketDemand: 'Very High - cybersecurity threats are increasing',
    payRange: '$65k-$150k depending on specialization',
    growthPath: ['Security Analyst', 'Senior Analyst', 'Security Engineer', 'Security Architect', 'CISO'],
    difficulty: 8,
    futureScope: 'Excellent - cybersecurity is critical and always evolving',
    requiredSkills: ['Networking', 'Operating Systems', 'Security Tools', 'Threat Analysis', 'Incident Response', 'Compliance'],
    timeToLearn: '8-12 months with certifications'
  },
  'Product Manager': {
    name: 'Product Manager',
    responsibilities: [
      'Define product vision and strategy',
      'Prioritize features based on user needs and business goals',
      'Coordinate between engineering, design, and business teams',
      'Analyze product metrics and user feedback'
    ],
    tools: ['Jira', 'Figma', 'Analytics Platforms', 'SQL', 'Roadmapping Tools', 'User Research Tools'],
    dailyTasks: [
      'Write product requirements and user stories',
      'Conduct user interviews and surveys',
      'Analyze product usage data',
      'Run sprint planning and reviews',
      'Make data-driven prioritization decisions'
    ],
    marketDemand: 'High - companies need strong product leaders',
    payRange: '$80k-$180k+ at senior levels',
    growthPath: ['Associate PM', 'Product Manager', 'Senior PM', 'Director of Product', 'VP of Product'],
    difficulty: 7,
    futureScope: 'Strong - tech product management is a growing field',
    requiredSkills: ['Communication', 'Analytics', 'User Research', 'Technical Understanding', 'Strategy', 'Leadership'],
    timeToLearn: '6-9 months to transition (often requires prior tech experience)'
  }
}

export function getRoleExplanation(roleName: string): RoleData | null {
  return ROLE_DATABASE[roleName] || null
}

export function getAllRoles(): string[] {
  return Object.keys(ROLE_DATABASE)
}

export function recommendRoles(
  skills: string[],
  interests: string[],
  workStyle: string,
  timeAvailability: string
): Array<{ role: RoleData; score: number; reasoning: string }> {
  const recommendations: Array<{ role: RoleData; score: number; reasoning: string }> = []

  for (const [roleName, roleData] of Object.entries(ROLE_DATABASE)) {
    let score = 0
    const reasons: string[] = []

    const skillMatches = skills.filter(skill => 
      roleData.requiredSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()))
    ).length

    score += skillMatches * 15

    if (skillMatches > 0) {
      reasons.push(`${skillMatches} of your skills match this role`)
    }

    interests.forEach(interest => {
      if (roleName.toLowerCase().includes(interest.toLowerCase()) ||
          roleData.responsibilities.some(r => r.toLowerCase().includes(interest.toLowerCase()))) {
        score += 10
        reasons.push(`Aligns with your interest in ${interest}`)
      }
    })

    if (workStyle === 'creative' && ['UI/UX Designer', 'Product Manager'].includes(roleName)) {
      score += 15
      reasons.push('Suits creative work style')
    }

    if (workStyle === 'analytical' && ['Data Scientist', 'AI/ML Engineer'].includes(roleName)) {
      score += 15
      reasons.push('Suits analytical thinking')
    }

    if (workStyle === 'coding' && ['Full Stack Developer', 'AI/ML Engineer', 'Cloud Engineer'].includes(roleName)) {
      score += 15
      reasons.push('Coding-focused role')
    }

    if (timeAvailability === 'limited' && roleData.difficulty <= 6) {
      score += 10
      reasons.push('Achievable with limited time')
    }

    if (timeAvailability === 'full-time' && roleData.difficulty >= 7) {
      score += 8
      reasons.push('Challenging role suitable for full-time learners')
    }

    if (score > 0) {
      recommendations.push({
        role: roleData,
        score,
        reasoning: reasons.join(', ')
      })
    }
  }

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 5)
}

export function calculateSkillGap(role: RoleData, currentSkills: Array<{ name: string; level: string }>): {
  gaps: string[]
  strengths: string[]
  learningDistance: string
  monthsEstimate: number
} {
  const userSkillNames = currentSkills.map(s => s.name.toLowerCase())
  const requiredSkillsLower = role.requiredSkills.map(s => s.toLowerCase())

  const strengths = role.requiredSkills.filter(req =>
    userSkillNames.some(user => req.toLowerCase().includes(user) || user.includes(req.toLowerCase()))
  )

  const gaps = role.requiredSkills.filter(req =>
    !userSkillNames.some(user => req.toLowerCase().includes(user) || user.includes(req.toLowerCase()))
  )

  const totalRequired = role.requiredSkills.length
  const haveCount = strengths.length
  const gapPercentage = (gaps.length / totalRequired) * 100

  let learningDistance = 'Far'
  let monthsEstimate = 12

  if (gapPercentage < 30) {
    learningDistance = 'Close'
    monthsEstimate = 3
  } else if (gapPercentage < 60) {
    learningDistance = 'Moderate'
    monthsEstimate = 6
  } else {
    learningDistance = 'Far'
    monthsEstimate = 12
  }

  const advancedSkills = currentSkills.filter(s => s.level === 'advanced').length
  if (advancedSkills > 2) {
    monthsEstimate = Math.max(2, monthsEstimate - 2)
  }

  return {
    gaps,
    strengths,
    learningDistance,
    monthsEstimate
  }
}

export function generateRoadmapPreview(role: RoleData, skillGap: ReturnType<typeof calculateSkillGap>): {
  estimatedMonths: number
  intensity: string
  difficultyScore: number
  milestones: string[]
} {
  const { monthsEstimate } = skillGap

  let intensity = 'Moderate'
  if (monthsEstimate <= 4) {
    intensity = 'Light'
  } else if (monthsEstimate > 8) {
    intensity = 'High'
  }

  const milestones: string[] = []

  if (skillGap.gaps.length > 0) {
    milestones.push(`Learn fundamentals: ${skillGap.gaps.slice(0, 3).join(', ')}`)
  }

  milestones.push('Build 2-3 portfolio projects')
  milestones.push('Complete certifications or courses')
  milestones.push('Apply for entry-level positions')

  return {
    estimatedMonths: monthsEstimate,
    intensity,
    difficultyScore: role.difficulty,
    milestones
  }
}
