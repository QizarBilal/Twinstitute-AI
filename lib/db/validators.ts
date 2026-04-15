/**
 * Database Validators
 * Validates data before insert/update operations to ensure data integrity
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// ─── USER VALIDATORS ─────────────────────────────────────────────────────────

export function validateUserData(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.email || typeof data.email !== 'string') {
    errors.push('User.email is required and must be a string')
  }

  if (!data.fullName || typeof data.fullName !== 'string') {
    errors.push('User.fullName is required and must be a string')
  }

  if (data.selectedDomain && typeof data.selectedDomain !== 'string') {
    errors.push('User.selectedDomain must be a string if provided')
  }

  if (data.selectedRole && typeof data.selectedRole !== 'string') {
    errors.push('User.selectedRole must be a string if provided')
  }

  if (typeof data.capabilityScore !== 'number') {
    errors.push('User.capabilityScore must be a number (0-100)')
  }

  if (data.capabilityScore < 0 || data.capabilityScore > 100) {
    errors.push('User.capabilityScore must be between 0 and 100')
  }

  const validLevels = ['foundation', 'building', 'advancing', 'expert']
  if (data.currentLevel && !validLevels.includes(data.currentLevel)) {
    errors.push(`User.currentLevel must be one of: ${validLevels.join(', ')}`)
  }

  return { valid: errors.length === 0, errors }
}

// ─── ROADMAP VALIDATORS ─────────────────────────────────────────────────────

export function validateRoadmap(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('Roadmap.userId is required and must be a string')
  }

  if (!data.role || typeof data.role !== 'string') {
    errors.push('Roadmap.role is required and must be a string')
  }

  if (!data.domain || typeof data.domain !== 'string') {
    errors.push('Roadmap.domain is required and must be a string')
  }

  if (typeof data.estimatedCompletionMonths !== 'number' || data.estimatedCompletionMonths <= 0) {
    errors.push('Roadmap.estimatedCompletionMonths must be a positive number')
  }

  if (typeof data.readinessScore !== 'number' || data.readinessScore < 0 || data.readinessScore > 100) {
    errors.push('Roadmap.readinessScore must be a number between 0-100')
  }

  if (!Array.isArray(data.nodes) || data.nodes.length === 0) {
    errors.push('Roadmap.nodes must be a non-empty array')
  }

  return { valid: errors.length === 0, errors }
}

// ─── SKILL GENOME VALIDATORS ────────────────────────────────────────────────

export function validateSkillGenome(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('SkillGenome.userId is required and must be a string')
  }

  try {
    if (data.nodes && typeof data.nodes === 'string') {
      const parsed = JSON.parse(data.nodes)
      if (!Array.isArray(parsed)) {
        errors.push('SkillGenome.nodes must be a JSON array')
      }
    }
  } catch {
    errors.push('SkillGenome.nodes must be valid JSON')
  }

  try {
    if (data.edges && typeof data.edges === 'string') {
      const parsed = JSON.parse(data.edges)
      if (!Array.isArray(parsed)) {
        errors.push('SkillGenome.edges must be a JSON array')
      }
    }
  } catch {
    errors.push('SkillGenome.edges must be valid JSON')
  }

  if (typeof data.coreStrength !== 'number' || data.coreStrength < 0) {
    errors.push('SkillGenome.coreStrength must be a non-negative number')
  }

  if (typeof data.breadthScore !== 'number' || data.breadthScore < 0) {
    errors.push('SkillGenome.breadthScore must be a non-negative number')
  }

  if (typeof data.depthScore !== 'number' || data.depthScore < 0) {
    errors.push('SkillGenome.depthScore must be a non-negative number')
  }

  return { valid: errors.length === 0, errors }
}

// ─── LAB TASK VALIDATORS ────────────────────────────────────────────────────

export function validateLabTask(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.title || typeof data.title !== 'string') {
    errors.push('LabTask.title is required and must be a string')
  }

  if (!data.description || typeof data.description !== 'string') {
    errors.push('LabTask.description is required and must be a string')
  }

  if (!data.domain || typeof data.domain !== 'string') {
    errors.push('LabTask.domain is required and must be a string')
  }

  const validTaskTypes = ['coding', 'debugging', 'system_design', 'integration', 'optimization', 'mini_project']
  if (!data.taskType || !validTaskTypes.includes(data.taskType)) {
    errors.push(`LabTask.taskType must be one of: ${validTaskTypes.join(', ')}`)
  }

  if (typeof data.difficulty !== 'number' || data.difficulty < 1 || data.difficulty > 10) {
    errors.push('LabTask.difficulty must be a number between 1-10')
  }

  if (typeof data.timeEstimateMin !== 'number' || data.timeEstimateMin <= 0) {
    errors.push('LabTask.timeEstimateMin must be a positive number')
  }

  if (!data.instructions || typeof data.instructions !== 'string') {
    errors.push('LabTask.instructions is required and must be a string')
  }

  return { valid: errors.length === 0, errors }
}

// ─── LAB SUBMISSION VALIDATORS ──────────────────────────────────────────────

export function validateLabSubmission(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('LabSubmission.userId is required and must be a string')
  }

  if (!data.taskId || typeof data.taskId !== 'string') {
    errors.push('LabSubmission.taskId is required and must be a string')
  }

  if (typeof data.timeSpentMin !== 'number' || data.timeSpentMin < 0) {
    errors.push('LabSubmission.timeSpentMin must be a non-negative number')
  }

  if (typeof data.attemptNumber !== 'number' || data.attemptNumber < 1) {
    errors.push('LabSubmission.attemptNumber must be a positive number')
  }

  const validStatuses = ['pending', 'evaluated', 'passed', 'failed']
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push(`LabSubmission.status must be one of: ${validStatuses.join(', ')}`)
  }

  if (typeof data.scoreTotal !== 'number' || data.scoreTotal < 0 || data.scoreTotal > 100) {
    errors.push('LabSubmission.scoreTotal must be a number between 0-100')
  }

  return { valid: errors.length === 0, errors }
}

// ─── CAPABILITY TWIN VALIDATORS ────────────────────────────────────────────

export function validateCapabilityTwin(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('CapabilityTwin.userId is required and must be a string')
  }

  const scores = [
    'overallScore',
    'executionReliability',
    'learningSpeed',
    'problemSolvingDepth',
    'consistency',
    'designReasoning',
    'abstractionLevel',
    'burnoutRisk',
    'improvementSlope',
    'innovationIndex',
    'formationVelocity',
    'readinessScore',
  ]

  for (const score of scores) {
    if (typeof data[score] === 'number') {
      if (data[score] < 0 || data[score] > 100) {
        errors.push(`CapabilityTwin.${score} must be between 0-100`)
      }
    }
  }

  const validStages = ['foundation', 'building', 'advancing', 'expert']
  if (data.currentStage && !validStages.includes(data.currentStage)) {
    errors.push(`CapabilityTwin.currentStage must be one of: ${validStages.join(', ')}`)
  }

  return { valid: errors.length === 0, errors }
}

// ─── GENERIC LOGGER ─────────────────────────────────────────────────────────

export function logValidationError(collection: string, operation: string, data: any, errors: string[]) {
  console.error(`[DB VALIDATION ERROR] ${collection}.${operation}`)
  console.error(`Data: ${JSON.stringify(data, null, 2)}`)
  console.error(`Errors: ${errors.join('; ')}`)
}

export function logValidationSuccess(collection: string, operation: string, data: any) {
  console.log(`[DB VALIDATION SUCCESS] ${collection}.${operation}`)
  console.log(`Data keys: ${Object.keys(data).join(', ')}`)
}
