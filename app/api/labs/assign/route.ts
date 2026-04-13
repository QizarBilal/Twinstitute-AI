import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// POST /api/labs/assign — Auto-assign tasks to user based on skill gaps
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { taskType, count = 3 } = body

    // Get user's completed tasks to avoid reassignment
    const completedTaskIds = (await prisma.labSubmission.findMany({
      where: { userId: session.user.id, status: { in: ['passed', 'evaluated'] } },
      select: { taskId: true },
    })).map(s => s.taskId)

    const where: Record<string, unknown> = {
      isActive: true,
      id: { notIn: completedTaskIds },
    }
    if (taskType && taskType !== 'all') where.taskType = taskType

    // Get user's twin to match tasks to weak areas
    const twin = await prisma.capabilityTwin.findUnique({
      where: { userId: session.user.id },
    })

    // Assign tasks matching user's target domain or general
    const tasks = await prisma.labTask.findMany({
      where,
      orderBy: { difficulty: 'asc' },
      take: Number(count),
    })

    // If user has a twin, prefer tasks that target weak dimensions
    const assignedTasks = tasks.map(task => ({
      ...task,
      skills: JSON.parse(task.skills || '[]'),
      assigned: true,
      assignedAt: new Date().toISOString(),
      matchReason: twin ? `Assigned based on your ${twin.currentStage} stage` : 'Daily assignment',
    }))

    return success({
      assigned: assignedTasks,
      totalAvailable: tasks.length,
      userStage: twin?.currentStage || 'foundation',
    })
  } catch (error) {
    console.error('Labs assign error:', error)
    return serverError()
  }
}
