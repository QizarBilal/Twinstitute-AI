/**
 * AGENT PSYCHOLOGY LAYER
 * 
 * Makes the decision system feel like a real mentor:
 * - Reflection moments (pause to summarize understanding)
 * - Intelligent pushback (challenge user's assumptions)
 * - Decision tension (realistic concerns before finalizing)
 * 
 * THIS IS WHAT MAKES IT "ALIVE"
 */

import { AgentMemory } from './agent-memory'
import { ExtractedSignals } from './hybrid-signal-extraction'

// ============================================================================
// REFLECTION MOMENTS
// ============================================================================

/**
 * Generate a reflection moment after sufficient conversation
 * "Let me pause and summarize what I'm seeing..."
 */
export function generateReflectionMoment(
  memory: AgentMemory,
  signals: ExtractedSignals
): string | null {
  // Trigger after 3+ turns with enough confidence
  if (memory.conversationTurns < 3) return null
  if (memory.detectedTraits.length < 2 || memory.statedInterests.length < 2) return null

  const traits = memory.detectedTraits.slice(0, 3).join(', ')
  const interests = memory.statedInterests.slice(0, 2).join(', ')
  const goals = memory.impliedGoals.slice(0, 2).join(', ')

  return `
Let me pause and reflect on what I'm seeing about you so far:

**Your Core Patterns:**
• You value: ${interests}
• You show traits of: ${traits}
• You're driven by: ${goals}

This combination tells me something specific — you're not looking 
for just any tech path. You want **impact + autonomy + technical depth**.

That's getting clearer to me. Before we narrow it down, 
I want to test something with you...
`.trim()
}

// ============================================================================
// INTELLIGENT PUSHBACK
// ============================================================================

export interface PushbackPoint {
  assumption: string
  challenge: string
  testQuestion: string
}

/**
 * Generate pushback questions that test if user's choice is real or surface-level
 */
export function generateIntelligentPushback(
  memory: AgentMemory,
  selectedDomain: string | null,
  selectedRole: string | null
): PushbackPoint | null {
  if (!selectedRole) return null

  // Build context-specific pushback
  const pushbackMap: Record<string, PushbackPoint> = {
    'Backend Engineer': {
      assumption: 'You think you want deep technical work',
      challenge:
        'Backend is unglamorous — you spend 40% debugging other people\'s issues, not building new features.',
      testQuestion:
        'Have you actually enjoyed debugging complex problems before? Or do you prefer building new things?',
    },

    'Frontend Engineer': {
      assumption: 'You want to see immediate visual feedback',
      challenge:
        'Frontend is the most competitive market. You\'ll compete with 10k bootcamp grads for jobs. Burnout is high from design perfectionism.',
      testQuestion:
        'Are you the type to obsess over pixels? Or do you get frustrated by design constraints?',
    },

    'Data Scientist': {
      assumption: 'You like "AI" and "machine learning"',
      challenge:
        '90% of data science is data cleaning, not modeling. You won\'t touch ML for 18 months.',
      testQuestion:
        'Do you actually enjoy statistical analysis and deep exploration? Or do you just like the prestige of the title?',
    },

    'DevOps Engineer': {
      assumption: 'You want to solve infrastructure problems',
      challenge:
        'You\'re oncall at 3am when servers crash. You\'re grateful when *nothing* breaks. It\'s different from building.',
      testQuestion:
        'Can you commit to unpredictable incident response? Or do you need predictable working hours?',
    },

    'Product Manager': {
      assumption: 'You want to "lead" and make big decisions',
      challenge:
        'Product managers have zero execution power. You negotiate constantly. Engineers often ignore your suggestions.',
      testQuestion:
        'Are you comfortable influencing without authority? Or do you need direct control over outcomes?',
    },
  }

  return pushbackMap[selectedRole] || null
}

// ============================================================================
// DECISION TENSION
// ============================================================================

export interface DecisionTensionMoment {
  role: string
  domain: string
  pros: string[]
  cons: string[]
  finalChallenge: string
}

/**
 * Generate the final tension moment before commitment
 * "Here's what you're actually committing to..."
 */
