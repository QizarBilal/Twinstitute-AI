/**
 * DETERMINISTIC ROADMAP STRUCTURE
 * 
 * Core principle: Structure is HARDCODED, CONSISTENT, role-specific
 * AI enhancement is DESCRIPTIVE LAYER ONLY (descriptions + tasks)
 * Time adaptation ONLY scales hours + task density, never modules
 */

export interface RoadmapModule {
  id: string;
  title: string;
  description: string; // Static - can be enhanced by AI
  coreTopics: string[]; // What must be learned
  skills: string[]; // Technologies/concepts
  tasks: string[]; // Will be enhanced by AI per duration
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  baseHours: number; // Base hours before time adaptation
  dependsOn: string[]; // Prerequisite module IDs
}

export interface RoadmapPhase {
  id: string;
  phase: "Foundation" | "Core Skills" | "Application" | "Mastery";
  description: string;
  modules: RoadmapModule[];
}

export interface RoleRoadmapStructure {
  role: string;
  totalModules: number;
  phases: RoadmapPhase[];
}

// ═══════════════════════════════════════════════════════════════════
// 🏗️ SOFTWARE ENGINEER - DETERMINISTIC STRUCTURE (20 modules, 4 phases)
// ═══════════════════════════════════════════════════════════════════
// This structure is IDENTICAL for 1-month and 12-month users
// Only hours and task density adapt per duration

