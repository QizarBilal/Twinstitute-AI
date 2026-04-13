import { prisma } from '@/lib/prisma'
import { success, notFound, serverError } from '@/lib/api-auth'

// GET /api/portfolio/public/:token — Get public portfolio view
export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) return notFound('Portfolio not found')

    // Fetch user with portfolio published
    const user = await (prisma as any).user.findUnique({
      where: { portfolioToken: token },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        selectedRole: true,
        selectedDomain: true,
        createdAt: true,
        portfolioPublished: true,
        portfolioPublishedAt: true,
        capabilityTwin: {
          select: {
            overallScore: true,
            executionReliability: true,
            learningSpeed: true,
            problemSolvingDepth: true,
            consistency: true,
            designReasoning: true,
            abstractionLevel: true,
            innovationIndex: true,
            currentStage: true,
            targetRole: true,
            readinessScore: true,
          },
        },
      },
    })

    if (!user || !(user as any).portfolioPublished) {
      return notFound('Portfolio not found')
    }

    // Fetch public proof artifacts
    const proofs = await prisma.proofArtifact.findMany({
      where: {
        userId: user.id,
        isPublic: true,
      },
      select: {
        id: true,
        artifactType: true,
        title: true,
        description: true,
        skills: true,
        capabilityLevel: true,
        recruiterSummary: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Fetch completed labs summary
    const labSubmissions = await prisma.labSubmission.findMany({
      where: {
        userId: user.id,
        status: 'passed',
      },
      include: {
        task: {
          select: {
            title: true,
            domain: true,
            difficulty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Fetch credits
    const credits = await prisma.capabilityCredit.findMany({
      where: { userId: user.id },
    })

    const totalCredits = credits.reduce((sum, c) => sum + c.amount, 0)

    // Transform proof artifacts
    const transformedProofs = proofs.map((p) => ({
      id: p.id,
      type: p.artifactType,
      title: p.title,
      description: p.description,
      skills: JSON.parse(p.skills || '[]'),
      capabilityLevel: p.capabilityLevel,
      recruiterSummary: p.recruiterSummary,
      createdAt: p.createdAt,
    }))

    return success({
      profile: {
        name: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.selectedRole,
        domain: user.selectedDomain,
        stage: (user as any).capabilityTwin?.currentStage || 'foundation',
        joinedDate: user.createdAt,
        publishedDate: (user as any).portfolioPublishedAt,
      },
      capability: {
        overallScore: (user as any).capabilityTwin?.overallScore || 0,
        readinessScore: (user as any).capabilityTwin?.readinessScore || 0,
        metrics: {
          executionReliability: (user as any).capabilityTwin?.executionReliability || 0,
          learningSpeed: (user as any).capabilityTwin?.learningSpeed || 0,
          problemSolvingDepth: (user as any).capabilityTwin?.problemSolvingDepth || 0,
          consistency: (user as any).capabilityTwin?.consistency || 0,
          designReasoning: (user as any).capabilityTwin?.designReasoning || 0,
          abstractionLevel: (user as any).capabilityTwin?.abstractionLevel || 0,
          innovationIndex: (user as any).capabilityTwin?.innovationIndex || 0,
        },
      },
      proofs: {
        total: transformedProofs.length,
        items: transformedProofs,
      },
      labs: {
        total: labSubmissions.length,
        items: labSubmissions.map((l) => ({
          title: l.task.title,
          domain: l.task.domain,
          difficulty: l.task.difficulty,
          score: l.scoreTotal,
          completedAt: l.createdAt,
        })),
      },
      credits: {
        total: totalCredits,
      },
    })
  } catch (error) {
    console.error('Public portfolio error:', error)
    return serverError()
  }
}
