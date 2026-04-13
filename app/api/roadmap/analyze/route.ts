import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

interface NodeWithProgress {
  nodeId: string
  title: string
  difficulty?: number | string
  estimatedHours?: number
  dependencies: string[]
  progress?: { status: string }[]
}

// POST /api/roadmap/analyze - Get recommendations and completion analysis
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { roadmapId } = body

    if (!roadmapId) {
      return badRequest('Missing roadmapId')
    }

    const roadmap = await (prisma as any).roadmap.findUnique({
      where: { roadmapId },
      include: {
        nodes: {
          include: {
            progress: {
              where: { userId: session.user.id },
            },
          },
        },
        progress: {
          where: { userId: session.user.id },
        },
      },
    })

    if (!roadmap) {
      return badRequest('Roadmap not found')
    }

    // Verify user owns roadmap
    if (roadmap.userId !== session.user.id) {
      return unauthorized()
    }

    // Analyze roadmap
    const totalNodes = roadmap.nodes.length
    const completedCount = roadmap.progress.filter(
      (p: any) => p.status === 'completed'
    ).length
    const inProgressCount = roadmap.progress.filter(
      (p: any) => p.status === 'in_progress'
    ).length

    // Find bottlenecks and blockers
    const blockedNodes = roadmap.nodes.filter((node: any) => {
      // Node is blocked if any dependency is incomplete
      const deps = typeof node.dependencies === 'string'
        ? JSON.parse(node.dependencies)
        : (node.dependencies || [])

      return deps.some((dep: string) => {
        const depNode = (roadmap.nodes as any[]).find(n => n.nodeId === dep)
        if (!depNode) return false
        const depProgress = depNode.progress?.[0]
        return depProgress?.status !== 'completed'
      })
    })

    // Find recommended next steps
    const availableNodes = roadmap.nodes.filter((node: any) => {
      const deps = typeof node.dependencies === 'string'
        ? JSON.parse(node.dependencies)
        : (node.dependencies || [])

      // Node is available if:
      // 1. All dependencies are completed
      // 2. It's not already completed/in-progress
      const isBlocked = deps.some((dep: string) => {
        const depNode = (roadmap.nodes as any[]).find(n => n.nodeId === dep)
        if (!depNode) return false
        const depProgress = depNode.progress?.[0]
        return depProgress?.status !== 'completed'
      })

      const userStatus = node.progress?.[0]?.status
      return !isBlocked && userStatus !== 'completed' && userStatus !== 'in_progress'
    })

    const recommendations = (availableNodes as any[])
      .sort((a: any, b: any) => {
        const aDiff = typeof a.difficulty === 'string' ? parseInt(a.difficulty) : (a.difficulty || 1)
        const bDiff = typeof b.difficulty === 'string' ? parseInt(b.difficulty) : (b.difficulty || 1)
        return aDiff - bDiff
      })
      .slice(0, 3)
      .map((node: any) => ({
        nodeId: node.nodeId,
        title: node.title,
        difficulty: node.difficulty || 'intermediate',
        estimatedHours: node.estimatedHours || 40,
        reasoning: `Ready to start. Difficulty: ${node.difficulty || 'intermediate'}.`,
      }))

    // Calculate metrics
    const completionPercentage = Math.round((completedCount / totalNodes) * 100)
    const averageDifficulty =
      roadmap.nodes.reduce((sum: number, node: any) => {
        const diff = typeof node.difficulty === 'string' ? parseInt(node.difficulty) : (node.difficulty || 1)
        return sum + diff
      }, 0) / (totalNodes || 1)

    // Estimate remaining time (rough estimate: 10 hours per difficulty point)
    const remainingHours = roadmap.nodes
      .filter((node: NodeWithProgress) => node.progress?.[0]?.status !== 'completed')
      .reduce((sum: number, node: any) => sum + (node.estimatedHours || 0), 0)

    return success({
      analysis: {
        roadmapId,
        completionMetrics: {
          total: totalNodes,
          completed: completedCount,
          inProgress: inProgressCount,
          completionPercentage,
          estimatedTotalHours: roadmap.nodes.reduce(
            (sum: number, node: any) => sum + (node.estimatedHours || 0),
            0
          ),
          estimatedRemainingHours: remainingHours,
        },
        difficulty: {
          average: Math.round(averageDifficulty * 10) / 10,
          distribution: {
            foundational: roadmap.nodes.filter((n: any) => n.difficulty <= 3).length,
            intermediate: roadmap.nodes.filter((n: any) => n.difficulty > 3 && n.difficulty <= 7)
              .length,
            advanced: roadmap.nodes.filter((n: any) => n.difficulty > 7).length,
          },
        },
        blockers: {
          count: blockedNodes.length,
          nodes: blockedNodes.map((node: NodeWithProgress) => ({
            nodeId: node.nodeId,
            title: node.title,
            blockedBy: typeof node.dependencies === 'string'
              ? JSON.parse(node.dependencies)
              : node.dependencies,
          })),
        },
        recommendations: {
          nextSteps: recommendations,
          suggestionCount: recommendations.length,
          message:
            recommendations.length > 0
              ? `Complete these ${recommendations.length} items to progress`
              : 'All available nodes are either completed or blocked by dependencies',
        },
      },
    })
  } catch (error) {
    console.error('Roadmap Analysis Error:', error)
    return serverError()
  }
}
