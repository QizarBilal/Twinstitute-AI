import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// Safe JSON parser that handles CSV strings
function safeJsonParse(value: string | null, fallback: any = []) {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    // If JSON parse fails, try treating as CSV
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map(s => s.trim()).filter(Boolean)
    }
    return fallback
  }
}

// GET /api/labs — Get lab tasks (with optional filters)
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const { searchParams } = new URL(req.url)
    const taskType = searchParams.get('taskType')
    const domain = searchParams.get('domain')

    const where: Record<string, unknown> = { isActive: true }
    if (taskType && taskType !== 'all') where.taskType = taskType
    if (domain) where.domain = domain

    const tasks = await prisma.labTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Get user submissions for these tasks
    const submissions = await prisma.labSubmission.findMany({
      where: { userId: session.user.id },
      include: { evaluation: true },
    })

    const submissionMap = new Map(submissions.map(s => [s.taskId, s]))

    const enrichedTasks = tasks.map(task => ({
      ...task,
      skills: safeJsonParse(task.skills),
      testCases: safeJsonParse(task.testCases),
      evaluationRubric: safeJsonParse(task.evaluationRubric, {}),
      userSubmission: submissionMap.get(task.id) ? {
        ...submissionMap.get(task.id),
        scoreBreakdown: safeJsonParse(submissionMap.get(task.id)!.scoreBreakdown, {}),
      } : null,
    }))

    // Get user's twin data to determine recommended task
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { selectedDomain: true, directionProfile: true },
    })

    // Select recommended task (first incomplete task matching domain)
    const recommendedTask = enrichedTasks.find(
      t => !t.userSubmission && (t.domain === user?.selectedDomain || !user?.selectedDomain)
    ) || enrichedTasks.find(t => !t.userSubmission) || enrichedTasks[0]

    const recommended = recommendedTask ? {
      title: recommendedTask.title,
      description: recommendedTask.description,
      reason: `Improves ${recommendedTask.taskType} skills for your selected role`,
      duration: recommendedTask.timeEstimateMin || 45,
      difficulty: recommendedTask.difficulty,
      impactExecution: Math.round(recommendedTask.creditReward * 0.8),
      impactProblemSolving: Math.round(recommendedTask.creditReward * 0.5),
      category: recommendedTask.taskType,
      tags: recommendedTask.skills ? safeJsonParse(recommendedTask.skills) : [],
    } : null

    return success({
      tasks: enrichedTasks,
      recommended: recommended || {
        title: 'Start Your First Lab Task',
        description: 'Complete any available lab task to begin building your capability profile',
        reason: 'Initialize the intelligence engine and start your growth journey',
        duration: 45,
        difficulty: 1,
        impactExecution: 5,
        impactProblemSolving: 3,
        category: 'foundation',
        tags: ['introduction', 'basics'],
      },
    })
  } catch (error) {
    console.error('Labs GET error:', error)
    return serverError()
  }
}

// POST /api/labs — Create a new lab task (admin/system only)
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { title, description, taskType, difficulty, domain, skills, timeEstimateMin, instructions, testCases, evaluationRubric, creditReward } = body

    if (!title || !description || !taskType || !difficulty || !domain) {
      return badRequest('Missing required fields: title, description, taskType, difficulty, domain')
    }

    const task = await prisma.labTask.create({
      data: {
        title,
        description,
        taskType,
        difficulty: Number(difficulty),
        domain,
        skills: JSON.stringify(skills || []),
        timeEstimateMin: Number(timeEstimateMin || 30),
        instructions: instructions || '',
        testCases: JSON.stringify(testCases || []),
        evaluationRubric: JSON.stringify(evaluationRubric || {}),
        creditReward: Number(creditReward || 10),
      },
    })

    return success(task)
  } catch (error) {
    console.error('Labs POST error:', error)
    return serverError()
  }
}
