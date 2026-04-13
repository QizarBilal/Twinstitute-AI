import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// GET /api/credits — Get credit summary for current user
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const credits = await prisma.capabilityCredit.findMany({
      where: { userId: session.user.id },
      orderBy: { awardedAt: 'desc' },
    })

    // Calculate totals per type
    const totals = {
      execution: 0,
      design: 0,
      reliability: 0,
      innovation: 0,
      problem_solving: 0,
      consistency: 0,
      grand_total: 0,
    }

    credits.forEach(c => {
      const key = c.creditType as keyof typeof totals
      if (key in totals) totals[key] += c.amount
      totals.grand_total += c.amount
    })

    return success({
      totals,
      recent: credits.slice(0, 20),
      totalCredits: credits.length,
    })
  } catch (error) {
    console.error('Credits GET error:', error)
    return serverError()
  }
}

// POST /api/credits — Award capability credits
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { creditType, amount, source, sourceId, description } = body

    if (!creditType || !amount || !source || !description) {
      return badRequest('Required: creditType, amount, source, description')
    }

    const validTypes = ['execution', 'design', 'reliability', 'innovation', 'problem_solving', 'consistency']
    if (!validTypes.includes(creditType)) {
      return badRequest(`creditType must be one of: ${validTypes.join(', ')}`)
    }

    const credit = await prisma.capabilityCredit.create({
      data: {
        userId: session.user.id,
        creditType,
        amount: Number(amount),
        source,
        sourceId: sourceId || null,
        description,
      },
    })

    return success(credit)
  } catch (error) {
    console.error('Credits POST error:', error)
    return serverError()
  }
}
