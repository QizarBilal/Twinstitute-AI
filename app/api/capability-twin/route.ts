import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    let twin = await prisma.capabilityTwin.findUnique({
      where: { userId: session.user.id },
    })

    if (!twin) {
      // Initialize with default scores
      twin = await prisma.capabilityTwin.create({
        data: {
          userId: session.user.id,
          overallScore: 0,
          executionReliability: 0,
          learningSpeed: 0,
          problemSolvingDepth: 0,
          consistency: 0,
          designReasoning: 0,
          abstractionLevel: 0,
          burnoutRisk: 0,
          improvementSlope: 0,
          innovationIndex: 0,
          currentStage: 'foundation',
          formationVelocity: 0,
          readinessScore: 0,
        },
      })
    }

    return success({
      ...twin,
      scoreHistory: JSON.parse(twin.scoreHistory || '[]'),
      weeklyReports: JSON.parse(twin.weeklyReports || '[]'),
    })
  } catch (error) {
    console.error('Capability Twin GET error:', error)
    return serverError()
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await request.json()
    const {
      overallScore,
      executionReliability,
      learningSpeed,
      problemSolvingDepth,
      consistency,
      designReasoning,
      abstractionLevel,
      burnoutRisk,
      improvementSlope,
      innovationIndex,
      currentStage,
      targetRole,
      targetDomain,
      formationVelocity,
      readinessScore,
    } = body

    const updateData: Record<string, any> = { lastUpdated: new Date() }

    if (overallScore !== undefined) updateData.overallScore = overallScore
    if (executionReliability !== undefined) updateData.executionReliability = executionReliability
    if (learningSpeed !== undefined) updateData.learningSpeed = learningSpeed
    if (problemSolvingDepth !== undefined) updateData.problemSolvingDepth = problemSolvingDepth
    if (consistency !== undefined) updateData.consistency = consistency
    if (designReasoning !== undefined) updateData.designReasoning = designReasoning
    if (abstractionLevel !== undefined) updateData.abstractionLevel = abstractionLevel
    if (burnoutRisk !== undefined) updateData.burnoutRisk = burnoutRisk
    if (improvementSlope !== undefined) updateData.improvementSlope = improvementSlope
    if (innovationIndex !== undefined) updateData.innovationIndex = innovationIndex
    if (currentStage) updateData.currentStage = currentStage
    if (targetRole) updateData.targetRole = targetRole
    if (targetDomain) updateData.targetDomain = targetDomain
    if (formationVelocity !== undefined) updateData.formationVelocity = formationVelocity
    if (readinessScore !== undefined) updateData.readinessScore = readinessScore

    let twin = await prisma.capabilityTwin.findUnique({
      where: { userId: session.user.id },
    })

    if (twin) {
      twin = await prisma.capabilityTwin.update({
        where: { userId: session.user.id },
        data: updateData,
      })
    } else {
      twin = await prisma.capabilityTwin.create({
        data: {
          userId: session.user.id,
          ...updateData,
        } as Parameters<typeof prisma.capabilityTwin.create>[0]['data'],
      })
    }

    return success({
      ...twin,
      scoreHistory: JSON.parse(twin.scoreHistory || '[]'),
      weeklyReports: JSON.parse(twin.weeklyReports || '[]'),
    })
  } catch (error) {
    console.error('Capability Twin POST error:', error)
    return serverError()
  }
}
