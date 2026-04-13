import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// GET /api/simulation — Get user's past simulations
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const simulations = await prisma.simulationRun.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return success(simulations.map(s => ({
      ...s,
      inputParams: JSON.parse(s.inputParams || '{}'),
      oneYearProjection: JSON.parse(s.oneYearProjection || '{}'),
      threeYearProjection: JSON.parse(s.threeYearProjection || '{}'),
      riskCurve: JSON.parse(s.riskCurve || '[]'),
      keyInsights: JSON.parse(s.keyInsights || '[]'),
    })))
  } catch (error) {
    console.error('Simulation GET error:', error)
    return serverError()
  }
}

// POST /api/simulation — Run an outcome simulation
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { simulationType, selectedPath, inputParams } = body

    if (!simulationType) return badRequest('simulationType is required')

    // Get user's current capability twin
    const twin = await prisma.capabilityTwin.findUnique({
      where: { userId: session.user.id },
    })

    const currentScore = twin?.overallScore || 50
    const velocity = twin?.formationVelocity || 1.5
    const burnout = twin?.burnoutRisk || 20

    // Path simulation configs
    const pathConfigs: Record<string, {
      label: string
      oneYear: { role: string; salary: string; readiness: number }
      threeYear: { role: string; salary: string; readiness: number; opportunities: string[] }
      riskScore: number
      stabilityScore: number
    }> = {
      fullstack: {
        label: 'Full Stack Engineer Path',
        oneYear: { role: 'Junior Full Stack Dev', salary: '$65k–$80k', readiness: Math.min(100, currentScore + velocity * 12) },
        threeYear: { role: 'Mid-Senior Full Stack', salary: '$95k–$130k', readiness: Math.min(100, currentScore + velocity * 36), opportunities: ['Startup CTO', 'Tech Lead', 'Platform Engineer'] },
        riskScore: Math.max(5, 35 - currentScore * 0.2),
        stabilityScore: Math.min(95, 70 + currentScore * 0.2),
      },
      specialist: {
        label: 'Backend Specialist Path',
        oneYear: { role: 'Backend Developer', salary: '$70k–$90k', readiness: Math.min(100, currentScore + velocity * 10) },
        threeYear: { role: 'Senior Backend / Systems', salary: '$110k–$150k', readiness: Math.min(100, currentScore + velocity * 30), opportunities: ['Staff Engineer', 'Platform Architect', 'Lead Backend'] },
        riskScore: Math.max(8, 40 - currentScore * 0.15),
        stabilityScore: Math.min(92, 65 + currentScore * 0.25),
      },
      aiml: {
        label: 'AI/ML Engineer Path',
        oneYear: { role: 'ML Engineer Trainee', salary: '$55k–$75k', readiness: Math.min(100, currentScore * 0.6 + velocity * 8) },
        threeYear: { role: 'ML Engineer', salary: '$120k–$170k', readiness: Math.min(100, currentScore * 0.8 + velocity * 25), opportunities: ['AI Research', 'LLM Engineer', 'AI Product'] },
        riskScore: Math.max(20, 65 - currentScore * 0.3),
        stabilityScore: Math.min(80, 50 + currentScore * 0.3),
      },
    }

    const pathKey = selectedPath || 'fullstack'
    const config = pathConfigs[pathKey] || pathConfigs.fullstack

    // Generate risk curve (12 months)
    const riskCurve = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      risk: Math.max(5, config.riskScore - (i * (velocity > 2 ? 3 : 1.5)) + (burnout * 0.1)),
      confidence: Math.min(95, 40 + (i * (velocity > 1.5 ? 5 : 3))),
    }))

    const outcomeProbability = Math.min(95, Math.max(20,
      55 + (currentScore - 50) * 0.5 + velocity * 5 - burnout * 0.3
    ))

    // Key insights based on data
    const keyInsights = [
      velocity > 2 ? 'Your learning velocity is above average. Accelerated outcomes are likely.' : 'Your learning velocity is steady. Consistent effort will yield results.',
      burnout > 40 ? '⚠️ Burnout risk is elevated. Consider spacing out intensive tasks.' : 'Burnout risk is manageable. Current pace is sustainable.',
      currentScore > 70 ? 'Your foundation is strong. Focus on depth and specialization.' : 'Continue building core skills before specializing.',
      `Outcome probability for ${config.label}: ${outcomeProbability}%`,
    ]

    const simulation = await prisma.simulationRun.create({
      data: {
        userId: session.user.id,
        simulationType,
        inputParams: JSON.stringify(inputParams || {}),
        selectedPath: pathKey,
        oneYearProjection: JSON.stringify(config.oneYear),
        threeYearProjection: JSON.stringify(config.threeYear),
        riskCurve: JSON.stringify(riskCurve),
        stabilityScore: config.stabilityScore,
        outcomeProbability,
        recommendedPath: outcomeProbability > 70 ? pathKey : 'fullstack',
        keyInsights: JSON.stringify(keyInsights),
        status: 'completed',
        completedAt: new Date(),
      },
    })

    return success({
      ...simulation,
      oneYearProjection: config.oneYear,
      threeYearProjection: config.threeYear,
      riskCurve,
      keyInsights,
    })
  } catch (error) {
    console.error('Simulation POST error:', error)
    return serverError()
  }
}
