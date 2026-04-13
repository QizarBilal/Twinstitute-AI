/**
 * BASE ROLE DATA LAYER - FALLBACK DATA
 * 
 * PURPOSE: Provides deterministic fallback data when AI fails
 * This ensures the system NEVER breaks, even if Groq API is down
 * 
 * GOLDEN RULE: If AI returns null/invalid → always fall back to this data
 * AI enriches the data, but never replaces it
 */

export interface BaseRoleData {
  coreSkills: string[]
  marketDemand: 'High' | 'Medium' | 'Low'
  baseSalaryRange: {
    entry: number // ₹ per annum
    mid: number
    senior: number
  }
  yearsToSenior: number
  industryGrowth: 'Declining' | 'Stable' | 'Growing' | 'Booming'
  jobMarketStatus: string
  commonCareerProgression: string[]
}

/**
 * Static role database with verified 2024-2026 India market data
 * Source: Industry surveys, job boards, company reports
 */
export const ROLE_BASE_DATABASE: Record<string, BaseRoleData> = {
  'Full-Stack Software Engineer': {
    coreSkills: [
      'JavaScript/TypeScript',
      'React or Vue',
      'Node.js',
      'SQL Databases',
      'REST APIs',
    ],
    marketDemand: 'High',
    baseSalaryRange: {
      entry: 600000, // ₹6LPA
      mid: 1200000, // ₹12LPA
      senior: 2500000, // ₹25LPA+
    },
    yearsToSenior: 6,
    industryGrowth: 'Booming',
    jobMarketStatus: 'High demand across startups and enterprises',
    commonCareerProgression: [
      'Junior Developer → Senior Developer',
      'Tech Lead',
      'Architect',
      'Engineering Manager',
    ],
  },
  'Frontend Software Engineer': {
    coreSkills: [
      'HTML/CSS',
      'JavaScript/TypeScript',
      'React/Vue/Angular',
      'UI/UX Principles',
      'Responsive Design',
    ],
    marketDemand: 'High',
    baseSalaryRange: {
      entry: 550000, // ₹5.5LPA
      mid: 1100000, // ₹11LPA
      senior: 2300000, // ₹23LPA+
    },
    yearsToSenior: 5,
    industryGrowth: 'Growing',
    jobMarketStatus: 'Strong demand in web and mobile development',
    commonCareerProgression: [
      'Junior FE Developer → Senior FE Developer',
      'UI/UX Specialist',
      'Tech Lead',
      'Product Manager',
    ],
  },
  'Backend Software Engineer': {
    coreSkills: [
      'Java/Python/Go',
      'Databases (SQL/NoSQL)',
      'APIs & Microservices',
      'System Design',
      'Cloud Platforms',
    ],
    marketDemand: 'High',
    baseSalaryRange: {
      entry: 650000, // ₹6.5LPA
      mid: 1300000, // ₹13LPA
      senior: 2800000, // ₹28LPA+
    },
    yearsToSenior: 6,
    industryGrowth: 'Booming',
    jobMarketStatus: 'Critical shortage of experienced developers',
    commonCareerProgression: [
      'Junior Developer → Senior Developer',
      'Architect',
      'Tech Lead',
      'Engineering Manager',
      'CTO',
    ],
  },
  'Data Engineer': {
    coreSkills: [
      'Python/Scala',
      'SQL',
      'Big Data Tools (Spark/Hadoop)',
      'ETL/Data Pipelines',
      'Cloud (AWS/GCP/Azure)',
    ],
    marketDemand: 'High',
    baseSalaryRange: {
      entry: 700000, // ₹7LPA
      mid: 1400000, // ₹14LPA
      senior: 3000000, // ₹30LPA+
    },
    yearsToSenior: 6,
    industryGrowth: 'Booming',
    jobMarketStatus: 'Extreme shortage, companies competing for talent',
    commonCareerProgression: [
      'Junior Data Engineer → Senior Data Engineer',
      'Data Architect',
      'Analytics Engineer',
      'Engineering Manager',
    ],
  },
  'Data Scientist': {
    coreSkills: [
      'Python/R',
      'Machine Learning',
      'Statistics',
      'SQL',
      'Data Visualization',
    ],
    marketDemand: 'High',
    baseSalaryRange: {
      entry: 650000, // ₹6.5LPA
      mid: 1300000, // ₹13LPA
      senior: 2800000, // ₹28LPA+
    },
    yearsToSenior: 5,
    industryGrowth: 'Growing',
    jobMarketStatus: 'Strong demand but more saturated than DE',
    commonCareerProgression: [
      'Junior DS → Senior DS',
      'ML Engineer',
      'Analytics Lead',
      'AI/ML Manager',
    ],
  },
  'DevOps Engineer': {
    coreSkills: [
      'Linux/Unix',
      'Docker/Kubernetes',
      'CI/CD Pipelines',
      'Cloud Platforms',
      'Infrastructure as Code',
    ],
    marketDemand: 'High',
    baseSalaryRange: {
      entry: 700000, // ₹7LPA
      mid: 1400000, // ₹14LPA
      senior: 3000000, // ₹30LPA+
    },
    yearsToSenior: 6,
    industryGrowth: 'Booming',
    jobMarketStatus: 'High demand across all tech companies',
    commonCareerProgression: [
      'Junior DevOps → Senior DevOps',
      'Infrastructure Architect',
      'Platform Engineer',
      'Engineering Manager',
    ],
  },
  'Product Manager': {
    coreSkills: [
      'Product Strategy',
      'User Research',
      'Data Analysis',
      'Communication',
      'SQL/Analytics',
    ],
    marketDemand: 'Medium',
    baseSalaryRange: {
      entry: 800000, // ₹8LPA
      mid: 1600000, // ₹16LPA
      senior: 3500000, // ₹35LPA+
    },
    yearsToSenior: 6,
    industryGrowth: 'Growing',
    jobMarketStatus: 'More competitive, requires 2-3 years eng background',
    commonCareerProgression: [
      'APM → PM',
      'Senior PM',
      'Director of Product',
      'VP Products',
      'Chief Product Officer',
    ],
  },
  'Security Engineer': {
    coreSkills: [
      'Network Security',
      'Cryptography',
      'System Hardening',
      'Penetration Testing',
      'Cloud Security',
    ],
    marketDemand: 'High',
    baseSalaryRange: {
      entry: 750000, // ₹7.5LPA
      mid: 1500000, // ₹15LPA
      senior: 3200000, // ₹32LPA+
    },
    yearsToSenior: 6,
    industryGrowth: 'Booming',
    jobMarketStatus: 'Critical demand with strict compliance requirements',
    commonCareerProgression: [
      'Junior Security → Senior Security',
      'Security Architect',
      'CISO',
      'Chief Security Officer',
    ],
  },
  'Cloud Architect': {
    coreSkills: [
      'AWS/Azure/GCP',
      'Cloud Architecture',
      'Infrastructure Design',
      'DevOps',
      'Cost Optimization',
    ],
    marketDemand: 'High',
    baseSalaryRange: {
      entry: 900000, // ₹9LPA
      mid: 1800000, // ₹18LPA
      senior: 3500000, // ₹35LPA+
    },
    yearsToSenior: 6,
    industryGrowth: 'Booming',
    jobMarketStatus: 'Requires 8+ years experience, very high demand',
    commonCareerProgression: [
      'Senior Engineer → Cloud Architect',
      'Principal Architect',
      'VP Infrastructure',
    ],
  },
}

/**
 * Get base role data for a specific role
 * Returns null if role not found (don't fill unknown roles)
 */
export function getBaseRoleData(roleName: string): BaseRoleData | null {
  return ROLE_BASE_DATABASE[roleName] || null
}

/**
 * Get list of all known roles
 */
export function getAllKnownRoles(): string[] {
  return Object.keys(ROLE_BASE_DATABASE)
}

/**
 * Check if a role exists in base database
 */
export function isKnownRole(roleName: string): boolean {
  return roleName in ROLE_BASE_DATABASE
}
