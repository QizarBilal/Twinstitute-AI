import { prisma } from '../lib/prisma'

async function seed() {
  console.log('🌱 Seeding database...')

  // Seed lab tasks
  const labTasks = [
    {
      title: 'Build a Rate Limiter',
      description: 'Implement a token bucket rate limiter in TypeScript that handles 1000 req/min per user.',
      taskType: 'coding',
      difficulty: 6,
      domain: 'Backend Engineering',
      skills: JSON.stringify(['TypeScript', 'Node.js', 'Algorithms']),
      timeEstimateMin: 45,
      instructions: 'Implement a TokenBucketRateLimiter class with methods: allow(userId), getUsage(userId), reset(userId). Handle edge cases: concurrent requests, userId expiry after 1 hour of inactivity.',
      creditReward: 25,
    },
    {
      title: 'Debug Authentication Middleware',
      description: 'A JWT middleware has 3 critical bugs. Identify and fix all of them.',
      taskType: 'debugging',
      difficulty: 5,
      domain: 'Security',
      skills: JSON.stringify(['JWT', 'Node.js', 'Security']),
      timeEstimateMin: 30,
      instructions: 'Given code has bugs: (1) token expiry not checked, (2) secret key hardcoded, (3) userId not validated against DB. Find and fix.',
      creditReward: 20,
    },
    {
      title: 'Design a Notification System',
      description: 'Design the architecture for a real-time notification system serving 1M users.',
      taskType: 'system_design',
      difficulty: 8,
      domain: 'System Design',
      skills: JSON.stringify(['Architecture', 'Redis', 'WebSockets', 'Kafka']),
      timeEstimateMin: 60,
      instructions: 'Design: storage layer, delivery mechanism, real-time vs batch, failure handling, scaling strategy. Provide component diagram + data flow.',
      creditReward: 40,
    },
    {
      title: 'Optimize a Slow SQL Query',
      description: 'A query taking 8 seconds. Optimize it to under 200ms using proper indexing & query rewrite.',
      taskType: 'optimization',
      difficulty: 7,
      domain: 'Database',
      skills: JSON.stringify(['PostgreSQL', 'SQL', 'Query Optimization']),
      timeEstimateMin: 35,
      instructions: 'Provided: slow query, table schemas, sample data. Add indexes, rewrite the query, explain your choices.',
      creditReward: 30,
    },
    {
      title: 'Build a React Dashboard Widget',
      description: 'Create a reusable metric card component with live data simulation and animation.',
      taskType: 'coding',
      difficulty: 4,
      domain: 'Frontend Engineering',
      skills: JSON.stringify(['React', 'TypeScript', 'Framer Motion']),
      timeEstimateMin: 25,
      instructions: 'Build a MetricCard component that: displays a value + label, animates on load, supports trend arrows, has a sparkline chart option.',
      creditReward: 15,
    },
    {
      title: 'Mini Project: Expense Tracker API',
      description: '7-day mini project: Build a REST API with expense tracking, categories, and monthly summaries.',
      taskType: 'mini_project',
      difficulty: 7,
      domain: 'Full Stack',
      skills: JSON.stringify(['Node.js', 'PostgreSQL', 'REST API', 'TypeScript']),
      timeEstimateMin: 800,
      instructions: 'Build a complete REST API with: CRUD endpoints for expenses, category management, monthly summary aggregation, basic auth, and proper error handling.',
      creditReward: 120,
    },
    {
      title: 'Implement a LRU Cache',
      description: 'Build a Least Recently Used (LRU) cache in TypeScript with O(1) get/put operations.',
      taskType: 'coding',
      difficulty: 6,
      domain: 'Data Structures',
      skills: JSON.stringify(['TypeScript', 'Algorithms', 'Data Structures']),
      timeEstimateMin: 40,
      instructions: 'Implement an LRU cache with capacity limit. get(key) and put(key, value) must be O(1). Use a Map + doubly-linked list.',
      creditReward: 25,
    },
    {
      title: 'Debug Memory Leak in Express Server',
      description: 'An Express server has a memory leak causing crashes every 4 hours. Find and fix it.',
      taskType: 'debugging',
      difficulty: 7,
      domain: 'Backend Engineering',
      skills: JSON.stringify(['Node.js', 'Express', 'Debugging', 'Memory Management']),
      timeEstimateMin: 45,
      instructions: 'The server stores session data in a global object without cleanup. Event listeners are not removed. Fix both issues and add monitoring.',
      creditReward: 30,
    },
    {
      title: 'Design a URL Shortener',
      description: 'Design a URL shortener service that handles 100M URLs and 10K requests/second.',
      taskType: 'system_design',
      difficulty: 6,
      domain: 'System Design',
      skills: JSON.stringify(['Architecture', 'Distributed Systems', 'Caching']),
      timeEstimateMin: 50,
      instructions: 'Design: URL encoding strategy, storage (SQL vs NoSQL), read-heavy caching, analytics, expiration handling. Include API design.',
      creditReward: 35,
    },
    {
      title: 'Build a WebSocket Chat',
      description: 'Create a real-time chat application using WebSockets with rooms and typing indicators.',
      taskType: 'coding',
      difficulty: 5,
      domain: 'Full Stack',
      skills: JSON.stringify(['WebSockets', 'Node.js', 'React', 'Real-time']),
      timeEstimateMin: 60,
      instructions: 'Implement: WebSocket server with room support, join/leave events, typing indicators, message history, and a React frontend.',
      creditReward: 35,
    },
    {
      title: 'Integrate OAuth2 with GitHub',
      description: 'Add GitHub OAuth2 authentication to a Node.js application with proper token management.',
      taskType: 'integration',
      difficulty: 5,
      domain: 'Security',
      skills: JSON.stringify(['OAuth2', 'Node.js', 'GitHub API', 'Security']),
      timeEstimateMin: 40,
      instructions: 'Implement the full OAuth2 flow: redirect, callback, token exchange, user data fetch, session management, and refresh token handling.',
      creditReward: 25,
    },
    {
      title: 'Optimize React Rendering',
      description: 'A React dashboard with 50+ components re-renders unnecessarily. Optimize it.',
      taskType: 'optimization',
      difficulty: 6,
      domain: 'Frontend Engineering',
      skills: JSON.stringify(['React', 'Performance', 'Memoization', 'Profiling']),
      timeEstimateMin: 35,
      instructions: 'Use React DevTools Profiler to identify problems. Apply React.memo, useMemo, useCallback, and component splitting. Reduce re-renders by 80%.',
      creditReward: 25,
    },
  ]

  for (const task of labTasks) {
    const existing = await prisma.labTask.findFirst({ where: { title: task.title } })
    if (!existing) {
      await prisma.labTask.create({ data: task })
      console.log(`  ✅ Created: ${task.title}`)
    } else {
      console.log(`  ⏭️ Skipped: ${task.title} (already exists)`)
    }
  }

  // ─── DEMO DATA FOR BILALQIZAR@GMAIL.COM ───────────────────────────────────
  console.log('📊 Seeding demo data for bilalqizar@gmail.com...')

  // Find or create demo user
  let demoUser = await prisma.user.findUnique({ where: { email: 'bilalqizar@gmail.com' } })
  
  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: 'bilalqizar@gmail.com',
        fullName: 'Mohammed Qizar Bilal',
        passwordHash: '', // Will be set during login
        emailVerified: true,
        isVerified: true,
        accountType: 'learner',
        selectedDomain: 'Backend Development',
        selectedRole: 'Senior Software Engineer',
      },
    })
    console.log('  ✅ Created demo user: bilalqizar@gmail.com')
  }

  // Create realistic SkillGenome for Software Development Engineer (~4-5 months progress, 60-70%)
  const skillNodes = [
    { id: 'typescript', label: 'TypeScript', proficiency: 72, category: 'core', type: 'strong', xp: 2800, endorsements: 8 },
    { id: 'nodejs', label: 'Node.js', proficiency: 70, category: 'core', type: 'strong', xp: 2600, endorsements: 7 },
    { id: 'react', label: 'React.js', proficiency: 68, category: 'core', type: 'strong', xp: 2400, endorsements: 6 },
    { id: 'javascript', label: 'JavaScript', proficiency: 85, category: 'core', type: 'strong', xp: 3200, endorsements: 12 },
    { id: 'express', label: 'Express.js', proficiency: 66, category: 'supporting', type: 'medium', xp: 2200, endorsements: 5 },
    { id: 'postgresql', label: 'PostgreSQL', proficiency: 64, category: 'supporting', type: 'medium', xp: 2000, endorsements: 4 },
    { id: 'mongodb', label: 'MongoDB', proficiency: 58, category: 'supporting', type: 'medium', xp: 1600, endorsements: 3 },
    { id: 'rest-api', label: 'REST API Design', proficiency: 70, category: 'supporting', type: 'strong', xp: 2500, endorsements: 6 },
    { id: 'graphql', label: 'GraphQL', proficiency: 48, category: 'advanced', type: 'weak', xp: 1200, endorsements: 1 },
    { id: 'docker', label: 'Docker', proficiency: 55, category: 'supporting', type: 'medium', xp: 1400, endorsements: 2 },
    { id: 'git', label: 'Git & Version Control', proficiency: 78, category: 'core', type: 'strong', xp: 2900, endorsements: 9 },
    { id: 'ci-cd', label: 'CI/CD Pipelines', proficiency: 52, category: 'advanced', type: 'medium', xp: 1300, endorsements: 1 },
    { id: 'algorithms', label: 'Algorithms', proficiency: 67, category: 'core', type: 'medium', xp: 2300, endorsements: 5 },
    { id: 'data-structures', label: 'Data Structures', proficiency: 69, category: 'core', type: 'strong', xp: 2450, endorsements: 6 },
    { id: 'system-design', label: 'System Design', proficiency: 58, category: 'advanced', type: 'medium', xp: 1800, endorsements: 2 },
    { id: 'oop', label: 'Object Oriented Programming', proficiency: 74, category: 'core', type: 'strong', xp: 2700, endorsements: 7 },
    { id: 'html-css', label: 'HTML & CSS', proficiency: 72, category: 'core', type: 'strong', xp: 2600, endorsements: 6 },
    { id: 'tailwind', label: 'TailwindCSS', proficiency: 68, category: 'supporting', type: 'medium', xp: 2100, endorsements: 4 },
    { id: 'state-management', label: 'State Management', proficiency: 62, category: 'supporting', type: 'medium', xp: 1900, endorsements: 3 },
    { id: 'testing', label: 'Unit Testing & Jest', proficiency: 60, category: 'supporting', type: 'medium', xp: 1700, endorsements: 2 },
    { id: 'authentication', label: 'Authentication & Security', proficiency: 65, category: 'supporting', type: 'medium', xp: 2100, endorsements: 4 },
    { id: 'redis', label: 'Redis & Caching', proficiency: 50, category: 'advanced', type: 'medium', xp: 1200, endorsements: 1 },
    { id: 'problem-solving', label: 'Problem Solving', proficiency: 71, category: 'core', type: 'strong', xp: 2600, endorsements: 7 },
    { id: 'communication', label: 'Communication Skills', proficiency: 64, category: 'supporting', type: 'medium', xp: 1900, endorsements: 4 },
  ]

  const skillEdges = [
    { from: 'javascript', to: 'typescript', strength: 0.95, type: 'prerequisite' },
    { from: 'javascript', to: 'react', strength: 0.92, type: 'prerequisite' },
    { from: 'typescript', to: 'node.js', strength: 0.90, type: 'synergy' },
    { from: 'nodejs', to: 'express', strength: 0.93, type: 'prerequisite' },
    { from: 'express', to: 'rest-api', strength: 0.88, type: 'synergy' },
    { from: 'rest-api', to: 'authentication', strength: 0.82, type: 'related' },
    { from: 'postgresql', to: 'rest-api', strength: 0.85, type: 'synergy' },
    { from: 'data-structures', to: 'algorithms', strength: 0.91, type: 'prerequisite' },
    { from: 'algorithms', to: 'system-design', strength: 0.78, type: 'synergy' },
    { from: 'oop', to: 'typescript', strength: 0.87, type: 'synergy' },
    { from: 'html-css', to: 'react', strength: 0.90, type: 'prerequisite' },
    { from: 'tailwind', to: 'react', strength: 0.72, type: 'synergy' },
    { from: 'state-management', to: 'react', strength: 0.85, type: 'related' },
    { from: 'git', to: 'ci-cd', strength: 0.80, type: 'synergy' },
    { from: 'docker', to: 'ci-cd', strength: 0.82, type: 'synergy' },
    { from: 'testing', to: 'nodejs', strength: 0.75, type: 'synergy' },
    { from: 'redis', to: 'system-design', strength: 0.76, type: 'related' },
    { from: 'mongodb', to: 'rest-api', strength: 0.80, type: 'synergy' },
    { from: 'authentication', to: 'express', strength: 0.78, type: 'related' },
    { from: 'problem-solving', to: 'algorithms', strength: 0.89, type: 'synergy' },
  ]

  // Calculate genome stats
  const avgProficiency = skillNodes.reduce((sum, node) => sum + node.proficiency, 0) / skillNodes.length
  const strongSkills = skillNodes.filter(n => n.proficiency >= 70).length
  const coreStrength = skillNodes
    .filter(n => n.category === 'core' && n.proficiency >= 70)
    .reduce((sum, n) => sum + n.proficiency, 0) / (skillNodes.filter(n => n.category === 'core').length || 1)

  // Create or update SkillGenome
  const existingGenome = await prisma.skillGenome.findUnique({
    where: { userId: demoUser.id },
  })

  if (existingGenome) {
    await prisma.skillGenome.update({
      where: { userId: demoUser.id },
      data: {
        nodes: JSON.stringify(skillNodes),
        edges: JSON.stringify(skillEdges),
        coreStrength: coreStrength,
        breadthScore: Math.min((skillNodes.length / 25) * 100, 100), // Normalized to 25 total skills
        depthScore: avgProficiency,
        lastAnalyzed: new Date(),
      },
    })
    console.log('  ✅ Updated SkillGenome for demo user')
  } else {
    await prisma.skillGenome.create({
      data: {
        userId: demoUser.id,
        nodes: JSON.stringify(skillNodes),
        edges: JSON.stringify(skillEdges),
        coreStrength: coreStrength,
        breadthScore: Math.min((skillNodes.length / 25) * 100, 100),
        depthScore: avgProficiency,
      },
    })
    console.log('  ✅ Created SkillGenome for demo user')
  }

  // Create or update CapabilityTwin with realistic scores (4-5 months of progress)
  const existingTwin = await prisma.capabilityTwin.findUnique({
    where: { userId: demoUser.id },
  })

  if (existingTwin) {
    await prisma.capabilityTwin.update({
      where: { userId: demoUser.id },
      data: {
        overallScore: 68,
        executionReliability: 72,
        learningSpeed: 75,
        problemSolvingDepth: 68,
        consistency: 70,
        designReasoning: 58,
        abstractionLevel: 62,
        burnoutRisk: 25,
        improvementSlope: 15, // 15% monthly improvement
        innovationIndex: 55,
        currentStage: 'building',
        targetRole: 'Full Stack Developer',
        targetDomain: 'Software Development Engineer',
        formationVelocity: 12, // 12% weekly velocity
        readinessScore: avgProficiency,
      },
    })
    console.log('  ✅ Updated CapabilityTwin for demo user')
  } else {
    await prisma.capabilityTwin.create({
      data: {
        userId: demoUser.id,
        overallScore: 68,
        executionReliability: 72,
        learningSpeed: 75,
        problemSolvingDepth: 68,
        consistency: 70,
        designReasoning: 58,
        abstractionLevel: 62,
        burnoutRisk: 25,
        improvementSlope: 15,
        innovationIndex: 55,
        currentStage: 'building',
        targetRole: 'Full Stack Developer',
        targetDomain: 'Software Development Engineer',
        formationVelocity: 12,
        readinessScore: avgProficiency,
      },
    })
    console.log('  ✅ Created CapabilityTwin for demo user')
  }

  console.log('✅ Seed complete!')
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
