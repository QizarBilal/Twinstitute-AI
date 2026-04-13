import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// GET /api/roadmap/node?nodeId=xxx - Get node details with dependencies
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const { searchParams } = new URL(req.url)
    const nodeId = searchParams.get('nodeId')

    if (!nodeId) {
      return badRequest('Missing nodeId query parameter')
    }

    const node = await (prisma as any).roadmapNode.findUnique({
      where: { nodeId },
      include: {
        roadmap: {
          select: {
            roadmapId: true,
            userId: true,
            role: true,
            domain: true,
            readinessScore: true,
          },
        },
        progress: {
          where: { userId: session.user.id },
          select: {
            status: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
    })

    if (!node) {
      return badRequest('Node not found')
    }

    // Verify user owns this roadmap
    if (node.roadmap.userId !== session.user.id) {
      return unauthorized()
    }

    // Parse skills and dependencies if they're stored as JSON strings
    const skills = typeof node.skills === 'string' 
      ? JSON.parse(node.skills) 
      : node.skills

    const dependencies = typeof node.dependencies === 'string'
      ? JSON.parse(node.dependencies)
      : node.dependencies

    return success({
      node: {
        nodeId: node.nodeId,
        title: node.title,
        description: node.description,
        type: node.type, // 'foundation', 'core', 'advanced', 'specialized', 'interview'
        difficulty: node.difficulty, // 1-10
        skills,
        dependencies,
        estimatedHours: node.estimatedHours,
        impact: node.impact,
        resources: node.resources,
        analysis: node.analysis,
        userProgress: node.progress[0] || {
          status: 'locked',
          startedAt: null,
          completedAt: null,
        },
        roadmapContext: {
          role: node.roadmap.role,
          domain: node.roadmap.domain,
          readinessScore: node.roadmap.readinessScore,
        },
      },
    })
  } catch (error) {
    console.error('Node Fetch Error:', error)
    return serverError()
  }
}
