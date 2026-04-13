import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { TaskAllocator } from '@/lib/ai/taskAllocator'
import { TaskGenerator } from '@/lib/ai/taskGenerator'
import { calculateSkillGap, getRequiredSkillsForRole } from '@/lib/ai/roleSkillMapping'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        capabilityTwin: true,
        skillGenome: true,
        labSubmissions: {
          orderBy: { submittedAt: 'desc' },
          take: 20,
          include: {
            task: {
              select: {
                id: true,
                skills: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.selectedRole) {
      return NextResponse.json(
        { error: 'User has not selected a role' },
        { status: 400 }
      )
    }

    // Parse skill genome
    let userSkills = new Map<string, number>()
    if (user.skillGenome) {
      try {
        const nodes = JSON.parse(user.skillGenome.nodes || '[]')
        nodes.forEach((node: any) => {
          userSkills.set(node.name, node.proficiency || 0)
        })
      } catch (e) {
        console.error('Error parsing skill genome:', e)
      }
    }

    // Calculate skill gaps
    const { gapSkills } = calculateSkillGap(userSkills, user.selectedRole)

    // Parse performance history
    const performanceHistory = user.labSubmissions.map(sub => ({
      taskId: sub.taskId,
      performance: sub.scoreTotal || 0,
      timeSpent: sub.timeSpentMin,
      estimatedTime: 0,
      timestamp: sub.submittedAt,
      taskSkills: (sub.task?.skills && JSON.parse(sub.task.skills)) || [],
    }))

    // Build task queue
    const queue = TaskAllocator.buildTaskQueue(
      user.id,
      user.capabilityTwin?.overallScore || 0,
      performanceHistory.length > 0
        ? performanceHistory.reduce((sum, p) => sum + p.performance, 0) /
            performanceHistory.length /
            100
        : 0.5,
      gapSkills,
      performanceHistory
    )

    return NextResponse.json({
      queue,
      userStats: {
        completedTasks: queue.completedCount,
        successStreak: queue.successStreak,
        overallCapability: user.capabilityTwin?.overallScore || 0,
        selectedRole: user.selectedRole,
      },
    })
  } catch (error) {
    console.error('Queue error:', error)
    return NextResponse.json(
      { error: 'Failed to load task queue' },
      { status: 500 }
    )
  }
}
