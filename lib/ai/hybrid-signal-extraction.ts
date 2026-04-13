/**
 * HYBRID SIGNAL EXTRACTION LAYER
 * 
 * Combines:
 * 1. Fast rule-based extraction (instant)
 * 2. AI refinement via Groq (intelligent)
 * 3. Merged result (best of both)
 * 
 * This gives us speed + intelligence
 */

import { callGroqAPI } from '@/lib/groq-client'

export interface ExtractedSignals {
  // What the person told us
  statedInterests: string[]
  mentionedSkills: string[]
  impliedGoals: string[]

  // What we inferred
  traits: string[]
  workStylePreferences: string[]
  learningStylePreferences: string[]

  // Confidence levels
  confidenceLevel: 'high' | 'medium' | 'low'
  uncertaintyFactors: string[]

  // Next questions to ask
  suggestedQuestions: string[]

  // Source of extraction
  extractionMethod: 'rules' | 'ai' | 'hybrid'
  timestamp: number
}

// ============================================================================
// STEP 1: RULE-BASED EXTRACTION (FAST)
// ============================================================================

interface RuleSignals {
  interests: string[]
  traits: string[]
  workStyle: string[]
  learningStyle: string[]
  impliedGoals: string[]
}

function extractSignalsViaRules(userInput: string): RuleSignals {
  const lowerInput = userInput.toLowerCase()

  // Interest detection
  const interestPatterns: Record<string, string> = {
    'build|create|coding|development': 'Building & Coding',
    'data|analysis|statistics|numbers': 'Data & Analytics',
    'design|ui|ux|visual': 'Design & User Experience',
    'manage|lead|organize|people': 'Leadership & Management',
    'solve|problem|puzzle|challenge': 'Problem Solving',
    'automate|efficiency|scale|system': 'Systems & Automation',
    'security|protect|encrypt|risk': 'Security & Risk',
    'mobile|app|user-facing|frontend': 'User-Facing Products',
  }

  const interests: string[] = []
  for (const [pattern, interest] of Object.entries(interestPatterns)) {
    if (new RegExp(pattern).test(lowerInput)) {
      interests.push(interest)
    }
  }

  // Trait detection
  const traitPatterns: Record<string, string> = {
    'think|reason|logic|analytical': 'Analytical',
    'detail|precise|careful|meticulous': 'Detail-Oriented',
    'creative|imagine|novel|new': 'Creative',
    'patient|persistent|deep|focus': 'Patient & Focused',
    'communicate|explain|teach|share': 'Communicative',
    'curious|explore|learn|discover': 'Curious',
  }

  const traits: string[] = []
  for (const [pattern, trait] of Object.entries(traitPatterns)) {
    if (new RegExp(pattern).test(lowerInput)) {
      traits.push(trait)
    }
  }

  // Work style detection
  const workStylePatterns: Record<string, string> = {
    'alone|solo|independent|focus': 'Independent Worker',
    'team|collaborate|together|group': 'Collaborative',
    'fast|quick|agile|iterate': 'Fast-Paced',
    'stable|steady|reliable|predictable': 'Stable & Predictable',
    'flexible|adapt|change|dynamic': 'Dynamic & Changing',
    'structured|plan|process|organized': 'Structured & Organized',
  }

  const workStyle: string[] = []
  for (const [pattern, style] of Object.entries(workStylePatterns)) {
    if (new RegExp(pattern).test(lowerInput)) {
      workStyle.push(style)
    }
  }

  // Learning style detection
  const learningStylePatterns: Record<string, string> = {
    'hands.?on|build|project|code': 'Learning by Building',
    'reading|paper|theory|concept': 'Learning from Theory',
    'mentors|teach|guidance|help': 'Learning from Mentors',
    'communities|group|discuss': 'Learning via Community',
  }

  const learningStyle: string[] = []
  for (const [pattern, style] of Object.entries(learningStylePatterns)) {
    if (new RegExp(pattern).test(lowerInput)) {
      learningStyle.push(style)
    }
  }

  // Implied goals
  const impliedGoals: string[] = []
  if (lowerInput.includes('money') || lowerInput.includes('salary')) {
    impliedGoals.push('Financial Security')
  }
  if (lowerInput.includes('impact') || lowerInput.includes('change')) {
    impliedGoals.push('Make Impact')
  }
  if (lowerInput.includes('learn') || lowerInput.includes('grow')) {
    impliedGoals.push('Personal Growth')
  }
  if (lowerInput.includes('freedom') || lowerInput.includes('flexibility')) {
    impliedGoals.push('Work Flexibility')
  }
  if (lowerInput.includes('status') || lowerInput.includes('title')) {
    impliedGoals.push('Status & Recognition')
  }

  return {
    interests,
    traits,
    workStyle,
    learningStyle,
    impliedGoals,
  }
}

