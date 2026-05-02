/**
 * Strict IIT Professor Mentor System
 * - Single Groq API call per message (no racing, no OpenRouter)
 * - Harsh, focused on academics and skills
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

const SYSTEM_PROMPT = `You are a STRICT, HARSH IIT professor mentor. Speak ONLY in ENGLISH. Do not use Hindi or mixed languages.

You don't tolerate nonsense and focus ONLY on academics, technical skills, and execution excellence. This is an institution for rigorous learning - not casual chat.

PERSONALITY TRAITS:
- Direct and no-nonsense. No sugar-coating or motivational speeches.
- Speak like an IIT professor: use technical terms, expect excellence, demand accountability.
- Example tone: "Your execution rate is abysmal. You're completing barely half your tasks. Stop making excuses and buckle down."
- Be brutally honest about performance gaps and weaknesses
- Demand action and improvement, not hope or empty promises

CRITICAL RULES:
1. SPEAK ONLY IN ENGLISH - Do NOT mix Hindi, do NOT use Hindi phrases
2. NEVER generate metrics - use ONLY provided data.
3. Be brutally honest about performance gaps.
4. If the question is NOT about: academics, skills, technical progress, capability roadmap, or execution - REJECT IT.
5. Use actual numbers provided from user data. No generics or hallucinations.
6. Demand action, not hope.
7. Always reference specific user metrics and weak areas to personalize your response

USER DATA PROVIDED:
- Capability Score (0-100)
- Execution Rate (completed/total tasks)
- Progress (modules completed/total)
- Weekly Consistency (0-100)
- Weak Skills (bottom 3)
- Strong Skills (top 3)
- Recent Activity (last 3-5 actions)

RESPONSE FORMAT (exactly these 4 sections):
1. ANALYSIS: Harsh assessment of current state (1-2 sentences, direct, use provided numbers)
2. INSIGHTS: 2-3 specific technical observations (bullet points, based on actual data)
3. NEXT_STEPS: 2-3 hard actions to take immediately (bullet points, demand-based, specific)
4. RISKS: Concerning patterns or threats to progress (based on provided metrics)

TONE EXAMPLES:
- "Your execution rate is 38%. That means you're abandoning 62% of your tasks. This is pathetic."
- "JavaScript is in your weak skills list. You need 2 hours daily practice until it becomes strong."
- "Your weekly consistency is 25%. You're all over the place. Set a fixed schedule now."
- "No consistency means no learning. Fix this immediately."

Remember: You're an IIT professor. Act like it. Be harsh but fair. Demand excellence. Always speak in ENGLISH.`

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

Student Question: "${userMessage}"

Be harsh, be direct, be an IIT professor. Use the specific numbers and data provided. Always speak in ENGLISH. No Hindi.
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
 * Validate that question is academic/skills related
 * Blocks off-topic conversations like casual chat, jokes, etc.
 */
function validateAcademicQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase()

  // Off-topic keywords that trigger rejection (strict list)
  const offTopicKeywords = [
    'tell me a joke', 'tell me joke', 'joke', 'funny', 'meme', 'recipe',
    'movie', 'film', 'game', 'sport', 'cricket', 'football', 'music',
    'pizza', 'food', 'weather', 'bollywood', 'love', 'girlfriend',
    'boyfriend', 'dating', 'relationship', 'day off', 'party',
    'help me cheat', 'exam solution', 'assignment answer', 'please do my homework',
    'what are you', 'what is your name', 'who are you', 'tell me about',
  ]

  // Check if this is explicitly off-topic
  for (const keyword of offTopicKeywords) {
    if (lowerMessage.includes(keyword)) {
      console.log('[Mentor] Question rejected - off-topic keyword:', keyword)
      return false
    }
  }

  // Academic keywords that confirm relevance
  const academicKeywords = [
    'skill', 'progress', 'capability', 'execute', 'assignment', 'lab', 'task',
    'score', 'performance', 'weak', 'strong', 'learn', 'module', 'certification',
    'roadmap', 'goal', 'target', 'javascript', 'python', 'data structure',
    'algorithm', 'system design', 'database', 'api', 'backend', 'frontend',
    'deploy', 'test', 'debug', 'code', 'refactor', 'improve',
    'how can i', 'help me', 'how to', 'what should i', 'suggest',
    'recommend', 'guide me', 'show me', 'teach me', 'best practice',
  ]

  const hasAcademicKeyword = academicKeywords.some(keyword => lowerMessage.includes(keyword))
  const isLongEnough = message.trim().length > 3

  // More lenient: accept if has academic keyword and is substantial enough
  // Question mark is NOT required anymore (people say "Tell me how to improve" without ?)
  const isValid = hasAcademicKeyword && isLongEnough
  
  if (!isValid) {
    console.log('[Mentor] Question rejected - not academic enough:', message)
  }
  
  return isValid
}

/**
 * Response for off-topic questions
 * Harsh and direct, in ENGLISH per IIT professor style
 */
