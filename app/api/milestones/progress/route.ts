import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

interface RoadmapModule {
  id: string
  name: string
  phase: string
  totalTasks: number
  completedTasks: number
  status: 'not_started' | 'in_progress' | 'completed'
  progress: number
  startedAt: Date | null
  completedAt: Date | null
  timeSpent: number // in minutes
}

interface MilestoneProgress {
  userId: string
  totalModules: number
  completedModules: number
  inProgressModules: number
  notStartedModules: number
  overallProgress: number
  modules: RoadmapModule[]
  phases: Record<string, { count: number; completed: number; progress: number }>
}

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    // Get roadmap for user with nodes
    const roadmap = await prisma.roadmap.findFirst({
      where: { userId: session.user.id },
      include: { nodes: true }
    })

    if (!roadmap) {
      return success({
        userId: session.user.id,
        totalModules: 0,
        completedModules: 0,
        inProgressModules: 0,
        notStartedModules: 0,
        overallProgress: 0,
        modules: [],
        phases: {}
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        labSubmissions: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            evaluatedAt: true,
            scoreTotal: true,
            createdAt: true
          }
        }
      }
    })

    const modules = roadmap.nodes || []

    // Calculate module progress
    const calculateModuleStatus = (nodeId: string) => {
      // Since submissions aren't directly mapped to modules, estimate based on all submissions
      // In a full implementation, tasks would be mapped to modules
      const completedCount = user.labSubmissions.filter(s => s.status === 'passed' || s.status === 'completed').length
      const totalCount = user.labSubmissions.length || 1

      let status: 'not_started' | 'in_progress' | 'completed' = 'not_started'
      if (totalCount > 0 && completedCount > 0) {
        status = completedCount >= totalCount * 0.9 ? 'completed' : 'in_progress'
      } else if (totalCount > 0) {
        status = 'in_progress'
      }

      const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

      // Find first and last submission dates
      const allSubmissions = user.labSubmissions
      const startedAt = allSubmissions.length > 0 ? allSubmissions[0].submittedAt : null
      const completedAt = status === 'completed' ? allSubmissions[allSubmissions.length - 1]?.evaluatedAt || null : null

      return {
        status,
        progress,
        timeSpent: 0, // Time tracking not available
        startedAt,
        completedAt
      }
    }

    const processedModules: RoadmapModule[] = modules.map(mod => {
      const { status, progress, timeSpent, startedAt, completedAt } = calculateModuleStatus(mod.id)

      return {
        id: mod.id,
        name: mod.title || 'Untitled Module',
        phase: mod.type || 'core',
        totalTasks: 1, // Simplified: treat each module as 1 unit
        completedTasks: status === 'completed' ? 1 : 0,
        status,
        progress,
        startedAt,
        completedAt,
        timeSpent
      }
    })

    // Group by phase
    const phases: Record<string, { count: number; completed: number; progress: number }> = {}
    processedModules.forEach(mod => {
      if (!phases[mod.phase]) {
        phases[mod.phase] = { count: 0, completed: 0, progress: 0 }
      }
      phases[mod.phase].count++
      if (mod.status === 'completed') phases[mod.phase].completed++
      phases[mod.phase].progress += mod.progress
    })

    // Calculate phase progress
    Object.keys(phases).forEach(phase => {
      phases[phase].progress = Math.round(phases[phase].progress / phases[phase].count)
    })

    const completedModules = processedModules.filter(m => m.status === 'completed').length
    const inProgressModules = processedModules.filter(m => m.status === 'in_progress').length
    const notStartedModules = processedModules.filter(m => m.status === 'not_started').length
    const overallProgress = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0

    return success({
      userId: session.user.id,
      totalModules: modules.length,
      completedModules,
      inProgressModules,
      notStartedModules,
      overallProgress,
      modules: processedModules,
      phases
    } as MilestoneProgress)
  } catch (error) {
    console.error('Milestone progress error:', error)
    return serverError()
  }
}
