import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

// GET /api/portfolio — Build & get proof portfolio
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const [user, twin, proofs, credits, labs] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id } }),
      prisma.capabilityTwin.findUnique({ where: { userId: session.user.id } }),
      prisma.proofArtifact.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.capabilityCredit.findMany({ where: { userId: session.user.id } }),
      prisma.labSubmission.findMany({
        where: { userId: session.user.id, status: 'passed' },
        include: { task: true },
      }),
    ])

    const totalCredits = credits.reduce((sum, c) => sum + c.amount, 0)

    const portfolio = {
      profile: {
        name: user?.fullName || '',
        title: twin?.targetRole || 'Software Engineer',
        stage: twin?.currentStage || 'foundation',
        capabilityScore: twin?.overallScore || 0,
        readinessScore: twin?.readinessScore || 0,
        totalCredits,
      },
      proofArtifacts: proofs.map(p => ({
        id: p.id,
        title: p.title,
        type: p.artifactType,
        description: p.description,
        skills: JSON.parse(p.skills || '[]'),
        capabilityLevel: p.capabilityLevel,
        isPublic: p.isPublic,
        shareUrl: p.shareToken ? `/proof/${p.shareToken}` : null,
        recruiterSummary: p.recruiterSummary,
        createdAt: p.createdAt,
      })),
      completedLabs: labs.map(l => ({
        title: l.task.title,
        type: l.task.taskType,
        domain: l.task.domain,
        difficulty: l.task.difficulty,
        score: l.scoreTotal,
        creditsEarned: l.creditsAwarded,
      })),
      stats: {
        totalProofs: proofs.length,
        publicProofs: proofs.filter(p => p.isPublic).length,
        labsCompleted: labs.length,
        avgLabScore: labs.length > 0 ? Math.round(labs.reduce((sum, l) => sum + l.scoreTotal, 0) / labs.length) : 0,
      },
    }

    return success(portfolio)
  } catch (error) {
    console.error('Portfolio error:', error)
    return serverError()
  }
}
