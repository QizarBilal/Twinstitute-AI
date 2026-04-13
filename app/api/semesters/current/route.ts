import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

// GET /api/semesters/current — Get user's current active semester
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    // Find user's active cohort
    const cohortMember = await prisma.cohortMember.findFirst({
      where: { userId: session.user.id },
      include: {
        cohort: {
          include: {
            semester: true
          }
        }
      }
    })

    if (!cohortMember?.cohort?.semester) {
      return success(null) // No active semester
    }

    return success(cohortMember.cohort.semester)
  } catch (error) {
    console.error('Current semester error:', error)
    return serverError()
  }
}