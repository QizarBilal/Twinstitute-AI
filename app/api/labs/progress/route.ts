import { NextRequest } from 'next/server'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user?.email) {
      return unauthorized('Not authenticated')
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        labSubmissions: {
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return serverError('User not found')
    }

    const completedCount = user.labSubmissions.filter(s => s.status === 'passed').length
    const totalAttempts = user.labSubmissions.length
    const avgScore = totalAttempts > 0 ? 
      Math.round(user.labSubmissions.reduce((sum, s) => sum + (s.scoreTotal || 0), 0) / totalAttempts) : 0

    return success({
      completedCount,
      totalAttempts,
      averageScore: avgScore,
      successRate: totalAttempts > 0 ? Math.round((completedCount / totalAttempts) * 100) : 0,
      recentSubmissions: user.labSubmissions.slice(0, 10).map(s => ({
        id: s.id,
        taskId: s.taskId,
        score: s.scoreTotal,
        status: s.status,
        submittedAt: s.createdAt,
        timeSpent: s.timeSpentMin,
      })),
    })
  } catch (error) {
    console.error('Progress GET error:', error)
    return serverError(error instanceof Error ? error.message : 'Failed to fetch progress')
  }
}

interface ProgressUpdateRequest {
  taskId: string
  score: number // 0-100
  timeSpentMin: number
  submittedCode?: string
  submittedAnswer?: string
  approach?: string
  skillsEvaluated?: string[]
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        skillGenome: true,
        capabilityTwin: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body: ProgressUpdateRequest = await req.json()

    // Validate input
    if (!body.taskId || body.score === undefined || body.timeSpentMin === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch the task
    const task = await prisma.labTask.findUnique({
      where: { id: body.taskId },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Determine pass/fail
    const isPassed = body.score >= 70

    // Calculate credits earned
    const creditsEarned = isPassed
      ? Math.round((body.score / 100) * task.creditReward)
      : 0

    // Create submission record
    const submission = await prisma.labSubmission.create({
      data: {
        userId: user.id,
        taskId: body.taskId,
        submittedCode: body.submittedCode,
        submittedAnswer: body.submittedAnswer,
        approach: body.approach,
        timeSpentMin: body.timeSpentMin,
        status: isPassed ? 'passed' : 'failed',
        scoreTotal: body.score,
        creditsAwarded: creditsEarned,
      },
    })

    // ─── UPDATE SKILL GENOME ─────────────────────────────────────────────────
    // This is the critical feedback loop

    const skillsFromTask = body.skillsEvaluated || (task.skills ? JSON.parse(task.skills) : [])
    const scoreMultiplier = body.score / 100

    let skillGenomeData = user.skillGenome
      ? JSON.parse(user.skillGenome.nodes || '[]')
      : []

    // Update proficiency for skills evaluated in this task
    for (const skill of skillsFromTask) {
      let node = skillGenomeData.find((n: any) => n.name === skill)

      if (!node) {
        node = {
          name: skill,
          proficiency: 0,
          attempts: 0,
          successes: 0,
          lastUpdated: new Date(),
        }
        skillGenomeData.push(node)
      }

      // Update node based on performance
      node.attempts = (node.attempts || 0) + 1
      if (isPassed) {
        node.successes = (node.successes || 0) + 1
      }

      // Calculate new proficiency (weighted average)
      const currentProf = node.proficiency || 0
      const taskDifficulty = task.difficulty / 10
      const performanceWeight = scoreMultiplier * taskDifficulty
      node.proficiency = Math.min(
        100,
        currentProf * 0.7 + performanceWeight * 100 * 0.3
      )

      node.lastUpdated = new Date()
    }

    // Update skill genome in database
    if (!user.skillGenome) {
      await prisma.skillGenome.create({
        data: {
          userId: user.id,
          nodes: JSON.stringify(skillGenomeData),
          edges: '[]',
          weakClusters: '[]',
          bridgeSkills: '[]',
          compoundingSkills: '[]',
        },
      })
    } else {
      await prisma.skillGenome.update({
        where: { id: user.skillGenome.id },
        data: {
          nodes: JSON.stringify(skillGenomeData),
          lastAnalyzed: new Date(),
        },
      })
    }

    // ─── UPDATE CAPABILITY TWIN ──────────────────────────────────────────────

    let capabilityTwin = user.capabilityTwin

    if (!capabilityTwin) {
      capabilityTwin = await prisma.capabilityTwin.create({
        data: {
          userId: user.id,
          currentStage: 'foundation',
        },
      })
    }

    // Fetch recent submissions to calculate overall capability
    const recentSubmissions = await prisma.labSubmission.findMany({
      where: { userId: user.id },
      orderBy: { submittedAt: 'desc' },
      take: 20,
      select: { scoreTotal: true, taskId: true },
    })

    const recentScore =
      recentSubmissions.length > 0
        ? recentSubmissions.reduce((sum, s) => sum + s.scoreTotal, 0) /
          recentSubmissions.length
        : 0

    // Calculate execution reliability (consistency in performance)
    const recentScores = recentSubmissions
      .slice(0, 10)
      .map(s => s.scoreTotal)
    const executionReliability =
      recentScores.length > 0
        ? 100 -
          Math.sqrt(
            recentScores.reduce((sum, s) => sum + Math.pow(s - recentScore, 2), 0) /
              recentScores.length
          )
        : 50

    // Calculate learning speed (improvement over time)
    const oldScores = recentSubmissions.slice(10, 20).map(s => s.scoreTotal)
    const oldAvg = oldScores.length > 0 ? oldScores.reduce((a, b) => a + b, 0) / oldScores.length : recentScore
    const learningSpeed = recentScore - oldAvg + 50 // 50 is baseline

    // Update capability twin
    await prisma.capabilityTwin.update({
      where: { id: capabilityTwin.id },
      data: {
        overallScore: recentScore,
        executionReliability: Math.max(0, Math.min(100, executionReliability)),
        learningSpeed: Math.max(0, Math.min(100, learningSpeed)),
        currentStage:
          recentScore > 85
            ? 'expert'
            : recentScore > 70
              ? 'advancing'
              : recentScore > 50
                ? 'building'
                : 'foundation',
        lastUpdated: new Date(),
      },
    })

    return NextResponse.json({
      submission: {
        id: submission.id,
        passed: isPassed,
        score: body.score,
        creditsEarned,
      },
      updates: {
        skillsUpdated: skillsFromTask,
        capabilityScore: recentScore,
        stage:
          recentScore > 85
            ? 'expert'
            : recentScore > 70
              ? 'advancing'
              : recentScore > 50
                ? 'building'
                : 'foundation',
      },
      message: isPassed
        ? `Great job! You passed with ${Math.round(body.score)}% and earned ${creditsEarned} credits.`
        : `Keep practicing! You scored ${Math.round(body.score)}%. Try the next easier task.`,
    })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
