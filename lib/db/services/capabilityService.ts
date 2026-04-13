/**
 * Capability Twin Service
 * Centralized service for capability tracking and updates
 */

import { prisma } from '@/lib/prisma'
import { validateCapabilityTwin, logValidationError, logValidationSuccess } from '@/lib/db/validators'

export const capabilityService = {
  /**
   * Initialize capability twin for new user
   */
  async initializeCapabilityTwin(userId: string) {
    console.log(`[DB WRITE] CapabilityTwin.initialize: ${userId}`)

    const data = {
      userId,
      overallScore: 0,
      executionReliability: 0,
      learningSpeed: 0,
      problemSolvingDepth: 0,
      consistency: 0,
      designReasoning: 0,
      abstractionLevel: 0,
      burnoutRisk: 0,
      improvementSlope: 0,
      innovationIndex: 0,
      currentStage: 'foundation',
      formationVelocity: 0,
      readinessScore: 0,
    }

    const validation = validateCapabilityTwin(data)
    if (!validation.valid) {
      logValidationError('CapabilityTwin', 'initialize', data, validation.errors)
      throw new Error(`CapabilityTwin validation failed: ${validation.errors.join('; ')}`)
    }

    logValidationSuccess('CapabilityTwin', 'initialize', data)

    try {
      const twin = await prisma.capabilityTwin.create({ data })

      console.log(`[DB WRITE SUCCESS] CapabilityTwin initialized: ${twin.id}`)
      return twin
    } catch (error) {
      console.error('[DB ERROR] CapabilityTwin.initialize failed:', error)
      throw error
    }
  },

  /**
   * Get capability twin for user
   */
  async getCapabilityTwin(userId: string) {
    console.log(`[DB READ] CapabilityTwin.get: ${userId}`)

    try {
      const twin = await prisma.capabilityTwin.findUnique({
        where: { userId },
      })

      if (!twin) {
        console.warn(`[DB WARN] CapabilityTwin not found for: ${userId}`)
        return null
      }

      console.log(`[DB READ SUCCESS] CapabilityTwin retrieved for: ${userId}`)
      return twin
    } catch (error) {
      console.error('[DB ERROR] CapabilityTwin.get failed:', error)
      throw error
    }
  },

  /**
   * Update capability scores after task evaluation
   */
  async updateCapabilities(
    userId: string,
    updates: {
      executionReliability?: number
      learningSpeed?: number
      problemSolvingDepth?: number
      consistency?: number
      designReasoning?: number
      abstractionLevel?: number
      innovation?: number
    }
  ) {
    console.log(`[DB WRITE] CapabilityTwin.updateScores: ${userId}`)

    try {
      // Fetch current twin
      const twin = await prisma.capabilityTwin.findUnique({
        where: { userId },
      })

      if (!twin) {
        throw new Error(`CapabilityTwin not found for user: ${userId}`)
      }

      // Calculate weighted average
      const newOverallScore =
        (
          (updates.executionReliability ?? twin.executionReliability) * 0.2 +
          (updates.learningSpeed ?? twin.learningSpeed) * 0.15 +
          (updates.problemSolvingDepth ?? twin.problemSolvingDepth) * 0.2 +
          (updates.consistency ?? twin.consistency) * 0.15 +
          (updates.designReasoning ?? twin.designReasoning) * 0.15 +
          (updates.abstractionLevel ?? twin.abstractionLevel) * 0.1 +
          (updates.innovation ?? twin.innovationIndex) * 0.05
        ) / 100 * 100

      // Determine stage
      let newStage = 'foundation'
      if (newOverallScore >= 75) newStage = 'expert'
      else if (newOverallScore >= 60) newStage = 'advancing'
      else if (newOverallScore >= 40) newStage = 'building'

      const updated = await prisma.capabilityTwin.update({
        where: { userId },
        data: {
          overallScore: Math.round(newOverallScore * 10) / 10,
          executionReliability: updates.executionReliability,
          learningSpeed: updates.learningSpeed,
          problemSolvingDepth: updates.problemSolvingDepth,
          consistency: updates.consistency,
          designReasoning: updates.designReasoning,
          abstractionLevel: updates.abstractionLevel,
          innovationIndex: updates.innovation,
          currentStage: newStage,
          lastUpdated: new Date(),
        },
      })

      console.log(`[DB WRITE SUCCESS] Capabilities updated`)
      console.log(`  - Overall Score: ${updated.overallScore}`)
      console.log(`  - Current Stage: ${newStage}`)

      return updated
    } catch (error) {
      console.error('[DB ERROR] CapabilityTwin.updateScores failed:', error)
      throw error
    }
  },

  /**
   * Get capability summary for user
   */
  async getCapabilitySummary(userId: string) {
    console.log(`[DB READ] CapabilityTwin.getSummary: ${userId}`)

    try {
      const twin = await prisma.capabilityTwin.findUnique({
        where: { userId },
      })

      if (!twin) return null

      return {
        overallScore: twin.overallScore,
        currentStage: twin.currentStage,
        targetRole: twin.targetRole,
        targetDomain: twin.targetDomain,
        readinessScore: twin.readinessScore,
        formationVelocity: twin.formationVelocity,
        lastUpdated: twin.lastUpdated,
      }
    } catch (error) {
      console.error('[DB ERROR] CapabilityTwin.getSummary failed:', error)
      throw error
    }
  },

  /**
   * Update readiness score
   */
  async updateReadinessScore(userId: string, newScore: number) {
    console.log(`[DB WRITE] CapabilityTwin.updateReadiness: ${userId}`)

    try {
      const updated = await prisma.capabilityTwin.update({
        where: { userId },
        data: {
          readinessScore: Math.max(0, Math.min(100, newScore)),
          lastUpdated: new Date(),
        },
      })

      console.log(`[DB WRITE SUCCESS] Readiness score updated to: ${updated.readinessScore}`)
      return updated
    } catch (error) {
      console.error('[DB ERROR] CapabilityTwin.updateReadiness failed:', error)
      throw error
    }
  },

  /**
   * Check if user is ready for advancement
   */
  async isReadyForAdvancement(userId: string): Promise<boolean> {
    console.log(`[DB READ] CapabilityTwin.checkReadiness: ${userId}`)

    try {
      const twin = await prisma.capabilityTwin.findUnique({
        where: { userId },
      })

      if (!twin) return false

      const isReady =
        twin.overallScore >= 70 &&
        twin.readinessScore >= 65 &&
        twin.consistency >= 60

      console.log(`[DB READ SUCCESS] Readiness check: ${isReady}`)
      return isReady
    } catch (error) {
      console.error('[DB ERROR] CapabilityTwin.checkReadiness failed:', error)
      throw error
    }
  },
}
