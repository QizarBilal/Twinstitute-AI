/**
 * AI-Driven Task Generation Engine
 * Generates personalized tasks based on user profile, skill gaps, and performance
 */

import { calculateSkillGap, getRequiredSkillsForRole, ROLE_SKILL_MAP } from './roleSkillMapping'

export interface UserProfile {
  userId: string
  selectedRole: string
  capabilityScore: number // 0-100
  skillGenome: Map<string, number> // skill -> proficiency 0-100
  weakSkills: string[]
  performanceHistory: PerformanceRecord[]
  completedTaskCount: number
  successRate: number // 0-1
  learningVelocity: number // tasks/week
  pastErrors: string[]
}

export interface PerformanceRecord {
  taskId: string
  performance: number // 0-100
  timeSpent: number
  estimatedTime: number
  timestamp: Date
}

export interface GeneratedTask {
  id: string
  title: string
  description: string
  realWorldContext: string
  skillsFocused: string[]
  skillsSecondary: string[]
  difficulty: number // 1-10 (adaptive)
  estimatedTime: number // minutes
  taskType: 'micro' | 'mid' | 'capstone'
  domain: string
  resources?: string[]
  expectedOutput: string
  successCriteria: string[]
  hints?: string[]
  previousTaskId?: string // prerequisite
  priority: number // 1-high, 2-medium, 3-low
  personalizationFactors: {
    targetedSkills: string[]
    addressesWeakness: boolean
    buildsOnStrength: boolean
    estimatedCompletion: string
  }
}

/**
 * TASK TYPE DEFINITIONS
 */
const TASK_DEFINITIONS = {
  'micro-tasks': {
    description: 'Quick, focused exercises',
    timeRange: [30, 120],
    difficulty: [1, 3],
  },
  'mid-tasks': {
    description: 'Multi-step problem solving',
    timeRange: [240, 480],
    difficulty: [3, 6],
  },
  'capstone-projects': {
    description: 'Real-world application projects',
    timeRange: [1440, 10080], // 1 day to 1 week
    difficulty: [6, 10],
  },
}

/**
 * REAL-WORLD TASK TEMPLATES
 * These are structured templates for real tasks, not fake placeholders
 */
