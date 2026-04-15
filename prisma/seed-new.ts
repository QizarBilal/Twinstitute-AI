import { prisma } from '../lib/prisma'

const DEMO_EMAIL = 'bilalqizar@gmail.com'

async function seedDemoData() {
  console.log('🌱 Seeding demo data for bilalqizar@gmail.com...')

  try {
    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 1: Find the demo user (assume it exists from registration)
    // ═══════════════════════════════════════════════════════════════════════════
    let user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL }
    })

    if (!user) {
      console.log(`❌ User ${DEMO_EMAIL} not found. Please register first.`)
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.id}`)

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 2: Create/Update Capability Twin for /dashboard/twin page
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('📊 Setting up Capability Twin for dashboard...')
    
    let capabilityTwin = await prisma.capabilityTwin.findUnique({
      where: { userId: user.id }
    })

    const twinData = {
      overallScore: 72,
      executionReliability: 78,
      learningSpeed: 85,
      problemSolvingDepth: 68,
      consistency: 82,
      designReasoning: 65,
      abstractionLevel: 70,
      burnoutRisk: 15,
      improvementSlope: 22,
      innovationIndex: 58,
      currentStage: 'building',
      formationVelocity: 22,
      readinessScore: 72
    }

    if (capabilityTwin) {
      capabilityTwin = await prisma.capabilityTwin.update({
        where: { userId: user.id },
        data: twinData
      })
      console.log('  ✅ Updated existing Capability Twin')
    } else {
      capabilityTwin = await prisma.capabilityTwin.create({
        data: {
          userId: user.id,
          ...twinData
        }
      })
      console.log('  ✅ Created new Capability Twin')
    }
    console.log(`  📍 Overall Score: ${capabilityTwin.overallScore}`)

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 3: Create Roadmap for /dashboard/semesters page
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('🗺️ Setting up learning roadmap...')
    
    const targetRole = 'Full-Stack Developer'
    
    let roadmap = await prisma.roadmap.findFirst({
      where: { userId: user.id, role: targetRole }
    })

    if (roadmap) {
      // Delete existing roadmap so we can recreate with historical createdAt date
      await prisma.roadmap.delete({
        where: { id: roadmap.id }
      })
      console.log('  🗑️  Deleted existing roadmap')
      roadmap = null
    }
    
    if (!roadmap) {
      // Create roadmap with backdated createdAt to align with submission history
      // Submissions span ~4 weeks back, so start roadmap 4 weeks ago
      const roadmapStart = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      
      roadmap = await prisma.roadmap.create({
        data: {
          userId: user.id,
          role: targetRole,
          domain: 'Software Engineering',
          durationMonths: 6,
          estimatedCompletionMonths: 6,
          completionPercentage: 72,
          intensityLevel: 'Accelerated - Job-Ready Track',
          totalDuration: '6 months',
          reasoning: 'Accelerated track for software engineering fundamentals and full-stack development',
          readinessScore: 72,
          userSkills: ['TypeScript', 'React', 'Node.js', 'Express', 'MongoDB'],
          createdAt: roadmapStart
        }
      })
      console.log('  ✅ Created new roadmap (backdated to match submission history)')
    }

    // Create roadmap nodes (learning phases/modules)
    console.log('📍 Creating roadmap modules...')
    const nodeConfigs = [
      {
        nodeId: 'foundation',
        title: 'JavaScript Foundations',
        type: 'foundation',
        difficulty: 'easy',
        hours: 20,
        skills: ['JavaScript', 'ES6', 'Async/Await']
      },
      {
        nodeId: 'backend-basics',
        title: 'Backend Basics with Express',
        type: 'skill',
        difficulty: 'intermediate',
        hours: 25,
        skills: ['Node.js', 'Express', 'REST APIs']
      },
      {
        nodeId: 'databases',
        title: 'Database Design & SQL',
        type: 'skill',
        difficulty: 'intermediate',
        hours: 30,
        skills: ['SQL', 'Database Design', 'MongoDB']
      },
      {
        nodeId: 'system-design',
        title: 'System Design Fundamentals',
        type: 'system',
        difficulty: 'advanced',
        hours: 35,
        skills: ['Caching', 'Load Balancing', 'Scaling']
      },
      {
        nodeId: 'authentication',
        title: 'Security & Authentication',
        type: 'skill',
        difficulty: 'advanced',
        hours: 20,
        skills: ['Authentication', 'JWT', 'OAuth']
      },
      {
        nodeId: 'full-stack',
        title: 'Full Stack Integration',
        type: 'project',
        difficulty: 'advanced',
        hours: 40,
        skills: ['React', 'TypeScript', 'Integration Testing']
      }
    ]

    for (const nodeConfig of nodeConfigs) {
      const existing = await prisma.roadmapNode.findFirst({
        where: { roadmapId: roadmap.id, nodeId: nodeConfig.nodeId }
      })
      
      if (!existing) {
        await prisma.roadmapNode.create({
          data: {
            roadmapId: roadmap.id,
            nodeId: nodeConfig.nodeId,
            title: nodeConfig.title,
            type: nodeConfig.type,
            difficulty: nodeConfig.difficulty,
            estimatedHours: nodeConfig.hours,
            skillsGained: nodeConfig.skills,
            description: `Master ${nodeConfig.title.toLowerCase()}`,
            impactExecution: 8,
            impactProblemSolving: 7,
            dependencies: nodeConfig.nodeId === 'backend-basics' ? ['foundation'] : []
          }
        })
      }
    }
    console.log(`  ✅ Created ${nodeConfigs.length} learning modules`)

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 5: Create Lab Tasks & Submissions for milestone/semester pages
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('🧪 Creating lab submissions for milestone tracking...')
    
    // Delete existing submissions first
    const existingSubmissions = await prisma.labSubmission.findMany({
      where: { userId: user.id }
    })
    
    for (const sub of existingSubmissions) {
      await prisma.labSubmission.deleteMany({
        where: { id: sub.id }
      })
    }

    // Find or create lab tasks (these may already exist from other seeding)
    const taskTitles = [
      'Implement a Basic Express Server',
      'SQL Query Optimization',
      'Debug JWT Authentication Middleware',
      'Design a Caching Layer for APIs',
      'Build Rate Limiting Service',
      'Create a React Dashboard Component',
      'Implement LRU Cache',
      'System Design: URL Shortener'
    ]

    const tasks = []
    for (const title of taskTitles) {
      let task = await prisma.labTask.findFirst({
        where: { title }
      })
      
      if (!task) {
        task = await prisma.labTask.create({
          data: {
            title,
            description: `Learn by solving: ${title}`,
            taskType: 'coding',
            difficulty: 5,
            domain: 'Software Engineering',
            skills: '["TypeScript","Node.js"]',
            timeEstimateMin: 30,
            instructions: 'Complete the task according to specifications',
            creditReward: 20,
            isActive: true
          }
        })
      }
      tasks.push(task)
    }
    console.log(`  ✅ Tasks ready: ${tasks.length} tasks`)

    // Create lab submissions spanning 3-4 months (Jan 15 - Apr 15, 2026)
    // This shows a realistic progression with varying weekly activity
    const submissionConfigs = [
      // JANUARY (Week 1-4): Foundation phase - 2 tasks/week
      { taskIndex: 0, status: 'passed', daysAgo: 91, score: 78, minutes: 45 },  // Jan 15
      { taskIndex: 1, status: 'passed', daysAgo: 88, score: 82, minutes: 50 },  // Jan 18
      { taskIndex: 2, status: 'passed', daysAgo: 84, score: 80, minutes: 48 },  // Jan 22
      { taskIndex: 3, status: 'passed', daysAgo: 81, score: 85, minutes: 52 },  // Jan 25
      { taskIndex: 4, status: 'passed', daysAgo: 77, score: 88, minutes: 45 },  // Jan 29
      { taskIndex: 5, status: 'passed', daysAgo: 74, score: 83, minutes: 50 },  // Feb 1
      
      // FEBRUARY (Week 5-8): Core building - 2-3 tasks/week
      { taskIndex: 6, status: 'passed', daysAgo: 70, score: 86, minutes: 48 },  // Feb 5
      { taskIndex: 0, status: 'passed', daysAgo: 67, score: 88, minutes: 44 },  // Feb 8
      { taskIndex: 1, status: 'passed', daysAgo: 63, score: 90, minutes: 46 },  // Feb 12
      { taskIndex: 2, status: 'passed', daysAgo: 60, score: 87, minutes: 50 },  // Feb 15
      { taskIndex: 3, status: 'passed', daysAgo: 56, score: 91, minutes: 48 },  // Feb 19
      { taskIndex: 4, status: 'passed', daysAgo: 53, score: 89, minutes: 52 },  // Feb 22
      { taskIndex: 5, status: 'passed', daysAgo: 49, score: 92, minutes: 45 },  // Feb 26
      
      // MARCH (Week 9-13): Skills acceleration - 3 tasks/week
      { taskIndex: 6, status: 'passed', daysAgo: 46, score: 90, minutes: 42 },  // Mar 1
      { taskIndex: 0, status: 'passed', daysAgo: 42, score: 93, minutes: 40 },  // Mar 5
      { taskIndex: 1, status: 'passed', daysAgo: 39, score: 91, minutes: 44 },  // Mar 8
      { taskIndex: 2, status: 'passed', daysAgo: 35, score: 94, minutes: 41 },  // Mar 12
      { taskIndex: 3, status: 'passed', daysAgo: 32, score: 92, minutes: 46 },  // Mar 15
      { taskIndex: 4, status: 'passed', daysAgo: 28, score: 95, minutes: 43 },  // Mar 19
      { taskIndex: 5, status: 'passed', daysAgo: 25, score: 93, minutes: 45 },  // Mar 22
      { taskIndex: 6, status: 'passed', daysAgo: 21, score: 90, minutes: 48 },  // Mar 26
      { taskIndex: 0, status: 'passed', daysAgo: 18, score: 94, minutes: 42 },  // Mar 29
      
      // APRIL (Week 14-16): Mastery phase - 2-3 tasks/week, 1 in progress
      { taskIndex: 1, status: 'passed', daysAgo: 14, score: 96, minutes: 40 },  // Apr 1
      { taskIndex: 2, status: 'passed', daysAgo: 11, score: 92, minutes: 44 },  // Apr 4
      { taskIndex: 3, status: 'passed', daysAgo: 7, score: 95, minutes: 41 },   // Apr 8
      { taskIndex: 4, status: 'passed', daysAgo: 4, score: 93, minutes: 43 },   // Apr 11
      { taskIndex: 5, status: 'in_progress', daysAgo: 2, score: 0, minutes: 20 } // Apr 13 (in progress)
    ]

    let totalCredits = 0
    for (const config of submissionConfigs) {
      const task = tasks[config.taskIndex % tasks.length]
      const submittedDate = new Date(Date.now() - config.daysAgo * 24 * 60 * 60 * 1000)
      const evaluatedDate = config.status === 'passed' ? new Date(submittedDate.getTime() + 2 * 60 * 60 * 1000) : null
      const credits = config.status === 'passed' ? task.creditReward : 0

      await prisma.labSubmission.create({
        data: {
          userId: user.id,
          taskId: task.id,
          status: config.status,
          scoreTotal: config.score,
          scoreBreakdown: JSON.stringify({
            correctness: Math.floor(config.score * 0.4),
            codeQuality: Math.floor(config.score * 0.3),
            efficiency: Math.floor(config.score * 0.2),
            creativity: Math.floor(config.score * 0.1)
          }),
          creditsAwarded: credits,
          submittedAt: submittedDate,
          evaluatedAt: evaluatedDate,
          timeSpentMin: config.minutes,
          submittedCode: 'Solution implemented',
          approach: 'Optimized implementation with best practices',
          feedback: config.status === 'passed' ? '✅ Excellent work!' : null
        }
      })

      if (config.status === 'passed') {
        totalCredits += credits
      }
    }
    console.log(`  ✅ Created ${submissionConfigs.length} submissions (${totalCredits} credits earned)`)

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 6: Update user with final stats
    // ═══════════════════════════════════════════════════════════════════════════
    await prisma.user.update({
      where: { id: user.id },
      data: { capabilityScore: 72 }
    })

    // ═══════════════════════════════════════════════════════════════════════════
    // ✅ SUCCESS
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n✨ ═════════════════════════════════════════════════════════')
    console.log('✅ DEMO DATA SEEDING COMPLETED!')
    console.log('═════════════════════════════════════════════════════════')
    console.log(`📧 Account: ${DEMO_EMAIL}`)
    console.log(`👤 User ID: ${user.id}`)
    console.log(`\n📊 Dashboard Metrics:`)
    console.log(`  Overall Score: 73/ 100`)
    console.log(`  Interview Ready: 60%`)
    console.log(`  Readiness Score: 72`)
    console.log(`  Labs Completed: 8`)
    console.log(`  Active Learning Tasks: 3`)
    console.log(`  Credits Earned: ${totalCredits}`)
    console.log(`  Achievement Points: ${totalCredits * 10}`)
    console.log(`\n💪 Capability Breakdown:`)
    console.log(`  Execution Reliability: 78`)
    console.log(`  Learning Speed: 85`)
    console.log(`  Problem Solving Depth: 68`)
    console.log(`\n🎓 Development Stage: Building`)
    console.log(`  Growth Velocity: 41%`)
    console.log(`\n📍 Pages Ready to View:`)
    console.log(`  ✅ /dashboard - Dashboard with metrics`)
    console.log(`  ✅ /dashboard/twin - Capability Twin tracking`)
    console.log(`  ✅ /dashboard/milestones - Milestone progress (9 submissions)`)
    console.log(`  ✅ /dashboard/semesters - Semester overview`)
    console.log(`  ✅ /dashboard/strategy - Strategy signals`)
    console.log('═════════════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
    throw error
  }
}

seedDemoData()
  .then(() => {
    console.log('🌱 Seed completed')
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
