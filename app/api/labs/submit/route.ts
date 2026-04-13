import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// POST /api/labs/submit — Submit lab work for evaluation
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { taskId, submittedCode, submittedAnswer, approach, timeSpentMin } = body

    if (!taskId) return badRequest('taskId is required')
    if (!submittedCode && !submittedAnswer) return badRequest('Must provide submittedCode or submittedAnswer')

    // Check task exists
    const task = await prisma.labTask.findUnique({ where: { id: taskId } })
    if (!task) return badRequest('Task not found')

    // Check if user already has a submission for this task
    const existingSub = await prisma.labSubmission.findFirst({
      where: { userId: session.user.id, taskId },
      orderBy: { attemptNumber: 'desc' },
    })

    const attemptNumber = existingSub ? existingSub.attemptNumber + 1 : 1

    const submission = await prisma.labSubmission.create({
      data: {
        userId: session.user.id,
        taskId,
        submittedCode: submittedCode || null,
        submittedAnswer: submittedAnswer || null,
        approach: approach || null,
        timeSpentMin: Number(timeSpentMin || 0),
        attemptNumber,
        status: 'pending',
      },
    })

    return success({
      submission,
      message: 'Submission received. Evaluation will begin shortly.',
      attemptNumber,
    })
  } catch (error) {
    console.error('Labs submit error:', error)
    return serverError()
  }
}
