import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// GET /api/roadmap - Get user's roadmaps
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const domain = searchParams.get('domain')

    // Build where clause
    const where: Record<string, any> = { userId: session.user.id }
    if (role) where.role = role
    if (domain) where.domain = domain

    const roadmaps = await (prisma as any).roadmap.findMany({
      where,
      include: {
        nodes: true,
        progress: {
          where: { userId: session.user.id },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    if (roadmaps.length === 0) {
      return success({
        roadmaps: [],
        message: 'No roadmaps found. Use POST to /api/roadmap/generate to create one.',
      })
    }

    // Enrich roadmaps with node progress status
    const enrichedRoadmaps = (roadmaps as any[]).map((roadmap: any) => {
      const progressMap = new Map(
        roadmap.progress.map((p: any) => [p.nodeId, p.status])
      )

      const enrichedNodes = roadmap.nodes.map((node: any) => ({
        ...node,
        userStatus: progressMap.get(node.nodeId) || 'locked',
      }))

      return {
        ...roadmap,
        nodes: enrichedNodes,
      }
    })

    return success({
      roadmaps: enrichedRoadmaps,
      count: enrichedRoadmaps.length,
    })
  } catch (error) {
    console.error('Roadmap Fetch Error:', error)
    return serverError()
  }
}
