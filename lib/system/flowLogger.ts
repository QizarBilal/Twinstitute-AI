/**
 * Flow Logger
 * Tracks and logs all system events for full observability and debugging
 * Part of Priority 2: Flow Verification - "MAKE IT TRACEABLE"
 */

// Note: logFlowEvent integration is handled via callback pattern
// Instead of importing from dataFlow, the system uses the logger's event stream

export enum SystemEventType {
  // Authentication Events
  AUTH_STARTED = 'AUTH_STARTED',
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILED = 'AUTH_FAILED',
  AUTH_LOGOUT = 'AUTH_LOGOUT',

  // Orientation Events
  ORIENTATION_STARTED = 'ORIENTATION_STARTED',
  ORIENTATION_COMPLETED = 'ORIENTATION_COMPLETED',

  // Domain Selection Events
  DOMAIN_VIEW = 'DOMAIN_VIEW',
  DOMAIN_SELECTED = 'DOMAIN_SELECTED',
  DOMAIN_CHANGE = 'DOMAIN_CHANGE',

  // Genome Events
  GENOME_INITIALIZED = 'GENOME_INITIALIZED',
  GENOME_UPDATED = 'GENOME_UPDATED',
  SKILL_ADDED = 'SKILL_ADDED',
  SKILL_UPDATED = 'SKILL_UPDATED',

  // Roadmap Events
  ROADMAP_GENERATED = 'ROADMAP_GENERATED',
  ROADMAP_UPDATED = 'ROADMAP_UPDATED',
  MILESTONE_COMPLETED = 'MILESTONE_COMPLETED',

  // Task Events
  TASKS_GENERATED = 'TASKS_GENERATED',
  TASK_VIEW = 'TASK_VIEW',
  TASK_SUBMITTED = 'TASK_SUBMITTED',
  TASK_EVALUATED = 'TASK_EVALUATED',
  TASK_FEEDBACK = 'TASK_FEEDBACK',

  // Proof Events
  PROOF_GENERATED = 'PROOF_GENERATED',
  PROOF_VERIFIED = 'PROOF_VERIFIED',
  PROOF_SHARED = 'PROOF_SHARED',

  // Mentor Events
  MENTOR_CONSULTED = 'MENTOR_CONSULTED',
  MENTOR_FEEDBACK = 'MENTOR_FEEDBACK',

  // Simulation Events
  SIMULATION_STARTED = 'SIMULATION_STARTED',
  SIMULATION_COMPLETED = 'SIMULATION_COMPLETED',

  // API Events
  API_CALL = 'API_CALL',
  API_SUCCESS = 'API_SUCCESS',
  API_ERROR = 'API_ERROR',

  // UI Events
  PAGE_VIEW = 'PAGE_VIEW',
  MODAL_OPENED = 'MODAL_OPENED',
  MODAL_CLOSED = 'MODAL_CLOSED',

  // System Events
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export interface FlowLogEntry {
  id: string
  timestamp: string
  eventType: SystemEventType
  userId: string
  data: Record<string, any>
  duration?: number
  status: 'pending' | 'success' | 'failed'
  error?: string
  cascade?: string[] // Events triggered by this event
}

class FlowLogger {
  private logs: FlowLogEntry[] = []
  private activeOperations: Map<string, number> = new Map()

  /**
   * Log a system event
   */
  log(
    eventType: SystemEventType,
    userId: string,
    data: Record<string, any> = {},
    status: 'pending' | 'success' | 'failed' = 'success',
    error?: string
  ): string {
    const id = this.generateId()
    const timestamp = new Date().toISOString()

    const entry: FlowLogEntry = {
      id,
      timestamp,
      eventType,
      userId,
      data,
      status,
      error,
    }

    this.logs.push(entry)

    // Log for debugging
    this.debug(eventType, {
      userId,
      data,
      status,
      error,
    })

    return id
  }

  /**
   * Start tracking an operation (returns operation ID)
   */
  startOperation(eventType: SystemEventType, userId: string, data: Record<string, any> = {}): string {
    const opId = this.generateId()
    const startTime = performance.now()
    this.activeOperations.set(opId, startTime)

    this.log(eventType, userId, { ...data, operationId: opId }, 'pending')
    return opId
  }

