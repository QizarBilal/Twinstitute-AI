export interface AIAgentInput {
  intent: string
  skills: Array<{ canonicalName: string; level: string }>
  validatedSkills: Array<{ canonicalName: string; level: string }>
  selectedDomain: string
  requestType?: 'domain_insight' | 'role_comparison' | 'role_guidance'
  cognitiveProfile?: any // User cognitive/work style profile
  recommendedRoles?: any[] // Recommended roles for the user
}

export interface AIAgentOutput {
  understanding: string
  analysis: string
  domainInsight: string
  roleInsight: string
  guidance: string
  comparison?: string
}

let callDebounceTimers: Map<string, NodeJS.Timeout> = new Map()
const responseCache: Map<string, { data: AIAgentOutput; timestamp: number }> = new Map()

function getCacheKey(input: AIAgentInput): string {
  return `${input.selectedDomain}-${input.intent}-${input.requestType || 'default'}`
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < 3600000
}

export async function requestAIInsights(input: AIAgentInput): Promise<AIAgentOutput | null> {
  const callKey = getCacheKey(input)
  
  const cached = responseCache.get(callKey)
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data
  }

  return new Promise((resolve) => {
    if (callDebounceTimers.has(callKey)) {
      clearTimeout(callDebounceTimers.get(callKey)!)
    }

    const timer = setTimeout(async () => {
      try {
        resolve(null)
      } catch {
        resolve(null)
      } finally {
        callDebounceTimers.delete(callKey)
      }
    }, 500)

    callDebounceTimers.set(callKey, timer)
  })
}

export function buildAIInput(
  intent: string,
  cognitiveProfile: any,
  skills: Array<{ canonicalName: string; level: string }>,
  selectedDomain: string,
  domainRoles: any[],
  requestType: 'domain_insight' | 'role_comparison' | 'role_guidance' = 'domain_insight'
): AIAgentInput {
  const validatedSkills = skills.filter(s => ['Intermediate', 'Advanced', 'Expert'].includes(s.level))

  return {
    intent,
    skills,
    validatedSkills,
    selectedDomain,
    cognitiveProfile,
    recommendedRoles: domainRoles,
    requestType,
  }
}
