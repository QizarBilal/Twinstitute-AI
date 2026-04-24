import { NextRequest } from 'next/server'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { getMentorResponse } from '@/lib/ai-mentor'

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized('Not authenticated')

    const { message } = await request.json()
    if (!message || typeof message !== 'string') {
      return serverError('Invalid message')
    }

    // Fetch comprehensive user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        labSubmissions: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            task: true,
          },
        },
      },
    })

    if (!user) {
      return serverError('User not found')
    }

    // ===== PART 1: Compute REAL Metrics =====

    // 1. Execution Rate = completed tasks / total tasks attempted
    const completedTasks = user.labSubmissions.filter((s) => (s.scoreTotal || 0) >= 70).length
    const totalAttempts = user.labSubmissions.length
    const executionRate = totalAttempts > 0 ? (completedTasks / totalAttempts) * 100 : 0

    // 2. Weekly Consistency = submissions last 7 days
    const submissionsLast7Days = user.labSubmissions.filter((s) => {
      const daysDiff = Math.floor((Date.now() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff <= 7
    }).length
    const weeklyConsistency = Math.min(100, (submissionsLast7Days / 5) * 100) // 5 = expected per week

    // 3. Capability Score = weighted formula from available data
    // Components: execution rate (40%) + average score (30%) + consistency (20%) + recency (10%)
    const avgScore = totalAttempts > 0 ? user.labSubmissions.reduce((sum, s) => sum + (s.scoreTotal || 0), 0) / totalAttempts : 0

    // Recency bonus: submissions this week boost score slightly
    const recencyBonus = submissionsLast7Days > 2 ? 5 : submissionsLast7Days > 0 ? 2 : 0

    const capabilityScore = Math.min(
      100,
      executionRate * 0.4 + avgScore * 0.3 + weeklyConsistency * 0.2 + recencyBonus
    )

    // 4. Progress = extract from submissions or use default structure
    // Since schema doesn't have explicit "modules", use lab submissions as proxy
    // Group by task category to simulate modules
    const moduleMap = new Map<string, number>()
    user.labSubmissions.forEach((sub) => {
      const category = sub.task?.category || 'Uncategorized'
      moduleMap.set(category, (moduleMap.get(category) || 0) + 1)
    })
    const completedModules = moduleMap.size
    const totalModules = Math.max(completedModules, 10) // Assume at least 10 module categories exist

    // 5. Identify Weak and Strong Skills
    // Calculate average score per skill/category
    const skillScores = new Map<string, { sum: number; count: number }>()
    user.labSubmissions.forEach((sub) => {
      const skill = sub.task?.category || 'General'
      const current = skillScores.get(skill) || { sum: 0, count: 0 }
      skillScores.set(skill, {
        sum: current.sum + (sub.scoreTotal || 0),
        count: current.count + 1,
      })
    })

    // Calculate averages and sort
    const skillAverages = Array.from(skillScores.entries())
      .map(([name, data]) => ({
        name,
        average: data.sum / data.count,
      }))
      .sort((a, b) => b.average - a.average)

    const strongSkills = skillAverages.slice(0, 3).map((s) => s.name)
    const weakSkills = skillAverages.slice(-3).reverse().map((s) => s.name)

    // 6. Recent Activity = last 5 submissions with actual data
    const recentActivity = user.labSubmissions
      .slice(0, 5)
      .map((s) => `${s.task?.name || 'Task'} completed on ${s.createdAt.toLocaleDateString()} with ${s.scoreTotal}% score`)

    // ===== PART 2: Validate all fields (NO undefined or empty) =====
    const context = {
      userId: session.user.id,
      role: user.role || 'Developer',
      capabilityScore: Math.max(0, Math.min(100, capabilityScore)), // Clamp 0-100
      executionRate: Math.max(0, Math.min(100, executionRate)), // Clamp 0-100
      progressCount: completedModules,
      progressTotal: totalModules,
      weakSkills: weakSkills.length > 0 ? weakSkills : ['General Skills'],
      strongSkills: strongSkills.length > 0 ? strongSkills : ['Technical Foundation'],
      recentActivity: recentActivity.length > 0 ? recentActivity : ['No recent activity'],
      weeklyConsistency: Math.max(0, Math.min(100, weeklyConsistency)), // Clamp 0-100
      targetRole: 'Full Stack Engineer',
    }

    console.log('[Mentor API] Context built:', {
      capabilityScore: context.capabilityScore,
      executionRate: context.executionRate,
      progressCount: context.progressCount,
      progressTotal: context.progressTotal,
      strongSkills: context.strongSkills,
      weakSkills: context.weakSkills,
      weeklyConsistency: context.weeklyConsistency,
    })

    // ===== PART 3: Get AI response with real context =====
    const mentorResponse = await getMentorResponse(message, context as any)

    return success(mentorResponse)
  } catch (error) {
    console.error('Mentor API error:', error)
    return serverError(error instanceof Error ? error.message : 'Failed to get mentor response')
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized('Not authenticated')

    // Return empty chat history or load from database
    // This endpoint can be extended to fetch conversation history
    return success({
      messages: [],
      status: 'ready',
    })
  } catch (error) {
    return serverError('Failed to fetch chat history')
  }
}