export const SOFTWARE_ENGINEER_ROADMAP: RoleRoadmapStructure = {
  role: "Software Engineer",
  totalModules: 20,
  phases: [
    {
      id: "foundation",
      phase: "Foundation",
      description: "Essential tools, fundamentals, and web basics",
      modules: [
        {
          id: "dev-env-setup",
          title: "Development Environment Setup",
          description: "Configure tools, version control, and development workspace",
          coreTopics: [
            "Command line basics",
            "Git & GitHub workflow",
            "Node.js & npm",
            "IDE/Editor setup",
            "Local development server",
          ],
          skills: ["Git", "Command Line", "Node.js", "npm", "VS Code"],
          tasks: [], // Will be populated by AI
          difficulty: "Beginner",
          baseHours: 12,
          dependsOn: [],
        },
        {
          id: "js-fundamentals",
          title: "JavaScript Fundamentals",
          description: "Core language concepts for software development",
          coreTopics: [
            "Variables, types, operators",
            "Functions and scope",
            "Arrays and objects",
            "DOM manipulation",
            "Callbacks and promises",
            "Async/await patterns",
            "ES6+ syntax",
          ],
          skills: ["JavaScript", "ES6+", "Async Programming", "DOM"],
          tasks: [],
          difficulty: "Beginner",
          baseHours: 24,
          dependsOn: ["dev-env-setup"],
        },
        {
          id: "web-fundamentals",
          title: "Web Fundamentals (HTTP, HTML, CSS)",
          description: "How the web works, HTTP protocol, markup, and styling",
          coreTopics: [
            "HTTP requests/responses",
            "HTML structure and semantics",
            "CSS selectors and properties",
            "Flexbox and Grid",
            "Responsive design",
            "Browser DevTools",
            "Accessibility basics",
          ],
          skills: ["HTML", "CSS", "HTTP", "Responsive Design"],
          tasks: [],
          difficulty: "Beginner",
          baseHours: 20,
          dependsOn: ["js-fundamentals"],
        },
        {
          id: "data-structures",
          title: "Data Structures & Complexity",
          description: "Essential data structures and Big O complexity analysis",
          coreTopics: [
            "Arrays, linked lists, stacks, queues",
            "Hash tables and maps",
            "Trees (binary, BST, balanced)",
            "Graphs and traversal",
            "Time & space complexity",
            "Big O notation",
            "Trade-off analysis",
          ],
          skills: ["Data Structures", "Algorithm Analysis", "Complexity Theory"],
          tasks: [],
          difficulty: "Intermediate",
          baseHours: 20,
          dependsOn: ["js-fundamentals"],
        },
        {
          id: "algorithms",
          title: "Core Algorithms",
          description: "Problem-solving patterns and algorithmic thinking",
          coreTopics: [
            "Sorting algorithms (quicksort, mergesort, heapsort)",
            "Searching (binary search, DFS, BFS)",
            "Dynamic programming basics",
            "Greedy algorithms",
            "Two-pointer and sliding window",
            "Problem-solving patterns",
          ],
          skills: ["Algorithms", "Problem Solving", "DSA"],
          tasks: [],
          difficulty: "Intermediate",
          baseHours: 24,
          dependsOn: ["data-structures"],
        },
        {
          id: "dsa-interview-prep",
          title: "DSA Interview Preparation",
          description: "Practice and real interview-style DSA problems",
          coreTopics: [
            "LeetCode-style problems (medium/hard)",
            "Mock interviews",
            "Time management in interviews",
            "Communication while coding",
            "Optimization techniques",
            "Pattern recognition",
          ],
          skills: ["Interview DSA", "Problem Patterns", "Communication"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 18,
          dependsOn: ["algorithms"],
        },
      ],
    },

    {
      id: "core-skills",
      phase: "Core Skills",
      description: "Master frontend, backend, and database technologies",
      modules: [
        {
          id: "react-frontend",
          title: "React & Modern Frontend",
          description: "Build interactive UIs with React, hooks, and state management",
          coreTopics: [
            "React components (functional, hooks)",
            "useState, useEffect, useContext",
            "Component composition and reusability",
            "Controlled vs uncontrolled components",
            "Performance optimization (React.memo, useMemo)",
            "Form handling and validation",
            "API integration",
          ],
          skills: ["React", "Hooks", "State Management", "Performance"],
          tasks: [],
          difficulty: "Intermediate",
          baseHours: 26,
          dependsOn: ["web-fundamentals"],
        },
        {
          id: "nodejs-backend",
          title: "Node.js & Express Server Development",
          description: "Build REST APIs and server-side logic with Node.js and Express",
          coreTopics: [
            "Express setup and routing",
            "Middleware architecture",
            "Request/response handling",
            "Error handling and logging",
            "Authentication (JWT, sessions)",
            "Authorization and permissions",
            "Rate limiting and security",
          ],
          skills: ["Node.js", "Express", "REST APIs", "Authentication"],
          tasks: [],
          difficulty: "Intermediate",
          baseHours: 26,
          dependsOn: ["js-fundamentals"],
        },
        {
          id: "database-sql",
          title: "SQL & Relational Databases",
          description: "Design schemas, write queries, and optimize database performance",
          coreTopics: [
            "Schema design and normalization",
            "CRUD operations (SELECT, INSERT, UPDATE, DELETE)",
            "JOINs (INNER, LEFT, RIGHT, FULL)",
            "Aggregations and GROUP BY",
            "Subqueries and CTEs",
            "Indexing and query optimization",
            "Transactions and ACID properties",
            "PostgreSQL specifics",
          ],
          skills: ["SQL", "Database Design", "PostgreSQL", "Query Optimization"],
          tasks: [],
          difficulty: "Intermediate",
          baseHours: 24,
          dependsOn: ["data-structures"],
        },
        {
          id: "api-design",
          title: "API Design & REST Principles",
          description: "Design scalable, maintainable REST APIs",
          coreTopics: [
            "REST principles and constraints",
            "HTTP methods and status codes",
            "Request/response formatting",
            "Pagination, filtering, sorting",
            "Versioning strategies",
            "Error handling and validation",
            "Documentation (Swagger/OpenAPI)",
            "CORS and security headers",
          ],
          skills: ["API Design", "REST", "HTTP", "Documentation"],
          tasks: [],
          difficulty: "Intermediate",
          baseHours: 16,
          dependsOn: ["nodejs-backend"],
        },
        {
          id: "advanced-sql",
          title: "Advanced SQL & Database Optimization",
          description: "Master complex queries and database performance tuning",
          coreTopics: [
            "Window functions (OVER, PARTITION BY, ROW_NUMBER)",
            "Complex JOINs and subqueries",
            "Query execution plans",
            "Index strategies (B-trees, hash, partial)",
            "Denormalization trade-offs",
            "Monitoring and profiling",
            "Connection pooling",
            "Replication and high availability",
          ],
          skills: ["Advanced SQL", "Performance Tuning", "Optimization"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 20,
          dependsOn: ["database-sql"],
        },
        {
          id: "state-management",
          title: "State Management at Scale",
          description: "Manage complex state in large applications",
          coreTopics: [
            "State management patterns",
            "Redux or Context API deep dive",
            "Immutability principles",
            "Selectors and derived state",
            "Async state (thunks, middleware)",
            "DevTools and debugging",
            "Performance and memoization",
          ],
          skills: ["State Management", "Redux", "Immutability"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 18,
          dependsOn: ["react-frontend"],
        },
        {
          id: "testing",
          title: "Testing (Unit, Integration, E2E)",
          description: "Write reliable tests at all levels",
          coreTopics: [
            "Testing pyramid (unit, integration, E2E)",
            "Jest and testing frameworks",
            "Mocking and stubbing",
            "React Testing Library",
            "E2E testing with Cypress/Playwright",
            "Test coverage and CI/CD integration",
            "Test-driven development",
          ],
          skills: ["Testing", "Jest", "TDD", "Quality Assurance"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 16,
          dependsOn: ["react-frontend", "nodejs-backend"],
        },
      ],
    },

    {
      id: "application",
      phase: "Application",
      description: "Build production-ready applications with real-world patterns",
      modules: [
        {
          id: "fullstack-project-1",
          title: "Full Stack Project 1: Authentication & CRUD",
          description: "Build a complete app with user auth, database, and API",
          coreTopics: [
            "User authentication (signup, login, logout)",
            "Password hashing (bcrypt)",
            "JWT tokens and refresh logic",
            "Protected routes and authorization",
            "CRUD endpoints (GET, POST, PUT, DELETE)",
            "Input validation and sanitization",
            "Error handling",
            "Database migrations",
          ],
          skills: ["Full Stack", "Security", "Databases", "APIs"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 28,
          dependsOn: ["react-frontend", "nodejs-backend", "database-sql"],
        },
        {
          id: "deployment-devops",
          title: "Deployment & DevOps Fundamentals",
          description: "Deploy applications to production with CI/CD pipelines",
          coreTopics: [
            "Docker basics and containerization",
            "Docker Compose for local development",
            "Git workflows (branching, merging, PRs)",
            "CI/CD pipelines (GitHub Actions, GitLab CI)",
            "Environment management",
            "Secrets and configuration",
            "Cloud platforms (AWS, Heroku, Vercel)",
            "Monitoring and logging",
          ],
          skills: ["Docker", "CI/CD", "DevOps", "Cloud Deployment"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 20,
          dependsOn: ["nodejs-backend"],
        },
        {
          id: "fullstack-project-2",
          title: "Full Stack Project 2: Real-time Features",
          description: "Build features with WebSockets, real-time updates, and caching",
          coreTopics: [
            "WebSockets and Socket.io",
            "Real-time data synchronization",
            "Caching strategies (Redis, in-memory)",
            "Pub/Sub patterns",
            "Connection management",
            "Load balancing and scaling",
            "Monitoring performance",
          ],
          skills: ["WebSockets", "Real-time Architecture", "Caching", "Redis"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 24,
          dependsOn: ["fullstack-project-1"],
        },
        {
          id: "performance-optimization",
          title: "Performance Optimization & Monitoring",
          description: "Optimize application performance and set up monitoring",
          coreTopics: [
            "Frontend optimization (bundle size, lazy loading)",
            "Backend optimization (database queries, caching)",
            "Application profiling and metrics",
            "Monitoring tools (New Relic, Datadog, custom)",
            "Logging strategies",
            "Alerting and incident response",
            "Performance budgets",
          ],
          skills: ["Performance", "Monitoring", "Optimization", "Metrics"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 18,
          dependsOn: ["fullstack-project-1"],
        },
        {
          id: "security-hardening",
          title: "Security Hardening & Best Practices",
          description: "Secure applications against common vulnerabilities",
          coreTopics: [
            "OWASP Top 10",
            "SQL injection and NoSQL injection prevention",
            "XSS and CSRF attacks",
            "Security headers (CSP, HSTS, X-Frame-Options)",
            "Input validation and sanitization",
            "Encryption and hashing",
            "API security (rate limiting, throttling)",
            "Dependency management and scanning",
          ],
          skills: ["Security", "OWASP", "Encryption", "Hardening"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 16,
          dependsOn: ["nodejs-backend"],
        },
      ],
    },

    {
      id: "mastery",
      phase: "Mastery",
      description: "System design, architecture, and interview readiness",
      modules: [
        {
          id: "system-design",
          title: "System Design & Architecture",
          description: "Design scalable systems for real-world problems",
          coreTopics: [
            "Scalability principles (horizontal vs vertical)",
            "Load balancing and caching layers",
            "Database sharding and replication",
            "Microservices architecture",
            "Message queues and async processing",
            "CDNs and edge computing",
            "Rate limiting and circuit breakers",
            "Estimation and requirements gathering",
          ],
          skills: ["System Design", "Architecture", "Scalability", "Design Patterns"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 24,
          dependsOn: ["fullstack-project-2", "advanced-sql"],
        },
        {
          id: "advanced-architecture",
          title: "Advanced Architecture Patterns",
          description: "Master complex architectural patterns and trade-offs",
          coreTopics: [
            "Event-driven architecture",
            "CQRS and event sourcing",
            "Domain-driven design (DDD)",
            "Hexagonal architecture",
            "API gateway patterns",
            "Service mesh concepts",
            "Eventual consistency",
            "Building resilient systems",
          ],
          skills: ["Architecture", "Design Patterns", "Resilience", "DDD"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 20,
          dependsOn: ["system-design"],
        },
        {
          id: "interview-mastery",
          title: "Interview Mastery & Soft Skills",
          description: "Prepare for technical interviews and senior-level discussions",
          coreTopics: [
            "FAANG-style system design interviews",
            "Behavioral interview techniques",
            "Communicating technical complexity",
            "Negotiation and career growth",
            "Technical leadership concepts",
            "Mock interviews and feedback",
            "Story construction for impact",
          ],
          skills: ["Interviewing", "Communication", "Leadership", "Negotiation"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 16,
          dependsOn: ["system-design", "dsa-interview-prep"],
        },
        {
          id: "continuous-learning",
          title: "Continuous Learning & Career Growth",
          description: "Build habits for lifelong learning and career progression",
          coreTopics: [
            "Staying current with tech trends",
            "Contributing to open source",
            "Building personal projects",
            "Mentoring and knowledge sharing",
            "Writing technical content",
            "Community involvement",
            "Career planning and strategic growth",
          ],
          skills: ["Leadership", "Growth Mindset", "Community", "Expertise"],
          tasks: [],
          difficulty: "Advanced",
          baseHours: 12,
          dependsOn: ["interview-mastery"],
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 📊 TIME ADAPTATION: Same modules, different hours and task density
// ═══════════════════════════════════════════════════════════════════

export interface TimeAdaptation {
  multiplier: number; // Hours multiplier
  tasksPerModule: number; // Task density
  intensityLabel: string;
}

export const TIME_ADAPTATIONS: Record<number, TimeAdaptation> = {
  1: {
    multiplier: 0.35, // 12 base hours → ~4 hours (ultra-compressed)
    tasksPerModule: 1,
    intensityLabel: "Extreme (1 month) - Boot camp, 40-50 hrs/week",
  },
  2: {
    multiplier: 0.5, // 12 base hours → ~6 hours
    tasksPerModule: 2,
    intensityLabel: "Very High (2 months) - Intensive, 30-40 hrs/week",
  },
  3: {
    multiplier: 0.7, // 12 base hours → ~8.4 hours
    tasksPerModule: 2,
    intensityLabel: "High (3 months) - Fast-paced, 20-25 hrs/week",
  },
  6: {
    multiplier: 1.0, // 12 base hours → 12 hours (baseline)
    tasksPerModule: 3,
    intensityLabel: "Moderate (6 months) - Balanced, 10-15 hrs/week",
  },
  12: {
    multiplier: 1.4, // 12 base hours → ~16.8 hours
    tasksPerModule: 4,
    intensityLabel: "Relaxed (12 months) - Deep, 4-6 hrs/week",
  },
};

// ═══════════════════════════════════════════════════════════════════
// 📈 REALISTIC HOUR TARGETS
// ═══════════════════════════════════════════════════════════════════

export const REALISTIC_HOUR_TARGETS: Record<number, { min: number; max: number; target: number }> = {
  1: { min: 150, max: 250, target: 200 },
  2: { min: 250, max: 350, target: 300 },
  3: { min: 300, max: 450, target: 375 },
  6: { min: 400, max: 600, target: 500 },
  12: { min: 600, max: 900, target: 750 },
};

// Get expected hours for a duration
export function getExpectedHours(durationMonths: number): number {
  return REALISTIC_HOUR_TARGETS[durationMonths]?.target || 500;
}

// Get time adaptation
export function getTimeAdaptation(durationMonths: number): TimeAdaptation {
  return TIME_ADAPTATIONS[durationMonths] || TIME_ADAPTATIONS[6];
}