const REAL_WORLD_TASKS = {
  // Backend Engineering
  'be-auth-system': {
    title: 'Build a Secure Authentication System',
    context:
      'Implement production-grade authentication similar to how auth0 or firebase works',
    skills: ['Node.js', 'Security', 'Authentication', 'JWT', 'Password Hashing'],
    domain: 'Backend Development',
    description:
      'Create a RESTful authentication API with JWT tokens, refresh tokens, OAuth2 flow, and proper security measures. Include rate limiting, account lockout, and email verification.',
    expectedOutput:
      'Working API endpoints that pass security audit with 100% coverage',
    successCriteria: [
      'Implements JWT tokens correctly',
      'Includes mandatory refresh token rotation',
      'Has rate limiting on login attempts',
      'Password stored with proper hashing (bcrypt)',
      'Email verification working',
      'OAuth2 integration',
      'Security headers present',
    ],
  },

  'be-database-design': {
    title: 'Design a Scalable Database Schema',
    context:
      'Create a normalized database schema for a complex application like Airbnb',
    skills: ['SQL', 'Database Design', 'Normalization', 'Indexing'],
    domain: 'Backend Development',
    description:
      'Design a relational database for an e-commerce platform supporting millions of users, products, orders, and reviews. Include proper indexing strategies.',
    expectedOutput:
      'SQL schema with ERD, migration scripts, and performance analysis',
    successCriteria: [
      '3NF normalization minimum',
      'Proper foreign key relationships',
      'Indexes on high-query columns',
      'Query performance optimized',
      'Handles concurrent writes',
    ],
  },

  'be-api-design': {
    title: 'Design RESTful API',
    context: 'Create a well-designed REST API for a social media platform',
    skills: ['REST APIs', 'Express.js', 'Node.js', 'HTTP'],
    domain: 'Backend Development',
    description:
      'Build a REST API with proper versioning, error handling, pagination, and documentation. Include rate limiting and caching strategies.',
    expectedOutput:
      'Fully documented API with Swagger/OpenAPI, test suite, and performance benchmarks',
    successCriteria: [
      'Proper HTTP methods usage',
      'Versioning strategy',
      'Pagination implemented',
      'Comprehensive error handling',
      'Rate limiting implemented',
      'Caching strategy',
      'API documentation complete',
    ],
  },

  // Frontend Engineering
  'fe-state-management': {
    title: 'State Management in React',
    context:
      'Build a complex React application with Redux or Context API managing intricate state',
    skills: ['React', 'State Management', 'Redux', 'JavaScript'],
    domain: 'Frontend Development',
    description:
      'Create a dashboard application with complex state management including synchronization across components, undo/redo functionality, and persisted state.',
    expectedOutput:
      'React application with clean state management, test coverage >80%',
    successCriteria: [
      'State properly normalized',
      'No prop drilling',
      'Selectors for optimization',
      'Time-travel debugging works',
      'Performance optimized',
      'Tests covering state changes',
    ],
  },

  'fe-performance': {
    title: 'Optimize React App Performance',
    context:
      'Fix performance issues in a slow React application with thousands of components',
    skills: ['React', 'Performance Optimization', 'Profiling', 'JavaScript'],
    domain: 'Frontend Development',
    description:
      'Given a slow React app, identify bottlenecks using React DevTools profiler and implement optimizations including memoization, code splitting, and lazy loading.',
    expectedOutput:
      'Performance improved by >50%, with profiling report and optimization doc',
    successCriteria: [
      'FCP improved',
      'LCP improved',
      'Memory usage reduced',
      'Unnecessary re-renders eliminated',
      'Bundle size optimized',
      'Lazy loading implemented',
    ],
  },

  // Full-Stack
  'fs-ecommerce': {
    title: 'Build a Full E-commerce Platform',
    context:
      'Create a complete e-commerce system from database to user interface',
    skills: [
      'React',
      'Node.js',
      'SQL',
      'REST APIs',
      'Payment Integration',
    ],
    domain: 'Full-Stack Development',
    description:
      'Build a complete e-commerce platform including product catalog, shopping cart, checkout with Stripe integration, and order management system.',
    expectedOutput:
      'Fully functional e-commerce platform deployed to production',
    successCriteria: [
      'Product browsing & search',
      'Shopping cart functional',
      'Stripe payment integration',
      'Order tracking',
      'User authentication',
      'Admin dashboard',
      'Mobile responsive',
      'Performance >90 Lighthouse',
    ],
  },

  // Data Science
  'ds-eda': {
    title: 'Exploratory Data Analysis on Real Dataset',
    context:
      'Analyze a complex dataset (e.g., Kaggle dataset) to derive insights',
    skills: ['Python', 'Pandas', 'Data Visualization', 'Statistics'],
    domain: 'Data Science',
    description:
      'Perform comprehensive EDA on a real dataset, including data cleaning, feature engineering, statistical analysis, and visualization of key insights.',
    expectedOutput:
      'Jupyter notebook with analysis, visualizations, and key findings',
    successCriteria: [
      'Data quality issues identified',
      'Missing values handled',
      'Outliers detected',
      'Distributions visualized',
      'Correlations analyzed',
      'Insights documented',
      'Recommendations provided',
    ],
  },

  'ds-model-building': {
    title: 'Build Predictive ML Model',
    context:
      'Create a machine learning model to solve a real-world prediction problem',
    skills: ['Python', 'Scikit-learn', 'Statistics', 'Feature Engineering'],
    domain: 'Data Science',
    description:
      'Build a predictive model (classification/regression) with proper train-test split, feature scaling, model selection, hyperparameter tuning, and evaluation.',
    expectedOutput:
      'Model with >85% accuracy, cross-validation report, and feature importance analysis',
    successCriteria: [
      'Baseline model created',
      'Features engineered',
      'Models compared',
      'Hyperparameters tuned',
      'Cross-validation done',
      'Metrics reported',
      'Feature importance analyzed',
    ],
  },

  // DevOps
  'devops-containerization': {
    title: 'Containerize and Orchestrate Application',
    context:
      'Take an existing application and containerize it with Docker and Kubernetes',
    skills: ['Docker', 'Kubernetes', 'Linux', 'YAML'],
    domain: 'DevOps & Infrastructure',
    description:
      'Create Dockerfile for multi-stage builds, push to registry, deploy to Kubernetes cluster with proper resource limits, health checks, and scaling policies.',
    expectedOutput:
      'Kubernetes deployment files, deployment guide, and monitoring setup',
    successCriteria: [
      'Multi-stage Docker build',
      'Optimized image size',
      'Kubernetes deployment manifests',
      'Health checks configured',
      'Resource limits set',
      'Scaling policies configured',
      'Monitoring/logging setup',
    ],
  },
}

/**
 * Main Task Generator
 */
export class TaskGenerator {
  /**
   * Generate a personalized task for the user
   */
  static generateTask(userProfile: UserProfile): GeneratedTask {
    // Step 1: Identify skill gaps
    const { gapSkills, strengthSkills } = calculateSkillGap(
      userProfile.skillGenome,
      userProfile.selectedRole
    )

    // Step 2: Determine task type based on completion and velocity
    const taskType = this.selectTaskType(userProfile)

    // Step 3: Calculate adaptive difficulty
    const baseDifficulty = ROLE_SKILL_MAP[userProfile.selectedRole]?.difficulty || 5
    const adaptiveDifficulty = this.calculateAdaptiveDifficulty(
      userProfile,
      baseDifficulty
    )

    // Step 4: Identify priority skills to target
    const targetSkills = this.selectTargetSkills(
      gapSkills,
      userProfile.weakSkills,
      userProfile.performanceHistory
    )

    // Step 5: Select and personalize a real-world task
    const baseTask = this.selectRealWorldTask(
      userProfile.selectedRole,
      targetSkills,
      adaptiveDifficulty
    )

    // Step 6: Personalize the task
    const personalizedTask = this.personalizeTask(
      baseTask,
      userProfile,
      targetSkills,
      adaptiveDifficulty,
      taskType
    )

    return personalizedTask
  }