export function generateDecisionTension(
  role: string,
  domain: string
): DecisionTensionMoment {
  const tensionMap: Record<string, DecisionTensionMoment> = {
    'Backend Engineer': {
      role: 'Backend Engineer',
      domain: 'Software Engineering',
      pros: [
        '✔ Very strong job market (huge demand)',
        '✔ High salary trajectory ($200k+ possible)',
        '✔ Deep technical growth path',
        '✔ Most control over architecture',
      ],
      cons: [
        '⚠ Lowest visibility (frontend gets credit)',
        '⚠ On-call responsibility expected',
        '⚠ Heavy competition from bootcamp grads',
        '⚠ Burnout from complex debugging',
      ],
      finalChallenge: `You're choosing Backend Engineering.

This means:
• You accept being "invisible" while frontend gets PR
• You accept occasional on-call (not common, but real)
• You accept 18 months before you feel truly senior
• You commit to deep technical learning (not for everyone)

Is this still what you want? Or does the invisibility bother you?`,
    },

    'Frontend Engineer': {
      role: 'Frontend Engineer',
      domain: 'Software Engineering',
      pros: [
        '✔ Immediate visual feedback (satisfying)',
        '✔ User-facing impact is clear',
        '✔ Creative problem-solving',
        '✔ Design collaboration is interesting',
      ],
      cons: [
        '⚠ Most competitive market (high burnout)',
        '⚠ Design perfectionism pressure',
        '⚠ Less "technical depth" than backend',
        '⚠ Salary slightly lower ($125k vs $130k)',
      ],
      finalChallenge: `You're choosing Frontend Engineering.

This means:
• You embrace design perfectionism
• You're okay with high competition for jobs
• You care about user experience more than architecture
• You sacrifice technical depth for immediate impact

Does this align with who you are?`,
    },

    'Data Scientist': {
      role: 'Data Scientist',
      domain: 'Data & AI',
      pros: [
        '✔ Cutting-edge technology',
        '✔ Problem-solving focus',
        '✔ Strategic impact potential',
        '✔ High prestige and compensation',
      ],
      cons: [
        '⚠ 90% is data cleaning, 10% modeling',
        '⚠ Hard to show impact (slow feedback loops)',
        '⚠ Requires strong math foundation',
        '⚠ Not bootcamp-friendly (longer path)',
      ],
      finalChallenge: `You're choosing Data Science.

This means:
• You commit to 18+ months before touching real ML
• You accept slow feedback loops
• You need strong statistics background
• You agree to solve "boring" data problems first

Are you genuinely excited about exploration over impact?`,
    },

    'DevOps Engineer': {
      role: 'DevOps Engineer',
      domain: 'Infrastructure & Systems',
      pros: [
        '✔ Highest salary potential ($230k+)',
        '✔ Rare skill set (less competition)',
        '✔ Critical to company success',
        '✔ Problem-solving at scale',
      ],
      cons: [
        '⚠ 3am incident response is real',
        '⚠ "Success" means nothing breaks (invisible)',
        '⚠ High burnout in startups',
        '⚠ Requires systems knowledge (steep curve)',
      ],
      finalChallenge: `You're choosing DevOps Engineering.

This means:
• Your work is "invisible when it works"
• You accept on-call burden
• You commit to deep systems learning
• You need patience with infrastructure problems

Can you handle being the person nobody thanks?`,
    },

    'Product Manager': {
      role: 'Product Manager',
      domain: 'Product & Strategy',
      pros: [
        '✔ High visibility and influence',
        '✔ Strategic decision-making',
        '✔ Huge salary potential',
        '✔ Direct business impact',
      ],
      cons: [
        '⚠ Zero execution power (depend on others)',
        '⚠ Constant negotiation and politics',
        '⚠ Success depends on luck and team',
        '⚠ Most competitive role to land',
      ],
      finalChallenge: `You're choosing Product Management.

This means:
• You lead without authority
• You spend 40% of time in meetings
• Your success depends on engineers and designers
• You navigate politics constantly

Are you excited about influence without control?`,
    },
  }

  return tensionMap[role] || {
    role,
    domain,
    pros: [],
    cons: [],
    finalChallenge: `You're choosing ${role} in ${domain}.\n\nAre you ready to commit?`,
  }
}

// ============================================================================
// TECHNICAL GUARDRAILS
// ============================================================================

/**
 * GUARDRAIL 1: AI Confidence Threshold
 * If AI extraction confidence is too low, fall back to rules
 */
export function applyAIConfidenceGuardrail(
  aiSignals: any,
  ruleSignals: any,
  aiConfidence: number
): any {
  const MIN_CONFIDENCE = 0.6

  if (aiConfidence < MIN_CONFIDENCE) {
    // Fall back to rule-based signals
    console.warn(
      `AI confidence (${aiConfidence.toFixed(2)}) below threshold. Using rule-based signals only.`
    )

    return {
      ...ruleSignals,
      extraction_method: 'rules_only_low_ai_confidence',
      ai_fallback_reason: `AI confidence ${(aiConfidence * 100).toFixed(0)}% below ${(MIN_CONFIDENCE * 100).toFixed(0)}% threshold`,
    }
  }

  return aiSignals
}

/**
 * GUARDRAIL 2: Memory Decay on Contradiction
 * If user contradicts previous choice, reduce confidence and mark as unstable
 */
export function applyMemoryDecayOnContradiction(
  memory: AgentMemory,
  newSignals: ExtractedSignals
): AgentMemory {
  const updated = { ...memory }

  // Check for contradictions with previous interests
  const prevInterests = memory.statedInterests || []
  const newInterests = newSignals.statedInterests || []

  // Detect if user is changing direction
  const contradictingInterests = prevInterests.filter(
    (prev) => !newInterests.some((n) => n.toLowerCase().includes(prev.toLowerCase()))
  )

  if (contradictingInterests.length > 0 && memory.statedInterests.length > 0) {
    // User is contradicting previous signals
    console.log(`Contradiction detected: ${contradictingInterests.join(', ')}`)

    // Reduce confidence
    updated.confidenceLevel = Math.max(0, updated.confidenceLevel - 20)

    // Mark previous signals as unstable
    updated.uncertaintyAreas.push('Previous signals contradicted')

    // Reset the open question about direction
    updated.openQuestions = [
      'It sounds like your priorities may have shifted — is that right?',
      ...updated.openQuestions,
    ]

    updated.readinessForDecision = false
  }

  return updated
}

/**
 * Check if memory and signals are contradictory
 */
export function detectMemoryContradictions(
  memory: AgentMemory,
  newSignals: ExtractedSignals
): string[] {
  const contradictions: string[] = []

  // Example: User said they like on-call, but rejected DevOps
  if (
    memory.rejectedDomains.includes('Infrastructure & Systems') &&
    newSignals.impliedGoals.some((g) => g.includes('reliability') || g.includes('systems'))
  ) {
    contradictions.push(
      'User rejected DevOps but signals suggest systems-thinking interest'
    )
  }

  // Example: User chose Backend but asks about visual design
  if (
    memory.confirmedRole === 'Backend Engineer' &&
    newSignals.statedInterests.some((i) => i.includes('Design') || i.includes('Visual'))
  ) {
    contradictions.push('User chose Backend but showing interest in visual feedback')
  }

  return contradictions
}
