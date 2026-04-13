/**
 * AGENT STATE MEMORY
 * 
 * Tracks the complete state of a user's orientation journey
 * This is what makes the agent "remember" decisions and progress
 * 
 * KEY PRINCIPLE:
 * Every message updates this state
 * Agent uses this to understand where user is in their journey
 */

export interface AgentMemory {
  // User Identity
  userId: string
  sessionId: string

  // Conversation tracking
  conversationTurns: number
  messageHistory: Array<{
    role: 'user' | 'agent'
    content: string
    timestamp: number
    signalsExtracted?: any
  }>

  // Confirmed choices (ground truth)
  confirmedDomain: string | null
  confirmedRole: string | null
  confirmedTimeline: string | null

  // Rejected options (what we know they DON'T want)
  rejectedDomains: string[]
  rejectedRoles: string[]

  // What we know about them (accumulated signals)
  detectedTraits: string[]
  statedInterests: string[]
  mentionedSkills: {
    name: string
    level: 'beginner' | 'intermediate' | 'advanced'
  }[]
  impliedGoals: string[]

  // Journey state
  currentPhase: 'discovery' | 'exploration' | 'validation' | 'finalization'
  confidenceLevel: number // 0-100
  readinessForDecision: boolean

  // What still needs confirmation
  openQuestions: string[]
  uncertaintyAreas: string[]

  // Decision factors
  decisionFactors: {
    primaryMotivation: string | null
    secondaryMotivation: string | null
    dealBreakers: string[]
    mustHaves: string[]
  }

  // Timeline
  createdAt: number
  lastUpdatedAt: number
}

/**
 * Initialize a fresh agent memory for a user
 */
export function initializeMemory(userId: string, sessionId: string): AgentMemory {
  return {
    userId,
    sessionId,

    conversationTurns: 0,
    messageHistory: [],

    confirmedDomain: null,
    confirmedRole: null,
    confirmedTimeline: null,

    rejectedDomains: [],
    rejectedRoles: [],

    detectedTraits: [],
    statedInterests: [],
    mentionedSkills: [],
    impliedGoals: [],

    currentPhase: 'discovery',
    confidenceLevel: 0,
    readinessForDecision: false,

    openQuestions: [
      'What are your core interests?',
      'What kind of work environment do you prefer?',
      'What are your career goals?',
    ],
    uncertaintyAreas: [
      'Career direction',
      'Technical proficiency',
      'Work preferences',
    ],

    decisionFactors: {
      primaryMotivation: null,
      secondaryMotivation: null,
      dealBreakers: [],
      mustHaves: [],
    },

    createdAt: Date.now(),
    lastUpdatedAt: Date.now(),
  }
}

/**
 * Update memory after each agent turn
 */
export function updateMemory(
  memory: AgentMemory,
  userMessage: string,
  agentOutput: any,
  extractedSignals: any
): AgentMemory {
  const updated = { ...memory }

  // Track conversation
  updated.conversationTurns += 1
  updated.messageHistory.push({
    role: 'user',
    content: userMessage,
    timestamp: Date.now(),
    signalsExtracted: extractedSignals,
  })
  updated.messageHistory.push({
    role: 'agent',
    content: agentOutput.response,
    timestamp: Date.now(),
  })

  // Update signals
  if (extractedSignals) {
    // Merge traits (don't duplicate)
    updated.detectedTraits = Array.from(
      new Set([...updated.detectedTraits, ...(extractedSignals.traits || [])])
    )

    // Merge interests
    updated.statedInterests = Array.from(
      new Set([
        ...updated.statedInterests,
        ...(extractedSignals.statedInterests || []),
      ])
    )

    // Merge goals
    updated.impliedGoals = Array.from(
      new Set([
        ...updated.impliedGoals,
        ...(extractedSignals.impliedGoals || []),
      ])
    )
  }

  // Update phase based on conversation progress
  if (updated.conversationTurns < 2) {
    updated.currentPhase = 'discovery'
  } else if (updated.confirmedDomain && !updated.confirmedRole) {
    updated.currentPhase = 'exploration'
  } else if (updated.confirmedRole && !updated.confirmedDomain) {
    updated.currentPhase = 'validation'
  } else if (updated.confirmedDomain && updated.confirmedRole) {
    updated.currentPhase = 'finalization'
  }

  // Update confidence based on signals
  const confidenceFactors = {
    hasInterests: updated.statedInterests.length > 0 ? 15 : 0,
    hasTraits: updated.detectedTraits.length > 0 ? 15 : 0,
    hasDomainSelected: updated.confirmedDomain ? 30 : 0,
    hasRoleSelected: updated.confirmedRole ? 30 : 0,
    conversationDepth: Math.min(updated.conversationTurns * 5, 10),
  }

  updated.confidenceLevel = Math.min(
    100,
    Object.values(confidenceFactors).reduce((a, b) => a + b, 0)
  )

  // Determine readiness
  updated.readinessForDecision =
    updated.confirmedDomain !== null &&
    updated.confirmedRole !== null &&
    updated.confidenceLevel > 60

  // Update open questions dynamically
  const newOpenQuestions: string[] = []
  if (!updated.confirmedDomain) {
    newOpenQuestions.push('Which domain interests you most?')
  }
  if (updated.confirmedDomain && !updated.confirmedRole) {
    newOpenQuestions.push(`Which ${updated.confirmedDomain} role appeals to you?`)
  }
  if (updated.confirmedRole && !updated.confirmedTimeline) {
    newOpenQuestions.push('What timeline are you targeting?')
  }
  if (updated.decisionFactors.primaryMotivation === null) {
    newOpenQuestions.push('What is your primary career motivation?')
  }

  updated.openQuestions = newOpenQuestions

  updated.lastUpdatedAt = Date.now()

  return updated
}