  /**
   * Select task type based on user performance and learning velocity
   */
  private static selectTaskType(
    userProfile: UserProfile
  ): 'micro' | 'mid' | 'capstone' {
    // New users or struggling: micro tasks
    if (userProfile.completedTaskCount < 5 || userProfile.successRate < 0.6) {
      return 'micro'
    }

    // Building momentum: mix micro and mid
    if (userProfile.completedTaskCount < 20) {
      return Math.random() > 0.4 ? 'mid' : 'micro'
    }

    // Advanced: focus on capstones
    if (userProfile.successRate > 0.8 && userProfile.learningVelocity > 2) {
      return 'capstone'
    }

    return 'mid'
  }

  /**
   * Calculate adaptive difficulty based on performance
   */
  private static calculateAdaptiveDifficulty(
    userProfile: UserProfile,
    baseDifficulty: number
  ): number {
    let difficulty = baseDifficulty

    // If succeeding, increase difficulty
    if (userProfile.successRate > 0.85) {
      difficulty = Math.min(difficulty + 2, 10)
    } else if (userProfile.successRate > 0.7) {
      difficulty = Math.min(difficulty + 1, 10)
    }

    // If struggling, decrease difficulty
    if (userProfile.successRate < 0.5) {
      difficulty = Math.max(difficulty - 2, 1)
    } else if (userProfile.successRate < 0.65) {
      difficulty = Math.max(difficulty - 1, 1)
    }

    // Cap based on capability
    const capabilityDifficulty = Math.floor((userProfile.capabilityScore / 100) * 10)
    return Math.min(difficulty, capabilityDifficulty)
  }

  /**
   * Select target skills based on gaps, weaknesses, and performance
   */
  private static selectTargetSkills(
    gapSkills: string[],
    weakSkills: string[],
    performanceHistory: PerformanceRecord[]
  ): string[] {
    const allTargetSkills = [...new Set([...gapSkills, ...weakSkills])]

    // Prioritize skills with recent failures
    const failedSkills = new Set<string>()
    for (const record of performanceHistory.slice(-10)) {
      if (record.performance < 60) {
        failedSkills.add(record.taskId)
      }
    }

    // Return top 2-3 skills to focus on
    return allTargetSkills.slice(0, 3)
  }

  /**
   * Select a real-world task template based on role and skills
   */
  private static selectRealWorldTask(
    role: string,
    targetSkills: string[],
    difficulty: number
  ): any {
    // Map roles to available tasks
    const roleTaskMap: Record<string, string[]> = {
      'backend-engineer': [
        'be-auth-system',
        'be-database-design',
        'be-api-design',
      ],
      'frontend-engineer': ['fe-state-management', 'fe-performance'],
      'fullstack-engineer': [
        'be-auth-system',
        'fe-state-management',
        'fs-ecommerce',
      ],
      'data-scientist': ['ds-eda', 'ds-model-building'],
      'devops-engineer': ['devops-containerization'],
    }

    const availableTasks = roleTaskMap[role] || ['be-api-design']
    const taskKey =
      availableTasks[Math.floor(Math.random() * availableTasks.length)]

    return REAL_WORLD_TASKS[taskKey as keyof typeof REAL_WORLD_TASKS] || REAL_WORLD_TASKS['be-api-design']
  }

  /**
   * Personalize a task template for the user
   */
  private static personalizeTask(
    baseTask: any,
    userProfile: UserProfile,
    targetSkills: string[],
    difficulty: number,
    taskType: 'micro' | 'mid' | 'capstone'
  ): GeneratedTask {
    const taskTypeInfo = TASK_DEFINITIONS[taskType === 'micro' ? 'micro-tasks' : taskType === 'mid' ? 'mid-tasks' : 'capstone-projects']

    return {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: baseTask.title,
      description: baseTask.description,
      realWorldContext: baseTask.context,
      skillsFocused: targetSkills,
      skillsSecondary: baseTask.skills.filter((s: string) => !targetSkills.includes(s)),
      difficulty: Math.max(1, Math.min(difficulty, 10)),
      estimatedTime:
        taskTypeInfo.timeRange[0] +
        Math.random() * (taskTypeInfo.timeRange[1] - taskTypeInfo.timeRange[0]),
      taskType,
      domain: baseTask.domain,
      resources: [
        'https://github.com/topics/api-design',
        'https://www.postman.com/api-documentation',
      ],
      expectedOutput: baseTask.expectedOutput,
      successCriteria: baseTask.successCriteria,
      priority: targetSkills.length > 2 ? 1 : targetSkills.length > 1 ? 2 : 3,
      personalizationFactors: {
        targetedSkills: targetSkills,
        addressesWeakness: userProfile.weakSkills.some(ws =>
          targetSkills.includes(ws)
        ),
        buildsOnStrength: (userProfile.skillGenome.get(targetSkills[0] || '') ?? 0) > 50,
        estimatedCompletion: `${Math.round(
          (taskTypeInfo.timeRange[0] + taskTypeInfo.timeRange[1]) / 2 / 60
        )} hours`,
      },
    }
  }
}
