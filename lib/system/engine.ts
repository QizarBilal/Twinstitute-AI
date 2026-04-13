/**
 * SYSTEM ENGINE
 * Orchestrates post-submission automation: evaluation, skill updates, proof generation, etc.
 * Part of Priority 4: Event-Driven Automation
 */

import { apiClient } from './apiClient'
import { flowLogger, SystemEventType } from './flowLogger'

// ─────────────────────────────────────────────────────────────────────────────
// POST-SUBMISSION AUTOMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main engine function called after successful task submission
 * Orchestrates the complete cascade of updates
 */
export async function onTaskSubmitted(
  userId: string,
  submissionId: string,
  taskId: string,
  evaluationResult?: any
) {
  const opId = flowLogger.startOperation(
    SystemEventType.TASK_SUBMITTED,
    userId,
    { taskId, submissionId }
  )

  try {
    // STEP 1: Log the submission
    flowLogger.log(
      SystemEventType.TASK_SUBMITTED,
      userId,
      {
        taskId,
        submissionId,
        timestamp: new Date().toISOString(),
      },
      'success'
    )

    // STEP 2: Fetch evaluation if not provided
    let evaluation = evaluationResult
    if (!evaluation) {
      const evalResponse = await apiClient.evaluateSubmission(submissionId)
      if (!evalResponse.success) {
        throw new Error(`Evaluation failed: ${evalResponse.error}`)
      }
      evaluation = evalResponse.data
    }

    // Log evaluation
    flowLogger.log(
      SystemEventType.TASK_EVALUATED,
      userId,
      {
        submissionId,
        score: (evaluation as any)?.score || 0,
        feedback: (evaluation as any)?.feedback,
      },
      'success'
    )

    // STEP 3: Determine if high-quality submission (>70% score)
    const score = (evaluation as any)?.score || 0
    const isHighQuality = score > 70

    // STEP 4: Update skill genome with evaluation results
    await updateSkillsFromEvaluation(userId, evaluation)

    // STEP 5: Update roadmap progress
    await updateRoadmapProgress(userId, taskId, score > 70 ? 'completed' : 'in_progress')

    // STEP 6: Generate proof if high quality
    if (isHighQuality) {
      await generateProofFromSubmission(userId, submissionId, taskId, evaluation)
    }

    // STEP 7: Generate next tasks
    await generateNextTasks(userId)

    // STEP 8: Update capability twin with new metrics
    await updateCapabilityTwin(userId)

    // Complete operation
    flowLogger.completeOperation(
      opId,
      SystemEventType.TASK_SUBMITTED,
      userId,
      {
        submissionId,
        taskId,
        score,
        proofGenerated: isHighQuality,
      }
    )

    return {
      success: true,
      score,
      proofGenerated: isHighQuality,
      nextSteps: ['View feedback', 'Start next task'],
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    flowLogger.failOperation(opId, SystemEventType.TASK_SUBMITTED, userId, errorMsg)
    throw error
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILL GENOME UPDATE
// ─────────────────────────────────────────────────────────────────────────────

async function updateSkillsFromEvaluation(userId: string, evaluation: any) {
  try {
    const opId = flowLogger.startOperation(
      SystemEventType.GENOME_UPDATED,
      userId,
      { evaluation }
    )

    // Fetch current genome
    const genomeResponse = await apiClient.getGenome()
    if (!genomeResponse.success) {
      throw new Error('Failed to fetch genome')
    }

    const genome = genomeResponse.data as any

    // Update skills based on evaluation
    const skillsToUpdate: Record<string, number> = {}
    if ((evaluation as any)?.skillsImproved) {
      ;(evaluation as any).skillsImproved.forEach((skill: any) => {
        const skillName = typeof skill === 'string' ? skill : skill.name
        const improvement = typeof skill === 'string' ? 5 : skill.improvement || 5
        skillsToUpdate[skillName] = improvement
      })
    }

    // Call API to update genome
    const updateResponse = await apiClient.updateGenome({
      skillUpdates: skillsToUpdate,
      evaluationScore: (evaluation as any)?.score || 0,
      evaluationData: evaluation,
    })

    if (!updateResponse.success) {
      throw new Error('Failed to update genome')
    }

    flowLogger.completeOperation(opId, SystemEventType.GENOME_UPDATED, userId, {
      skillsUpdated: Object.keys(skillsToUpdate),
      evaluationScore: (evaluation as any)?.score,
    })

    return updateResponse.data
  } catch (error) {
    console.error('Failed to update skills:', error)
    throw error
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROADMAP PROGRESS UPDATE
// ─────────────────────────────────────────────────────────────────────────────

async function updateRoadmapProgress(
  userId: string,
  taskId: string,
  status: 'completed' | 'in_progress' | 'available' | 'locked'
) {
  try {
    const opId = flowLogger.startOperation(
      SystemEventType.ROADMAP_UPDATED,
      userId,
      { taskId, status }
    )

    const response = await apiClient.updateRoadmapProgress(taskId, status)

    if (!response.success) {
      throw new Error('Failed to update roadmap progress')
    }

    flowLogger.completeOperation(opId, SystemEventType.ROADMAP_UPDATED, userId, {
      taskId,
      status,
    })

    return response.data
  } catch (error) {
    console.error('Failed to update roadmap progress:', error)
    throw error
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROOF GENERATION
// ─────────────────────────────────────────────────────────────────────────────

async function generateProofFromSubmission(
  userId: string,
  submissionId: string,
  taskId: string,
  evaluation: any
) {
  try {
    const opId = flowLogger.startOperation(SystemEventType.PROOF_GENERATED, userId, {
      submissionId,
      taskId,
    })

    const proofResponse = await apiClient.createProof({
      labSubmissionId: submissionId,
      taskId,
      title: `Task Completion: ${taskId}`,
      artifactType: 'task-completion',
      score: (evaluation as any)?.score || 0,
      feedback: (evaluation as any)?.feedback,
      skillsGained: (evaluation as any)?.skillsImproved || [],
      credits: Math.floor(((evaluation as any)?.score || 0) / 10),
    })

    if (!proofResponse.success) {
      throw new Error('Failed to create proof')
    }

    flowLogger.completeOperation(opId, SystemEventType.PROOF_GENERATED, userId, {
      proofId: (proofResponse.data as any)?.id,
      submissionId,
    })

    return proofResponse.data
  } catch (error) {
    console.error('Failed to generate proof:', error)
    // Don't throw - proof generation is optional
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NEXT TASKS GENERATION
// ─────────────────────────────────────────────────────────────────────────────

async function generateNextTasks(userId: string) {
  try {
    const opId = flowLogger.startOperation(SystemEventType.TASKS_GENERATED, userId, {})

    const response = await apiClient.generateTasks(3)

    if (!response.success) {
      throw new Error('Failed to generate next tasks')
    }

    flowLogger.completeOperation(opId, SystemEventType.TASKS_GENERATED, userId, {
      taskCount: 3,
    })

    return response.data
  } catch (error) {
    console.error('Failed to generate next tasks:', error)
    // Don't throw - this is not critical
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPABILITY TWIN UPDATE
// ─────────────────────────────────────────────────────────────────────────────

async function updateCapabilityTwin(userId: string) {
  try {
    const opId = flowLogger.startOperation(SystemEventType.GENOME_UPDATED, userId, {})

    // Fetch current twin and genome to calculate new metrics
    const [twinRes, genomeRes] = await Promise.all([
      apiClient.getTwin(),
      apiClient.getGenome(),
    ])

    if (!twinRes.success || !genomeRes.success) {
      throw new Error('Failed to fetch twin or genome')
    }

    const twin = twinRes.data as any
    const genome = genomeRes.data as any

    // Calculate new metrics based on recent progress
    const updatedTwin = {
      ...twin,
      // These would be updated based on actual progress
      // For now, we just signal that it's been updated
      lastUpdated: new Date().toISOString(),
    }

    const response = await apiClient.updateTwin(updatedTwin)

    if (!response.success) {
      throw new Error('Failed to update twin')
    }

    flowLogger.completeOperation(opId, SystemEventType.GENOME_UPDATED, userId, {
      twinUpdated: true,
    })

    return response.data
  } catch (error) {
    console.error('Failed to update capability twin:', error)
    // Don't throw - this is non-critical
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN SELECTION TRIGGER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * NOTE: Domain selection logic is handled in dataFlow.ts selectDomain() function
 * This engine focuses specifically on post-submission automation
 */

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW EVALUATION AUTOMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Event handler triggered after interview evaluation
 * Updates capability twin with interview performance
 */
export async function onInterviewEvaluated(
  userId: string,
  interviewId: string,
  evaluationScore: number,
  detailedScores: {
    technicalDepth: number
    clarity: number
    structure: number
    confidence: number
    completeness: number
  }
) {
  const opId = flowLogger.startOperation(
    'INTERVIEW_EVALUATED' as SystemEventType,
    userId,
    { interviewId, evaluationScore }
  )

  try {
    // Update capability twin based on interview performance
    const twinResponse = await apiClient.getTwin()
    if (!twinResponse.success) {
      throw new Error('Failed to fetch capability twin')
    }

    const twin = twinResponse.data as any
    const scoreBoost = (evaluationScore / 100) * 5 // Up to 5 point boost

    const updateData = {
      executionReliability: Math.min(100, twin.executionReliability + scoreBoost * 0.6),
      problemSolvingDepth: Math.min(100, twin.problemSolvingDepth + scoreBoost * 0.8),
      consistency: Math.min(100, twin.consistency + scoreBoost * 0.4),
      learningSpeed: Math.min(100, twin.learningSpeed + scoreBoost * 0.3),
      designReasoning: Math.min(100, twin.designReasoning + detailedScores.structure * 0.04),
      abstractionLevel: Math.min(100, twin.abstractionLevel + detailedScores.technicalDepth * 0.04),
    }

    const updateResponse = await apiClient.updateTwin(updateData)
    if (!updateResponse.success) {
      throw new Error('Failed to update capability twin')
    }

    flowLogger.log(
      'INTERVIEW_EVALUATED' as SystemEventType,
      userId,
      {
        interviewId,
        score: evaluationScore,
        twinUpdated: updateData,
        timestamp: new Date().toISOString(),
      },
      'success'
    )

    return {
      success: true,
      score: evaluationScore,
      twinUpdated: true,
      improvements: updateData,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    flowLogger.failOperation(opId, 'INTERVIEW_EVALUATED' as SystemEventType, userId, errorMsg)
    console.error('[ENGINE] Interview evaluation automation failed:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DEBUG UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Export the event log for debugging
 */
export function getEngineFlowLog() {
  return flowLogger.getAllLogs()
}