  /**
   * Mark an operation as completed
   */
  completeOperation(
    operationId: string,
    eventType: SystemEventType,
    userId: string,
    data: Record<string, any> = {}
  ): FlowLogEntry | null {
    const startTime = this.activeOperations.get(operationId)
    if (!startTime) {
      console.warn(`Operation ${operationId} not found`)
      return null
    }

    const duration = performance.now() - startTime
    this.activeOperations.delete(operationId)

    const id = this.log(eventType, userId, { ...data, operationId, duration }, 'success')

    // Find and update the entry
    const entry = this.logs.find((log) => log.id === id)
    if (entry) {
      entry.duration = duration
    }

    return entry || null
  }

  /**
   * Mark an operation as failed
   */
  failOperation(
    operationId: string,
    eventType: SystemEventType,
    userId: string,
    error: string,
    data: Record<string, any> = {}
  ): FlowLogEntry | null {
    const startTime = this.activeOperations.get(operationId)
    const duration = startTime ? performance.now() - startTime : undefined

    this.activeOperations.delete(operationId)

    const id = this.log(eventType, userId, { ...data, operationId }, 'failed', error)

    const entry = this.logs.find((log) => log.id === id)
    if (entry && duration) {
      entry.duration = duration
    }

    return entry || null
  }

  /**
   * Record cascade of events (automatically triggered events)
   */
  recordCascade(
    triggeredByEventId: string,
    cascadeEventTypes: SystemEventType[]
  ): void {
    const entry = this.logs.find((log) => log.id === triggeredByEventId)
    if (entry) {
      entry.cascade = cascadeEventTypes
    }
  }

  /**
   * Get all logs for a user
   */
  getUserLogs(userId: string): FlowLogEntry[] {
    return this.logs.filter((log) => log.userId === userId)
  }

  /**
   * Get logs of a specific type
   */
  getLogsByType(eventType: SystemEventType, userId?: string): FlowLogEntry[] {
    return this.logs.filter((log) => log.eventType === eventType && (!userId || log.userId === userId))
  }

  /**
   * Get last N logs
   */
  getLastLogs(count: number = 50): FlowLogEntry[] {
    return this.logs.slice(-count)
  }

  /**
   * Get all logs
   */
  getAllLogs(): FlowLogEntry[] {
    return [...this.logs]
  }

  /**
   * Clear logs (for testing)
   */
  clear(): void {
    this.logs = []
    this.activeOperations.clear()
  }

  /**
   * Get statistics
   */
  getStats(userId?: string) {
    const logsToAnalyze = userId ? this.getUserLogs(userId) : this.logs

    const stats = {
      total: logsToAnalyze.length,
      successful: logsToAnalyze.filter((log) => log.status === 'success').length,
      failed: logsToAnalyze.filter((log) => log.status === 'failed').length,
      pending: logsToAnalyze.filter((log) => log.status === 'pending').length,
      avgDuration: 0,
      byType: {} as Record<string, number>,
    }

    // Calculate average duration
    const durations = logsToAnalyze.filter((log) => log.duration).map((log) => log.duration!)
    if (durations.length > 0) {
      stats.avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    }

    // Count by type
    logsToAnalyze.forEach((log) => {
      stats.byType[log.eventType] = (stats.byType[log.eventType] || 0) + 1
    })

    return stats
  }

  /**
   * Export logs as JSON for debugging
   */
  export(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        logs: this.logs,
        stats: this.getStats(),
      },
      null,
      2
    )
  }

  // ===== PRIVATE HELPERS =====

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private determineNextStep(eventType: SystemEventType): string {
    const cascades: Record<SystemEventType, string> = {
      [SystemEventType.AUTH_SUCCESS]: 'ORIENTATION_STARTED',
      [SystemEventType.ORIENTATION_COMPLETED]: 'DOMAIN_VIEW',
      [SystemEventType.DOMAIN_SELECTED]: 'ROADMAP_GENERATED',
      [SystemEventType.ROADMAP_GENERATED]: 'TASKS_GENERATED',
      [SystemEventType.TASK_SUBMITTED]: 'TASK_EVALUATED',
      [SystemEventType.TASK_EVALUATED]: 'GENOME_UPDATED',
      [SystemEventType.GENOME_UPDATED]: 'PROOF_GENERATED',
      [SystemEventType.DOMAIN_VIEW]: 'TASK_VIEW',
      // Add more as needed
    } as Record<SystemEventType, string>

    return cascades[eventType] || 'IDLE'
  }

  private debug(eventType: SystemEventType, context: Record<string, any>): void {
    if (typeof window !== 'undefined' && (window as any).__FLOW_DEBUG__) {
      console.log(`[FlowLog] ${eventType}`, context)
    }
  }
}

// Export singleton instance
export const flowLogger = new FlowLogger()

// Also export the class for testing
export { FlowLogger }
