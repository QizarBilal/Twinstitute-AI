import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

// GET /api/analytics/cohorts — Get cohort analytics for institution
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    // Get user's institution
    const institutionMember = await prisma.institutionMember.findUnique({
      where: { userId: session.user.id },
      include: { institution: true }
    })

    if (!institutionMember) {
      return success([]) // Not an institution member
    }

    // Get all cohorts for this institution
    const cohorts = await prisma.cohort.findMany({
      where: { institutionId: institutionMember.institutionId },
      include: {
        members: {
          include: {
            user: {
              include: {
                capabilityTwin: true,
                labSubmissions: {
                  include: { evaluation: true }
                }
              }
            }
          }
        },
        semester: true
      }
    })

    const analytics = await Promise.all(cohorts.map(async (cohort) => {
      const members = cohort.members
      const totalStudents = members.length
      const activeStudents = members.filter(m => m.user.capabilityTwin).length

      // Calculate averages
      const twins = members.map(m => m.user.capabilityTwin).filter(Boolean)
      const avgCapabilityScore = twins.length > 0
        ? twins.reduce((sum, twin) => sum + twin.overallScore, 0) / twins.length
        : 0

      const avgReadinessScore = twins.length > 0
        ? twins.reduce((sum, twin) => sum + twin.readinessScore, 0) / twins.length
        : 0

      const formationVelocity = twins.length > 0
        ? twins.reduce((sum, twin) => sum + twin.formationVelocity, 0) / twins.length
        : 0

      const burnoutRiskAverage = twins.length > 0
        ? twins.reduce((sum, twin) => sum + twin.burnoutRisk, 0) / twins.length
        : 0

      const completionRate = totalStudents > 0
        ? (activeStudents / totalStudents) * 100
        : 0

      // Skill gap heatmap (simplified)
      const skillGaps: Record<string, number> = {}
      members.forEach(member => {
        member.user.labSubmissions.forEach(sub => {
          if (sub.evaluation?.gapsIdentified) {
            const gaps = JSON.parse(sub.evaluation.gapsIdentified)
            gaps.forEach((gap: string) => {
              skillGaps[gap] = (skillGaps[gap] || 0) + 1
            })
          }
        })
      })

      return {
        cohortId: cohort.id,
        cohortName: cohort.name,
        totalStudents,
        activeStudents,
        avgCapabilityScore,
        avgReadinessScore,
        formationVelocity,
        completionRate,
        skillGapHeatmap: skillGaps,
        burnoutRiskAverage
      }
    }))

    return success(analytics)
  } catch (error) {
    console.error('Cohort analytics error:', error)
    return serverError()
  }
}