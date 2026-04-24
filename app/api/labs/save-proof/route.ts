import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createCapabilityProof,
  isNewScoreBetter,
  CapabilityProofData,
} from '@/lib/capability-proof'

interface SaveProofRequest {
  labId: string
  submissionId: string
  score: number
  passedTestCases: number
  totalTestCases: number
  taskType?: string
}

interface SaveProofResponse {
  success: boolean
  proof?: CapabilityProofData & { id: string }
  message: string
  isNewBest?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
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

    const {
      labId,
      submissionId,
      score,
      passedTestCases,
      totalTestCases,
      taskType,
    } = (await request.json()) as SaveProofRequest

    // Validate input
    if (!labId || !submissionId || score === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: labId, submissionId, score',
        },
        { status: 400 }
      )
    }

    if (score < 0 || score > 100) {
      return NextResponse.json(
        { success: false, message: 'Score must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Create proof object (returns null if not qualifying)
    const proofData = createCapabilityProof(
      user.id,
      labId,
      submissionId,
      score,
      passedTestCases,
      totalTestCases,
      taskType
    )

    if (!proofData) {
      return NextResponse.json({
        success: false,
        message: `Score ${score} does not qualify for proof (minimum: 50)`,
      })
    }

    // Check if user already has proof for this lab
    const existingProof = await prisma.capabilityProof.findUnique({
      where: {
        userId_labId: {
          userId: user.id,
          labId: labId,
        },
      },
      select: { id: true, score: true },
    })

    let savedProof
    let isNewBest = true

    if (existingProof) {
      // Only update if new score is better
      if (isNewScoreBetter(score, existingProof.score)) {
        savedProof = await prisma.capabilityProof.update({
          where: { id: existingProof.id },
          data: {
            ...proofData,
            isLatestBest: true,
            verifiedAt: new Date(),
          },
        })
        isNewBest = true
      } else {
        // Keep existing proof, new attempt is worse
        return NextResponse.json({
          success: true,
          message: `Score ${score} did not exceed your best score of ${existingProof.score}. Your best proof remains active.`,
          isNewBest: false,
          proof: { ...proofData, id: existingProof.id },
        })
      }
    } else {
      // Create new proof
      savedProof = await prisma.capabilityProof.create({
        data: {
          ...proofData,
          isLatestBest: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      proof: savedProof,
      message: `✅ Capability Verified: ${proofData.capability} – ${proofData.level}`,
      isNewBest,
    } as SaveProofResponse)
  } catch (error) {
    console.error('Proof save error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save capability proof',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
