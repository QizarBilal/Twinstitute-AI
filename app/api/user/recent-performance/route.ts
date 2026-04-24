import { NextRequest } from 'next/server'
import { getAuthSession, success, unauthorized, serverError } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized('Not authenticated')

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        labSubmissions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            task: true,
            evaluation: true,
          },
        },
      },
    })

    if (!user) {
      return serverError('User not found')
    }

    // Calculate metrics from submissions
    const submissions = user.labSubmissions
    const scores = submissions.map((s) => s.score || 0)
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0
    
    // Calculate consistency (standard deviation)
    const mean = averageScore
    const variance = scores.length > 0 ? scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length : 0
    const consistency = Math.max(0, Math.min(100, 100 - Math.sqrt(variance)))

    // Get total tasks completed
    const allSubmissions = await prisma.labSubmission.count({
      where: { userId: session.user.id },
    })

    return success({
      averageScore: averageScore,
      consistency: Math.round(consistency),
      completionRate: Math.min(1, (allSubmissions / 50) || 0), // Assume 50 total tasks
      tasksCompleted: allSubmissions,
      recentSubmissions: submissions.map((s) => ({
        taskId: s.labTaskId,
        taskName: s.labTask?.title || 'Lab Task',
        score: s.score || 0,
        submittedAt: s.createdAt,
        duration: s.timeSpentMin || 0,
      })),
      skillsProgression: [
        { skill: 'React', progress: 65, trend: 'up' },
        { skill: 'TypeScript', progress: 70, trend: 'up' },
        { skill: 'System Design', progress: 45, trend: 'stable' },
        { skill: 'Node.js', progress: 60, trend: 'up' },
        { skill: 'Database Design', progress: 50, trend: 'up' },
      ],
      weeklyMetrics: {
        avgScore: averageScore,
        tasksCompleted: Math.min(7, allSubmissions),
        timeSpent: Math.round(submissionsTimeSpent(submissions)),
        consistencyFlag: consistency > 70,
      },
    })
  } catch (error) {
    console.error('Recent Performance GET error:', error)
    return serverError()
  }
}

function submissionsTimeSpent(submissions: any[]): number {
  return submissions.reduce((sum, s) => sum + (s.timeSpentMin || 0), 0)
}
