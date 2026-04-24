import Anthropic from '@anthropic-ai/sdk'

// STRICT INPUT CONTRACT - Only real system data
interface MentorContext {
  userId: string
  role: string
  // Computed real metrics
  capabilityScore: number // 0-100, computed from system
  executionRate: number // 0-100, completed/total tasks
  progressCount: number // completed modules
  progressTotal: number // total modules
  // User performance data
  weakSkills: string[] // Names of bottom 3 skills
  strongSkills: string[] // Names of top 3 skills
  recentActivity: string[] // Last 3-5 activities
  weeklyConsistency: number // 0-100
  // Context only
  targetRole: string
}

interface MentorResponse {
  analysis: string // Grounded explanation of user state (NO METRICS)
  insights: string[] // 2-3 actual insights (NOT DUPLICATED)
  nextSteps: string[] // 2-3 action items (NOT DUPLICATED)
  risks: string[] // Risk factors or empty array
  // Computed metrics for UI display
  metrics: {
    capabilityScore: number
    executionRate: number
    progressCount: number
    progressTotal: number
  }
}

const SYSTEM_PROMPT = `You are a senior mentor at a top engineering institution. You analyze REAL user data and explain what it means.

CRITICAL RULES:
1. NEVER generate, invent, or estimate metrics. Use ONLY the data provided.
2. NEVER repeat the same insight/action in multiple sections.
3. Be specific and grounded. Use the actual numbers provided.
4. Do NOT use generic phrases like "allocate 10 hours" or "aim to reach 90%".
5. Focus on EXPLAINING the data and providing ACTIONABLE next steps.
6. Be direct. No motivational fluff.

Your user data includes:
- Capability Score (0-100)
- Execution Rate (completed/total tasks)
- Progress (modules completed/total)
- Weekly Consistency (0-100)
- Weak Skills (bottom 3)
- Strong Skills (top 3)
- Recent Activity (last 3-5 actions)

Your response MUST have exactly these 4 sections:
1. ANALYSIS: Explain what their data shows about their current state (2-3 sentences)
2. INSIGHTS: 2-3 specific observations about their progress (bullet points)
3. NEXT_STEPS: 2-3 prioritized actions based on their data (bullet points)
4. RISKS: Any concerning patterns (empty list if none)

Format each section clearly with the section name, then the content.`

export async function getMentorResponse(
  userMessage: string,
  context: MentorContext
): Promise<MentorResponse> {
  // Validate context - no undefined values allowed
  if (
    context.capabilityScore === undefined ||
    context.executionRate === undefined ||
    context.progressCount === undefined ||
    context.progressTotal === undefined ||
    !context.weakSkills ||
    !context.strongSkills ||
    !context.recentActivity
  ) {
    console.warn('[Mentor] Incomplete context, using fallback')
    return getFallbackResponse(context, userMessage)
  }

  const contextPrompt = `
User Data:
- Role: ${context.role} → Target: ${context.targetRole}
- Capability Score: ${Math.round(context.capabilityScore)}%
- Execution Rate: ${Math.round(context.executionRate)}% (${context.progressCount}/${context.progressTotal} tasks completed)
- Weekly Consistency: ${Math.round(context.weeklyConsistency)}%
- Progress: ${context.progressCount}/${context.progressTotal} modules

Strongest Skills:
${context.strongSkills.slice(0, 3).map((s) => `- ${s}`).join('\n')}

Weakest Skills:
${context.weakSkills.slice(0, 3).map((s) => `- ${s}`).join('\n')}

Recent Activity:
${context.recentActivity.slice(0, 5).map((a) => `- ${a}`).join('\n')}

User Question: ${userMessage}

Remember: Analyze this data. Do NOT invent metrics. Each section must be distinct with no duplication.
`

  try {
    // Race both APIs in parallel - whichever responds first wins
    const aiResponse = await Promise.race([
      getOpenRouterResponse(contextPrompt, userMessage),
      getGroqResponse(contextPrompt, userMessage),
      createTimeoutPromise(6000), // 6 second absolute timeout
    ])

    console.log('[Mentor] API response received successfully')
    
    // Add computed metrics to response
    return {
      ...aiResponse,
      metrics: {
        capabilityScore: Math.round(context.capabilityScore),
        executionRate: Math.round(context.executionRate),
        progressCount: context.progressCount,
        progressTotal: context.progressTotal,
      },
    }
  } catch (error) {
    console.error('[Mentor] Both APIs failed, using fallback:', error instanceof Error ? error.message : String(error))
    // Instant fallback - no delay
    return getFallbackResponse(context, userMessage)
  }
}

// Create a promise that rejects after specified time
function createTimeoutPromise(ms: number): Promise<MentorResponse> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  )
}

async function getOpenRouterResponse(
  contextPrompt: string,
  userMessage: string
): Promise<MentorResponse> {
  const apiKey = process.env.Open_Router_AI_Mentor_Key
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: contextPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = `OpenRouter HTTP ${response.status}: ${JSON.stringify(errorData)}`
    console.error('[OpenRouter]', errorMessage)
    throw new Error(errorMessage)
  }

  const data = (await response.json()) as any
  const content = data.choices?.[0]?.message?.content || ''

  if (!content) {
    throw new Error('OpenRouter returned empty response')
  }

  console.log('[Mentor] OpenRouter success')
  return parseAIResponse(content)
}

