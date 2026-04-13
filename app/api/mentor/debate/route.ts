import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// POST /api/mentor/debate — Run multi-agent debate
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { query } = body

    if (!query) {
      return badRequest('query is required')
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

    // Simulate multi-agent debate
    const debateLog = [
      {
        agent: 'Career Intelligence Agent',
        avatar: '🎯',
        message: `From a career perspective, with your capability score of ${twin?.overallScore || 50}, I recommend focusing on roles that leverage your ${genome && genome.breadthScore && genome.depthScore && genome.breadthScore > genome.depthScore ? 'versatile skill set' : 'deep technical expertise'}.`,
        color: '#6366f1',
        confidence: 85
      },
      {
        agent: 'Technical Mentor',
        avatar: '👨‍💻',
        message: `Technically, your recent work shows ${recentSubs[0]?.evaluation?.overallScore && recentSubs[0].evaluation.overallScore > 70 ? 'strong fundamentals' : 'room for improvement'}. I suggest prioritizing ${recentSubs[0]?.evaluation?.overallScore && recentSubs[0].evaluation.overallScore > 70 ? 'advanced concepts' : 'core principles'}.`,
        color: '#10b981',
        confidence: 78
      },
      {
        agent: 'Strategy Mentor',
        avatar: '🧭',
        message: `Strategically, your formation velocity of ${twin?.formationVelocity || 1.5} pts/week suggests ${twin && twin.formationVelocity && twin.formationVelocity > 2 ? 'acceleration opportunities' : 'sustainable pacing'}. Consider ${twin && twin.burnoutRisk && twin.burnoutRisk > 30 ? 'balancing intensity' : 'increasing depth'}.`,
        color: '#f59e0b',
        confidence: 82
      },
      {
        agent: 'Risk Mentor',
        avatar: '⚠️',
        message: `Risk assessment: Your burnout risk of ${twin?.burnoutRisk || 20}% indicates ${twin && twin.burnoutRisk && twin.burnoutRisk > 30 ? 'caution needed' : 'current pace is manageable'}. I recommend ${twin && twin.burnoutRisk && twin.burnoutRisk > 30 ? 'recovery focus' : 'continued progression'}.`,
        color: '#ef4444',
        confidence: 90
      },
      {
        agent: 'Evaluation Agent',
        avatar: '📊',
        message: `Based on evaluation data, your strengths are ${recentSubs[0]?.evaluation?.strengthsIdentified ? JSON.parse(recentSubs[0].evaluation.strengthsIdentified).slice(0, 2).join(' and ') : 'execution and consistency'}. Focus on bridging gaps in ${recentSubs[0]?.evaluation?.gapsIdentified ? JSON.parse(recentSubs[0].evaluation.gapsIdentified).slice(0, 2).join(' and ') : 'advanced concepts'}.`,
        color: '#8b5cf6',
        confidence: 88
      }
    ]

    // Generate consensus
    const consensus = `Consensus reached: With your current profile (capability: ${twin?.overallScore || 50}/100, velocity: ${twin?.formationVelocity || 1.5} pts/week), focus on ${genome && genome.breadthScore && genome.depthScore && genome.breadthScore > genome.depthScore ? 'specializing in your strongest areas' : 'broadening your technical foundation'} while maintaining sustainable pace. ${twin && twin.burnoutRisk && twin.burnoutRisk > 30 ? 'Prioritize recovery and work-life balance.' : 'Continue building momentum with regular practice.'}`

    const actionableOutput = [
      `Deepen expertise in ${twin?.targetDomain || 'your target domain'}`,
      `Maintain formation velocity of ${twin?.formationVelocity || 1.5} points per week`,
      `${twin && twin.burnoutRisk && twin.burnoutRisk > 30 ? 'Implement recovery protocols' : 'Increase practice frequency'}`,
      'Focus on high-impact skill gaps',
      'Track progress with capability twin metrics'
    ].join('. ')

    const avgConfidence = debateLog.reduce((sum, entry) => sum + entry.confidence, 0) / debateLog.length

    // Save debate session
    const sessionData = await prisma.mentorSession.create({
      data: {
        userId: session.user.id,
        sessionType: 'multi_agent_debate',
        agentRoles: JSON.stringify(['career_intelligence', 'technical_mentor', 'strategy_mentor', 'risk_mentor', 'evaluation_agent']),
        userQuery: query,
        sessionContext: JSON.stringify({
          capabilityScore: twin?.overallScore,
          formationVelocity: twin?.formationVelocity,
          burnoutRisk: twin?.burnoutRisk,
          skillBreadth: genome?.breadthScore
        }),
        debateLog: JSON.stringify(debateLog),
        consensusReport: consensus,
        actionableOutput,
        durationMin: Math.floor(debateLog.length * 0.5), // Simulate duration
        isCompleted: true,
        completedAt: new Date()
      }
    })

    return success({
      sessionId: sessionData.id,
      debateLog,
      consensus,
      actionableOutput,
      avgConfidence
    })
  } catch (error) {
    console.error('Mentor debate error:', error)
    return serverError()
  }
}