/**
 * LABS INITIALIZER
 * 
 * When user confirms their role, immediately assign them first 3 labs
 * Labs are role-specific, difficulty-adapted, and tied to roadmap phases
 */

import { RoadmapNode } from './roadmap-generator'

// ============================================================================
// TYPES
// ============================================================================

export interface InitializedLab {
  labId: string
  title: string
  phase: number
  difficulty: number
  estimatedHours: number
  description: string
  objectives: string[]
  starterCode?: string
  resources: {
    type: 'docs' | 'video' | 'article' | 'tutorial'
    title: string
    url: string
  }[]
  submission: {
    type: 'code' | 'project' | 'presentation'
    requirements: string[]
  }
  successCriteria: string[]
}

export interface LabInitializerInput {
  userId: string
  role: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  learningStyle: string
  roadmapPhases: RoadmapNode[]
}

// ============================================================================
// MAIN LABS INITIALIZER
// ============================================================================

export async function initializeLabs(input: LabInitializerInput): Promise<InitializedLab[]> {
  const labDatabase = getLabsForRole(input.role)

  if (!labDatabase.length) {
    throw new Error(`No labs available for role: ${input.role}`)
  }

  // Select first 3 labs adapted to skill level
  const selectedLabs = selectInitialLabs(
    labDatabase,
    input.skillLevel,
    input.roadmapPhases,
    3
  )

  // Adapt labs to learning style
  const adaptedLabs = selectedLabs.map((lab) => adaptLabToLearningStyle(lab, input.learningStyle))

  return adaptedLabs
}

// ============================================================================
// LAB SELECTION
// ============================================================================

function selectInitialLabs(
  labDatabase: InitializedLab[],
  skillLevel: string,
  roadmapPhases: RoadmapNode[],
  count: number
): InitializedLab[] {
  // Get labs from first phase
  const firstPhase = roadmapPhases[0]
  const firstPhaseLabs = labDatabase.filter((lab) => lab.phase === 1)

  // Adapt difficulty to skill level
  const adjustedDifficulty =
    skillLevel === 'advanced'
      ? 4 // Skip basics, start intermediate
      : skillLevel === 'intermediate'
      ? 2 // Skip absolute basics
      : 1 // Start from scratch

  const selectedLabs = firstPhaseLabs
    .filter((lab) => {
      if (skillLevel === 'advanced') return lab.difficulty >= 3
      if (skillLevel === 'intermediate') return lab.difficulty >= 2
      return true // beginner gets all
    })
    .slice(0, count)

  // Ensure we have exactly `count` labs
  if (selectedLabs.length < count) {
    const additionalLabs = labDatabase
      .filter((lab) => !selectedLabs.includes(lab) && lab.phase <= 2)
      .slice(0, count - selectedLabs.length)
    return [...selectedLabs, ...additionalLabs]
  }

  return selectedLabs
}

// ============================================================================
// LEARNING STYLE ADAPTATION
// ============================================================================

function adaptLabToLearningStyle(
  lab: InitializedLab,
  learningStyle: string
): InitializedLab {
  if (learningStyle.includes('visual')) {
    // Add more video resources
    return {
      ...lab,
      resources: [
        { type: 'video', title: 'Overview Video', url: `/labs/${lab.labId}/video` },
        ...lab.resources,
      ],
    }
  } else if (learningStyle.includes('hands-on')) {
    // Emphasize starter code
    return {
      ...lab,
      starterCode: `// TODO: Implement based on objectives\n// Reference: see resources below`,
    }
  }

  return lab
}

// ============================================================================
// LAB DATABASE BY ROLE
// ============================================================================

