import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// POST /api/agents/debate — Multi-agent debate pipeline
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { query, sessionType = 'panel_debate' } = body

    if (!query) return badRequest('query is required')

    // Get user's context for informed responses
    const twin = await prisma.capabilityTwin.findUnique({
      where: { userId: session.user.id },
    })

    const credits = await prisma.capabilityCredit.findMany({
      where: { userId: session.user.id },
    })
    const totalCredits = credits.reduce((sum, c) => sum + c.amount, 0)

    const score = twin?.overallScore || 50
    const velocity = twin?.formationVelocity || 1.5
    const stage = twin?.currentStage || 'foundation'
    const burnout = twin?.burnoutRisk || 20

    // Agent definitions with contextual response generation
    const agents = [
      {
        role: 'Technical Mentor',
        avatar: '🤖',
        color: '#6366f1',
        generateResponse: () => {
          const responses = [
            `Analyzing technical implications of "${query}". Current capability profile: ${score}/100 in ${stage} stage. `,
            score < 60
              ? `Your foundation needs strengthening before this decision becomes relevant. Focus on reaching 60+ score first.`
              : score < 80
              ? `You have a solid base. This decision should factor in your ${velocity > 2 ? 'accelerated' : 'steady'} learning velocity of ${velocity} pts/week.`
              : `Your technical foundation is strong at ${score}/100. You're well-positioned to make this strategic choice.`,
            ` Recommendation: ${velocity > 2 ? 'Your rapid progress supports ambitious decisions.' : 'Take a methodical approach given your current pace.'}`,
          ]
          return responses.join('')
        },
        confidence: Math.min(95, 60 + score * 0.3),
      },
      {
        role: 'Strategy Mentor',
        avatar: '🧭',
        color: '#8b5cf6',
        generateResponse: () => {
          return `Strategic analysis for: "${query}". At capability level ${score} with ${totalCredits} credits earned, ` +
            `your formation stage is "${stage}". ` +
            (score >= 70
              ? `You're approaching career readiness. Strategic pivots should be calculated and data-driven. Consider outcome probability before committing.`
              : `Focus on building capability mass before making strategic pivots. Each 10-point increase in capability score significantly improves outcome probability.`) +
            ` Formation velocity: ${velocity} pts/week. ${velocity > 1.5 ? 'Trajectory is favorable.' : 'Consider optimizing your learning approach.'}`
        },
        confidence: Math.min(92, 65 + score * 0.25),
      },
      {
        role: 'Risk Mentor',
        avatar: '⚠️',
        color: '#f59e0b',
        generateResponse: () => {
          return `Risk assessment for: "${query}". ` +
            `Current burnout risk: ${burnout}% (${burnout > 40 ? '⚠️ ELEVATED' : '✅ manageable'}). ` +
            (burnout > 40
              ? `CAUTION: Your burnout indicators are elevated. Any major changes now carry increased risk of formation breakdown. Recommend stabilizing before pivoting.`
              : `Your current risk profile is healthy. `) +
            `Context switch cost at ${stage} stage: ${stage === 'foundation' ? 'HIGH — foundational knowledge still forming' : stage === 'building' ? 'MODERATE — core skills established' : 'LOW — strong foundation supports pivots'}. ` +
            `Recommendation: ${burnout > 50 ? 'Reduce workload before making decisions.' : 'Proceed with measured approach.'}`
        },
        confidence: Math.min(90, 70 + (100 - burnout) * 0.2),
      },
      {
        role: 'Evaluation Agent',
        avatar: '📊',
        color: '#10b981',
        generateResponse: () => {
          const recentLabCount = credits.filter(c => c.source === 'lab_submission').length
          return `Performance data analysis for: "${query}". ` +
            `Total credits earned: ${totalCredits}. Lab submissions scored: ${recentLabCount}. ` +
            `Formation velocity: ${velocity} pts/week. Overall trend: ${velocity > 0 ? '📈 positive' : '📉 needs attention'}. ` +
            `Based on quantitative performance data, ${score >= 65 ? 'your execution metrics support moving forward with this decision.' : 'suggest building more execution evidence before committing to major changes.'}`
        },
        confidence: Math.min(88, 55 + score * 0.35),
      },
    ]

    // Generate debate log
    const debateLog = agents.map(agent => ({
      agent: agent.role,
      avatar: agent.avatar,
      message: agent.generateResponse(),
      color: agent.color,
      confidence: agent.confidence,
    }))

    // Generate consensus
    const avgConfidence = debateLog.reduce((sum, d) => sum + d.confidence, 0) / debateLog.length
    const consensusReport = avgConfidence > 75
      ? `Consensus reached (${Math.round(avgConfidence)}% average confidence): The agents agree on a clear direction based on your current profile.`
      : `Partial consensus (${Math.round(avgConfidence)}% average confidence): Agents have mixed views. Consider gathering more data before deciding.`

    // Save mentor session
    const mentorSession = await prisma.mentorSession.create({
      data: {
        userId: session.user.id,
        sessionType,
        agentRoles: JSON.stringify(agents.map(a => a.role)),
        userQuery: query,
        sessionContext: JSON.stringify({
          twinScore: score,
          stage,
          velocity,
          burnout,
          totalCredits,
        }),
        debateLog: JSON.stringify(debateLog),
        consensusReport,
        actionableOutput: `Based on this debate, the recommended next steps are: 1) Review each agent's perspective, 2) ${score >= 70 ? 'Proceed with strategic action' : 'Focus on capability building first'}, 3) Re-evaluate in one week.`,
        isCompleted: true,
        completedAt: new Date(),
      },
    })

    return success({
      sessionId: mentorSession.id,
      debateLog,
      consensus: consensusReport,
      actionableOutput: mentorSession.actionableOutput,
      avgConfidence: Math.round(avgConfidence),
    })
  } catch (error) {
    console.error('Debate error:', error)
    return serverError()
  }
}
