import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

// 🧬 CAPABILITY TWIN SCORING ENGINE
// Computes comprehensive capability metrics across skills, modules, tasks, and consistency

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const userId = session.user.id

    // Fetch all required data in parallel
    const [user, capabilityTwin, skillGenome, roadmap, labSubmissions, milestones] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.capabilityTwin.findUnique({ where: { userId } }),
      prisma.skillGenome.findUnique({ where: { userId } }),
      prisma.roadmap.findUnique({
        where: { userId_role: { userId, role: '' } },
        include: { nodes: true, progress: true }
      }).catch(() => null),
      prisma.labSubmission.findMany({
        where: { userId },
        include: { evaluation: true, task: true }
      }),
      prisma.milestone.findMany({ where: { userId } })
    ])

    if (!user) return serverError('User not found')

    // ────────────────────────────────────────────────────────────────────
    // 1️⃣ SKILL PROGRESS CALCULATION
    // ────────────────────────────────────────────────────────────────────
    let skillProgress = 0
    let skillsAnalysis = {
      coreSkills: [] as any[],
      supportSkills: [] as any[],
      advancedSkills: [] as any[],
      totalSkills: 0,
      masteredSkills: 0,
      proficientSkills: 0,
      developingSkills: 0
    }

    if (skillGenome) {
      try {
        const nodes = JSON.parse(skillGenome.nodes || '[]')
        skillsAnalysis.totalSkills = nodes.length

        nodes.forEach((skill: any) => {
          // Skill mastery: based on progress + dependencies completed
          const skillMastery = skill.progress || 0
          if (skillMastery >= 80) {
            skillsAnalysis.masteredSkills++
          } else if (skillMastery >= 50) {
            skillsAnalysis.proficientSkills++
          } else {
            skillsAnalysis.developingSkills++
          }

          // Categorize by importance
          if (skill.category === 'core') {
            skillsAnalysis.coreSkills.push({ name: skill.name, progress: skillMastery })
          } else if (skill.category === 'support') {
            skillsAnalysis.supportSkills.push({ name: skill.name, progress: skillMastery })
          } else if (skill.category === 'advanced') {
            skillsAnalysis.advancedSkills.push({ name: skill.name, progress: skillMastery })
          }
        })

        // Calculate overall skill progress (weighted by categories)
        const coreAvg = skillsAnalysis.coreSkills.length > 0
          ? skillsAnalysis.coreSkills.reduce((sum, s: any) => sum + s.progress, 0) / skillsAnalysis.coreSkills.length
          : 0
        const supportAvg = skillsAnalysis.supportSkills.length > 0
          ? skillsAnalysis.supportSkills.reduce((sum, s: any) => sum + s.progress, 0) / skillsAnalysis.supportSkills.length
          : 0
        const advancedAvg = skillsAnalysis.advancedSkills.length > 0
          ? skillsAnalysis.advancedSkills.reduce((sum, s: any) => sum + s.progress, 0) / skillsAnalysis.advancedSkills.length
          : 0

        // Core = 50%, Support = 30%, Advanced = 20%
        skillProgress = (coreAvg * 0.5) + (supportAvg * 0.3) + (advancedAvg * 0.2)
      } catch (e) {
        console.error('Error parsing skill genome:', e)
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // 2️⃣ MODULE COMPLETION TRACKING
    // ────────────────────────────────────────────────────────────────────
    let moduleCompletion = 0
    let moduleAnalysis = {
      totalModules: 0,
      completedModules: 0,
      inProgressModules: 0,
      availableModules: 0,
      averageTimePerModule: 0,
      totalTimeSpent: 0,
      allModules: [] as any[]
    }

    if (roadmap) {
      const progress = roadmap.progress || []
      moduleAnalysis.totalModules = roadmap.nodes.length

      roadmap.nodes.forEach((node: any) => {
        const nodeProgress = progress.find(p => p.nodeId === node.nodeId)
        const status = nodeProgress?.status || 'locked'

        const moduleData = {
          title: node.title,
          status,
          estimatedHours: node.estimatedHours,
          startedAt: nodeProgress?.startedAt,
          completedAt: nodeProgress?.completedAt,
          timeSpent: 0
        }

        if (status === 'completed') {
          moduleAnalysis.completedModules++
          if (nodeProgress?.startedAt && nodeProgress?.completedAt) {
            const timeSpent = (new Date(nodeProgress.completedAt).getTime() - new Date(nodeProgress.startedAt).getTime()) / (1000 * 60 * 60)
            moduleData.timeSpent = timeSpent
            moduleAnalysis.totalTimeSpent += timeSpent
          }
        } else if (status === 'in_progress') {
          moduleAnalysis.inProgressModules++
          if (nodeProgress?.startedAt) {
            const timeSpent = (Date.now() - new Date(nodeProgress.startedAt).getTime()) / (1000 * 60 * 60)
            moduleData.timeSpent = timeSpent
            moduleAnalysis.totalTimeSpent += timeSpent
          }
        } else if (status === 'available') {
          moduleAnalysis.availableModules++
        }

        moduleAnalysis.allModules.push(moduleData)
      })

      moduleCompletion = moduleAnalysis.totalModules > 0
        ? (moduleAnalysis.completedModules / moduleAnalysis.totalModules) * 100
        : 0
      moduleAnalysis.averageTimePerModule = moduleAnalysis.completedModules > 0
        ? moduleAnalysis.totalTimeSpent / moduleAnalysis.completedModules
        : 0
    }

    // ────────────────────────────────────────────────────────────────────
    // 3️⃣ TASK COMPLETION RATE
    // ────────────────────────────────────────────────────────────────────
    let taskCompletion = 0
    let taskAnalysis = {
      totalAttempts: 0,
      completedTasks: 0,
      passedTasks: 0,
      failedTasks: 0,
      averageScore: 0,
      recentTasks: [] as any[],
      tasksByDifficulty: {
        easy: { total: 0, passed: 0 },
        intermediate: { total: 0, passed: 0 },
        advanced: { total: 0, passed: 0 },
        expert: { total: 0, passed: 0 }
      }
    }

    if (labSubmissions && labSubmissions.length > 0) {
      taskAnalysis.totalAttempts = labSubmissions.length

      let totalScore = 0
      const sortedSubmissions = [...labSubmissions].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )

      sortedSubmissions.forEach((submission: any) => {
        // Convert numeric difficulty (1-10) to string difficulty level
        const numDifficulty = submission.task?.difficulty || 5
        let difficultyLevel = 'intermediate'
        
        if (numDifficulty <= 2) {
          difficultyLevel = 'beginner'
        } else if (numDifficulty <= 4) {
          difficultyLevel = 'intermediate'
        } else if (numDifficulty <= 7) {
          difficultyLevel = 'advanced'
        } else {
          difficultyLevel = 'expert'
        }
        
        const difficultyKey = difficultyLevel as keyof typeof taskAnalysis.tasksByDifficulty

        taskAnalysis.tasksByDifficulty[difficultyKey].total++

        if (submission.status === 'completed' || submission.status === 'passed') {
          taskAnalysis.completedTasks++
        }

        if (submission.evaluation || submission.scoreTotal > 0) {
          const score = submission.evaluation?.score || submission.scoreTotal || 0
          totalScore += score

          if (score >= 70) {
            taskAnalysis.passedTasks++
            taskAnalysis.tasksByDifficulty[difficultyKey].passed++
          } else if (score > 0) {
            taskAnalysis.failedTasks++
          }
        }

        if (taskAnalysis.recentTasks.length < 10) {
          taskAnalysis.recentTasks.push({
            taskId: submission.taskId,
            taskTitle: submission.task?.title,
            status: submission.status,
            score: submission.evaluation?.score,
            submittedAt: submission.submittedAt
          })
        }
      })

      taskAnalysis.averageScore = taskAnalysis.totalAttempts > 0
        ? totalScore / taskAnalysis.totalAttempts
        : 0
      taskCompletion = (taskAnalysis.passedTasks / Math.max(taskAnalysis.totalAttempts, 1)) * 100
    }

    // ────────────────────────────────────────────────────────────────────
    // 4️⃣ CONSISTENCY TRACKING
    // ────────────────────────────────────────────────────────────────────
    let consistency = 0
    let consistencyAnalysis = {
      submissionsPerWeek: 0,
      activeDaysThisWeek: 0,
      weeklyStreak: 0,
      averageActivityLevel: 0,
      consistencyTrend: 'stable' as 'stable' | 'improving' | 'declining',
      lastActivityDate: null as Date | null,
      totalActiveWeeks: 0
    }

    // Get submissions from last 90 days for consistency analysis
    const now = new Date()
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const recentSubmissions = labSubmissions.filter(
      sub => new Date(sub.submittedAt) > ninetyDaysAgo
    )

    if (recentSubmissions.length > 0) {
      consistencyAnalysis.lastActivityDate = new Date(
        Math.max(...recentSubmissions.map(s => new Date(s.submittedAt).getTime()))
      )

      // Calculate weekly activity
      const lastWeekSubmissions = recentSubmissions.filter(
        sub => new Date(sub.submittedAt) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      )
      consistencyAnalysis.submissionsPerWeek = lastWeekSubmissions.length

      // Calculate active days this week
      const activeDays = new Set(
        lastWeekSubmissions.map(s => new Date(s.submittedAt).toDateString())
      )
      consistencyAnalysis.activeDaysThisWeek = activeDays.size

      // Consistency score: based on regular activity and absence of long gaps
      const daysSinceLastActivity = Math.ceil(
        (now.getTime() - consistencyAnalysis.lastActivityDate.getTime()) / (24 * 60 * 60 * 1000)
      )

      if (daysSinceLastActivity <= 1) {
        consistency = 95 // Active today/yesterday
      } else if (daysSinceLastActivity <= 3) {
        consistency = 85 // Active within 3 days
      } else if (daysSinceLastActivity <= 7) {
        consistency = 70 // Active within a week
      } else if (daysSinceLastActivity <= 14) {
        consistency = 50 // Some activity in 2 weeks
      } else {
        consistency = Math.max(20, 100 - (daysSinceLastActivity * 5))
      }

      // Penalize for highly variable activity
      if (consistencyAnalysis.submissionsPerWeek < 1 && lastWeekSubmissions.length === 0) {
        consistency *= 0.8
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // 5️⃣ OVERALL CAPABILITY SCORE
    // ────────────────────────────────────────────────────────────────────
    // If CapabilityTwin exists with real data, use it directly (for demo/seeded users)
    let capabilityScore: number
    let capabilityLevel: string
    let taskCompletion_final = taskCompletion
    
    if (capabilityTwin && capabilityTwin.overallScore > 0) {
      // Use seeded/existing CapabilityTwin data
      capabilityScore = Math.round(capabilityTwin.overallScore)
      capabilityLevel = capabilityTwin.currentStage || 'building'
      // Use actual task completion from submissions for this metric
      taskCompletion_final = (taskAnalysis.passedTasks / Math.max(taskAnalysis.totalAttempts, 1)) * 100
    } else {
      // Calculate from scratch for new users
      capabilityScore = Math.round(
        (skillProgress * 0.4) +
        (moduleCompletion * 0.3) +
        (taskCompletion * 0.2) +
        (consistency * 0.1)
      )
      
      capabilityLevel = 'foundation'
      if (capabilityScore >= 80) capabilityLevel = 'expert'
      else if (capabilityScore >= 60) capabilityLevel = 'advancing'
      else if (capabilityScore >= 40) capabilityLevel = 'building'
    }

    // ────────────────────────────────────────────────────────────────────
    // 6️⃣ STRENGTHS & WEAKNESSES ANALYSIS
    // ────────────────────────────────────────────────────────────────────
    const strengthsWeaknesses = {
      topStrengths: [] as any[],
      topWeaknesses: [] as any[],
      recommendedFocus: [] as string[]
    }

    // Skills-based strengths
    if (skillsAnalysis.coreSkills.length > 0) {
      const ranked = [...skillsAnalysis.coreSkills].sort((a, b) => b.progress - a.progress)
      strengthsWeaknesses.topStrengths.push(
        ...ranked.slice(0, 3).map(s => ({ area: 'Skill', name: s.name, score: Math.round(s.progress) }))
      )
      strengthsWeaknesses.topWeaknesses.push(
        ...ranked.slice(-3).map(s => ({ area: 'Skill', name: s.name, score: Math.round(s.progress) }))
      )
    }

    // Task performance strengths
    const easyTasksScore = taskAnalysis.tasksByDifficulty.easy.total > 0
      ? (taskAnalysis.tasksByDifficulty.easy.passed / taskAnalysis.tasksByDifficulty.easy.total) * 100
      : 0
    const advancedTasksScore = taskAnalysis.tasksByDifficulty.advanced.total > 0
      ? (taskAnalysis.tasksByDifficulty.advanced.passed / taskAnalysis.tasksByDifficulty.advanced.total) * 100
      : 0

    if (easyTasksScore > 80) {
      strengthsWeaknesses.topStrengths.push({ area: 'Task Solving', name: 'Foundation Tasks', score: Math.round(easyTasksScore) })
    }
    if (advancedTasksScore < 60) {
      strengthsWeaknesses.topWeaknesses.push({ area: 'Task Solving', name: 'Advanced Tasks', score: Math.round(advancedTasksScore) })
    }

    // Recommendations
    if (skillsAnalysis.advancedSkills.length > 0) {
      const advancedAvg = skillsAnalysis.advancedSkills.reduce((sum, s: any) => sum + s.progress, 0) / skillsAnalysis.advancedSkills.length
      if (advancedAvg < 40) {
        strengthsWeaknesses.recommendedFocus.push('Focus on advancing your advanced-level skills')
      }
    }
    if (consistency < 50) {
      strengthsWeaknesses.recommendedFocus.push('Increase consistency in your learning routine')
    }
    if (moduleAnalysis.inProgressModules === 0 && moduleAnalysis.availableModules > 0) {
      strengthsWeaknesses.recommendedFocus.push('Start the next available module to maintain momentum')
    }

    // ────────────────────────────────────────────────────────────────────
    // 7️⃣ GROWTH METRICS
    // ────────────────────────────────────────────────────────────────────
    const growthMetrics = capabilityTwin ? {
      formationVelocity: capabilityTwin.formationVelocity || 0,
      readinessScore: capabilityTwin.readinessScore || 0,
      improvementSlope: capabilityTwin.improvementSlope || 0,
      burnoutRisk: capabilityTwin.burnoutRisk || 0,
      innovationIndex: capabilityTwin.innovationIndex || 0,
      currentStage: capabilityTwin.currentStage || capabilityLevel,
      targetRole: capabilityTwin.targetRole || user.selectedRole || 'Not selected',
      targetDomain: capabilityTwin.targetDomain || user.selectedDomain || 'Not selected',
      // Detailed breakdown
      executionReliability: capabilityTwin.executionReliability,
      learningSpeed: capabilityTwin.learningSpeed,
      problemSolvingDepth: capabilityTwin.problemSolvingDepth,
      consistency: capabilityTwin.consistency,
      designReasoning: capabilityTwin.designReasoning,
      abstractionLevel: capabilityTwin.abstractionLevel
    } : {
      formationVelocity: 0,
      readinessScore: 0,
      improvementSlope: 0,
      burnoutRisk: 0,
      innovationIndex: 0,
      currentStage: capabilityLevel,
      targetRole: user.selectedRole || 'Not selected',
      targetDomain: user.selectedDomain || 'Not selected'
    }

    // Return comprehensive capability twin data
    return success({
      // Overall Capability Score
      capabilityScore,
      capabilityLevel,
      percentToNextLevel: capabilityScore % 20,

      // Component Scores - use CapabilityTwin breakdown if available
      components: capabilityTwin && capabilityTwin.overallScore > 0 ? {
        skillProgress: Math.round(capabilityTwin.executionReliability),
        moduleCompletion: Math.round(capabilityTwin.learningSpeed),
        taskCompletion: taskCompletion_final,
        consistency: Math.round(capabilityTwin.consistency)
      } : {
        skillProgress: Math.round(skillProgress),
        moduleCompletion: Math.round(moduleCompletion),
        taskCompletion: Math.round(taskCompletion),
        consistency: Math.round(consistency)
      },

      // Detailed Analysis
      skillsAnalysis,
      moduleAnalysis,
      taskAnalysis,
      consistencyAnalysis,

      // Strengths & Weaknesses
      strengthsWeaknesses,

      // Growth Metrics
      growthMetrics,

      // Metadata
      lastUpdated: new Date(),
      userId
    })
  } catch (error) {
    console.error('Capability twin scoring error:', error)
    return serverError()
  }
}