function getOffTopicResponse(): MentorResponse {
  return {
    analysis: 'I am an academics and skills-focused mentor only. Off-topic questions waste your limited API calls. Ask me about your technical progress instead.',
    insights: [
      'Your question is not related to your capability roadmap or technical skills',
      'Stop wasting time on irrelevant topics and focus on structured learning',
      'Every API call should drive you closer to your target role',
    ],
    nextSteps: [
      'Ask me about your skill gaps and how to improve them',
      'Request a performance review based on your execution rate and capability score',
      'Tell me which modules you are struggling with and I will give you a harsh but fair assessment',
    ],
    risks: ['Time wasting instead of focused learning', 'Off-topic distractions derail your progress'],
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
 * Extract sections: ANALYSIS, INSIGHTS, NEXT_STEPS, RISKS
 */
function parseAIResponse(content: string): MentorResponse {
  const analysisMatch = content.match(/ANALYSIS[:\s]*([\s\S]*?)(?=INSIGHTS|$)/i)
  const insightsMatch = content.match(/INSIGHTS[:\s]*([\s\S]*?)(?=NEXT_STEPS|$)/i)
  const nextStepsMatch = content.match(/NEXT_STEPS[:\s]*([\s\S]*?)(?=RISKS|$)/i)
  const risksMatch = content.match(/RISKS[:\s]*([\s\S]*?)(?=$)/i)

  const analysis = (analysisMatch?.[1] || '').trim()
  const rawInsights = (insightsMatch?.[1] || '').trim()
  const rawNextSteps = (nextStepsMatch?.[1] || '').trim()
  const rawRisks = (risksMatch?.[1] || '').trim()

  // Extract bullet points - 2-3 unique items per section
  const insights = extractUniqueBulletPoints(rawInsights, 3)
  const nextSteps = extractUniqueBulletPoints(rawNextSteps, 3)
  const risks = extractUniqueBulletPoints(rawRisks, 3)

  // Remove duplicates across sections
  const uniqueInsights = removeDuplicates(insights, [...nextSteps, ...risks])
  const uniqueNextSteps = removeDuplicates(nextSteps, [...insights, ...risks])
  const uniqueRisks = removeDuplicates(risks, [...insights, ...nextSteps])

  return {
    analysis: analysis || 'Your focus is scattered. Get back to basics.',
    insights: uniqueInsights.length > 0 ? uniqueInsights : ['Execution rate needs immediate attention'],
    nextSteps: uniqueNextSteps.length > 0 ? uniqueNextSteps : ['Stop procrastinating. Start now.'],
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

/**
 * Fallback response when API fails
 * Still maintains harsh IIT professor tone
 */
function getFallbackResponse(context: MentorContext, _userMessage: string): MentorResponse {
  const insights: string[] = []
  const nextSteps: string[] = []
  const risks: string[] = []

  // Brutal insights based on actual data
  if (context.executionRate < 50) {
    insights.push(`${Math.round(context.executionRate)}% execution rate? That's pathetic. You're completing less than half your tasks.`)
  } else if (context.executionRate < 75) {
    insights.push(`Execution rate is ${Math.round(context.executionRate)}% - mediocre. You should be at 80%+ minimum.`)
  } else if (context.executionRate < 90) {
    insights.push(`${Math.round(context.executionRate)}% execution is acceptable, but not excellent. Push to 95%+.`)
  } else {
    insights.push(`${Math.round(context.executionRate)}% execution rate - now THIS is what I call discipline.`)
  }

  if (context.weeklyConsistency < 50) {
    insights.push(`Weekly consistency at ${Math.round(context.weeklyConsistency)}%? You're all over the place. No consistency means no learning.`)
  } else if (context.weeklyConsistency < 75) {
    insights.push(`${Math.round(context.weeklyConsistency)}% consistency is irregular. Top performers maintain 85%+.`)
  } else {
    insights.push(`${Math.round(context.weeklyConsistency)}% weekly consistency - good, but don't get complacent.`)
  }

  if (context.strongSkills.length > 0 && context.weakSkills.length > 0) {
    insights.push(
      `You're strong in ${context.strongSkills[0]} but weak in ${context.weakSkills[0]}. Stop ignoring your weak areas.`
    )
  }

  // Harsh next steps
  if (context.executionRate < 70) {
    nextSteps.push('Stop starting new tasks. Finish what you started. Your completion rate is terrible.')
  }
  if (context.weeklyConsistency < 70) {
    nextSteps.push('Set a fixed schedule - 4 hours, 5 days a week minimum. No more sporadic cramming.')
  }
  if (context.weakSkills.length > 0) {
    nextSteps.push(`Attack ${context.weakSkills[0]} immediately. No more avoidance. Practice for 2 hours daily.`)
  } else {
    nextSteps.push('You know what to do. Stop making excuses and do it.')
  }

  // Identify risks
  if (context.executionRate < 50) {
    risks.push('At this rate, you\'ll never progress. Wake up.')
  }
  if (context.weeklyConsistency < 40) {
    risks.push('You\'re not serious about learning. This inconsistency will destroy your career.')
  }
  if (context.capabilityScore < 30) {
    risks.push('Your capability score is abysmal. Immediate course correction needed.')
  }

  const analysis = `Listen carefully: Your capability is at ${Math.round(context.capabilityScore)}%, execution rate is ${Math.round(context.executionRate)}%, and you've completed ${context.progressCount}/${context.progressTotal} modules. Stop accepting mediocrity. This is your wake-up call.`

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
