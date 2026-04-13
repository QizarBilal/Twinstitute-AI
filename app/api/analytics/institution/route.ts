import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

// GET /api/analytics/institution — Get institution-wide analytics
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
      return success(null) // Not an institution member
    }

    // Get all cohorts and their data
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
        }
      }
    })

    const allMembers = cohorts.flatMap(cohort => cohort.members)
    const totalStudents = allMembers.length
    const activeCohorts = cohorts.filter(c => c.members.length > 0).length

    // Calculate institution metrics
    const twins = allMembers.map(m => m.user.capabilityTwin).filter(Boolean)

    const avgFormationVelocity = twins.length > 0
      ? twins.reduce((sum, twin) => sum + twin.formationVelocity, 0) / twins.length
      : 0

    // Readiness heatmap
    const readinessCounts = { low: 0, medium: 0, high: 0, ready: 0 }
    twins.forEach(twin => {
      if (twin.readinessScore >= 80) readinessCounts.ready++
      else if (twin.readinessScore >= 60) readinessCounts.high++
      else if (twin.readinessScore >= 40) readinessCounts.medium++
      else readinessCounts.low++
    })

    // Top skill gaps across institution
    const skillGapCounts: Record<string, number> = {}
    allMembers.forEach(member => {
      member.user.labSubmissions.forEach(sub => {
        if (sub.evaluation?.gapsIdentified) {
          const gaps = JSON.parse(sub.evaluation.gapsIdentified)
          gaps.forEach((gap: string) => {
            skillGapCounts[gap] = (skillGapCounts[gap] || 0) + 1
          })
        }
      })
    })

    const topSkillGaps = Object.entries(skillGapCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, frequency]) => ({ skill, frequency }))

    // Institutional efficiency (simplified metric)
    const institutionalEfficiency = totalStudents > 0
      ? Math.min((twins.length / totalStudents) * 100, 100)
      : 0

    return success({
      totalStudents,
      activeCohorts,
      avgFormationVelocity,
      readinessHeatmap: readinessCounts,
      topSkillGaps,
      institutionalEfficiency
    })
  } catch (error) {
    console.error('Institution analytics error:', error)
    return serverError()
  }
}