// ============================================================================
// STEP 2: AI REFINEMENT (INTELLIGENT)
// ============================================================================

interface AISignals {
  refinedTraits: string[]
  detectedIntentions: string[]
  uncertaintyLevel: 'clear' | 'confused' | 'exploring'
  suggestedQuestions: string[]
}

async function refineSignalsViaAI(userInput: string): Promise<AISignals> {
  try {
    const refinementPrompt = `
You are a career counselor analyzing what a student actually means, not just what they say.

USER INPUT: "${userInput}"

Extract and refine these signals:

1. REAL TRAITS (not just stated, but implied):
   - What personality traits does this person show?
   - How do they think (analytical, creative, social, etc)?
   - What drives them (money, impact, learning, validation)?

2. UNDERLYING INTENTIONS:
   - What are they really looking for in a career?
   - Is this about income, fulfillment, flexibility, status?
   - What's the unspoken need?

3. CERTAINTY LEVEL:
   - How clear are they about their direction?
   - Rate as: "clear" (knows what they want), "exploring" (curious), "confused" (lost)

4. NEXT QUESTIONS:
   - What 2-3 questions should we ask to understand them better?
   - Focus on the gaps in what they've told us

RESPOND AS JSON ONLY:
{
  "traits": ["trait1", "trait2"],
  "intentions": ["intention1"],
  "uncertaintyLevel": "exploring",
  "suggestedQuestions": ["question1?", "question2?"]
}
`

    const response = await callGroqAPI(
      [
        { role: 'system', content: 'You are a signal extraction assistant. Respond only with valid JSON.' },
        { role: 'user', content: refinementPrompt },
      ],
      0.6,
      500
    )

    try {
      const json = JSON.parse(response)
      return {
        refinedTraits: json.traits || [],
        detectedIntentions: json.intentions || [],
        uncertaintyLevel: json.uncertaintyLevel || 'exploring',
        suggestedQuestions: json.suggestedQuestions || [],
      }
    } catch {
      // If parse fails, return empty
      return {
        refinedTraits: [],
        detectedIntentions: [],
        uncertaintyLevel: 'exploring',
        suggestedQuestions: [],
      }
    }
  } catch (error) {
    console.error('AI signal refinement failed:', error)
    return {
      refinedTraits: [],
      detectedIntentions: [],
      uncertaintyLevel: 'exploring',
      suggestedQuestions: [],
    }
  }
}

// ============================================================================
// STEP 3: MERGE RESULTS (BEST OF BOTH)
// ============================================================================

export async function extractSignals(userInput: string): Promise<ExtractedSignals> {
  // Step 1: Fast extraction
  const ruleSignals = extractSignalsViaRules(userInput)

  // Step 2: AI refinement (in parallel)
  const aiSignals = await refineSignalsViaAI(userInput)

  // Step 3: Merge (rules are foundation, AI enhances)
  const mergedTraits = Array.from(
    new Set([...ruleSignals.traits, ...aiSignals.refinedTraits])
  )
  const mergedInterests = Array.from(new Set(ruleSignals.interests))

  // Determine extraction method
  const extractionMethod =
    aiSignals.refinedTraits.length > 0 && mergedTraits.length > ruleSignals.traits.length
      ? 'hybrid'
      : ruleSignals.traits.length > 0
        ? 'rules'
        : 'ai'

  return {
    statedInterests: mergedInterests,
    mentionedSkills: [], // Would extract from context
    impliedGoals: [...ruleSignals.impliedGoals, ...aiSignals.detectedIntentions],

    traits: mergedTraits,
    workStylePreferences: ruleSignals.workStyle,
    learningStylePreferences: ruleSignals.learningStyle,

    confidenceLevel:
      mergedTraits.length > 2 && mergedInterests.length > 1 ? 'high' : 'medium',
    uncertaintyFactors: aiSignals.uncertaintyLevel === 'confused' ? ['Needs more context'] : [],

    suggestedQuestions: aiSignals.suggestedQuestions,

    extractionMethod,
    timestamp: Date.now(),
  }
}

/**
 * Lightweight version (fast, rules only)
 * Used when speed matters more than accuracy
 */
export function extractSignalsFast(userInput: string): ExtractedSignals {
  const ruleSignals = extractSignalsViaRules(userInput)

  return {
    statedInterests: ruleSignals.interests,
    mentionedSkills: [],
    impliedGoals: ruleSignals.impliedGoals,

    traits: ruleSignals.traits,
    workStylePreferences: ruleSignals.workStyle,
    learningStylePreferences: ruleSignals.learningStyle,

    confidenceLevel: ruleSignals.traits.length > 1 ? 'medium' : 'low',
    uncertaintyFactors: [],
    suggestedQuestions: [],

    extractionMethod: 'rules',
    timestamp: Date.now(),
  }
}
