import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch all capability proofs for this user
    const proofs = await prisma.capabilityProof.findMany({
      where: {
        userId: user.id,
        isLatestBest: true, // Only get best proofs
      },
      select: {
        id: true,
        capability: true,
        level: true,
        score: true,
        passedTestCases: true,
        totalTestCases: true,
        verifiedAt: true,
        lab: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        verifiedAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      proofs,
      count: proofs.length,
    })
  } catch (error) {
    console.error('Fetch proofs error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch capability proofs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
