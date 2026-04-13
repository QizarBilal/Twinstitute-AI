/**
 * GET /api/recruiter/interviews
 * Retrieve user's past interview evaluations
 */

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

function apiResponse(success: boolean, data?: any, error?: string): Response {
  return Response.json(
    success
      ? { success: true, data }
      : { success: false, error: error || 'Unknown error' }
  )
}

export async function GET(req: Request): Promise<Response> {
  try {
    // Get authenticated user
    const session = await getServerSession()
    if (!session?.user?.email) {
      return apiResponse(false, undefined, 'Unauthorized')
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return apiResponse(false, undefined, 'User not found')
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const role = searchParams.get('role')
    const domain = searchParams.get('domain')

    // Build query filters
    const where: any = { userId: user.id }
    if (role) where.role = role
    if (domain) where.domain = domain

    // Fetch interviews
    const interviews = await (prisma as any).interviewEvaluation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        question: true,
        role: true,
        domain: true,
        score: true,
        technicalDepth: true,
        clarity: true,
        structure: true,
        confidence: true,
        completeness: true,
        strengths: true,
        weaknesses: true,
        suggestions: true,
        feedback: true,
        status: true,
        evaluatedAt: true,
        createdAt: true,
      },
    })

    // Get total count for pagination
    const total = await (prisma as any).interviewEvaluation.count({ where })

    // Transform data - parse JSON strings back to arrays
    const transformedInterviews = interviews.map((interview: any) => ({
      ...interview,
      strengths: JSON.parse(interview.strengths),
      weaknesses: JSON.parse(interview.weaknesses),
      suggestions: JSON.parse(interview.suggestions),
      detailedScores: {
        technicalDepth: interview.technicalDepth,
        clarity: interview.clarity,
        structure: interview.structure,
        confidence: interview.confidence,
        completeness: interview.completeness,
      },
    }))

    // Calculate statistics
    const averageScore =
      interviews.length > 0
        ? Math.round(interviews.reduce((sum: number, i: any) => sum + i.score, 0) / interviews.length)
        : 0

    const highestScore = interviews.length > 0 ? Math.max(...interviews.map((i: any) => i.score)) : 0
    const latestScore = interviews.length > 0 ? interviews[0].score : 0

    return apiResponse(true, {
      interviews: transformedInterviews,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
      statistics: {
        totalEvaluations: total,
        averageScore,
        highestScore,
        latestScore,
        uniqueRoles: [...new Set(interviews.map((i: any) => i.role))],
        uniqueDomains: [...new Set(interviews.map((i: any) => i.domain).filter(Boolean))],
      },
    })
  } catch (error) {
    console.error('[INTERVIEWS] Fetch error:', error)
    return apiResponse(
      false,
      undefined,
      error instanceof Error ? error.message : 'Failed to fetch interviews'
    )
  }
}

/**
 * POST /api/recruiter/interviews (optional delete endpoint)
 * Delete a specific interview evaluation
 */
export async function DELETE(req: Request): Promise<Response> {
  try {
    // Get authenticated user
    const session = await getServerSession()
    if (!session?.user?.email) {
      return apiResponse(false, undefined, 'Unauthorized')
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return apiResponse(false, undefined, 'User not found')
    }

    // Parse request body
    const { searchParams } = new URL(req.url)
    const interviewId = searchParams.get('id')

    if (!interviewId) {
      return apiResponse(false, undefined, 'Interview ID required')
    }

    // Verify ownership
    const interview = await (prisma as any).interviewEvaluation.findUnique({
      where: { id: interviewId },
    })

    if (!interview || interview.userId !== user.id) {
      return apiResponse(false, undefined, 'Interview not found or unauthorized')
    }

    // Delete
    await (prisma as any).interviewEvaluation.delete({
      where: { id: interviewId },
    })

    return apiResponse(true, { deleted: true })
  } catch (error) {
    console.error('[INTERVIEWS] Delete error:', error)
    return apiResponse(
      false,
      undefined,
      error instanceof Error ? error.message : 'Failed to delete interview'
    )
  }
}
