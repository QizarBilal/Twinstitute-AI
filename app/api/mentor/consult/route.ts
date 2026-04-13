import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// POST /api/mentor/consult — Consult a specific agent
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { agentId, query } = body

    if (!agentId || !query) {
      return badRequest('agentId and query are required')
    }

    // Get user's context
    const [twin, genome, recentSubs] = await Promise.all([
      prisma.capabilityTwin.findUnique({ where: { userId: session.user.id } }),
      prisma.skillGenome.findUnique({ where: { userId: session.user.id } }),
      prisma.labSubmission.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { task: true, evaluation: true }
      })
    ])

    // Generate agent response based on agent type
    let response = ''

    switch (agentId) {
      case 'career_intelligence':
        response = await generateCareerIntelligenceResponse(query, twin, genome)
        break
      case 'technical_mentor':
        response = await generateTechnicalMentorResponse(query, recentSubs)
        break
      case 'strategy_mentor':
        response = await generateStrategyMentorResponse(query, twin, genome)
        break
      case 'risk_mentor':
        response = await generateRiskMentorResponse(query, twin)
        break
      case 'evaluation_agent':
        response = await generateEvaluationAgentResponse(query, recentSubs)
        break
      default:
        response = 'Agent not recognized.'
    }

    // Log the session
    await prisma.mentorSession.create({
      data: {
        userId: session.user.id,
        sessionType: 'individual_consultation',
        agentRoles: JSON.stringify([agentId]),
        userQuery: query,
        sessionContext: JSON.stringify({ twin: twin?.overallScore, genome: genome?.coreStrength }),
        consensusReport: response,
        actionableOutput: response,
      }
    })

    return success({ response })
  } catch (error) {
    console.error('Mentor consult error:', error)
    return serverError()
  }
}

// Helper functions for agent responses
async function generateCareerIntelligenceResponse(query: string, twin: any, genome: any) {
  // Simulate AI response based on user data
  const score = twin?.overallScore || 50
  const targetRole = twin?.targetRole || 'Software Developer'

  return `Based on your current capability score of ${score}/100 and target role of ${targetRole}, I recommend focusing on roles that match your ${genome?.breadthScore > genome?.depthScore ? 'broad skill foundation' : 'deep technical expertise'}. Consider exploring positions that leverage your ${score > 70 ? 'advanced' : score > 50 ? 'intermediate' : 'developing'} capabilities in ${twin?.targetDomain || 'technology'}.`
}

async function generateTechnicalMentorResponse(query: string, recentSubs: any[]) {
  const latestScore = recentSubs[0]?.evaluation?.overallScore || 0
  return `Your recent technical work shows ${latestScore > 80 ? 'excellent' : latestScore > 60 ? 'solid' : 'developing'} execution. Focus on ${latestScore > 80 ? 'architectural patterns and optimization' : 'fundamental concepts and best practices'}. Your code quality score of ${recentSubs[0]?.evaluation?.codeQualityScore || 0}/100 suggests ${latestScore > 80 ? 'advanced refactoring opportunities' : 'basic improvements needed'}.`
}

async function generateStrategyMentorResponse(query: string, twin: any, genome: any) {
  const velocity = twin?.formationVelocity || 1.5
  return `Your formation velocity of ${velocity} points per week indicates ${velocity > 2 ? 'rapid progress' : velocity > 1 ? 'steady growth' : 'opportunity for acceleration'}. With your skill breadth score of ${genome?.breadthScore || 0}/100, I recommend ${velocity > 2 ? 'deepening key strengths' : 'broadening your foundation'}. Consider ${twin?.burnoutRisk > 30 ? 'balancing intensity with recovery' : 'increasing practice frequency'}.`
}

async function generateRiskMentorResponse(query: string, twin: any) {
  const burnoutRisk = twin?.burnoutRisk || 20
  return `Your current burnout risk is ${burnoutRisk}%. ${burnoutRisk > 50 ? 'High risk detected. Prioritize rest and recovery.' : burnoutRisk > 30 ? 'Moderate risk. Monitor workload and ensure adequate breaks.' : 'Low risk. Current pace appears sustainable.'} I recommend ${burnoutRisk > 30 ? 'reducing weekly hours and incorporating restorative activities' : 'maintaining current balance while monitoring for signs of fatigue'}.`
}

async function generateEvaluationAgentResponse(query: string, recentSubs: any[]) {
  const avgScore = recentSubs.reduce((sum, sub) => sum + (sub.evaluation?.overallScore || 0), 0) / recentSubs.length
  return `Your recent performance average is ${avgScore.toFixed(1)}/100. Strengths include ${recentSubs[0]?.evaluation?.strengthsIdentified ? JSON.parse(recentSubs[0].evaluation.strengthsIdentified).join(', ') : 'consistent execution'}. Areas for improvement: ${recentSubs[0]?.evaluation?.gapsIdentified ? JSON.parse(recentSubs[0].evaluation.gapsIdentified).join(', ') : 'practice variety'}. Next steps: ${recentSubs[0]?.evaluation?.nextStepsRecommended ? JSON.parse(recentSubs[0].evaluation.nextStepsRecommended).join(', ') : 'continue building on current trajectory'}.`
}