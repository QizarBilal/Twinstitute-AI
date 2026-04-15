import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

interface StrategySignal {
  id: string
  type: 'warning' | 'critical' | 'success' | 'info'
  title: string
  message: string
  recommendation: string
  metric: string
  currentValue: number | string
  targetValue?: number | string
  priority: number // 1 (lowest) to 5 (highest)
}

interface StrategyData {
  userId: string
  timestamp: string
  signals: StrategySignal[]
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor'
  actionItems: string[]
}

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    // Get roadmap for user with nodes included
    const roadmap = await prisma.roadmap.findFirst({
      where: { userId: session.user.id },
      include: { nodes: true }
    })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        capabilityTwin: true,
        labSubmissions: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            evaluatedAt: true,
            scoreTotal: true,
            createdAt: true
          }
        }
      }
    })

    if (!user) return unauthorized()

    const signals: StrategySignal[] = []
    const actionItems: string[] = []
    let healthScore = 100

    // === RULE 1: Progress vs Expected Pace ===
    if (roadmap) {
      const totalModules = roadmap.nodes ? roadmap.nodes.length : 0
      // Count submissions with passed status as module completions
      const completedSubmissions = user.labSubmissions.filter(s => s.status === 'passed' || s.status === 'completed').length
      // Use submission count as proxy for module progress (each module has tasks)
      const progressPercent = totalModules > 0 ? Math.min(100, Math.round((completedSubmissions / Math.max(1, totalModules * 3)) * 100)) : 0

      // Expected progress: calculate expected pace based on roadmap duration
      const semesterStart = new Date(roadmap.createdAt)
      const semesterEnd = new Date(semesterStart.getTime() + (roadmap.durationMonths || 6) * 30 * 24 * 60 * 60 * 1000)
      const totalDays = (semesterEnd.getTime() - semesterStart.getTime()) / (1000 * 60 * 60 * 24)
      const daysPassed = (new Date().getTime() - semesterStart.getTime()) / (1000 * 60 * 60 * 24)

      const expectedProgress = Math.round((daysPassed / totalDays) * 100)

      if (progressPercent < expectedProgress - 20) {
        signals.push({
          id: 'pace-critical',
          type: 'critical',
          title: '🔴 Behind Roadmap Pace',
          message: `You are ${expectedProgress - progressPercent}% behind schedule`,
          recommendation: 'Increase your learning intensity to catch up with the planned pace',
          metric: 'Progress vs Expected',
          currentValue: progressPercent,
          targetValue: expectedProgress,
          priority: 5
        })
        healthScore -= 20
        actionItems.push('Accelerate module completion to match roadmap schedule')
      } else if (progressPercent < expectedProgress - 10) {
          signals.push({
            id: 'pace-warning',
            type: 'warning',
            title: '🟡 Slightly Behind Schedule',
            message: `Expected ${expectedProgress}%, currently at ${progressPercent}%`,
            recommendation: 'Maintain consistent progress to stay on track',
            metric: 'Progress vs Expected',
            currentValue: progressPercent,
            targetValue: expectedProgress,
            priority: 3
          })
          healthScore -= 10
          actionItems.push('Monitor your progress against the planned timeline')
        } else {
          signals.push({
            id: 'pace-success',
            type: 'success',
            title: '✅ On Track',
            message: `Your progress (${progressPercent}%) matches the expected pace`,
            recommendation: 'Keep up this consistent momentum',
            metric: 'Progress vs Expected',
            currentValue: progressPercent,
            targetValue: expectedProgress,
            priority: 1
          })
        }
    }

    // === RULE 2: Skill Category Balance ===
    if (user.capabilityTwin) {
      const twin = user.capabilityTwin

      // Calculate derived scores from capability metrics
      const coreScore = (twin.executionReliability + twin.learningSpeed) / 2
      const advancedScore = (twin.problemSolvingDepth + twin.designReasoning) / 2
      const supportScore = twin.abstractionLevel

      if (advancedScore < 30) {
        signals.push({
          id: 'advanced-weak',
          type: 'warning',
          title: '🟡 Advanced Skills Lagging',
          message: 'Your advanced skill development is below target',
          recommendation: 'Focus on advanced modules to strengthen specialized capabilities',
          metric: 'Advanced Skills Score',
          currentValue: Math.round(advancedScore),
          targetValue: 50,
          priority: 4
        })
        healthScore -= 15
        actionItems.push('Prioritize advanced skill modules')
      }

      if (coreScore < 60) {
        signals.push({
          id: 'core-weak',
          type: 'critical',
          title: '🔴 Core Skills Foundation Weak',
          message: `Core skills at ${Math.round(coreScore)}% - need stronger fundamentals`,
          recommendation: 'Consolidate core skills before advancing to specialized areas',
          metric: 'Core Skills Score',
          currentValue: Math.round(coreScore),
          targetValue: 80,
          priority: 5
        })
        healthScore -= 25
        actionItems.push('Review and strengthen core competencies')
      }
    }

    // === RULE 3: Consistency & Learning Habit ===
    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)

    const recentSubmissions = user.labSubmissions.filter(
      sub => new Date(sub.submittedAt || sub.createdAt) >= last7Days
    ).length

    const expectedWeeklyTasks = 5 // Expected tasks per week

    if (recentSubmissions < expectedWeeklyTasks / 2) {
      signals.push({
        id: 'consistency-critical',
        type: 'critical',
        title: '🔴 Learning Consistency Dropped',
        message: `Low activity this week: ${recentSubmissions} tasks (expected: ${expectedWeeklyTasks})`,
        recommendation: 'Re-establish a consistent daily learning routine',
        metric: 'Weekly Submissions',
        currentValue: recentSubmissions,
        targetValue: expectedWeeklyTasks,
        priority: 5
      })
      healthScore -= 20
      actionItems.push('Re-establish consistent learning habits')
    } else if (recentSubmissions < expectedWeeklyTasks) {
      signals.push({
        id: 'consistency-warning',
        type: 'warning',
        title: '🟡 Below Average Activity',
        message: `This week: ${recentSubmissions} tasks (expected: ${expectedWeeklyTasks})`,
        recommendation: 'Increase weekly learning sessions for optimal progress',
        metric: 'Weekly Submissions',
        currentValue: recentSubmissions,
        targetValue: expectedWeeklyTasks,
        priority: 3
      })
      healthScore -= 10
    } else {
      signals.push({
        id: 'consistency-success',
        type: 'success',
        title: '✅ Good Learning Cadence',
        message: `Maintaining healthy activity: ${recentSubmissions} tasks this week`,
        recommendation: 'Continue this consistent learning pattern',
        metric: 'Weekly Submissions',
        currentValue: recentSubmissions,
        targetValue: expectedWeeklyTasks,
        priority: 1
      })
    }

    // === RULE 4: Task Completion Rate ===
    const totalSubmissions = user.labSubmissions.length
    const completedSubmissions = user.labSubmissions.filter(s => s.status === 'passed' || s.status === 'completed').length
    const completionRate = totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0

    if (completionRate < 50) {
      signals.push({
        id: 'completion-critical',
        type: 'critical',
        title: '🔴 Low Task Completion Rate',
        message: `Only ${completionRate}% of started tasks are completed`,
        recommendation: 'Focus on finishing tasks before starting new ones',
        metric: 'Task Completion Rate',
        currentValue: completionRate,
        targetValue: 85,
        priority: 4
      })
      healthScore -= 15
      actionItems.push('Improve task completion discipline')
    } else if (completionRate < 80) {
      signals.push({
        id: 'completion-warning',
        type: 'warning',
        title: '🟡 Completion Rate Below Target',
        message: `${completionRate}% completion - aim for 85%+`,
        recommendation: 'Work on completing started tasks more consistently',
        metric: 'Task Completion Rate',
        currentValue: completionRate,
        targetValue: 85,
        priority: 2
      })
      healthScore -= 8
    } else {
      signals.push({
        id: 'completion-success',
        type: 'success',
        title: '✅ Strong Completion Discipline',
        message: `${completionRate}% of tasks completed - excellent follow-through`,
        recommendation: 'Maintain this strong completion pattern',
        metric: 'Task Completion Rate',
        currentValue: completionRate,
        targetValue: 85,
        priority: 1
      })
    }

    // === RULE 5: Burnout Risk (consecutive days with high activity) ===
    const last3Days = new Date()
    last3Days.setDate(last3Days.getDate() - 3)

    const recentHighActivity = user.labSubmissions.filter(
      sub => new Date(sub.submittedAt || sub.createdAt) >= last3Days
    ).length

    if (recentHighActivity > 15) {
      signals.push({
        id: 'burnout-warning',
        type: 'warning',
        title: '⚠️ Potential Burnout Risk',
        message: 'Very high activity in the last 3 days',
        recommendation: 'Maintain sustainable pace - take breaks to avoid burnout',
        metric: 'Activity Intensity',
        currentValue: recentHighActivity,
        targetValue: 10,
        priority: 3
      })
      healthScore -= 5
      actionItems.push('Balance intensity with adequate rest')
    }

    // Determine overall health
    let overallHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent'
    if (healthScore >= 80) overallHealth = 'excellent'
    else if (healthScore >= 60) overallHealth = 'good'
    else if (healthScore >= 40) overallHealth = 'fair'
    else overallHealth = 'poor'

    // Sort signals by priority (highest first)
    signals.sort((a, b) => b.priority - a.priority)

    return success({
      userId: session.user.id,
      timestamp: new Date().toISOString(),
      signals,
      overallHealth,
      actionItems: [...new Set(actionItems)] // Remove duplicates
    } as StrategyData)
  } catch (error) {
    console.error('Strategy signals error:', error)
    return serverError()
  }
}
