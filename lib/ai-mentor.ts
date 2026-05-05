/**
 * Professional Mentor System
 * - Single Groq API call per message (no racing, no OpenRouter)
 * - Focused on academics and skills development
 * - Blocks unrelated conversations
 * - Uses GROQ_MENTOR_KEY from .env
 */

interface MentorContext {
  userId: string
  role: string
  capabilityScore: number
  executionRate: number
  progressCount: number
  progressTotal: number
  weakSkills: string[]
  strongSkills: string[]
  recentActivity: string[]
  weeklyConsistency: number
  targetRole: string
}

interface MentorResponse {
  analysis: string
  insights: string[]
  nextSteps: string[]
  risks: string[]
  metrics: {
    capabilityScore: number
    executionRate: number
    progressCount: number
    progressTotal: number
  }
}

const SYSTEM_PROMPT = `You are an expert mentor who helps students with technical skills development and academic excellence. You're knowledgeable, professional, articulate, and genuinely interested in each student's progress.

PERSONALITY & STYLE:
- Conversational yet authoritative. Natural and human-like in communication
- Crisp and composed: deliver information clearly without unnecessary verbosity
- Adapts response length to question complexity (brief for simple questions, detailed for complex ones)
- Encouraging and constructive, never condescending
- Uses perfect English with excellent grammar and formatting
- When discussing performance, be honest but solutions-focused

HOW TO RESPOND:
- For simple contextual questions ("What are you?", "How can you help?"): Answer directly in 1-2 sentences, natural tone
- For academic/skill questions: Provide structured but natural advice
- For learning queries: Realistic timelines, honest assessment, actionable steps
- Always prioritize clarity and user value over formal structure

WHEN USING USER DATA:
- Reference specific metrics naturally in conversation (not as lists)
- Use their weak/strong skills to personalize guidance
- Connect performance patterns to actionable improvements
- Never generate fake metrics; only use provided data

TONE EXAMPLES:
- "I'm your academic mentor focused on helping you develop technical skills and track your learning progress."
- "Your execution rate is 45%, which suggests you're starting tasks but not completing them. Let's focus on finishing what you begin."
- "To learn Python in 10 days requires intensive daily practice—4-5 hours minimum. It's ambitious but feasible with structured effort and consistency."
- "Your strongest area is React, which is great. Let's use that momentum to strengthen your weaknesses in system design."

KEY RULES:
1. Always respond in clear, professional English
2. Match response length to question type: simple questions = brief answers
3. Never make up data. Use only provided student metrics
4. Be helpful, not restrictive. Answer questions about learning strategies, role transitions, skill building
5. For off-topic requests (jokes, recipes, unrelated topics): politely redirect with a friendly reminder`

/**
 * Single Groq API call - no racing, no OpenRouter
 * One message = one API call to keep costs low and performance predictable
 */
export async function getMentorResponse(
  userMessage: string,
  context: MentorContext
): Promise<MentorResponse> {
  console.log('[Mentor] Processing message:', userMessage)
  
  // Validate context
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

  // Check if the question is related to academics/skills
  const isAcademicQuestion = validateAcademicQuestion(userMessage)
  console.log('[Mentor] Academic question validation:', isAcademicQuestion)
  
  if (!isAcademicQuestion) {
    console.log('[Mentor] Rejecting off-topic question')
    return getOffTopicResponse()
  }

  console.log('[Mentor] Question accepted, building context for Groq API')
  
  const contextPrompt = `
STUDENT PROFILE:
• Role: ${context.role} → Target: ${context.targetRole}
• Capability Score: ${Math.round(context.capabilityScore)}%
• Execution Rate: ${Math.round(context.executionRate)}% (${context.progressCount}/${context.progressTotal} tasks completed)
• Weekly Consistency: ${Math.round(context.weeklyConsistency)}%

STRENGTHS:
${context.strongSkills.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')}

AREAS FOR DEVELOPMENT:
${context.weakSkills.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')}

RECENT ACTIVITY:
${context.recentActivity.slice(0, 5).map((a, i) => `${i + 1}. ${a}`).join('\n')}

STUDENT'S QUESTION: "${userMessage}"

Please provide a thoughtful, well-written response. Keep it natural and conversational. For simple questions, answer directly and concisely. For complex questions, provide structured advice. Use the student's data naturally to personalize your response when relevant.
`

  try {
    // SINGLE API CALL to Groq - no racing, predictable cost
    console.log('[Mentor] Calling Groq API with user context')
    const mentorResponse = await getGroqResponse(contextPrompt)

    console.log('[Mentor] Groq API successful')
    return {
      ...mentorResponse,
      metrics: {
        capabilityScore: Math.round(context.capabilityScore),
        executionRate: Math.round(context.executionRate),
        progressCount: context.progressCount,
        progressTotal: context.progressTotal,
      },
    }
  } catch (error) {
    console.error('[Mentor] Groq API failed:', error instanceof Error ? error.message : String(error))
    // Instant fallback with no delay
    return getFallbackResponse(context, userMessage)
  }
}

