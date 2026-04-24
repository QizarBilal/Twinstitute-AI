import { NextRequest } from 'next/server'
import { getAuthSession, success, unauthorized, serverError } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized('Not authenticated')

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        capabilityTwin: true,
        skillGenome: true,
      },
    })

    if (!user) {
      return serverError('User not found')
    }

    const twin = user.capabilityTwin

    if (!twin) {
      // Return default twin data if not created yet
      return success({
        id: `twin-${user.id}`,
        userId: user.id,
        targetRole: 'Full Stack Developer',
        overallScore: 50,
        formationVelocity: 1,
        burnoutRisk: 30,
        capabilityMaturity: {
          foundation: 40,
          core: 35,
          application: 30,
          mastery: 0,
        },
        recommendedPath: 'Foundation → Core Skills',
        nextMilestone: 'Core Skills Completion',
        institutionFit: 85,
        industryReadiness: 35,
      })
    }

    return success({
      id: twin.id,
      userId: twin.userId,
      targetRole: twin.targetRole || 'Full Stack Developer',
      overallScore: twin.overallScore || 50,
      formationVelocity: twin.formationVelocity || 1,
      burnoutRisk: twin.burnoutRisk || 30,
      capabilityMaturity: twin.capabilityMaturity || {
        foundation: 40,
        core: 35,
        application: 30,
        mastery: 0,
      },
      recommendedPath: twin.recommendedPath || 'Foundation → Core Skills',
      nextMilestone: twin.nextMilestone || 'Core Skills Completion',
      institutionFit: twin.institutionFit || 85,
      industryReadiness: twin.industryReadiness || 35,
    })
  } catch (error) {
    console.error('Twin GET error:', error)
    return serverError()
  }
}
