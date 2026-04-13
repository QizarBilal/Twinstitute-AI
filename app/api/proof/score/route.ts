import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

// GET /api/proof/score — Get user's capability score breakdown
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    // Get skill genome for user
    const skillGenome = await prisma.skillGenome.findUnique({
      where: { userId: session.user.id },
    })

    // Get all proof artifacts
    const artifacts = await prisma.proofArtifact.findMany({
      where: { userId: session.user.id },
    })

    // Get all lab evaluations for user
    const submissions = await prisma.labSubmission.findMany({
      where: { userId: session.user.id },
      include: { evaluation: true, task: true },
    })

    // Calculate capability score
    const totalScore = submissions.length > 0
      ? submissions.reduce((sum, s) => sum + (s.evaluation?.overallScore || 0), 0) / submissions.length
      : 0

    // Calculate trust score
    let trustScore = 0
    let trustDetails = {
      difficultyScore: 0,
      consistencyScore: 0,
      qualityScore: 0,
    }

    if (submissions.length > 0) {
      // Task difficulty component (30%)
      const avgDifficulty = submissions.reduce((sum, s) => sum + (s.task.difficulty || 5), 0) / submissions.length
      trustDetails.difficultyScore = (avgDifficulty / 10) * 30

      // Consistency component (25%) — low variance in scores
      if (submissions.length >= 2) {
        const scores = submissions.map(s => s.evaluation?.overallScore || 0)
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
        const stdDev = Math.sqrt(variance)
        const consistency = Math.max(0, 100 - stdDev) / 100 // Inverse: lower variance = higher consistency
        trustDetails.consistencyScore = consistency * 25
      }

      // Evaluation quality component (30%)
      const qualityMetrics = submissions
        .filter(s => s.evaluation)
        .map(s => {
          const evaluation = s.evaluation!
          return (
            (evaluation.correctnessScore * 0.4 +
             evaluation.codeQualityScore * 0.25 +
             evaluation.efficiencyScore * 0.2 +
             evaluation.clarityScore * 0.15) / 100
          )
        })
      const avgQuality = qualityMetrics.length > 0
        ? qualityMetrics.reduce((a, b) => a + b, 0) / qualityMetrics.length
        : 0
      trustDetails.qualityScore = avgQuality * 30
    }

    trustScore = trustDetails.difficultyScore + trustDetails.consistencyScore + trustDetails.qualityScore

    // Parse skill genome
    const nodes = skillGenome ? JSON.parse(skillGenome.nodes || '[]') : []
    const verifiedSkills = nodes.filter((n: any) => n.strength >= 0.7)
    const developingSkills = nodes.filter((n: any) => n.strength >= 0.4 && n.strength < 0.7)
    const weakSkills = nodes.filter((n: any) => n.strength < 0.4)

    // Skill breakdown by type
    const skillBreakdown: Record<string, any> = {}
    nodes.forEach((node: any) => {
      skillBreakdown[node.name] = {
        strength: node.strength,
        level: node.strength >= 0.7 ? 'verified' : node.strength >= 0.4 ? 'developing' : 'weak',
        proofCount: artifacts.filter(a => {
          const skills = JSON.parse(a.skills || '[]')
          return skills.includes(node.name)
        }).length,
      }
    })

    return success({
      capabilityScore: Math.round(totalScore * 100) / 100,
      trustScore: Math.round(trustScore * 100) / 100,
      trustLevel: trustScore >= 70 ? 'High' : trustScore >= 40 ? 'Medium' : 'Low',
      trustDetails,
      skillBreakdown,
      summary: {
        totalProofs: artifacts.length,
        totalSubmissions: submissions.length,
        verifiedSkillsCount: verifiedSkills.length,
        developingSkillsCount: developingSkills.length,
        weakSkillsCount: weakSkills.length,
      },
      skillGenome: {
        coreStrength: skillGenome?.coreStrength || 0,
        breadthScore: skillGenome?.breadthScore || 0,
        depthScore: skillGenome?.depthScore || 0,
      },
    })
  } catch (error) {
    console.error('Proof score error:', error)
    return serverError()
  }
}