/**
 * Groq API Call - ONLY this API is used
 * Using GROQ_MENTOR_KEY from .env for the harsh IIT professor mentor
 */
async function getGroqResponse(contextPrompt: string): Promise<MentorResponse> {
  // Use GROQ_MENTOR_KEY as primary (user provided this specific key for mentor)
  const apiKey = process.env.GROQ_MENTOR_KEY || process.env.GROQ_AI_MENTOR_BACKUP_KEY
  if (!apiKey) {
    throw new Error('Groq mentor API key not configured (need GROQ_MENTOR_KEY or GROQ_AI_MENTOR_BACKUP_KEY)')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
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
      temperature: 0.8,
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = `Groq HTTP ${response.status}: ${JSON.stringify(errorData)}`
    console.error('[Groq Mentor]', errorMessage)
    throw new Error(errorMessage)
  }

  const data = (await response.json()) as any
  const content = data.choices?.[0]?.message?.content || ''

  if (!content) {
    throw new Error('Groq returned empty response')
  }

  console.log('[Mentor] Groq API call successful (1 call per message)')
  return parseAIResponse(content)
}

/**
 * Validate that question is appropriate to answer
 * Allow contextual questions about the mentor, learning, and skills
 * Only reject truly off-topic requests
 */
function validateAcademicQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase()

  // Explicit off-topic keywords that need rejection (jokes, unrelated topics)
  const strictlyOffTopic = [
    'tell me a joke', 'tell me joke', 'joke', 'funny', 'meme', 'recipe',
    'movie', 'film', 'sport', 'cricket', 'football', 'pizza', 'food', 'weather',
    'help me cheat', 'exam solution', 'assignment answer',
  ]

  // Check strictly off-topic
  for (const keyword of strictlyOffTopic) {
    if (lowerMessage.includes(keyword)) {
      console.log('[Mentor] Question rejected - strictly off-topic:', keyword)
      return false
    }
  }

  // Allow contextual questions
  const contextualKeywords = [
    'what are you', 'who are you', 'what can you help', 'what do you do',
    'how can you help', 'tell me about yourself', 'what is your role',
  ]

  const isContextual = contextualKeywords.some(kw => lowerMessage.includes(kw))
  
  // Academic/learning keywords
  const academicKeywords = [
    'skill', 'progress', 'capability', 'execute', 'task',
    'score', 'performance', 'weak', 'strong', 'learn', 'module', 'certification',
    'roadmap', 'goal', 'target', 'javascript', 'python', 'data structure',
    'algorithm', 'system design', 'database', 'api', 'backend', 'frontend',
    'deploy', 'test', 'debug', 'code', 'refactor', 'improve',
    'how can i', 'help me', 'how to', 'what should i', 'suggest',
    'recommend', 'guide me', 'teach me', 'best practice', 'career',
    'next step', 'improve', 'strengthen', 'focus',
  ]

  const hasAcademicKeyword = academicKeywords.some(keyword => lowerMessage.includes(keyword))
  const isLongEnough = message.trim().length > 3
  
  // Accept: contextual questions OR academic questions
  const isValid = (isContextual || hasAcademicKeyword) && isLongEnough
  
  if (!isValid) {
    console.log('[Mentor] Question appears off-topic:', message)
  }
  
  return isValid
}

/**
 * Response for off-topic questions
 * Friendly redirect without being judgmental
 */
function getOffTopicResponse(): MentorResponse {
  return {
    analysis: "I focus specifically on your academic progress and technical skill development. I can't help with unrelated topics, but I'm here to guide you on learning, skill gaps, and your roadmap.",
    insights: [
      "I'm most useful for discussing your technical progress and learning strategy",
      "Questions about your skills, performance, and capability are what I can address best",
      "Let's keep our conversations focused on driving you toward your goals",
    ],
    nextSteps: [
      "Ask me about your skill gaps and learning priorities",
      "Tell me what technical areas you'd like to improve",
      "Share your goals and I'll help you create a focused development plan",
    ],
    risks: ["Time wasting instead of focused learning", "Off-topic distractions derail your progress"],
    metrics: {
      capabilityScore: 0,
      executionRate: 0,
      progressCount: 0,
      progressTotal: 0,
    },
  }
}

/**
 * Parse AI response into structured format
 * More flexible to handle natural conversational responses
 */