function getLabsForRole(role: string): InitializedLab[] {
  const labs: Record<string, InitializedLab[]> = {
    'Backend Engineer': [
      {
        labId: 'be-001-setup',
        title: 'Setup Your First Node.js Server',
        phase: 1,
        difficulty: 1,
        estimatedHours: 2,
        description: 'Create a basic Express.js server that responds to HTTP requests',
        objectives: [
          'Install Node.js and npm',
          'Create an Express application',
          'Handle GET and POST requests',
          'Return JSON responses',
        ],
        resources: [
          { type: 'docs', title: 'Express.js Guide', url: 'https://expressjs.com' },
          { type: 'tutorial', title: 'Node.js Tutorial', url: 'https://nodejs.org/docs' },
          { type: 'video', title: 'Express Basics', url: '/videos/express-intro' },
        ],
        submission: {
          type: 'code',
          requirements: [
            'Server runs on port 3000',
            'Has /api/hello endpoint',
            'Has /api/echo?text=xyz endpoint',
          ],
        },
        successCriteria: [
          'Server starts without errors',
          'Can curl endpoints successfully',
          'Code is readable and documented',
        ],
      },

      {
        labId: 'be-002-database',
        title: 'Design and Query a Database',
        phase: 1,
        difficulty: 2,
        estimatedHours: 3,
        description: 'Create a SQL database schema and write queries',
        objectives: [
          'Design database schema for a blog',
          'Create tables for users, posts, comments',
          'Write SELECT queries with JOINs',
          'Write INSERT/UPDATE/DELETE statements',
        ],
        resources: [
          { type: 'docs', title: 'SQL Reference', url: 'https://sqlzoo.net' },
          { type: 'tutorial', title: 'Database Design', url: '/tutorials/schema-design' },
          { type: 'video', title: 'SQL Joins Explained', url: '/videos/sql-joins' },
        ],
        submission: {
          type: 'code',
          requirements: [
            'Schema file with CREATE TABLE statements',
            'Query file with 5+ interesting queries',
            'Schema diagram (ASCII ok)',
          ],
        },
        successCriteria: [
          'Schema is normalized',
          'All queries execute without errors',
          'Performance considerations mentioned',
        ],
      },

      {
        labId: 'be-003-rest-api',
        title: 'Build a REST API',
        phase: 1,
        difficulty: 2,
        estimatedHours: 4,
        description: 'Build a complete REST API with CRUD operations',
        objectives: [
          'Create endpoints for GET, POST, PUT, DELETE',
          'Validate input data',
          'Handle errors properly',
          'Connect to database',
        ],
        resources: [
          { type: 'docs', title: 'REST API Best Practices', url: '/docs/rest-api' },
          { type: 'tutorial', title: 'Express + Database', url: '/tutorials/express-db' },
          { type: 'video', title: 'Building APIs', url: '/videos/api-building' },
        ],
        submission: {
          type: 'code',
          requirements: [
            'All CRUD endpoints implemented',
            'Input validation present',
            'Error handling in place',
            'Database integration working',
          ],
        },
        successCriteria: [
          'API can be called via curl/Postman',
          'Data persists in database',
          'Code has error handling',
          'README explains all endpoints',
        ],
      },

      {
        labId: 'be-004-auth',
        title: 'Implement Authentication',
        phase: 2,
        difficulty: 5,
        estimatedHours: 5,
        description: 'Add user authentication with JWT tokens',
        objectives: [
          'Implement user registration',
          'Implement user login with password hashing',
          'Use JWT for session management',
          'Protect private endpoints',
        ],
        resources: [
          { type: 'docs', title: 'JWT Guide', url: 'https://jwt.io' },
          { type: 'tutorial', title: 'Password Security', url: '/tutorials/auth' },
          { type: 'video', title: 'JWT Authentication', url: '/videos/jwt' },
        ],
        submission: {
          type: 'code',
          requirements: [
            'Registration endpoint',
            'Login endpoint',
            'Protected routes',
            'Token refresh mechanism',
          ],
        },
        successCriteria: [
          'Passwords are hashed (bcrypt)',
          'Tokens are signed',
          'Protected routes work correctly',
          'Security best practices followed',
        ],
      },

      {
        labId: 'be-005-scaling',
        title: 'Optimize for Scale',
        phase: 2,
        difficulty: 6,
        estimatedHours: 4,
        description: 'Add caching, indexing, and query optimization',
        objectives: [
          'Add Redis caching',
          'Create database indexes',
          'Optimize N+1 queries',
          'Implement pagination',
        ],
        resources: [
          { type: 'docs', title: 'Redis Guide', url: 'https://redis.io' },
          { type: 'tutorial', title: 'Database Optimization', url: '/tutorials/optimization' },
          { type: 'video', title: 'Scaling Databases', url: '/videos/db-scaling' },
        ],
        submission: {
          type: 'code',
          requirements: [
            'Redis integration',
            'Database indexes added',
            'Query performance improved',
            'Load testing results',
          ],
        },
        successCriteria: [
          'Queries execute in <100ms',
          'Caching working correctly',
          'Pagination implemented',
          'Performance metrics shown',
        ],
      },
    ],

    'Frontend Engineer': [
      {
        labId: 'fe-001-hello',
        title: 'Your First React Component',
        phase: 1,
        difficulty: 1,
        estimatedHours: 2,
        description: 'Build a simple React component with state',
        objectives: [
          'Create a React app with Create React App',
          'Build a counter component',
          'Use useState hook',
          'Add basic styling',
        ],
        resources: [
          { type: 'docs', title: 'React Docs', url: 'https://react.dev' },
          { type: 'tutorial', title: 'JSX Intro', url: '/tutorials/jsx' },
          { type: 'video', title: 'React Basics', url: '/videos/react-101' },
        ],
        submission: {
          type: 'code',
          requirements: [
            'Counter that increments/decrements',
            'Displays current count',
            'Has increment/decrement buttons',
          ],
        },
        successCriteria: [
          'Runs without errors',
          'UI is clear and functional',
          'Code is readable',
        ],
      },

      {
        labId: 'fe-002-list',
        title: 'Build a Todo List',
        phase: 1,
        difficulty: 2,
        estimatedHours: 3,
        description: 'Create a functional todo list application',
        objectives: [
          'Create components for list items',
          'Manage state for todos',
          'Add and remove items',
          'Mark items as complete',
        ],
        resources: [
          { type: 'docs', title: 'React Hooks', url: 'https://react.dev/reference/react' },
          { type: 'tutorial', title: 'State Management', url: '/tutorials/state' },
          { type: 'video', title: 'Building Lists', url: '/videos/lists' },
        ],
        submission: {
          type: 'project',
          requirements: [
            'Add new todos',
            'Delete todos',
            'Mark todos complete',
            'Persist to localStorage',
          ],
        },
        successCriteria: [
          'All features work',
          'Data persists on reload',
          'UI is polished',
          'Component structure is clean',
        ],
      },

      {
        labId: 'fe-003-api',
        title: 'Fetch Data from an API',
        phase: 1,
        difficulty: 2,
        estimatedHours: 3,
        description: 'Build a component that fetches and displays API data',
        objectives: [
          'Use fetch API',
          'Handle async/await',
          'Show loading state',
          'Handle errors',
          'Display fetched data',
        ],
        resources: [
          { type: 'docs', title: 'Fetch API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API' },
          { type: 'tutorial', title: 'useEffect for Data', url: '/tutorials/useeffect' },
          { type: 'video', title: 'API Calls in React', url: '/videos/api-calls' },
        ],
        submission: {
          type: 'code',
          requirements: [
            'Fetches from public API',
            'Shows loading indicator',
            'Handles errors gracefully',
            'Displays data cleanly',
          ],
        },
        successCriteria: [
          'Data loads correctly',
          'Loading state shows',
          'Errors are handled',
          'Code uses useEffect properly',
        ],
      },
    ],

    'Data Scientist': [
      {
        labId: 'ds-001-pandas',
        title: 'Explore a Dataset with Pandas',
        phase: 1,
        difficulty: 1,
        estimatedHours: 2,
        description: 'Load and explore data using pandas and numpy',
        objectives: [
          'Load CSV file',
          'Inspect data shape and dtypes',
          'Calculate basic statistics',
          'Check for missing values',
        ],
        resources: [
          { type: 'docs', title: 'Pandas Guide', url: 'https://pandas.pydata.org' },
          { type: 'tutorial', title: 'Data Loading', url: '/tutorials/data-loading' },
          { type: 'video', title: 'Pandas Basics', url: '/videos/pandas-intro' },
        ],
        submission: {
          type: 'code',
          requirements: [
            'Python notebook with data exploration',
            'Summary statistics calculated',
            'Missing values identified',
            'Data types documented',
          ],
        },
        successCriteria: [
          'Notebook runs without errors',
          'All statistics are correct',
          'Analysis is thorough',
          'Code is well-documented',
        ],
      },

      {
        labId: 'ds-002-cleaning',
        title: 'Clean and Transform Data',
        phase: 2,
        difficulty: 3,
        estimatedHours: 4,
        description: 'Handle missing values, outliers, and feature engineering',
        objectives: [
          'Handle missing values appropriately',
          'Detect and handle outliers',
          'Create new features',
          'Normalize numerical features',
        ],
        resources: [
          { type: 'docs', title: 'Data Cleaning', url: '/docs/data-cleaning' },
          { type: 'tutorial', title: 'Feature Engineering', url: '/tutorials/feature-eng' },
          { type: 'video', title: 'Data Prep', url: '/videos/data-prep' },
        ],
        submission: {
          type: 'code',
          requirements: [
            'Missing data handled',
            'Outliers identified',
            'New features created',
            'Data normalization applied',
          ],
        },
        successCriteria: [
          'Data quality improved',
          'No leakage in features',
          'Transformations are justified',
          'Cleaned data is saved',
        ],
      },

      {
        labId: 'ds-003-viz',
        title: 'Visualize Data Patterns',
        phase: 2,
        difficulty: 2,
        estimatedHours: 3,
        description: 'Create meaningful visualizations to understand patterns',
        objectives: [
          'Create histograms and distributions',
          'Create scatter plots',
          'Create correlation heatmaps',
          'Find insights from visualizations',
        ],
        resources: [
          { type: 'docs', title: 'Matplotlib', url: 'https://matplotlib.org' },
          { type: 'tutorial', title: 'Data Visualization', url: '/tutorials/visualization' },
          { type: 'video', title: 'Seaborn Tutorial', url: '/videos/seaborn' },
        ],
        submission: {
          type: 'presentation',
          requirements: [
            '5+ visualizations',
            'Clear titles and labels',
            'Insights documented',
            'Visualizations saved as images',
          ],
        },
        successCriteria: [
          'Visualizations are clear',
          'Patterns are visible',
          'Insights are documented',
          'Publication-ready quality',
        ],
      },
    ],

    'DevOps Engineer': [
      {
        labId: 'do-001-linux',
        title: 'Linux Command Line Mastery',
        phase: 1,
        difficulty: 2,
        estimatedHours: 3,
        description: 'Master essential Linux commands and scripting',
        objectives: [
          'Navigate file system confidently',
          'Write bash scripts',
          'Manage users and permissions',
          'Work with packages',
        ],
        resources: [
          { type: 'docs', title: 'Linux Manual', url: 'https://man7.org' },
          { type: 'tutorial', title: 'Bash Scripting', url: '/tutorials/bash' },
          { type: 'video', title: 'Linux Fundamentals', url: '/videos/linux' },
        ],
        submission: {
          type: 'code',
          requirements: [
            'Bash script with functions',
            'Error handling implemented',
            'Tested on Linux/WSL',
            'Well-commented',
          ],
        },
        successCriteria: [
          'Script executes correctly',
          'Error handling works',
          'Code is efficient',
          'Documentation is clear',
        ],
      },

      {
        labId: 'do-002-docker',
        title: 'Containerize an Application',
        phase: 1,
        difficulty: 2,
        estimatedHours: 3,
        description: 'Create Docker images and run containers',
        objectives: [
          'Write Dockerfile',
          'Build Docker image',
          'Run containers',
          'Use Docker compose',
          'Push to registry',
        ],
        resources: [
          { type: 'docs', title: 'Docker Docs', url: 'https://docs.docker.com' },
          { type: 'tutorial', title: 'Docker Guide', url: '/tutorials/docker' },
          { type: 'video', title: 'Docker Basics', url: '/videos/docker' },
        ],
        submission: {
          type: 'code',
          requirements: [
            'Dockerfile with best practices',
            'Docker compose file',
            'Image builds successfully',
            'README with instructions',
          ],
        },
        successCriteria: [
          'Image builds without errors',
          'Container runs correctly',
          'Volume mounting works',
          'Image is optimized',
        ],
      },

      {
        labId: 'do-003-k8s',
        title: 'Deploy to Kubernetes',
        phase: 2,
        difficulty: 5,
        estimatedHours: 5,
        description: 'Deploy applications to a Kubernetes cluster',
        objectives: [
          'Write Kubernetes manifests',
          'Create deployments',
          'Configure services',
          'Set up ingress',
        ],
        resources: [
          { type: 'docs', title: 'Kubernetes Docs', url: 'https://kubernetes.io/docs' },
          { type: 'tutorial', title: 'K8s Tutorial', url: '/tutorials/k8s' },
          { type: 'video', title: 'K8s Basics', url: '/videos/kubernetes' },
        ],
        submission: {
          type: 'code',
          requirements: [
            'Deployment manifest',
            'Service manifest',
            'Ingress configuration',
            'Deployment instructions',
          ],
        },
        successCriteria: [
          'Pod starts successfully',
          'Service is accessible',
          'Scaling works',
          'Manifests follow best practices',
        ],
      },
    ],

    'Product Manager': [
      {
        labId: 'pm-001-research',
        title: 'Conduct User Research',
        phase: 1,
        difficulty: 1,
        estimatedHours: 3,
        description: 'Learn to understand user needs and problems',
        objectives: [
          'Design interview questions',
          'Conduct user interviews',
          'Analyze feedback',
          'Summarize insights',
        ],
        resources: [
          { type: 'docs', title: 'User Research Guide', url: '/docs/research' },
          { type: 'tutorial', title: 'Interview Techniques', url: '/tutorials/interviews' },
          { type: 'video', title: 'User Testing', url: '/videos/user-testing' },
        ],
        submission: {
          type: 'presentation',
          requirements: [
            'Interview notes from 3+ users',
            'Key insights documented',
            'Problem statement drafted',
            'Recommendations listed',
          ],
        },
        successCriteria: [
          'Insights are specific',
          'Problems are validated',
          'Recommendations are actionable',
          'Presentation is clear',
        ],
      },

      {
        labId: 'pm-002-metrics',
        title: 'Define Success Metrics',
        phase: 1,
        difficulty: 2,
        estimatedHours: 2,
        description: 'Learn to define and track product success',
        objectives: [
          'Identify North Star metric',
          'Define leading indicators',
          'Create metric dashboard',
          'Track results over time',
        ],
        resources: [
          { type: 'docs', title: 'Metrics Framework', url: '/docs/metrics' },
          { type: 'tutorial', title: 'OKR Writing', url: '/tutorials/okrs' },
          { type: 'video', title: 'Analytics', url: '/videos/analytics' },
        ],
        submission: {
          type: 'presentation',
          requirements: [
            'North Star metric defined',
            'OKRs written for 1 year',
            'Dashboard mockup provided',
            'Success criteria listed',
          ],
        },
        successCriteria: [
          'Metrics are measurable',
          'Metrics are actionable',
          'OKRs are ambitious but achievable',
          'Dashboard is clear',
        ],
      },

      {
        labId: 'pm-003-roadmap',
        title: 'Build a Product Roadmap',
        phase: 2,
        difficulty: 3,
        estimatedHours: 4,
        description: 'Create a strategic product roadmap',
        objectives: [
          'Prioritize feature requests',
          'Build quarterly roadmap',
          'Document trade-offs',
          'Plan releases',
        ],
        resources: [
          { type: 'docs', title: 'Roadmapping', url: '/docs/roadmapping' },
          { type: 'tutorial', title: 'Prioritization Frameworks', url: '/tutorials/prioritization' },
          { type: 'video', title: 'Roadmap Planning', url: '/videos/roadmapping' },
        ],
        submission: {
          type: 'presentation',
          requirements: [
            '2-quarter roadmap',
            'Prioritization approach documented',
            'Trade-offs explained',
            'Stakeholder buy-in strategy',
          ],
        },
        successCriteria: [
          'Roadmap is realistic',
          'Priorities are justified',
          'Trade-offs are explicit',
          'Roadmap is visually clear',
        ],
      },
    ],
  }

  return labs[role] || []
}
