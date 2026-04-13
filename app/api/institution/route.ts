import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// GET /api/institution — Get institution data + cohort analytics
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    // Check if user is part of an institution
    const membership = await prisma.institutionMember.findUnique({
      where: { userId: session.user.id },
      include: {
        institution: {
          include: {
            cohorts: {
              include: {
                members: {
                  include: {
                    user: {
                      include: {
                        capabilityTwin: true,
                      },
                    },
                  },
                },
                semester: true,
              },
            },
          },
        },
      },
    })

    if (!membership) {
      return success({ isInstitutionMember: false, institution: null })
    }

    const institution = membership.institution

    // Cohort analytics
    const cohortAnalytics = institution.cohorts.map(cohort => {
      const members = cohort.members
      const twins = members.map(m => m.user.capabilityTwin).filter(Boolean)

      const avgScore = twins.length > 0
        ? Math.round(twins.reduce((sum, t) => sum + (t?.overallScore || 0), 0) / twins.length)
        : 0

      const avgReadiness = twins.length > 0
        ? Math.round(twins.reduce((sum, t) => sum + (t?.readinessScore || 0), 0) / twins.length)
        : 0

      const avgVelocity = twins.length > 0
        ? Number((twins.reduce((sum, t) => sum + (t?.formationVelocity || 0), 0) / twins.length).toFixed(2))
        : 0

      // Stage distribution
      const stages = { foundation: 0, building: 0, advancing: 0, expert: 0 }
      twins.forEach(t => {
        const stage = (t?.currentStage || 'foundation') as keyof typeof stages
        if (stage in stages) stages[stage]++
      })

      // Skill gap detection (average dimension scores)
      const dimensions = {
        executionReliability: 0,
        learningSpeed: 0,
        problemSolvingDepth: 0,
        consistency: 0,
        designReasoning: 0,
        abstractionLevel: 0,
        innovationIndex: 0,
      }

      twins.forEach(t => {
        if (!t) return
        dimensions.executionReliability += t.executionReliability
        dimensions.learningSpeed += t.learningSpeed
        dimensions.problemSolvingDepth += t.problemSolvingDepth
        dimensions.consistency += t.consistency
        dimensions.designReasoning += t.designReasoning
        dimensions.abstractionLevel += t.abstractionLevel
        dimensions.innovationIndex += t.innovationIndex
      })

      const count = Math.max(twins.length, 1)
      const avgDimensions = Object.fromEntries(
        Object.entries(dimensions).map(([k, v]) => [k, Math.round(v / count)])
      )

      // Identify gaps (dimensions below 50)
      const skillGaps = Object.entries(avgDimensions)
        .filter(([, v]) => v < 50)
        .map(([k, v]) => ({ dimension: k, score: v, gap: 50 - v }))
        .sort((a, b) => b.gap - a.gap)

      // Readiness heatmap data
      const readinessData = members.map(m => ({
        name: m.user.fullName,
        score: m.user.capabilityTwin?.overallScore || 0,
        readiness: m.user.capabilityTwin?.readinessScore || 0,
        stage: m.user.capabilityTwin?.currentStage || 'foundation',
        velocity: m.user.capabilityTwin?.formationVelocity || 0,
      }))

      return {
        id: cohort.id,
        name: cohort.name,
        targetDomain: cohort.targetDomain,
        targetRole: cohort.targetRole,
        isActive: cohort.isActive,
        memberCount: members.length,
        semester: cohort.semester?.name || null,
        analytics: {
          avgScore,
          avgReadiness,
          avgVelocity,
          stages,
          avgDimensions,
          skillGaps,
          readinessHeatmap: readinessData,
        },
      }
    })

    // Placement analytics
    const allTwins = institution.cohorts
      .flatMap(c => c.members)
      .map(m => m.user.capabilityTwin)
      .filter(Boolean)

    const placementReady = allTwins.filter(t => (t?.readinessScore || 0) >= 80).length
    const total = allTwins.length || 1

    return success({
      isInstitutionMember: true,
      role: membership.role,
      institution: {
        id: institution.id,
        name: institution.name,
        domain: institution.domain,
        planType: institution.planType,
        maxStudents: institution.maxStudents,
        isVerified: institution.isVerified,
      },
      cohorts: cohortAnalytics,
      placementAnalytics: {
        totalStudents: allTwins.length,
        placementReady,
        placementRate: Math.round((placementReady / total) * 100),
        avgFormationVelocity: Number((allTwins.reduce((sum, t) => sum + (t?.formationVelocity || 0), 0) / total).toFixed(2)),
      },
    })
  } catch (error) {
    console.error('Institution GET error:', error)
    return serverError()
  }
}

// POST /api/institution — Institution onboarding
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { name, domain, planType } = body

    if (!name || !domain) return badRequest('name and domain are required')

    // Check if institution already exists
    const existing = await prisma.institution.findUnique({ where: { domain } })
    if (existing) return badRequest('Institution with this domain already exists')

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    const institution = await prisma.institution.create({
      data: {
        name,
        domain,
        adminEmail: user?.email || '',
        planType: planType || 'starter',
      },
    })

    // Make current user an admin member
    await prisma.institutionMember.create({
      data: {
        userId: session.user.id,
        institutionId: institution.id,
        role: 'admin',
      },
    })

    // Update user account type
    await prisma.user.update({
      where: { id: session.user.id },
      data: { accountType: 'institution' },
    })

    return success({ institution, message: 'Institution created successfully' })
  } catch (error) {
    console.error('Institution POST error:', error)
    return serverError()
  }
}
