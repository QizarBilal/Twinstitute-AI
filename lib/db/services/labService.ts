/**
 * Lab Service
 * Centralized service for lab task and submission management
 */

import { prisma } from '@/lib/prisma'
import { validateLabTask, validateLabSubmission, logValidationError, logValidationSuccess } from '@/lib/db/validators'

export const labService = {
  /**
   * Create a lab task template
   */
  async createTask(data: any) {
    console.log('[DB WRITE] LabTask.create initiated')

    const validation = validateLabTask(data)
    if (!validation.valid) {
      logValidationError('LabTask', 'create', data, validation.errors)
      throw new Error(`LabTask validation failed: ${validation.errors.join('; ')}`)
    }

    logValidationSuccess('LabTask', 'create', data)

    try {
      const task = await prisma.labTask.create({
        data: {
          title: data.title,
          description: data.description,
          taskType: data.taskType,
          difficulty: data.difficulty,
          domain: data.domain,
          skills: JSON.stringify(data.skills || []),
          timeEstimateMin: data.timeEstimateMin,
          instructions: data.instructions,
          testCases: JSON.stringify(data.testCases || []),
          evaluationRubric: JSON.stringify(data.evaluationRubric || {}),
          creditReward: data.creditReward || 10,
          isActive: data.isActive !== false,
        },
      })

      console.log(`[DB WRITE SUCCESS] LabTask created: ${task.id}`)
      return task
    } catch (error) {
      console.error('[DB ERROR] LabTask.create failed:', error)
      throw error
    }
  },

  /**
   * Get task by ID
   */
  async getTask(taskId: string) {
    console.log(`[DB READ] LabTask.getTask: ${taskId}`)

    try {
      const task = await prisma.labTask.findUnique({
        where: { id: taskId },
      })

      if (!task) {
        console.warn(`[DB WARN] LabTask not found: ${taskId}`)
        return null
      }

      console.log(`[DB READ SUCCESS] LabTask found: ${task.title}`)
      return task
    } catch (error) {
      console.error('[DB ERROR] LabTask.getTask failed:', error)
      throw error
    }
  },

  /**
   * Get tasks by domain and difficulty
   */
  async getTasksByDomain(domain: string, difficulty?: number) {
    console.log(`[DB READ] LabTask.getByDomain: ${domain}`)

    try {
      const where: any = {
        domain: { contains: domain, mode: 'insensitive' },
        isActive: true,
      }

      if (difficulty) {
        where.difficulty = difficulty
      }

      const tasks = await prisma.labTask.findMany({
        where,
        orderBy: { difficulty: 'asc' },
      })

      console.log(`[DB READ SUCCESS] Found ${tasks.length} tasks for domain: ${domain}`)
      return tasks
    } catch (error) {
      console.error('[DB ERROR] LabTask.getByDomain failed:', error)
      throw error
    }
  },

  /**
   * Create a lab submission
   */
  async createSubmission(data: any) {
    console.log(`[DB WRITE] LabSubmission.create: ${data.userId}`)

    const validation = validateLabSubmission(data)
    if (!validation.valid) {
      logValidationError('LabSubmission', 'create', data, validation.errors)
      throw new Error(`LabSubmission validation failed: ${validation.errors.join('; ')}`)
    }

    logValidationSuccess('LabSubmission', 'create', data)

    try {
      const submission = await prisma.labSubmission.create({
        data: {
          userId: data.userId,
          taskId: data.taskId,
          submittedCode: data.submittedCode,
          submittedAnswer: data.submittedAnswer,
          approach: data.approach,
          timeSpentMin: data.timeSpentMin || 0,
          attemptNumber: data.attemptNumber || 1,
          status: 'pending',
          createdAt: new Date(),
        },
      })

      console.log(`[DB WRITE SUCCESS] LabSubmission created: ${submission.id}`)
      return submission
    } catch (error) {
      console.error('[DB ERROR] LabSubmission.create failed:', error)
      throw error
    }
  },

  /**
   * Get submission by ID
   */
  async getSubmission(submissionId: string) {
    console.log(`[DB READ] LabSubmission.getSubmission: ${submissionId}`)

    try {
      const submission = await prisma.labSubmission.findUnique({
        where: { id: submissionId },
        include: {
          task: true,
          user: true,
          evaluation: true,
        },
      })

      if (!submission) {
        console.warn(`[DB WARN] LabSubmission not found: ${submissionId}`)
        return null
      }

      console.log(`[DB READ SUCCESS] LabSubmission found: ${submissionId}`)
      return submission
    } catch (error) {
      console.error('[DB ERROR] LabSubmission.getSubmission failed:', error)
      throw error
    }
  },

  /**
   * Get user's recent submissions
   */
  async getUserSubmissions(userId: string, limit: number = 10) {
    console.log(`[DB READ] LabSubmission.getByUser: ${userId}`)

    try {
      const submissions = await prisma.labSubmission.findMany({
        where: { userId },
        include: {
          task: true,
          evaluation: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      console.log(`[DB READ SUCCESS] Found ${submissions.length} submissions for user: ${userId}`)
      return submissions
    } catch (error) {
      console.error('[DB ERROR] LabSubmission.getByUser failed:', error)
      throw error
    }
  },

  /**
   * Update submission with evaluation results
   */
  async updateSubmissionWithEvaluation(
    submissionId: string,
    evaluation: any
  ) {
    console.log(`[DB WRITE] LabSubmission.updateEvaluation: ${submissionId}`)

    try {
      const submission = await prisma.labSubmission.update({
        where: { id: submissionId },
        data: {
          status: evaluation.status || 'evaluated',
          scoreTotal: evaluation.scoreTotal || 0,
          scoreBreakdown: JSON.stringify(evaluation.scoreBreakdown || {}),
          feedback: evaluation.feedback,
          evaluatedAt: new Date(),
        },
      })

      console.log(`[DB WRITE SUCCESS] Submission evaluated: ${submissionId}`)
      return submission
    } catch (error) {
      console.error('[DB ERROR] LabSubmission.updateEvaluation failed:', error)
      throw error
    }
  },

  /**
   * Get tasks completed by user
   */
  async getUserCompletedTasks(userId: string) {
    console.log(`[DB READ] LabSubmission.getCompleted: ${userId}`)

    try {
      const submissions = await prisma.labSubmission.findMany({
        where: {
          userId,
          status: 'passed',
        },
        select: { taskId: true },
        distinct: ['taskId'],
      })

      console.log(`[DB READ SUCCESS] Found ${submissions.length} completed tasks for: ${userId}`)
      return submissions.map(s => s.taskId)
    } catch (error) {
      console.error('[DB ERROR] LabSubmission.getCompleted failed:', error)
      throw error
    }
  },

  /**
   * Get user's success rate
   */
  async getUserSuccessRate(userId: string) {
    console.log(`[DB READ] LabSubmission.getSuccessRate: ${userId}`)

    try {
      const total = await prisma.labSubmission.count({
        where: { userId },
      })

      const passed = await prisma.labSubmission.count({
        where: {
          userId,
          status: 'passed',
        },
      })

      const rate = total === 0 ? 0 : (passed / total) * 100

      console.log(`[DB READ SUCCESS] Success rate for ${userId}: ${rate.toFixed(1)}%`)
      return { total, passed, rate: Math.round(rate * 100) / 100 }
    } catch (error) {
      console.error('[DB ERROR] LabSubmission.getSuccessRate failed:', error)
      throw error
    }
  },
}
