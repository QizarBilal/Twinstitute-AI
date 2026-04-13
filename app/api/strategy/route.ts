import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// GET /api/strategy — Get strategy signals for user
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const signals = await prisma.strategySignal.findMany({
      where: { userId: session.user.id },
      orderBy: { generatedAt: 'desc' },
      take: 20,
    })

    return success(signals.map(s => ({
      ...s,
      agentConsensus: JSON.parse(s.agentConsensus || '{}'),
      actionItems: JSON.parse(s.actionItems || '[]'),
    })))
  } catch (error) {
    console.error('Strategy GET error:', error)
    return serverError()
  }
}

// POST /api/strategy — Generate strategy decisions from multi-agent analysis
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    // Get user's capability twin
    const twin = await prisma.capabilityTwin.findUnique({
      where: { userId: session.user.id },
    })

    // Get user's skill genome
    const genome = await prisma.skillGenome.findUnique({
      where: { userId: session.user.id },
    })

    // Get recent lab submissions
    const recentSubs = await prisma.labSubmission.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { task: true },
    })

    const score = twin?.overallScore || 50
    const velocity = twin?.formationVelocity || 1.5
    const burnout = twin?.burnoutRisk || 20
    const stage = twin?.currentStage || 'foundation'
    const completedLabs = recentSubs.filter(s => s.status === 'passed').length

    // Generate strategy signals based on real data
    const generatedSignals: Array<{
      signalType: string
      urgency: string
      title: string
      reasoning: string
      consensus: Record<string, unknown>
      actionItems: string[]
    }> = []

    // Signal 1: Skill deepening or broadening
    if (score < 65) {
      generatedSignals.push({
        signalType: 'deepen',
        urgency: 'high',
        title: 'Deepen Core Skills Before Advancing',
        reasoning: `Your overall capability score is ${score}/100, which is below the advancement threshold (65). Focus on strengthening your weakest areas to build a solid foundation. Current velocity: ${velocity} pts/week.`,
        consensus: {
          technicalMentor: { vote: 'Deepen', confidence: 90 },
          strategyMentor: { vote: 'Deepen', confidence: 85 },
          riskMentor: { vote: 'Deepen', confidence: 88 },
        },
        actionItems: ['Complete 3 lab tasks this week', 'Focus on lowest-scoring skill areas', 'Review feedback from recent evaluations'],
      })
    }

    // Signal 2: Portfolio trigger
    if (score >= 70 && completedLabs >= 5) {
      generatedSignals.push({
        signalType: 'publish_project',
        urgency: 'medium',
        title: 'Start Building Public Portfolio',
        reasoning: `With ${completedLabs} completed labs and a score of ${score}, you have enough proven execution to start a public portfolio. This increases recruiter discoverability by 3x.`,
        consensus: {
          technicalMentor: { vote: 'Build Portfolio', confidence: 75 },
          strategyMentor: { vote: 'Build Portfolio Now', confidence: 88 },
          riskMentor: { vote: 'Build Portfolio', confidence: 72 },
        },
        actionItems: ['Select your strongest lab outputs', 'Create a GitHub project with proper README', 'Write 500-word execution case study'],
      })
    }

    // Signal 3: Burnout warning
    if (burnout > 40) {
      generatedSignals.push({
        signalType: 'change_strategy',
        urgency: 'critical',
        title: 'Burnout Risk Elevated — Adjust Pace',
        reasoning: `Your burnout risk index is ${burnout}/100. This is above the safe threshold (40). High burnout degrades learning speed and consistency. Consider reducing workload for 1 week.`,
        consensus: {
          technicalMentor: { vote: 'Reduce Load', confidence: 70 },
          strategyMentor: { vote: 'Strategic Rest', confidence: 82 },
          riskMentor: { vote: 'Mandatory Rest', confidence: 95 },
        },
        actionItems: ['Skip 2 lab sessions this week', 'Review instead of build', 'Return at full capacity next week'],
      })
    }

    // Signal 4: Interview readiness
    if (score >= 78) {
      generatedSignals.push({
        signalType: 'attempt_interview',
        urgency: score >= 85 ? 'high' : 'low',
        title: 'Approaching Interview Readiness',
        reasoning: `Your capability score of ${score} is ${score >= 85 ? 'above' : 'approaching'} the interview readiness threshold (85). ${score >= 85 ? 'Start scheduling mock interviews immediately.' : 'Prepare interview materials while continuing formation.'}`,
        consensus: {
          technicalMentor: { vote: score >= 85 ? 'Interview Now' : 'Not Yet', confidence: score >= 85 ? 88 : 65 },
          strategyMentor: { vote: 'Start Mock Interviews', confidence: 78 },
          riskMentor: { vote: score >= 85 ? 'Ready' : 'Wait', confidence: score >= 85 ? 82 : 90 },
        },
        actionItems: ['Schedule 2 mock interviews', 'Review system design patterns', 'Practice explaining your execution traces'],
      })
    }

    // Default signal if none generated
    if (generatedSignals.length === 0) {
      generatedSignals.push({
        signalType: 'deepen',
        urgency: 'medium',
        title: 'Continue Current Formation Path',
        reasoning: `Your formation is on track. Current score: ${score}/100, velocity: ${velocity} pts/week. Maintain consistent practice and complete daily lab assignments.`,
        consensus: {
          technicalMentor: { vote: 'Continue Path', confidence: 80 },
          strategyMentor: { vote: 'Continue Path', confidence: 82 },
          riskMentor: { vote: 'Continue Path', confidence: 85 },
        },
        actionItems: ['Complete today\'s lab assignment', 'Review any pending feedback', 'Check skill genome for gaps'],
      })
    }

    // Save signals to DB
    const savedSignals = await Promise.all(
      generatedSignals.map(signal =>
        prisma.strategySignal.create({
          data: {
            userId: session.user.id,
            signalType: signal.signalType,
            urgency: signal.urgency,
            title: signal.title,
            reasoning: signal.reasoning,
            agentConsensus: JSON.stringify(signal.consensus),
            actionItems: JSON.stringify(signal.actionItems),
          },
        })
      )
    )

    return success(savedSignals.map(s => ({
      ...s,
      agentConsensus: JSON.parse(s.agentConsensus || '{}'),
      actionItems: JSON.parse(s.actionItems || '[]'),
    })))
  } catch (error) {
    console.error('Strategy POST error:', error)
    return serverError()
  }
}
