import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// GET /api/milestones — Get user's milestones
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    let milestones = await prisma.milestone.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
      include: { semester: true },
    })

    // Auto-create default milestones if none exist
    if (milestones.length === 0) {
      const defaults = [
        { milestoneType: 'formation', title: 'Complete Orientation', description: 'Finish the direction orientation flow', targetValue: 1 },
        { milestoneType: 'lab_completion', title: 'Complete 5 Lab Tasks', description: 'Pass 5 capability lab assignments', targetValue: 5 },
        { milestoneType: 'lab_completion', title: 'Complete 20 Lab Tasks', description: 'Pass 20 capability lab assignments', targetValue: 20 },
        { milestoneType: 'credit_threshold', title: 'Earn 100 Credits', description: 'Accumulate 100 total capability credits', targetValue: 100 },
        { milestoneType: 'credit_threshold', title: 'Earn 500 Credits', description: 'Accumulate 500 total capability credits', targetValue: 500 },
        { milestoneType: 'readiness', title: 'Reach Building Stage', description: 'Achieve Building stage in capability twin', targetValue: 40 },
        { milestoneType: 'readiness', title: 'Reach Advancing Stage', description: 'Achieve Advancing stage in capability twin', targetValue: 65 },
        { milestoneType: 'readiness', title: 'Interview Ready', description: 'Reach interview readiness score of 80', targetValue: 80 },
        { milestoneType: 'project', title: 'First Public Proof', description: 'Publish your first public proof artifact', targetValue: 1 },
        { milestoneType: 'interview_ready', title: 'Complete Mock Interview', description: 'Complete a mock interview session', targetValue: 1 },
      ]

      await Promise.all(
        defaults.map(m =>
          prisma.milestone.create({
            data: { userId: session.user.id, ...m },
          })
        )
      )

      milestones = await prisma.milestone.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'asc' },
        include: { semester: true },
      })
    }

    // Auto-update progress from real data
    const [twin, credits, labs, proofs] = await Promise.all([
      prisma.capabilityTwin.findUnique({ where: { userId: session.user.id } }),
      prisma.capabilityCredit.findMany({ where: { userId: session.user.id } }),
      prisma.labSubmission.findMany({ where: { userId: session.user.id, status: 'passed' } }),
      prisma.proofArtifact.findMany({ where: { userId: session.user.id, isPublic: true } }),
    ])

    const totalCredits = credits.reduce((sum, c) => sum + c.amount, 0)
    const passedLabs = labs.length
    const publicProofs = proofs.length
    const overallScore = twin?.overallScore || 0
    const orientationDone = true // since they're on dashboard

    // Update milestone progress
    for (const milestone of milestones) {
      let currentValue = milestone.currentValue
      switch (milestone.milestoneType) {
        case 'formation':
          currentValue = orientationDone ? 1 : 0
          break
        case 'lab_completion':
          currentValue = passedLabs
          break
        case 'credit_threshold':
          currentValue = totalCredits
          break
        case 'readiness':
          currentValue = overallScore
          break
        case 'project':
          currentValue = publicProofs
          break
      }

      const isCompleted = currentValue >= milestone.targetValue
      if (currentValue !== milestone.currentValue || isCompleted !== milestone.isCompleted) {
        await prisma.milestone.update({
          where: { id: milestone.id },
          data: {
            currentValue,
            isCompleted,
            completedAt: isCompleted && !milestone.isCompleted ? new Date() : milestone.completedAt,
          },
        })
        milestone.currentValue = currentValue
        milestone.isCompleted = isCompleted
      }
    }

    return success(milestones)
  } catch (error) {
    console.error('Milestones error:', error)
    return serverError()
  }
}
