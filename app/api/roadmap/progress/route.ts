import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// POST /api/roadmap/progress - Update node progress
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { roadmapId, nodeId, status } = body

    if (!roadmapId || !nodeId) {
      return badRequest('roadmapId and nodeId are required')
    }

    // Validate status
    const validStatuses = ['locked', 'available', 'in_progress', 'completed']
    if (status && !validStatuses.includes(status)) {
      return badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }

    // Verify roadmap belongs to user
    const roadmap = await (prisma as any).roadmap.findUnique({
      where: { id: roadmapId },
      select: { userId: true },
    })

    if (!roadmap || roadmap.userId !== session.user.id) {
      return badRequest('Roadmap not found or unauthorized')
    }

    // Get or create progress entry
    let progress = await (prisma as any).roadmapProgress.findUnique({
      where: {
        userId_roadmapId_nodeId: {
          userId: session.user.id,
          roadmapId,
          nodeId,
        },
      },
    })

    if (!progress) {
      progress = await (prisma as any).roadmapProgress.create({
        data: {
          userId: session.user.id,
          roadmapId,
          nodeId,
          status: status || 'available',
        },
      })
    } else if (status) {
      // Update status
      progress = await (prisma as any).roadmapProgress.update({
        where: {
          userId_roadmapId_nodeId: {
            userId: session.user.id,
            roadmapId,
            nodeId,
          },
        },
        data: {
          status,
          startedAt: status === 'in_progress' && !progress.startedAt ? new Date() : progress.startedAt,
          completedAt: status === 'completed' && !progress.completedAt ? new Date() : progress.completedAt,
        },
      })
    }

    // Calculate updated readiness score
    const allProgress = await (prisma as any).roadmapProgress.findMany({
      where: {
        userId: session.user.id,
        roadmapId,
        status: 'completed',
      },
    })

    const totalNodes = await (prisma as any).roadmapNode.count({
      where: { roadmapId },
    })

    const newReadinessScore = Math.round((allProgress.length / Math.max(totalNodes, 1)) * 100)

    // Update roadmap readiness score
    await (prisma as any).roadmap.update({
      where: { id: roadmapId },
      data: { readinessScore: newReadinessScore },
    })

    return success({
      progress,
      readinessScore: newReadinessScore,
      message: `Node ${nodeId} status updated to ${status}`,
    })
  } catch (error) {
    console.error('Progress Update Error:', error)
    return serverError()
  }
}
