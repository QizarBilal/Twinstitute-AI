import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

// GET /api/twin — Get or create the capability twin for current user
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    let twin = await prisma.capabilityTwin.findUnique({
      where: { userId: session.user.id },
    })

    if (!twin) {
      twin = await prisma.capabilityTwin.create({
        data: { userId: session.user.id },
      })
    }

    // Calculate derived fields
    const overallScore = twin.overallScore || 0
    const currentStage = 
      overallScore < 25 ? 'foundation' :
      overallScore < 50 ? 'building' :
      overallScore < 75 ? 'advancing' :
      'expert'

    // Calculate readiness score (interview-readiness percentage)
    const readinessScore = Math.min(
      100,
      Math.round(
        ((twin.executionReliability || 0) * 0.25 +
         (twin.learningSpeed || 0) * 0.2 +
         (twin.problemSolvingDepth || 0) * 0.35 +
         (twin.consistency || 0) * 0.2) * 1.2
      )
    )

    // Calculate formation velocity (points per week growth)
    const scoreHistory = JSON.parse(twin.scoreHistory || '[]') as Array<{ score: number }>
    const formationVelocity = scoreHistory.length > 7
      ? Math.round((scoreHistory[scoreHistory.length - 1]?.score - scoreHistory[scoreHistory.length - 8]?.score) / 2)
      : 0

    // Count completed labs
    const submissions = await prisma.labSubmission.count({
      where: { userId: session.user.id },
    })

    return success({
      ...twin,
      scoreHistory: JSON.parse(twin.scoreHistory || '[]'),
      weeklyReports: JSON.parse(twin.weeklyReports || '[]'),
      // Derived fields for dashboard
      overallScore,
      currentStage,
      readinessScore,
      formationVelocity,
      labsCompleted: submissions,
      creditsEarned: twin.overallScore || 0, // Could be more sophisticated
    })
  } catch (error) {
    console.error('Twin GET error:', error)
    return serverError()
  }
}

// POST /api/twin — Update capability twin after task completion
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const {
      executionReliability,
      learningSpeed,
      problemSolvingDepth,
      consistency,
      designReasoning,
      abstractionLevel,
      burnoutRisk,
      innovationIndex,
      targetRole,
      targetDomain,
    } = body

    let twin = await prisma.capabilityTwin.findUnique({
      where: { userId: session.user.id },
    })

    const updateData: Record<string, unknown> = { lastUpdated: new Date() }

    if (executionReliability !== undefined) updateData.executionReliability = executionReliability
    if (learningSpeed !== undefined) updateData.learningSpeed = learningSpeed
    if (problemSolvingDepth !== undefined) updateData.problemSolvingDepth = problemSolvingDepth
    if (consistency !== undefined) updateData.consistency = consistency
    if (designReasoning !== undefined) updateData.designReasoning = designReasoning
    if (abstractionLevel !== undefined) updateData.abstractionLevel = abstractionLevel
    if (burnoutRisk !== undefined) updateData.burnoutRisk = burnoutRisk
    if (innovationIndex !== undefined) updateData.innovationIndex = innovationIndex
    if (targetRole !== undefined) updateData.targetRole = targetRole
    if (targetDomain !== undefined) updateData.targetDomain = targetDomain

    // Compute overall score from dimensions
    const dims = [
      executionReliability ?? twin?.executionReliability ?? 0,
      learningSpeed ?? twin?.learningSpeed ?? 0,
      problemSolvingDepth ?? twin?.problemSolvingDepth ?? 0,
      consistency ?? twin?.consistency ?? 0,
      designReasoning ?? twin?.designReasoning ?? 0,
      abstractionLevel ?? twin?.abstractionLevel ?? 0,
      innovationIndex ?? twin?.innovationIndex ?? 0,
    ]
    updateData.overallScore = Math.round(dims.reduce((a, b) => a + b, 0) / dims.length)

    // Compute readiness score (overall minus burnout penalty)
    const burnout = burnoutRisk ?? twin?.burnoutRisk ?? 0
    updateData.readinessScore = Math.max(0, (updateData.overallScore as number) - burnout * 0.3)

    // Determine stage
    const score = updateData.overallScore as number
    if (score >= 85) updateData.currentStage = 'expert'
    else if (score >= 65) updateData.currentStage = 'advancing'
    else if (score >= 40) updateData.currentStage = 'building'
    else updateData.currentStage = 'foundation'

    // Append to score history
    const existingHistory = JSON.parse(twin?.scoreHistory || '[]')
    existingHistory.push({
      score: updateData.overallScore,
      date: new Date().toISOString(),
    })
    // Keep last 52 entries (1 year of weekly)
    if (existingHistory.length > 52) existingHistory.splice(0, existingHistory.length - 52)
    updateData.scoreHistory = JSON.stringify(existingHistory)

    // Calculate formation velocity (point change per week over last 4 entries)
    if (existingHistory.length >= 2) {
      const recent = existingHistory.slice(-4)
      const velocity = (recent[recent.length - 1].score - recent[0].score) / recent.length
      updateData.formationVelocity = Number(velocity.toFixed(2))
      updateData.improvementSlope = Number(velocity.toFixed(2))
    }

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
    console.error('Twin POST error:', error)
    return serverError()
  }
}
