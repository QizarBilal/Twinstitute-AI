/**
 * Strategy Signal Service
 * Centralized service for domain decisions and strategic signals
 */

import { prisma } from '@/lib/prisma'
import { validateStrategySignal, logValidationError, logValidationSuccess } from '@/lib/db/validators'

export const strategyService = {
  /**
   * Record domain selection decision (CRITICAL)
   */
  async recordDomainDecision(
    userId: string,
    domainSelected: string,
    confidenceScore: number,
    reasoning: string
  ) {
    console.log(`[DB WRITE] StrategySignal.recordDomain: ${userId} - ${domainSelected}`)

    const data = {
      userId,
      domainSelected,
      confidenceScore,
      signalType: 'domain_selection',
      title: `Domain Selection: ${domainSelected}`,
      reasoning,
      urgency: 'high',
    }

    const validation = validateStrategySignal(data)
    if (!validation.valid) {
      logValidationError('StrategySignal', 'recordDomain', data, validation.errors)
      throw new Error(`StrategySignal validation failed: ${validation.errors.join('; ')}`)
    }

    logValidationSuccess('StrategySignal', 'recordDomain', data)

    try {
      // Record decision
      const signal = await prisma.strategySignal.create({
        data: {
          userId,
          domainSelected,
          confidenceScore,
          signalType: 'domain_selection',
          title: data.title,
          reasoning,
          urgency: 'high',
          isAcknowledged: true,
          acknowledgedAt: new Date(),
        },
      })

      // Update user profile
      await prisma.user.update({
        where: { id: userId },
        data: {
          selectedDomain: domainSelected,
        },
      })

      console.log(`[DB WRITE SUCCESS] Domain decision recorded: ${domainSelected} (${confidenceScore}% confidence)`)
      return signal
    } catch (error) {
      console.error('[DB ERROR] StrategySignal.recordDomain failed:', error)
      throw error
    }
  },

  /**
   * Create strategic signal for user action
   */
  async createSignal(data: any) {
    console.log(`[DB WRITE] StrategySignal.create: ${data.userId}`)

    const validation = validateStrategySignal(data)
    if (!validation.valid) {
      logValidationError('StrategySignal', 'create', data, validation.errors)
      throw new Error(`StrategySignal validation failed: ${validation.errors.join('; ')}`)
    }

    logValidationSuccess('StrategySignal', 'create', data)

    try {
      const signal = await prisma.strategySignal.create({
        data: {
          userId: data.userId,
          domainSelected: data.domainSelected,
          confidenceScore: data.confidenceScore,
          signalType: data.signalType,
          urgency: data.urgency || 'medium',
          title: data.title,
          reasoning: data.reasoning,
          agentConsensus: JSON.stringify(data.agentConsensus || {}),
          actionItems: JSON.stringify(data.actionItems || []),
        },
      })

      console.log(`[DB WRITE SUCCESS] StrategySignal created: ${signal.id}`)
      return signal
    } catch (error) {
      console.error('[DB ERROR] StrategySignal.create failed:', error)
      throw error
    }
  },

  /**
   * Get recent signals for user
   */
  async getUserSignals(userId: string, limit: number = 10) {
    console.log(`[DB READ] StrategySignal.getByUser: ${userId}`)

    try {
      const signals = await prisma.strategySignal.findMany({
        where: { userId },
        orderBy: { generatedAt: 'desc' },
        take: limit,
      })

      console.log(`[DB READ SUCCESS] Found ${signals.length} signals for: ${userId}`)
      return signals
    } catch (error) {
      console.error('[DB ERROR] StrategySignal.getByUser failed:', error)
      throw error
    }
  },

  /**
   * Get unacknowledged signals (critical alerts)
   */
  async getUnacknowledgedSignals(userId: string) {
    console.log(`[DB READ] StrategySignal.getUnacknowledged: ${userId}`)

    try {
      const signals = await prisma.strategySignal.findMany({
        where: {
          userId,
          isAcknowledged: false,
        },
        orderBy: { generatedAt: 'desc' },
      })

      console.log(`[DB READ SUCCESS] Found ${signals.length} unacknowledged signals`)
      return signals
    } catch (error) {
      console.error('[DB ERROR] StrategySignal.getUnacknowledged failed:', error)
      throw error
    }
  },

  /**
   * Acknowledge a signal
   */
  async acknowledgeSignal(signalId: string) {
    console.log(`[DB WRITE] StrategySignal.acknowledge: ${signalId}`)

    try {
      const signal = await prisma.strategySignal.update({
        where: { id: signalId },
        data: {
          isAcknowledged: true,
          acknowledgedAt: new Date(),
        },
      })

      console.log(`[DB WRITE SUCCESS] Signal acknowledged: ${signalId}`)
      return signal
    } catch (error) {
      console.error('[DB ERROR] StrategySignal.acknowledge failed:', error)
      throw error
    }
  },

  /**
   * Record signal action (user acted on signal)
   */
  async recordSignalAction(signalId: string) {
    console.log(`[DB WRITE] StrategySignal.recordAction: ${signalId}`)

    try {
      const signal = await prisma.strategySignal.update({
        where: { id: signalId },
        data: {
          isActedUpon: true,
        },
      })

      console.log(`[DB WRITE SUCCESS] Signal action recorded: ${signalId}`)
      return signal
    } catch (error) {
      console.error('[DB ERROR] StrategySignal.recordAction failed:', error)
      throw error
    }
  },

  /**
   * Get domain selection history for user
   */
  async getDomainHistory(userId: string) {
    console.log(`[DB READ] StrategySignal.getDomainHistory: ${userId}`)

    try {
      const signals = await prisma.strategySignal.findMany({
        where: {
          userId,
          signalType: 'domain_selection',
        },
        orderBy: { generatedAt: 'desc' },
        select: {
          domainSelected: true,
          confidenceScore: true,
          generatedAt: true,
          reasoning: true,
        },
      })

      console.log(`[DB READ SUCCESS] Found ${signals.length} domain selections`)
      return signals
    } catch (error) {
      console.error('[DB ERROR] StrategySignal.getDomainHistory failed:', error)
      throw error
    }
  },
}