/**
 * Add a confirmed choice to memory
 */
export function confirmDomain(memory: AgentMemory, domainName: string): AgentMemory {
  const updated = { ...memory }
  updated.confirmedDomain = domainName

  // Remove from rejected if it was there
  updated.rejectedDomains = updated.rejectedDomains.filter((d) => d !== domainName)

  updated.lastUpdatedAt = Date.now()
  return updated
}

/**
 * Add a confirmed role to memory
 */
export function confirmRole(memory: AgentMemory, roleName: string): AgentMemory {
  const updated = { ...memory }
  updated.confirmedRole = roleName

  // Remove from rejected if it was there
  updated.rejectedRoles = updated.rejectedRoles.filter((r) => r !== roleName)

  updated.lastUpdatedAt = Date.now()
  return updated
}

/**
 * Reject a domain
 */
export function rejectDomain(memory: AgentMemory, domainName: string): AgentMemory {
  const updated = { ...memory }

  if (!updated.rejectedDomains.includes(domainName)) {
    updated.rejectedDomains.push(domainName)
  }

  updated.lastUpdatedAt = Date.now()
  return updated
}

/**
 * Reject a role
 */
export function rejectRole(memory: AgentMemory, roleName: string): AgentMemory {
  const updated = { ...memory }

  if (!updated.rejectedRoles.includes(roleName)) {
    updated.rejectedRoles.push(roleName)
  }

  updated.lastUpdatedAt = Date.now()
  return updated
}

/**
 * Add motivation to memory
 */
export function addMotivation(
  memory: AgentMemory,
  primary: string,
  secondary?: string
): AgentMemory {
  const updated = { ...memory }
  updated.decisionFactors.primaryMotivation = primary
  if (secondary) {
    updated.decisionFactors.secondaryMotivation = secondary
  }
  updated.lastUpdatedAt = Date.now()
  return updated
}

/**
 * Add deal breaker
 */
export function addDealBreaker(memory: AgentMemory, dealBreaker: string): AgentMemory {
  const updated = { ...memory }
  if (!updated.decisionFactors.dealBreakers.includes(dealBreaker)) {
    updated.decisionFactors.dealBreakers.push(dealBreaker)
  }
  updated.lastUpdatedAt = Date.now()
  return updated
}

/**
 * Extract a summary of current state for agent to use
 */
export function getMemorySummary(memory: AgentMemory): string {
  const summary = {
    confidence: `${memory.confidenceLevel}% confident`,
    domain: memory.confirmedDomain ? `${memory.confirmedDomain} (confirmed)` : 'Not selected',
    role: memory.confirmedRole ? `${memory.confirmedRole} (confirmed)` : 'Not selected',
    traits: memory.detectedTraits.slice(0, 3).join(', ') || 'Being explored',
    interests: memory.statedInterests.slice(0, 3).join(', ') || 'Being explored',
    rejectedDomains:
      memory.rejectedDomains.length > 0
        ? `Not interested: ${memory.rejectedDomains.join(', ')}`
        : 'No rejections yet',
    phase: memory.currentPhase,
    ready: memory.readinessForDecision ? '✓ Ready for decision' : 'Still exploring',
  }

  return `
=== ORIENTATION STATE ===
Phase: ${summary.phase}
Confidence: ${summary.confidence}

Confirmed Choices:
- Domain: ${summary.domain}
- Role: ${summary.role}

What We Know:
- Traits: ${summary.traits}
- Interests: ${summary.interests}
- Rejections: ${summary.rejectedDomains}

Status: ${summary.ready}
`.trim()
}
