/**
 * Skill Genome Service
 * Centralized service for skill genome tracking and updates
 */

import { prisma } from '@/lib/prisma'
import { validateSkillGenome, logValidationError, logValidationSuccess } from '@/lib/db/validators'

export interface SkillNode {
  id: string
  name: string
  proficiency: number // 0-100
  lastUpdated: string
}

export const genomeService = {
  /**
   * Initialize skill genome for new user
   */
  async initializeGenome(userId: string, initialSkills: SkillNode[] = []) {
    console.log(`[DB WRITE] SkillGenome.initialize: ${userId}`)

    const data = {
      userId,
      nodes: JSON.stringify(initialSkills),
      edges: JSON.stringify([]),
      weakClusters: JSON.stringify([]),
      bridgeSkills: JSON.stringify([]),
      compoundingSkills: JSON.stringify([]),
      coreStrength: 0,
      breadthScore: 0,
      depthScore: 0,
    }

    const validation = validateSkillGenome(data)
    if (!validation.valid) {
      logValidationError('SkillGenome', 'initialize', data, validation.errors)
      throw new Error(`SkillGenome validation failed: ${validation.errors.join('; ')}`)
    }

    logValidationSuccess('SkillGenome', 'initialize', data)

    try {
      const genome = await prisma.skillGenome.create({
        data,
      })

      console.log(`[DB WRITE SUCCESS] SkillGenome initialized: ${genome.id}`)
      return genome
    } catch (error) {
      console.error('[DB ERROR] SkillGenome.initialize failed:', error)
      throw error
    }
  },

  /**
   * Get skill genome for user
   */
  async getGenome(userId: string) {
    console.log(`[DB READ] SkillGenome.getGenome: ${userId}`)

    try {
      const genome = await prisma.skillGenome.findUnique({
        where: { userId },
      })

      if (!genome) {
        console.warn(`[DB WARN] SkillGenome not found for user: ${userId}`)
        return null
      }

      console.log(`[DB READ SUCCESS] SkillGenome retrieved for: ${userId}`)
      return genome
    } catch (error) {
      console.error('[DB ERROR] SkillGenome.getGenome failed:', error)
      throw error
    }
  },

  /**
   * Update skill proficiency after task submission
   */
  async updateSkillProficiency(userId: string, skillId: string, newProficiency: number) {
    console.log(`[DB WRITE] SkillGenome.updateSkill: ${userId} - ${skillId}`)

    try {
      const genome = await prisma.skillGenome.findUnique({
        where: { userId },
      })

      if (!genome) {
        throw new Error(`SkillGenome not found for user: ${userId}`)
      }

      const nodes: SkillNode[] = JSON.parse(genome.nodes || '[]')
      const skillIndex = nodes.findIndex(n => n.id === skillId)

      if (skillIndex >= 0) {
        nodes[skillIndex].proficiency = Math.max(
          0,
          Math.min(100, newProficiency)
        )
        nodes[skillIndex].lastUpdated = new Date().toISOString()
      } else {
        nodes.push({
          id: skillId,
          name: skillId,
          proficiency: newProficiency,
          lastUpdated: new Date().toISOString(),
        })
      }

      const updated = await prisma.skillGenome.update({
        where: { userId },
        data: {
          nodes: JSON.stringify(nodes),
          lastAnalyzed: new Date(),
        },
      })

      console.log(`[DB WRITE SUCCESS] Skill proficiency updated: ${skillId} → ${newProficiency}`)
      return updated
    } catch (error) {
      console.error('[DB ERROR] SkillGenome.updateSkillProficiency failed:', error)
      throw error
    }
  },

  /**
   * Calculate and update genome metrics
   */
  async recalculateMetrics(userId: string) {
    console.log(`[DB WRITE] SkillGenome.recalculate: ${userId}`)

    try {
      const genome = await prisma.skillGenome.findUnique({
        where: { userId },
      })

      if (!genome) {
        throw new Error(`SkillGenome not found for user: ${userId}`)
      }

      const nodes: SkillNode[] = JSON.parse(genome.nodes || '[]')

      // Calculate metrics
      const avgProficiency = nodes.length > 0
        ? nodes.reduce((sum, n) => sum + n.proficiency, 0) / nodes.length
        : 0

      const strongSkills = nodes.filter(n => n.proficiency >= 70).length
      const weakSkills = nodes.filter(n => n.proficiency < 50).length

      const coreStrength = Math.max(0, Math.min(100, avgProficiency))
      const breadthScore = (strongSkills / Math.max(1, nodes.length)) * 100
      const depthScore = weakSkills === 0
        ? 100
        : Math.max(0, 100 - (weakSkills * 10))

      const updated = await prisma.skillGenome.update({
        where: { userId },
        data: {
          coreStrength,
          breadthScore,
          depthScore,
          lastAnalyzed: new Date(),
        },
      })

      console.log(`[DB WRITE SUCCESS] SkillGenome metrics recalculated`)
      console.log(`  - coreStrength: ${coreStrength.toFixed(1)}`)
      console.log(`  - breadthScore: ${breadthScore.toFixed(1)}`)
      console.log(`  - depthScore: ${depthScore.toFixed(1)}`)

      return updated
    } catch (error) {
      console.error('[DB ERROR] SkillGenome.recalculateMetrics failed:', error)
      throw error
    }
  },

  /**
   * Get weak skills for remedial task assignment
   */
  async getWeakSkills(userId: string, threshold: number = 50) {
    console.log(`[DB READ] SkillGenome.getWeakSkills: ${userId}`)

    try {
      const genome = await prisma.skillGenome.findUnique({
        where: { userId },
      })

      if (!genome) return []

      const nodes: SkillNode[] = JSON.parse(genome.nodes || '[]')
      const weakSkills = nodes
        .filter(n => n.proficiency < threshold)
        .sort((a, b) => a.proficiency - b.proficiency)

      console.log(`[DB READ SUCCESS] Found ${weakSkills.length} weak skills`)
      return weakSkills
    } catch (error) {
      console.error('[DB ERROR] SkillGenome.getWeakSkills failed:', error)
      throw error
    }
  },

  /**
   * Get strong skills for mastery tasks
   */
  async getStrongSkills(userId: string, threshold: number = 75) {
    console.log(`[DB READ] SkillGenome.getStrongSkills: ${userId}`)

    try {
      const genome = await prisma.skillGenome.findUnique({
        where: { userId },
      })

      if (!genome) return []

      const nodes: SkillNode[] = JSON.parse(genome.nodes || '[]')
      const strongSkills = nodes
        .filter(n => n.proficiency >= threshold)
        .sort((a, b) => b.proficiency - a.proficiency)

      console.log(`[DB READ SUCCESS] Found ${strongSkills.length} strong skills`)
      return strongSkills
    } catch (error) {
      console.error('[DB ERROR] SkillGenome.getStrongSkills failed:', error)
      throw error
    }
  },
}
