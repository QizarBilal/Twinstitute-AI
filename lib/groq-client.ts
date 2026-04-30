import Groq from 'groq-sdk'

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface GroqResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }> | Array<{
    delta: {
      content?: string
    }
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const GROQ_RECRUITER_KEY = process.env.GROQ_RECRUITER_KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_AI_MENTOR_BACKUP_KEY = process.env.GROQ_AI_MENTOR_BACKUP_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Determine which API key to use (priority order)
export const SELECTED_GROQ_KEY = GROQ_RECRUITER_KEY || GROQ_API_KEY || GROQ_AI_MENTOR_BACKUP_KEY || ''

// Initialize Groq SDK client when any key is present
export const groqClient = SELECTED_GROQ_KEY
  ? new Groq({
      apiKey: SELECTED_GROQ_KEY,
    })
  : null

console.log('[groq-client] Groq SDK selected key present:', !!SELECTED_GROQ_KEY)

export async function callGroqAPI(
  messages: GroqMessage[],
  temperature = 0.7,
  maxTokens = 1000,
  model = 'llama-3.3-70b-versatile'
): Promise<string> {
  // Choose key at call-time as well (in case environment changes)
  const apiKey = process.env.GROQ_RECRUITER_KEY || process.env.GROQ_API_KEY || process.env.GROQ_AI_MENTOR_BACKUP_KEY
  if (!apiKey) {
    console.warn('[groq-client] No GROQ key found (GROQ_RECRUITER_KEY/GROQ_API_KEY/GROQ_AI_MENTOR_BACKUP_KEY), using fallback mock response')
    // Return a sensible fallback response used by callers (non-JSON friendly demo string)
    return 'Demo response: GROQ key not configured. Please set GROQ_RECRUITER_KEY or GROQ_API_KEY.'
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: 0.95,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API Error:', error)
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = (await response.json()) as any
    const content = data.choices[0]?.message?.content || ''
    return content
  } catch (error) {
    console.error('Error calling Groq API:', error)
    // Fallback to demo response on error
    return 'Demo response due to API error. Please check your configuration.'
  }
}

export async function generateCareerAnalysis(
  role: string,
  userBackground: string
): Promise<{
  analysis: string
  dailyWork: string[]
  requiredSkills: string[]
  salaryRange: string
  demand: string
  growthPotential: number
  difficulty: number
}> {
  const prompt = `You are a career guidance expert. Provide comprehensive analysis of the role: "${role}"

Given the learner's background: "${userBackground}"

Provide a detailed JSON response with exactly these fields (pure JSON, NO markdown, NO code blocks):
{
  "analysis": "detailed 3-4 sentence overview of what this role entails, key responsibilities, and work environment",
  "dailyWork": ["specific daily task 1", "specific daily task 2", "specific daily task 3", "specific daily task 4", "specific daily task 5"],
  "requiredSkills": ["key skill 1", "key skill 2", "key skill 3", "key skill 4", "key skill 5"],
  "salaryRange": "estimated salary range in Indian Rupees (₹) with entry and senior levels, e.g. ₹8,00,000 - ₹25,00,000",
  "demand": "High or Medium or Low (based on current market data)",
  "growthPotential": 85,
  "difficulty": 7
}

Ensure all salaries are in Indian Rupees (₹). Ensure JSON is valid and parseable with no extra text.`

  const response = await callGroqAPI(
    [
      {
        role: 'system',
        content: 'You are a career analysis expert. You respond ONLY with valid JSON, no markdown or extra text.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    0.5,
    800
  )

  try {
    return JSON.parse(response)
  } catch (e) {
    console.error('Failed to parse career analysis response:', response)
    throw new Error('Invalid response format from Groq API')
  }
}

export async function generateRoleComparison(
  roles: string[],
  userProfile: string
): Promise<{
  comparison: string
  roleScores: Record<string, { fitScore: number; summary: string }>
  recommendation: string
}> {
  const rolesStr = roles.join(', ')
  const prompt = `You are a career comparison expert. Provide detailed comparison of these roles: ${rolesStr}

Learner profile: ${userProfile}

Provide a comprehensive JSON response with exactly this structure (pure JSON, NO markdown, NO code blocks):
{
  "comparison": "detailed multi-paragraph comparison of all roles, including salary expectations in Indian Rupees, market demand, growth opportunities, and work-life balance",
  "roleScores": {
    "RoleName": {
      "fitScore": 85,
      "summary": "detailed explanation (3-4 sentences) of why this role fits or doesn't fit the learner's profile"
    }
  },
  "recommendation": "detailed explanation (4-5 sentences) of your top 1-2 role recommendations with reasoning"
}

Make sure each role name matches the input exactly. Salaries must be in Indian Rupees (₹). Return ONLY valid JSON.`

  const response = await callGroqAPI(
    [
      {
        role: 'system',
        content: 'You are a career comparison expert. You respond ONLY with valid JSON, no markdown or extra text.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    0.6,
    1000
  )

  try {
    return JSON.parse(response)
  } catch (e) {
    console.error('Failed to parse role comparison response:', response)
    throw new Error('Invalid response format from Groq API')
  }
}

export async function generateCognitiveProfile(
  excitement: string[],
  skills: string[],
  background: string
): Promise<{
  dominantTrait: string
  thinkingStyle: string
  strengthAreas: string[]
  growthAreas: string[]
  recommendedDomains: string[]
  confidenceScore: number
}> {
  const excitementStr = excitement.join(', ')
  const skillsStr = skills.join(', ')

  const prompt = `You are a cognitive profile specialist. Analyze and create a detailed cognitive profile based on:
- What excites them: ${excitementStr}
- Current skills: ${skillsStr}
- Background: ${background}

Create a comprehensive cognitive profile as JSON (pure JSON, NO markdown, NO code blocks):
{
  "dominantTrait": "builder|analytical|creative|systems|strategic (select primary)",
  "thinkingStyle": "2-3 sentence detailed description of how they think and approach problems",
  "strengthAreas": ["detailed strength 1", "detailed strength 2", "detailed strength 3", "detailed strength 4"],
  "growthAreas": ["growth area 1 with context", "growth area 2 with context", "growth area 3 with suggested development"],
  "recommendedDomains": ["domain 1 with brief reason", "domain 2 with brief reason", "domain 3 with brief reason"],
  "confidenceScore": 82
}

Return ONLY valid JSON with detailed, meaningful content.`

  const response = await callGroqAPI(
    [
      {
        role: 'system',
        content: 'You are a cognitive profile specialist. You respond ONLY with valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    0.6,
    800
  )

  try {
    return JSON.parse(response)
  } catch (e) {
    console.error('Failed to parse cognitive profile response:', response)
    throw new Error('Invalid response format from Groq API')
  }
}

export async function generateMentorResponse(
  context: string,
  currentStep: string,
  userInput: string,
  conversationHistory: GroqMessage[]
): Promise<{ response: string; reasoning: string }> {
  const systemPrompt = `You are an expert career mentor with 20+ years of experience guiding professionals. You are wise, empathetic, deeply insightful, and genuinely invested in helping people find fulfilling careers.
You provide comprehensive, thoughtful guidance with clear explanations. Always respond in a warm, professional mentor tone.

CRITICAL INSTRUCTION: Always stay true to and respect what the user has explicitly stated. If they mention a specific career goal, domain, or interest, guide them WITHIN that domain. Do NOT suggest or recommend completely different careers unless they specifically ask for alternatives. Your role is to help them succeed in THEIR chosen path, not to redirect them.

When answering, provide a detailed, thorough response (4-5 sentences minimum) that fully explores the topic, followed by a 💭 reasoning explanation of your approach.

Your response format MUST be JSON (NO markdown, NO code blocks):
{
  "response": "your detailed mentor response",
  "reasoning": "why you said that"
}`

  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...conversationHistory,
    {
      role: 'user',
      content: `Step: ${currentStep}\nContext: ${context}\nUser Input: "${userInput}"\n\nRespond as a career mentor. Return ONLY valid JSON.`,
    },
  ]

  const response = await callGroqAPI(messages, 0.8, 600)

  try {
    return JSON.parse(response)
  } catch (e) {
    console.error('Failed to parse mentor response:', response)
    // Fallback response
    return {
      response: `That's interesting. Tell me more about ${userInput}.`,
      reasoning: 'Encouraging deeper conversation',
    }
  }
}

export async function generateRoleRecommendation(
  dominantTrait: string,
  skills: string[],
  excitement: string[],
  domains: string[]
): Promise<{
  topRole: string
  alternativeRoles: string[]
  whyThisFit: string
  marketTrend: string
  potentialSalary: string
  learningPath: string[]
  nextSteps: string[]
}> {
  const skillsStr = skills.join(', ')
  const excitementStr = excitement.join(', ')
  const domainsStr = domains.join(', ')

  // Build domain-respecting alternatives based on user's exact stated domain
  let domainContext = ''
  if (domainsStr.toLowerCase().includes('software development engineer') || 
      domainsStr.toLowerCase().includes('software engineer')) {
    domainContext = `If the user selected "Software Development Engineer", appropriate roles include:
- Software Development Engineer
- Frontend Developer / Frontend Software Engineer
- Backend Developer / Backend Software Engineer
- Full-Stack Developer / Full-Stack Software Engineer
Do NOT recommend Cloud Software Development Engineer, DevOps Engineer, ML Engineer, or any other specialized domain unless explicitly asked.`
  }

  const prompt = `You are a career recommender with STRICT domain alignment requirements.

The user has EXPLICITLY and DIRECTLY stated their interest in: ${domainsStr}

${domainContext}

You MUST recommend a role that EXACTLY MATCHES the user's stated interest or is a direct core specialization of it.

Based on this expressed interest, along with:
- Dominant trait: ${dominantTrait}
- Skills: ${skillsStr}
- What excites them: ${excitementStr}

CRITICAL REQUIREMENTS (NON-NEGOTIABLE):
1. The topRole MUST be EXACTLY what the user said or a core specialization within that exact domain
2. Do NOT recommend derivative domains, adjacent fields, or related-but-different specializations
3. If the user said "Software Development Engineer", recommend "Software Development Engineer" or its direct specializations (Frontend/Backend/Full-Stack)
4. NEVER recommend Cloud, DevOps, ML, Platform, or other specialized engineering domains unless the user specifically mentioned them

Recommend the BEST role that EXACTLY matches their stated interests. Provide detailed, comprehensive explanations. Salary MUST be in Indian Rupees (₹).

Return ONLY this JSON structure (NO markdown, NO code blocks, pure JSON):
{
  "topRole": "the EXACT role matching what the user stated or a direct core specialization",
  "alternativeRoles": ["role2", "role3"],
  "whyThisFit": "detailed 4-5 sentence explanation of why this role is perfect for them, considering their traits, skills, and interests",
  "marketTrend": "comprehensive explanation of current market demand, growth trends, industry outlook, and job market statistics for this role",
  "potentialSalary": "realistic salary range in Indian Rupees (₹) with entry-level to senior level breakdown",
  "learningPath": ["detailed step 1", "detailed step 2", "detailed step 3", "detailed step 4"],
  "nextSteps": ["comprehensive action 1", "comprehensive action 2", "comprehensive action 3"]
}`

  const response = await callGroqAPI(
    [
      {
        role: 'system',
        content: 'You are a career recommender. Respond ONLY with valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    0.7,
    1000
  )

  try {
    // Handle markdown-wrapped JSON from Groq
    let cleanedResponse = response
    if (response.includes('```json')) {
      cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    } else if (response.includes('```')) {
      cleanedResponse = response.replace(/```\n?/g, '').trim()
    }
    return JSON.parse(cleanedResponse)
  } catch (e) {
    console.error('Failed to parse role recommendation:', response)
    throw new Error('Invalid response format from Groq API')
  }
}

/**
 * Match user input to the best role from a list of candidates
 */
export async function matchIntentToRole(
  userInput: string,
  candidateRoles: Array<{ name: string; description: string; id?: string }>
): Promise<{
  bestMatch: string
  confidence: number
  reasoning: string
}> {
  const roleDescriptions = candidateRoles
    .map((role, idx) => `${idx + 1}. ${role.name}: ${role.description.substring(0, 100)}...`)
    .join('\n')

  const prompt = `You are a career guidance expert. A user wants to select a role but their input might not exactly match the role names available.

User Input: "${userInput}"

Available Roles:
${roleDescriptions}

Based on the user's input "${userInput}", which role from the available list do they most likely mean?

Consider:
- Synonyms and common job title variations
- The user's intent and what they're likely looking for
- Match them to the CLOSEST role name from the available list

Respond in JSON format ONLY:
{
  "bestMatch": "EXACT_ROLE_NAME_FROM_LIST",
  "confidence": 0.95,
  "reasoning": "Why this is the best match"
}

Return ONLY the JSON, no other text.`

  const response = await callGroqAPI(
    [
      { role: 'system', content: 'You are a role matching assistant. Respond only with valid JSON.' },
      { role: 'user', content: prompt },
    ],
    0.3,
    200
  )

  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Could not parse JSON response from Groq API')
  }

  return JSON.parse(jsonMatch[0])
}

/**
 * Generate comprehensive explanation for any role
 */
export async function explainRole(roleTitle: string): Promise<{
  id: string
  name: string
  domain: string
  description: string
  dailyWork: string[]
  requiredSkills: Array<{ name: string; level: string }>
  optionalSkills: string[]
  difficulty: string
  demandLevel: string
  salaryRangeIndia: {
    entry: number
    mid: number
    senior: number
  }
  growthPath: string[]
  workStyle: string[]
  marketOutlook: string
  companiesHiring: string[]
}> {
  const cleanRoleTitle = roleTitle.trim()

  const prompt = `You are a career expert. Generate detailed information about the role: "${cleanRoleTitle}"

Generate ONLY valid JSON with this exact structure (no markdown, no code blocks, pure JSON):
{
  "id": "role-${Date.now()}",
  "name": "Exact role title",
  "domain": "One of: Software Engineering, Data & AI, Cybersecurity, Cloud & DevOps, Product & Design, Mobile & Game Dev",
  "description": "2-3 sentence description of what this role does",
  "dailyWork": ["task1", "task2", "task3", "task4", "task5"],
  "requiredSkills": [
    { "name": "Skill1", "level": "basic|intermediate|advanced" },
    { "name": "Skill2", "level": "basic|intermediate|advanced" },
    { "name": "Skill3", "level": "basic|intermediate|advanced" },
    { "name": "Skill4", "level": "basic|intermediate|advanced" },
    { "name": "Skill5", "level": "basic|intermediate|advanced" }
  ],
  "optionalSkills": ["skill1", "skill2", "skill3"],
  "difficulty": "foundation|intermediate|advanced",
  "demandLevel": "high|medium|low|emerging",
  "salaryRangeIndia": {
    "entry": 4,
    "mid": 12,
    "senior": 30
  },
  "growthPath": ["Senior role", "Lead role", "Manager role"],
  "workStyle": ["creative", "analytical", "system-focused", "collaborative"],
  "marketOutlook": "Market overview and trends for this role",
  "companiesHiring": ["company1", "company2", "company3"]
}`

  const response = await callGroqAPI(
    [
      { role: 'system', content: 'You are a role explanation assistant. Respond only with valid JSON.' },
      { role: 'user', content: prompt },
    ],
    0.7,
    1500
  )

  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Could not parse JSON response from Groq API')
  }

  return JSON.parse(jsonMatch[0])
}
