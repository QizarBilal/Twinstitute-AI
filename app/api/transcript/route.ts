import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

// GET /api/transcript — Generate complete capability transcript
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    // Gather all user data
    const [user, twin, genome, credits, labs, proofs, milestones, signals] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id } }),
      prisma.capabilityTwin.findUnique({ where: { userId: session.user.id } }),
      prisma.skillGenome.findUnique({ where: { userId: session.user.id } }),
      prisma.capabilityCredit.findMany({ where: { userId: session.user.id } }),
      prisma.labSubmission.findMany({
        where: { userId: session.user.id },
        include: { task: true, evaluation: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.proofArtifact.findMany({ where: { userId: session.user.id } }),
      prisma.milestone.findMany({ where: { userId: session.user.id } }),
      prisma.strategySignal.findMany({ where: { userId: session.user.id } }),
    ])

    // Credit totals
    const creditTotals = { execution: 0, design: 0, reliability: 0, innovation: 0, problem_solving: 0, consistency: 0, grand_total: 0 }
    credits.forEach(c => {
      const key = c.creditType as keyof typeof creditTotals
      if (key in creditTotals) creditTotals[key] += c.amount
      creditTotals.grand_total += c.amount
    })

    // Lab stats
    const passedLabs = labs.filter(l => l.status === 'passed')
    const avgScore = passedLabs.length > 0
      ? Math.round(passedLabs.reduce((sum, l) => sum + l.scoreTotal, 0) / passedLabs.length)
      : 0

    const transcript = {
      student: {
        name: user?.fullName || 'Unknown',
        email: user?.email || '',
        accountType: user?.accountType || 'learner',
        joinedAt: user?.createdAt,
      },
      capabilityTwin: twin ? {
        overallScore: twin.overallScore,
        stage: twin.currentStage,
        readinessScore: twin.readinessScore,
        formationVelocity: twin.formationVelocity,
        dimensions: {
          executionReliability: twin.executionReliability,
          learningSpeed: twin.learningSpeed,
          problemSolvingDepth: twin.problemSolvingDepth,
          consistency: twin.consistency,
          designReasoning: twin.designReasoning,
          abstractionLevel: twin.abstractionLevel,
          innovationIndex: twin.innovationIndex,
          burnoutRisk: twin.burnoutRisk,
        },
        targetRole: twin.targetRole,
        targetDomain: twin.targetDomain,
      } : null,
      skillGenome: genome ? {
        nodes: JSON.parse(genome.nodes || '[]'),
        coreStrength: genome.coreStrength,
        breadthScore: genome.breadthScore,
        depthScore: genome.depthScore,
      } : null,
      credits: creditTotals,
      labPerformance: {
        totalSubmissions: labs.length,
        passed: passedLabs.length,
        avgScore,
        taskBreakdown: Object.entries(
          labs.reduce((acc, l) => {
            acc[l.task.taskType] = (acc[l.task.taskType] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        ).map(([type, count]) => ({ type, count })),
      },
      proofArtifacts: proofs.map(p => ({
        title: p.title,
        type: p.artifactType,
        capabilityLevel: p.capabilityLevel,
        isPublic: p.isPublic,
        skills: JSON.parse(p.skills || '[]'),
      })),
      milestones: milestones.map(m => ({
        title: m.title,
        type: m.milestoneType,
        progress: `${m.currentValue}/${m.targetValue}`,
        completed: m.isCompleted,
      })),
      strategyHistory: signals.length,
      generatedAt: new Date().toISOString(),
      verifiedBy: 'Twinstitute AI Engine v1.0',
    }

    return success(transcript)
  } catch (error) {
    console.error('Transcript error:', error)
    return serverError()
  }
}
