import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

// GET /api/labs/recommend — Get AI-recommended lab tasks
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    // Get user's skill genome
    const genome = await prisma.skillGenome.findUnique({
      where: { userId: session.user.id },
    })

    const nodes = genome ? JSON.parse(genome.nodes || '[]') : []
    const weakSkills = nodes.filter((n: any) => n.proficiency < 60).map((n: any) => n.id)

    // Get user's selected domain
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { selectedDomain: true, selectedRole: true },
    })

    // Get completed tasks
    const completedSubmissions = await prisma.labSubmission.findMany({
      where: { userId: session.user.id, status: 'passed' },
      select: { taskId: true },
    })
    const completedTaskIds = new Set(completedSubmissions.map(s => s.taskId))

    // Get available tasks (not completed)
    const allTasks = await prisma.labTask.findMany({
      where: { isActive: true },
      orderBy: { difficulty: 'asc' },
    })

    const availableTasks = allTasks.filter(t => !completedTaskIds.has(t.id))

    // Score tasks based on user profile
    const scoredTasks = availableTasks.map((task) => {
      let score = 0

      // Match domain preference
      if (user?.selectedDomain && task.domain.toLowerCase().includes(user.selectedDomain.toLowerCase())) {
        score += 30
      }

      // Match weak skills (prioritize skill gaps)
      const taskSkills = JSON.parse(task.skills || '[]')
      const matchingWeak = taskSkills.filter((s: string) => weakSkills.some((ws: string) => s.toLowerCase().includes(ws))).length
      score += matchingWeak * 15

      // Prefer intermediate difficulty
      if (task.difficulty >= 4 && task.difficulty <= 6) {
        score += 20
      }

      // Prefer tasks with higher credit reward
      score += task.creditReward * 0.5

      return { task, score }
    })

    // Sort by score and take top 5
    const topRecommendations = scoredTasks
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => ({
        ...item.task,
        skills: JSON.parse(item.task.skills || '[]'),
        score: item.score,
      }))

    return success({
      recommendations: topRecommendations,
      totalAvailable: availableTasks.length,
      completed: completedTaskIds.size,
      suggestedFirst: topRecommendations[0] || null,
      weakAreasToFocus: weakSkills.slice(0, 3),
    })
  } catch (error) {
    console.error('Recommendations error:', error)
    return serverError()
  }
}
