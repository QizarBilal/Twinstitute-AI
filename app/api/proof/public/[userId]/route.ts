import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { success, serverError, badRequest } from '@/lib/api-auth'

// GET /api/proof/public/[userId] — Get recruiter-readable public proof profile
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        fullName: true,
        selectedDomain: true,
        capabilityScore: true,
        currentLevel: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    if (!user) return badRequest('User not found')

    // Get public artifacts
    const artifacts = await prisma.proofArtifact.findMany({
      where: {
        userId: params.userId,
        isPublic: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get skill genome
    const skillGenome = await prisma.skillGenome.findUnique({
      where: { userId: params.userId },
    })

    // Get evaluations for trust calculation
    const submissions = await prisma.labSubmission.findMany({
      where: { userId: params.userId },
      include: { evaluation: true, task: true },
    })

    // Calculate trust score (simplified for public view)
    let trustScore = 0
    if (submissions.length > 0) {
      const avgDifficulty = submissions.reduce((sum, s) => sum + (s.task.difficulty || 5), 0) / submissions.length
      const qualityScores = submissions
        .filter(s => s.evaluation)
        .map(s => s.evaluation!.overallScore || 0)
      const avgQuality = qualityScores.length > 0
        ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length / 100
        : 0
      trustScore = ((avgDifficulty / 10) * 0.4 + avgQuality * 0.6) * 100
    }

    // Parse skill genome
    const nodes = skillGenome ? JSON.parse(skillGenome.nodes || '[]') : []
    const verifiedSkills = nodes
      .filter((n: any) => n.strength >= 0.7)
      .map((n: any) => ({
        name: n.name,
        strength: Math.round(n.strength * 100),
        level: 'verified',
      }))

    // Create public profile summary
    const profileSummary = {
      user: {
        id: user.id,
        fullName: user.fullName,
        domain: user.selectedDomain,
        level: user.currentLevel,
        avatar: user.avatarUrl,
        joinedAt: user.createdAt,
      },
      scores: {
        capability: Math.round(user.capabilityScore * 100) / 100,
        trust: Math.round(trustScore * 100) / 100,
        trustLevel: trustScore >= 70 ? 'High' : trustScore >= 40 ? 'Medium' : 'Low',
      },
      proofSummary: {
        totalProofs: artifacts.length,
        verifiedSkillsCount: verifiedSkills.length,
        totalEvaluations: submissions.filter(s => s.evaluation).length,
      },
      skills: {
        verified: verifiedSkills.slice(0, 5),
        count: verifiedSkills.length,
      },
      artifacts: artifacts.map(a => ({
        id: a.id,
        type: a.artifactType,
        title: a.title,
        description: a.description,
        shortSummary: a.recruiterSummary,
        skills: JSON.parse(a.skills || '[]'),
        capabilityLevel: a.capabilityLevel,
        createdAt: a.createdAt,
      })),
    }

    return success(profileSummary)
  } catch (error) {
    console.error('Proof public profile error:', error)
    return serverError()
  }
}
