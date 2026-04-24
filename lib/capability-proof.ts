/**
 * Capability Proof Engine
 * Converts lab execution results into verified capability proofs
 */

export const CAPABILITY_MAPPING: Record<string, string> = {
  // Task-specific capabilities
  'task-001': 'Problem Solving',
  'task-002': 'Problem Solving',
  'task-003': 'System Architecture',
  'task-004': 'Database Optimization',
  'task-005': 'Security & Authentication',

  // Fallback by task type
  coding: 'Problem Solving',
  debugging: 'Debugging & Troubleshooting',
  system_design: 'System Architecture',
  optimization: 'Performance Optimization',
  integration: 'API Integration',
  architecture: 'System Architecture',
}

export const CAPABILITY_LEVELS = {
  BEGINNER: 'Beginner',
  BASIC: 'Basic',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const

/**
 * Convert test score to capability level
 * @param score 0-100
 * @returns Capability level string
 */
export function getCapabilityLevel(score: number): string {
  if (score >= 90) return CAPABILITY_LEVELS.ADVANCED
  if (score >= 70) return CAPABILITY_LEVELS.INTERMEDIATE
  if (score >= 50) return CAPABILITY_LEVELS.BASIC
  return CAPABILITY_LEVELS.BEGINNER
}

/**
 * Get capability name for a lab task
 * @param taskId Task identifier
 * @param taskType Fallback task type if taskId not found
 * @returns Capability name
 */
export function getCapabilityName(taskId: string, taskType?: string): string {
  // Try direct task ID mapping first
  if (CAPABILITY_MAPPING[taskId]) {
    return CAPABILITY_MAPPING[taskId]
  }
  // Fallback to task type mapping
  if (taskType && CAPABILITY_MAPPING[taskType]) {
    return CAPABILITY_MAPPING[taskType]
  }
  // Default
  return 'Problem Solving'
}

/**
 * Determine if score qualifies for capability proof
 * @param score 0-100
 * @returns true if score >= 50
 */
export function isProofQualifying(score: number): boolean {
  return score >= 50
}

/**
 * Create a capability proof object
 * @param userId User ID
 * @param labId Lab/Task ID
 * @param submissionId Submission ID
 * @param score Test score 0-100
 * @param passedTestCases Number of passed tests
 * @param totalTestCases Total number of tests
 * @param taskType Task type for fallback capability mapping
 * @returns Capability proof object or null if not qualifying
 */
export interface CapabilityProofData {
  userId: string
  labId: string
  submissionId: string
  capability: string
  level: string
  score: number
  passedTestCases: number
  totalTestCases: number
}

export function createCapabilityProof(
  userId: string,
  labId: string,
  submissionId: string,
  score: number,
  passedTestCases: number,
  totalTestCases: number,
  taskType?: string
): CapabilityProofData | null {
  // Only create proof if qualifying score
  if (!isProofQualifying(score)) {
    return null
  }

  return {
    userId,
    labId,
    submissionId,
    capability: getCapabilityName(labId, taskType),
    level: getCapabilityLevel(score),
    score: Math.round(score),
    passedTestCases,
    totalTestCases,
  }
}

/**
 * Check if new proof is better than existing
 * @param newScore New test score
 * @param existingScore Existing proof score
 * @returns true if new score is better
 */
export function isNewScoreBetter(newScore: number, existingScore: number): boolean {
  return newScore > existingScore
}

/**
 * Format capability for display
 * @param capability Capability name
 * @param level Capability level
 * @returns Formatted string like "Problem Solving – Intermediate"
 */
export function formatCapability(capability: string, level: string): string {
  return `${capability} – ${level}`
}

/**
 * Get all unique capabilities for a user from their proofs
 * (typically used in resume/profile display)
 * @param proofs Array of capability proofs
 * @returns Array of unique capabilities sorted by level (advanced → beginner)
 */
export function getUniqueCapabilities(
  proofs: Array<{ capability: string; level: string }>
): Array<{ capability: string; level: string }> {
  const levelOrder = { [CAPABILITY_LEVELS.ADVANCED]: 0, [CAPABILITY_LEVELS.INTERMEDIATE]: 1, [CAPABILITY_LEVELS.BASIC]: 2, [CAPABILITY_LEVELS.BEGINNER]: 3 }

  // Keep only unique capabilities (last one wins = most recent)
  const map = new Map<string, { capability: string; level: string }>()
  proofs.forEach((proof) => {
    map.set(proof.capability, proof)
  })

  // Sort by level (advanced first)
  return Array.from(map.values()).sort(
    (a, b) => (levelOrder[a.level] ?? 999) - (levelOrder[b.level] ?? 999)
  )
}

/**
 * Generate credential badge HTML
 * @param capability Capability name
 * @param level Capability level
 * @returns HTML badge string
 */
export function getCapabilityBadgeHTML(capability: string, level: string): string {
  const colors = {
    [CAPABILITY_LEVELS.ADVANCED]: '#10b981',
    [CAPABILITY_LEVELS.INTERMEDIATE]: '#3b82f6',
    [CAPABILITY_LEVELS.BASIC]: '#f59e0b',
    [CAPABILITY_LEVELS.BEGINNER]: '#6b7280',
  }

  const bgColor = colors[level] || '#6b7280'

  return `
    <span style="
      display: inline-block;
      background-color: ${bgColor};
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 4px;
      margin-bottom: 4px;
    ">
      ✓ ${capability} – ${level}
    </span>
  `
}
