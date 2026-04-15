import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

interface DailyActivity {
  date: string
  tasksCompleted: number
  timeSpentMinutes: number
  skillsImproved: number
}

interface WeeklyProgress {
  weekStart: string
  weekEnd: string
  tasksCompleted: number
  timeSpent: number
  modulesStarted: number
  modulesCompleted: number
  progressPercentage: number
}

interface SemesterData {
  semesterName: string
  startDate: string
  endDate: string
  totalWeeks: number
  currentWeek: number
  weeklyProgress: WeeklyProgress[]
  dailyActivity: DailyActivity[]
  monthlyCompletion: Record<string, number>
  learningVelocity: number // tasks per week
  averageTimePerTask: number // minutes
  consistencyScore: number // 0-100
  totalTasksCompleted: number
  totalTimeSpent: number // minutes
}

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    // Get roadmap for user
    const roadmap = await prisma.roadmap.findFirst({
      where: { userId: session.user.id }
    })

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
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!roadmap) {
      return success({
        semesterName: 'No Active Roadmap',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalWeeks: 24,
        currentWeek: 1,
        weeklyProgress: [],
        dailyActivity: [],
        monthlyCompletion: {},
        learningVelocity: 0,
        averageTimePerTask: 0,
        consistencyScore: 0,
        totalTasksCompleted: 0,
        totalTimeSpent: 0
      })
    }

    // Use roadmap creation as semester start, estimate 6 months duration
    const startDate = new Date(roadmap.createdAt)
    const endDate = new Date(startDate.getTime() + (roadmap.durationMonths || 6) * 30 * 24 * 60 * 60 * 1000)

    // Calculate weeks
    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
    const currentWeek = Math.ceil((new Date().getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1

    // Daily activity (last 30 days)
    const dailyActivity: DailyActivity[] = []
    const activityMap: Record<string, { tasks: number; time: number; skills: number }> = {}

    user.labSubmissions.forEach(sub => {
      const date = new Date(sub.submittedAt).toISOString().split('T')[0]
      if (!activityMap[date]) activityMap[date] = { tasks: 0, time: 0, skills: 0 }

      if (sub.status === 'passed' || sub.status === 'completed') activityMap[date].tasks++

      activityMap[date].skills++ // Count as skill engagement
    })

    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    Object.entries(activityMap).forEach(([date, data]) => {
      if (new Date(date) >= last30Days) {
        dailyActivity.push({
          date,
          tasksCompleted: data.tasks,
          timeSpentMinutes: data.time,
          skillsImproved: Math.min(data.skills, 5) // Cap at 5 skills per day
        })
      }
    })

    // Weekly progress
    const weeklyProgress: WeeklyProgress[] = []
    for (let w = 0; w < totalWeeks; w++) {
      const weekStart = new Date(startDate)
      weekStart.setDate(weekStart.getDate() + w * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const weekSubmissions = user.labSubmissions.filter(sub => {
        const subDate = new Date(sub.submittedAt)
        return subDate >= weekStart && subDate <= weekEnd
      })

      const completedTasks = weekSubmissions.filter(sub => sub.status === 'passed' || sub.status === 'completed').length
      const timeSpent = 0 // Time tracking not available in LabSubmission model

      // Count module data in the week
      const modulesStarted = weekSubmissions.length > 0 ? 1 : 0 // Simplified: any submission counts as starting work
      const modulesCompleted = completedTasks > 0 ? 1 : 0 // Simplified: completed tasks indicate progress

      weeklyProgress.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        tasksCompleted: completedTasks,
        timeSpent,
        modulesStarted,
        modulesCompleted,
        progressPercentage: weekSubmissions.length > 0 ? Math.round((completedTasks / weekSubmissions.length) * 100) : 0
      })
    }

    // Monthly completion
    const monthlyCompletion: Record<string, number> = {}
    user.labSubmissions.forEach(sub => {
      const date = new Date(sub.submittedAt)
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM
      monthlyCompletion[monthKey] = (monthlyCompletion[monthKey] || 0) + (sub.status === 'passed' || sub.status === 'completed' ? 1 : 0)
    })

    // Calculate metrics
    const totalTasksCompleted = user.labSubmissions.filter(s => s.status === 'passed' || s.status === 'completed').length
    const totalTimeSpent = 0 // Time tracking not available in LabSubmission model

    // Learning velocity: tasks per week based on elapsed time (not total roadmap weeks)
    const now = new Date()
    const elapsedDays = (now.getTime() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000)
    const elapsedWeeks = Math.max(elapsedDays / 7, 1) // At least 1 week to avoid division by near-zero
    const learningVelocity = totalTasksCompleted > 0 ? Math.round(totalTasksCompleted / elapsedWeeks) : 0
    
    const averageTimePerTask = totalTasksCompleted > 0 ? Math.round(totalTimeSpent / totalTasksCompleted) : 0

    // Consistency score (how many days active in last 30 days)
    const activeDays = Object.keys(activityMap).filter(date => new Date(date) >= last30Days).length
    const consistencyScore = Math.round((activeDays / 30) * 100)

    return success({
      semesterName: roadmap.role || 'Learning Roadmap',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalWeeks,
      currentWeek: Math.min(currentWeek, totalWeeks),
      weeklyProgress,
      dailyActivity: dailyActivity.sort((a, b) => a.date.localeCompare(b.date)),
      monthlyCompletion,
      learningVelocity,
      averageTimePerTask,
      consistencyScore,
      totalTasksCompleted,
      totalTimeSpent
    } as SemesterData)
  } catch (error) {
    console.error('Semester overview error:', error)
    return serverError()
  }
}
