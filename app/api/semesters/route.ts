import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// GET /api/semesters — Get available semesters
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const semesters = await prisma.semester.findMany({
      where: { isActive: true },
      include: {
        cohorts: {
          include: { _count: { select: { members: true } } },
        },
        milestones: { where: { userId: session.user.id } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return success(semesters)
  } catch (error) {
    console.error('Semesters error:', error)
    return serverError()
  }
}

// POST /api/semesters — Create a virtual semester (institution admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { name, description, domain, targetRole, durationWeeks, labCycles, evaluationRounds } = body

    if (!name || !domain || !targetRole) {
      return badRequest('Required: name, domain, targetRole')
    }

    const semester = await prisma.semester.create({
      data: {
        name,
        description: description || null,
        domain,
        targetRole,
        durationWeeks: Number(durationWeeks || 12),
        labCycles: Number(labCycles || 4),
        evaluationRounds: Number(evaluationRounds || 2),
      },
    })

    return success(semester)
  } catch (error) {
    console.error('Semesters POST error:', error)
    return serverError()
  }
}