function parseAIResponse(content: string): MentorResponse {
  // Try to extract structured sections
  const analysisMatch = content.match(/ANALYSIS[:\s]*([\s\S]*?)(?=INSIGHTS|$)/i)
  const insightsMatch = content.match(/INSIGHTS[:\s]*([\s\S]*?)(?=NEXT_STEPS|$)/i)
  const nextStepsMatch = content.match(/NEXT_STEPS[:\s]*([\s\S]*?)(?=RISKS|$)/i)
  const risksMatch = content.match(/RISKS[:\s]*([\s\S]*?)(?=$)/i)

  // If we have structured sections, use them
  if (analysisMatch) {
    const analysis = (analysisMatch?.[1] || '').trim()
    const rawInsights = (insightsMatch?.[1] || '').trim()
    const rawNextSteps = (nextStepsMatch?.[1] || '').trim()
    const rawRisks = (risksMatch?.[1] || '').trim()

    const insights = extractUniqueBulletPoints(rawInsights, 3)
    const nextSteps = extractUniqueBulletPoints(rawNextSteps, 3)
    const risks = extractUniqueBulletPoints(rawRisks, 3)

    const uniqueInsights = removeDuplicates(insights, [...nextSteps, ...risks])
    const uniqueNextSteps = removeDuplicates(nextSteps, [...insights, ...risks])
    const uniqueRisks = removeDuplicates(risks, [...insights, ...nextSteps])

    return {
      analysis: analysis || content.substring(0, 200),
      insights: uniqueInsights.length > 0 ? uniqueInsights : [content.substring(0, 150)],
      nextSteps: uniqueNextSteps.length > 0 ? uniqueNextSteps : [],
      risks: uniqueRisks,
    }
  }

  // Otherwise, treat the entire response as natural conversation (single analysis)
  return {
    analysis: content.trim(),
    insights: [],
    nextSteps: [],
    risks: [],
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

/**
 * Fallback response when API fails
 * Provides professional, well-written guidance
 */
function getFallbackResponse(context: MentorContext, userMessage: string): MentorResponse {
  // If question is about who/what the mentor is, provide a direct answer
  if (userMessage.toLowerCase().includes('what are you') || 
      userMessage.toLowerCase().includes('who are you') ||
      userMessage.toLowerCase().includes('tell me about yourself')) {
    return {
      analysis: "I'm your academic mentor—here to help you develop technical skills, track your learning progress, and provide honest feedback on your performance. I focus on helping you reach your goals through structured guidance and data-driven insights.",
      insights: [],
      nextSteps: [],
      risks: [],
      metrics: {
        capabilityScore: Math.round(context.capabilityScore),
        executionRate: Math.round(context.executionRate),
        progressCount: context.progressCount,
        progressTotal: context.progressTotal,
      },
    }
  }

  // For learning-related questions without API, provide solid guidance
  const insights: string[] = []
  const nextSteps: string[] = []
  const risks: string[] = []

  // Professional insights based on actual data
  if (context.executionRate < 50) {
    insights.push(`With an execution rate of ${Math.round(context.executionRate)}%, you're starting tasks but not completing them. The key is to prioritize finishing what you begin before taking on new work.`)
  } else if (context.executionRate < 75) {
    insights.push(`Your execution rate of ${Math.round(context.executionRate)}% shows room for improvement. Aim for 80%+ by being more intentional about task prioritization and completion.`)
  } else if (context.executionRate < 90) {
    insights.push(`Your ${Math.round(context.executionRate)}% execution rate is solid—shows good discipline. Push toward 95%+ to maximize your learning outcomes.`)
  } else {
    insights.push(`Your ${Math.round(context.executionRate)}% execution rate demonstrates excellent follow-through and commitment.`)
  }

  if (context.weeklyConsistency < 50) {
    insights.push(`Your weekly consistency of ${Math.round(context.weeklyConsistency)}% indicates sporadic effort. Establishing a fixed schedule will dramatically improve your retention and progress.`)
  } else if (context.weeklyConsistency < 75) {
    insights.push(`At ${Math.round(context.weeklyConsistency)}% consistency, you're building habits but need more structure. High performers maintain 85%+ through disciplined routines.`)
  } else {
    insights.push(`Your ${Math.round(context.weeklyConsistency)}% consistency is excellent. This discipline is a major asset in your learning journey.`)
  }

  if (context.strongSkills.length > 0 && context.weakSkills.length > 0) {
    insights.push(`Your strength in ${context.strongSkills[0]} is valuable—leverage it. Meanwhile, dedicate focused time to ${context.weakSkills[0]} to create more balanced capabilities.`)
  }

  // Constructive next steps
  if (context.executionRate < 70) {
    nextSteps.push('Finish current tasks before starting new ones. Create a tracking system to visualize and close open items.')
  }
  if (context.weeklyConsistency < 70) {
    nextSteps.push('Set a fixed study schedule—4-5 hours daily, same times each day. Consistency builds compounding results.')
  }
  if (context.weakSkills.length > 0) {
    nextSteps.push(`Dedicate 1.5-2 hours daily to ${context.weakSkills[0]}. Consistent, focused practice yields measurable improvement.`)
  } else {
    nextSteps.push('Continue strengthening your skills while exploring adjacent technical areas.')
  }

  // Risk assessment
  if (context.executionRate < 50) {
    risks.push('Low completion rates create knowledge gaps. Shift your focus from breadth to depth.')
  }
  if (context.weeklyConsistency < 40) {
    risks.push('Inconsistent effort patterns significantly impede learning. Establishing routine is foundational.')
  }
  if (context.capabilityScore < 30) {
    risks.push('Current capability level requires intensive, structured focus. A personalized development plan would help.')
  }

  const analysis = `Your capability score is ${Math.round(context.capabilityScore)}%, with ${Math.round(context.executionRate)}% task completion and ${context.progressCount}/${context.progressTotal} modules completed. There are clear opportunities to improve through better execution and consistency.`

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