async function getGroqResponse(
  contextPrompt: string,
  userMessage: string
): Promise<MentorResponse> {
  const apiKey = process.env.GROQ_AI_MENTOR_BACKUP_KEY
  if (!apiKey) {
    throw new Error('Groq API key not configured')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // Same model as orientation, roadmap, skill genome
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: contextPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = `Groq HTTP ${response.status}: ${JSON.stringify(errorData)}`
    console.error('[Groq]', errorMessage)
    throw new Error(errorMessage)
  }

  const data = (await response.json()) as any
  const content = data.choices?.[0]?.message?.content || ''

  if (!content) {
    throw new Error('Groq returned empty response')
  }

  console.log('[Mentor] Groq success')
  return parseAIResponse(content)
}

function parseAIResponse(content: string): MentorResponse {
  // Extract sections based on section markers
  const analysisMatch = content.match(/ANALYSIS[:\s]*([\s\S]*?)(?=INSIGHTS|$)/i)
  const insightsMatch = content.match(/INSIGHTS[:\s]*([\s\S]*?)(?=NEXT_STEPS|$)/i)
  const nextStepsMatch = content.match(/NEXT_STEPS[:\s]*([\s\S]*?)(?=RISKS|$)/i)
  const risksMatch = content.match(/RISKS[:\s]*([\s\S]*?)(?=$)/i)

  const analysis = (analysisMatch?.[1] || '').trim()
  const rawInsights = (insightsMatch?.[1] || '').trim()
  const rawNextSteps = (nextStepsMatch?.[1] || '').trim()
  const rawRisks = (risksMatch?.[1] || '').trim()

  // Extract bullet points - only take 2-3 unique items per section
  const insights = extractUniqueBulletPoints(rawInsights, 3)
  const nextSteps = extractUniqueBulletPoints(rawNextSteps, 3)
  const risks = extractUniqueBulletPoints(rawRisks, 3)

  // Remove duplicate content across sections
  const uniqueInsights = removeDuplicates(insights, [...nextSteps, ...risks])
  const uniqueNextSteps = removeDuplicates(nextSteps, [...insights, ...risks])
  const uniqueRisks = removeDuplicates(risks, [...insights, ...nextSteps])

  return {
    analysis: analysis || 'Analysis not available',
    insights: uniqueInsights,
    nextSteps: uniqueNextSteps,
    risks: uniqueRisks,
  }
}

function extractUniqueBulletPoints(text: string, limit: number): string[] {
  if (!text.trim()) return []

  const points: string[] = []
  const seen = new Set<string>()
  const lines = text.split('\n')

  for (const line of lines) {
    if (line.includes('-') || line.includes('•') || line.includes('*') || line.match(/^\d+\./)) {
      const cleaned = line
        .replace(/^[-•*]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .trim()

      if (cleaned && cleaned.length > 5 && !seen.has(cleaned)) {
        points.push(cleaned)
        seen.add(cleaned)
        if (points.length >= limit) break
      }
    }
  }

  return points
}

function removeDuplicates(items: string[], otherItems: string[]): string[] {
  const otherLower = otherItems.map((s) => s.toLowerCase())
  return items.filter((item) => {
    const itemLower = item.toLowerCase()
    return !otherLower.some((other) => other.includes(itemLower) || itemLower.includes(other))
  })
}

function getFallbackResponse(context: MentorContext, _userMessage: string): MentorResponse {
  // Build insights only from actual data - NO hallucination
  const insights: string[] = []
  const nextSteps: string[] = []
  const risks: string[] = []

  // Insight 1: Execution rate
  if (context.executionRate < 50) {
    insights.push(`Your execution rate of ${Math.round(context.executionRate)}% suggests you're completing less than half of attempted tasks`)
  } else if (context.executionRate < 75) {
    insights.push(`Your execution rate of ${Math.round(context.executionRate)}% shows moderate task completion; there's room for improvement`)
  } else {
    insights.push(`Your execution rate of ${Math.round(context.executionRate)}% indicates strong task completion discipline`)
  }

  // Insight 2: Consistency
  if (context.weeklyConsistency < 50) {
    insights.push(`Weekly consistency at ${Math.round(context.weeklyConsistency)}% indicates irregular engagement patterns`)
  } else {
    insights.push(`You maintain ${Math.round(context.weeklyConsistency)}% weekly consistency, which is a strong foundation`)
  }

  // Insight 3: Skill gap
  if (context.strongSkills.length > 0 && context.weakSkills.length > 0) {
    insights.push(
      `Clear skill differentiation: strong in ${context.strongSkills[0]}, needs work in ${context.weakSkills[0]}`
    )
  }

  // Next steps based on weakest areas
  if (context.executionRate < 70) {
    nextSteps.push('Focus on completing your current module before starting new ones')
  }
  if (context.weeklyConsistency < 70) {
    nextSteps.push('Establish a consistent weekly engagement schedule - even 3 sessions per week is better than sporadic intensity')
  }
  if (context.weakSkills.length > 0) {
    nextSteps.push(`Practice ${context.weakSkills[0]} with focused exercises from your current roadmap`)
  }

  // Risks - only if actual data shows problems
  if (context.executionRate < 50) {
    risks.push('Low execution rate may delay role readiness progress')
  }
  if (context.weeklyConsistency < 40) {
    risks.push('Inconsistent engagement makes it harder to build momentum')
  }

  const analysis = `Your current state: ${Math.round(context.capabilityScore)}% capability, ${Math.round(context.executionRate)}% task completion, ${context.progressCount}/${context.progressTotal} modules completed. Based on this data, your key opportunity is to improve consistency and execution rate.`

  return {
    analysis,
    insights: insights.slice(0, 3),
    nextSteps: nextSteps.slice(0, 3),
    risks,
    metrics: {
      capabilityScore: Math.round(context.capabilityScore),
      executionRate: Math.round(context.executionRate),
      progressCount: context.progressCount,
      progressTotal: context.progressTotal,
    },
  }
}
