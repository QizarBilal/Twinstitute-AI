/**
 * Roadmap Service
 * Centralized service for roadmap and career path management
 */

import { prisma } from '@/lib/prisma'
import { validateRoadmap, logValidationError, logValidationSuccess } from '@/lib/db/validators'

export const roadmapService = {
  /**
   * Create roadmap for user
   */
  async createRoadmap(data: any) {
    console.log(`[DB WRITE] Roadmap.create: ${data.userId}`)

    const validation = validateRoadmap(data)
    if (!validation.valid) {
      logValidationError('Roadmap', 'create', data, validation.errors)
      throw new Error(`Roadmap validation failed: ${validation.errors.join('; ')}`)
    }

    logValidationSuccess('Roadmap', 'create', data)

    try {
      // Create roadmap
      const roadmap = await prisma.roadmap.create({
        data: {
          userId: data.userId,
          role: data.role,
          domain: data.domain,
          estimatedCompletionMonths: data.estimatedCompletionMonths,
          readinessScore: data.readinessScore,
        },
      })

      // Create roadmap nodes
      if (data.nodes && Array.isArray(data.nodes)) {
        for (const node of data.nodes) {
          await prisma.roadmapNode.create({
            data: {
              roadmapId: roadmap.id,
              nodeId: node.nodeId,
              title: node.title,
              description: node.description,
              type: node.type,
              difficulty: node.difficulty,
              estimatedHours: node.estimatedHours,
              skillsGained: node.skillsGained || [],
              why: node.why,
              impactExecution: node.impactExecution || 0,
              impactProblemSolving: node.impactProblemSolving || 0,
              dependencies: node.dependencies || [],
            },
          })
        }
      }

      console.log(`[DB WRITE SUCCESS] Roadmap created: ${roadmap.id} with ${data.nodes?.length || 0} nodes`)
      return roadmap
    } catch (error) {
      console.error('[DB ERROR] Roadmap.create failed:', error)
      throw error
    }
  },

  /**
   * Get roadmap for user
   */
  async getRoadmap(userId: string, role: string, domain: string) {
    console.log(`[DB READ] Roadmap.get: ${userId} - ${role} - ${domain}`)

    try {
      const roadmap = await prisma.roadmap.findUnique({
        where: {
          userId_role_domain: { userId, role, domain },
        },
        include: {
          nodes: true,
          progress: true,
        },
      })

      if (!roadmap) {
        console.warn(`[DB WARN] Roadmap not found for: ${userId}`)
        return null
      }

      console.log(`[DB READ SUCCESS] Roadmap found with ${roadmap.nodes.length} nodes`)
      return roadmap
    } catch (error) {
      console.error('[DB ERROR] Roadmap.get failed:', error)
      throw error
    }
  },

  /**
   * Get all roadmaps for user
   */
  async getUserRoadmaps(userId: string) {
    console.log(`[DB READ] Roadmap.getAll: ${userId}`)

    try {
      const roadmaps = await prisma.roadmap.findMany({
        where: { userId },
        include: {
          nodes: true,
          progress: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      console.log(`[DB READ SUCCESS] Found ${roadmaps.length} roadmaps for: ${userId}`)
      return roadmaps
    } catch (error) {
      console.error('[DB ERROR] Roadmap.getAll failed:', error)
      throw error
    }
  },

  /**
   * Mark roadmap node as completed
   */
  async completeNode(userId: string, roadmapId: string, nodeId: string) {
    console.log(`[DB WRITE] RoadmapProgress.complete: ${userId} - ${nodeId}`)

    try {
      const progress = await prisma.roadmapProgress.updateMany({
        where: {
          userId,
          roadmapId,
          nodeId,
        },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      })

      console.log(`[DB WRITE SUCCESS] Node marked completed: ${nodeId}`)
      return progress
    } catch (error) {
      console.error('[DB ERROR] RoadmapProgress.complete failed:', error)
      throw error
    }
  },

  /**
   * Get roadmap progress
   */
  async getProgress(userId: string, roadmapId: string) {
    console.log(`[DB READ] RoadmapProgress.get: ${userId} - ${roadmapId}`)

    try {
      const progress = await prisma.roadmapProgress.findMany({
        where: {
          userId,
          roadmapId,
        },
      })

      const completed = progress.filter(p => p.status === 'completed').length
      const total = progress.length

      console.log(`[DB READ SUCCESS] Progress: ${completed}/${total} nodes completed`)
      return { progress, completed, total, percentage: (completed / total) * 100 }
    } catch (error) {
      console.error('[DB ERROR] RoadmapProgress.get failed:', error)
      throw error
    }
  },
}
