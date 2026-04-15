/**
 * User Service
 * Centralized service for all user-related database operations
 */

import { prisma } from '@/lib/prisma'
import { validateUserData, logValidationError, logValidationSuccess } from '@/lib/db/validators'

export const userService = {
  /**
   * Create a new user with validation
   */
  async create(data: any) {
    console.log('[DB WRITE] User.create initiated')

    const validation = validateUserData(data)
    if (!validation.valid) {
      logValidationError('User', 'create', data, validation.errors)
      throw new Error(`User validation failed: ${validation.errors.join('; ')}`)
    }

    logValidationSuccess('User', 'create', data)

    try {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          fullName: data.fullName,
          passwordHash: data.passwordHash,
          accountType: data.accountType || 'learner',
          selectedDomain: data.selectedDomain,
          selectedRole: data.selectedRole,
          capabilityScore: data.capabilityScore || 0,
          currentLevel: data.currentLevel || 'foundation',
        },
      })

      console.log(`[DB WRITE] User created: ${user.id}`)
      return user
    } catch (error) {
      console.error('[DB ERROR] User.create failed:', error)
      throw error
    }
  },

  /**
   * Get user by ID
   */
  async getById(userId: string) {
    console.log(`[DB READ] User.getById: ${userId}`)

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          capabilityTwin: true,
          skillGenome: true,
        },
      })

      if (!user) {
        console.warn(`[DB WARN] User not found: ${userId}`)
        return null
      }

      console.log(`[DB READ SUCCESS] User found: ${user.email}`)
      return user
    } catch (error) {
      console.error('[DB ERROR] User.getById failed:', error)
      throw error
    }
  },

  /**
   * Update user profile
   */
  async update(userId: string, data: any) {
    console.log(`[DB WRITE] User.update: ${userId}`)

    const validation = validateUserData(data)
    if (!validation.valid) {
      logValidationError('User', 'update', data, validation.errors)
      throw new Error(`User validation failed: ${validation.errors.join('; ')}`)
    }

    logValidationSuccess('User', 'update', data)

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          selectedDomain: data.selectedDomain,
          selectedRole: data.selectedRole,
          capabilityScore: data.capabilityScore,
          currentLevel: data.currentLevel,
        },
      })

      console.log(`[DB WRITE SUCCESS] User updated: ${userId}`)
      return user
    } catch (error) {
      console.error('[DB ERROR] User.update failed:', error)
      throw error
    }
  },

  /**
   * Get user with all related data for profile view
   */
  async getFullProfile(userId: string) {
    console.log(`[DB READ] User.getFullProfile: ${userId}`)

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          capabilityTwin: true,
          skillGenome: true,
          labSubmissions: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!user) return null

      console.log(`[DB READ SUCCESS] Full profile loaded for: ${user.email}`)
      return user
    } catch (error) {
      console.error('[DB ERROR] User.getFullProfile failed:', error)
      throw error
    }
  },
}
