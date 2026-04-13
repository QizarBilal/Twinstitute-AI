/**
 * Mentor System Utilities
 * Handles multi-agent thinking, consensus, and actionable guidance
 */

export interface MentorContext {
  twin?: {
    overallScore: number
    executionReliability: number
    learningSpeed: number
    problemSolvingDepth: number
    consistency: number
    burnoutRisk: number
    formationVelocity: number
    readinessScore: number
    targetRole?: string
    targetDomain?: string
  }
  genome?: {
    totalSkills: number
    strongSkills: number
    mediumSkills: number
    weakSkills: number
    breadthScore: number
    depthScore: number
    coreStrength: number
    gaps: Array<{ skill: string; priority: 'critical' | 'important' | 'optional' }>
  }
  recentPerformance?: {
    labCount: number
    avgScore: number
    completionRate: number
    improvementTrend: 'up' | 'down' | 'stable'
  }
}

export interface AgentResponse {
  agentId: string
  agentName: string
  perspective: string
  confidence: number
  keyPoints: string[]
  recommendation: string
  emoji: string
}

export interface MentorConsensus {
  query: string
  agentResponses: AgentResponse[]
  synthesizedAdvice: string
  actionableOutput: string[]
  riskFlags: string[]
  nextSteps: string[]
  priority: 'urgent' | 'high' | 'medium' | 'low'
}

/**
 * Generate Career Intelligence Agent response
 */
export function generateCareerAgentResponse(
  query: string,
  context: MentorContext
): AgentResponse {
  const { twin, genome } = context
  if (!twin || !genome) {
    return {
      agentId: 'career_intelligence',
      agentName: 'Career Intelligence Agent',
      emoji: '🎯',
      perspective: 'Career Planning',
      confidence: 0.5,
      keyPoints: ['Insufficient context'],
      recommendation: 'Career Intelligence Agent requires user profile data',
    }
  }

  const score = twin.overallScore
  const targetRole = twin.targetRole || 'Software Developer'
  const breadthVsDepth = genome.breadthScore > genome.depthScore ? 'broad' : 'deep'
  const skillLevel = score > 80 ? 'advanced' : score > 60 ? 'intermediate' : 'foundational'

  const keyPoints = [
    `Current capability score: ${score}/100 (${skillLevel} level)`,
    `Target role: ${targetRole}`,
    `Skill profile: ${breadthVsDepth} expertise with ${genome.weakSkills} gap${genome.weakSkills !== 1 ? 's' : ''}`,
    `Readiness for next level: ${twin.readinessScore}%`,
  ]

  let recommendationText = ''
  if (score > 80) {
    recommendationText = `You're approaching mastery level capability. Focus on advanced specialization in your target role. Consider mentoring opportunities to deepen expertise.`
  } else if (score > 60) {
    recommendationText = `Solid intermediate capability. Begin transitioning from foundational learning to specialized skill development. Align practice with ${targetRole} requirements.`
  } else {
    recommendationText = `Build your foundational capability first. Focus on core skills that form the backbone of your ${targetRole} target role.`
  }

  return {
    agentId: 'career_intelligence',
    agentName: 'Career Intelligence Agent',
    emoji: '🎯',
    perspective: 'Career Planning & Development',
    confidence: 0.85,
    keyPoints,
    recommendation: recommendationText,
  }
}

/**
 * Generate Skill Agent response based on genome and gaps
 */
export function generateSkillAgentResponse(
  query: string,
  context: MentorContext
): AgentResponse {
  const { genome } = context
  if (!genome) {
    return {
      agentId: 'skill_agent',
      agentName: 'Skill Development Agent',
      emoji: '📚',
      perspective: 'Learning Path',
      confidence: 0.5,
      keyPoints: ['Insufficient context'],
      recommendation: 'Unable to generate skill recommendations',
    }
  }

  const totalGaps = genome.gaps.length
  const criticalGaps = genome.gaps.filter(g => g.priority === 'critical').length
  const gapSummary =
    totalGaps === 0
      ? 'No critical skill gaps identified'
      : `${criticalGaps} critical skill gap${criticalGaps !== 1 ? 's' : ''} requiring attention`

  const keyPoints = [
    `Total skills mastered: ${genome.totalSkills}`,
    `Strong skills: ${genome.strongSkills} | Medium: ${genome.mediumSkills} | Weak: ${genome.weakSkills}`,
    `Core strength: ${genome.coreStrength}/100`,
    gapSummary,
  ]

  const topGaps = genome.gaps.slice(0, 3)
  let recommendationText = 'Prioritize learning these skills in order: '
  if (topGaps.length > 0) {
    recommendationText += topGaps.map((g, i) => `${i + 1}. ${g.skill}`).join('; ')
  } else {
    recommendationText = 'You have a strong skill foundation. Focus on deepening expertise in your specialized domain.'
  }

  return {
    agentId: 'skill_agent',
    agentName: 'Skill Development Agent',
    emoji: '📚',
    perspective: 'Skills & Learning Paths',
    confidence: 0.9,
    keyPoints,
    recommendation: recommendationText,
  }
}

/**
 * Generate Execution Agent response based on performance
 */
export function generateExecutionAgentResponse(
  query: string,
  context: MentorContext
): AgentResponse {
  const { recentPerformance, twin } = context
  if (!recentPerformance || !twin) {
    return {
      agentId: 'execution_agent',
      agentName: 'Execution Agent',
      emoji: '⚡',
      perspective: 'Task Execution',
      confidence: 0.5,
      keyPoints: ['Insufficient performance data'],
      recommendation: 'Complete more practice tasks to generate execution insights',
    }
  }

  const { labCount, avgScore, completionRate, improvementTrend } = recentPerformance
  const reliability = twin.executionReliability
  const velocity = twin.formationVelocity

  const keyPoints = [
    `Tasks completed: ${labCount}`,
    `Average score: ${avgScore}/100`,
    `Completion rate: ${completionRate}%`,
    `Improvement trend: ${improvementTrend === 'up' ? '📈 Positive' : improvementTrend === 'down' ? '📉 Declining' : '➡️ Stable'}`,
    `Execution reliability: ${reliability}/100`,
    `Formation velocity: ${velocity} points/week`,
  ]

  let recommendationText = ''
  if (improvementTrend === 'up' && avgScore > 75) {
    recommendationText = `Excellent execution momentum. Increase difficulty and scope of tasks to continue growth. You're ready for more complex challenges.`
  } else if (improvementTrend === 'down' || avgScore < 60) {
    recommendationText = `Focus on execution fundamentals. Slow down and ensure mastery of current concepts before moving forward. Quality over speed.`
  } else {
    recommendationText = `Maintain steady pace. Your execution is reliable. Look for opportunities to optimize workflows and reduce rework.`
  }

  return {
    agentId: 'execution_agent',
    agentName: 'Execution Agent',
    emoji: '⚡',
    perspective: 'Task Execution & Performance',
    confidence: 0.88,
    keyPoints,
    recommendation: recommendationText,
  }
}

/**
 * Generate Risk Assessment Agent response
 */
export function generateRiskAgentResponse(
  query: string,
  context: MentorContext
): AgentResponse {
  const { twin } = context

  if (!twin) {
    return {
      agentId: 'risk_agent',
      agentName: 'Risk Assessment Agent',
      emoji: '⚠️',
      perspective: 'Risk Management',
      confidence: 0.5,
      keyPoints: ['Insufficient context'],
      recommendation: 'Unable to assess risks without user profile data',
    }
  }

  const burnoutLevel = twin.burnoutRisk
  const consistency = twin.consistency
  const learningSpeed = twin.learningSpeed

  const keyPoints = [
    `Burnout risk: ${burnoutLevel}% (${burnoutLevel > 60 ? '🔴 High' : burnoutLevel > 40 ? '🟡 Moderate' : '🟢 Low'})`,
    `Consistency score: ${consistency}/100`,
    `Learning speed: ${learningSpeed}/100 (Risk of overextension: ${learningSpeed > 80 ? 'High' : 'Low'})`,
  ]

  let recommendationText = ''
  const riskFlags: string[] = []

  if (burnoutLevel > 60) {
    riskFlags.push('High burnout risk detected')
    recommendationText = `⚠️ URGENT: Your burnout risk is critically high. Immediately reduce workload intensity. Take restorative breaks. Prioritize rest over progress. Consider speaking with a mentor about sustainable pacing.`
  } else if (burnoutLevel > 40) {
    riskFlags.push('Moderate burnout risk')
    recommendationText = `Monitor your pace closely. You're approaching moderate risk. Ensure adequate rest between intense learning sessions. Balance challenge with recovery.`
  } else {
    recommendationText = `Your current pace is sustainable. Continue monitoring and maintain healthy work-life balance.`
  }

  if (consistency < 50) {
    riskFlags.push('Inconsistent performance pattern')
  }

  return {
    agentId: 'risk_agent',
    agentName: 'Risk Assessment Agent',
    emoji: '⚠️',
    perspective: 'Risk & Sustainability',
    confidence: 0.92,
    keyPoints: [...keyPoints, ...riskFlags.map(f => `Risk: ${f}`)],
    recommendation: recommendationText,
  }
}

/**
 * Generate Evaluation Agent response
 */
export function generateEvaluationAgentResponse(
  query: string,
  context: MentorContext
): AgentResponse {
  const { recentPerformance, twin, genome } = context

  if (!recentPerformance || !twin || !genome) {
    return {
      agentId: 'evaluation_agent',
      agentName: 'Evaluation Agent',
      emoji: '📊',
      perspective: 'Assessment',
      confidence: 0.5,
      keyPoints: ['Insufficient data'],
      recommendation: 'Complete more assessments to provide detailed evaluation feedback',
    }
  }

  const { avgScore, improvementTrend } = recentPerformance
  const { problemSolvingDepth, learningSpeed } = twin
  const { coreStrength } = genome

  const keyPoints = [
    `Overall assessment score: ${avgScore}/100`,
    `Problem-solving depth: ${problemSolvingDepth}/100`,
    `Learning speed: ${learningSpeed}/100`,
    `Core skill strength: ${coreStrength}/100`,
    `Trend: ${improvementTrend === 'up' ? '✅ Improving' : improvementTrend === 'down' ? '⚠️ Declining' : '➡️ Stable'}`,
  ]

  const strengths = []
  const improvements = []

  if (avgScore > 80) strengths.push('Exceptional execution quality')
  if (problemSolvingDepth > 80) strengths.push('Deep problem-solving capability')
  if (learningSpeed > 70) strengths.push('Strong learning agility')

  if (avgScore < 70) improvements.push('Execution quality needs attention')
  if (coreStrength < 70) improvements.push('Core skill depth requires focus')
  if (improvementTrend === 'down') improvements.push('Reverse declining performance trend')

  const strengthsText = strengths.length > 0 ? `Strengths: ${strengths.join(', ')}` : ''
  const improvementsText = improvements.length > 0 ? `\nAreas for improvement: ${improvements.join(', ')}` : ''

  const recommendationText = `Your evaluation shows ${avgScore > 75 ? 'strong' : avgScore > 60 ? 'solid' : 'developing'} capability overall. ${strengthsText}${improvementsText}`

  return {
    agentId: 'evaluation_agent',
    agentName: 'Evaluation Agent',
    emoji: '📊',
    perspective: 'Performance Assessment',
    confidence: 0.89,
    keyPoints,
    recommendation: recommendationText,
  }
}

/**
 * Synthesize multiple agent responses into consensus
 */
export function synthesizeConsensus(
  query: string,
  agentResponses: AgentResponse[]
): MentorConsensus {
  const confidenceScores = agentResponses.map(r => r.confidence)
  const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length

  // Extract action items from all recommendations
  const actionableOutput: string[] = []
  agentResponses.forEach(agent => {
    const sentences = agent.recommendation.split('. ').filter(s => s.trim())
    sentences.forEach(sentence => {
      if (
        sentence.match(/\b(focus|start|begin|try|consider|prioritize|ensure|avoid|reduce|increase)\b/i)
      ) {
        actionableOutput.push(`${agent.emoji} ${sentence.trim()}`)
      }
    })
  })

  // Identify risk flags
  const riskFlags = agentResponses
    .filter(r => r.agentId === 'risk_agent')
    .flatMap(r => r.keyPoints.filter(p => p.includes('Risk') || p.includes('High') || p.includes('Moderate')))

  // Determine priority
  let priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium'
  if (riskFlags.some(f => f.includes('High'))) priority = 'urgent'
  else if (riskFlags.some(f => f.includes('Moderate'))) priority = 'high'

  // Synthesize advice
  const synthesizedAdvice = `Based on analysis from ${agentResponses.length} mentor perspectives:\n\n${agentResponses
    .map(r => `**${r.agentName}:** ${r.recommendation}`)
    .join('\n\n')}`

  // Generate next steps
  const nextSteps = generateNextSteps(agentResponses)

  return {
    query,
    agentResponses,
    synthesizedAdvice,
    actionableOutput,
    riskFlags,
    nextSteps,
    priority,
  }
}

/**
 * Generate context-aware next steps
 */
function generateNextSteps(agentResponses: AgentResponse[]): string[] {
  const steps: string[] = []

  agentResponses.forEach(agent => {
    const recommendation = agent.recommendation.toLowerCase()

    if (agent.agentId === 'career_intelligence' && recommendation.includes('focus')) {
      steps.push('Align your next tasks with career target role requirements')
    }

    if (agent.agentId === 'skill_agent') {
      steps.push('Start learning the highest-priority skill gap this week')
    }

    if (agent.agentId === 'execution_agent') {
      if (recommendation.includes('increase')) {
        steps.push('Take on a more challenging task to build execution depth')
      } else {
        steps.push('Refocus on foundational execution before scaling')
      }
    }

    if (agent.agentId === 'risk_agent') {
      if (recommendation.includes('burnout') || recommendation.includes('risk')) {
        steps.push('Schedule recovery time and reduce immediate workload')
      }
    }

    if (agent.agentId === 'evaluation_agent') {
      steps.push('Review your recent evaluation results in detail')
    }
  })

  return [...new Set(steps)].slice(0, 4) // Remove duplicates and limit to 4
}

/**
 * Multi-agent debate endpoint preparation helper
 */
export function prepareDebateContext(context: MentorContext): string {
  const { twin, genome, recentPerformance } = context

  let contextString = ''

  if (twin) {
    contextString += `Capability Twin: Score ${twin.overallScore}/100, Target: ${twin.targetRole || 'Not set'}, Burnout Risk: ${twin.burnoutRisk}%\n`
  }

  if (genome) {
    contextString += `Skill Genome: ${genome.totalSkills} skills, ${genome.weakSkills} gaps, Core Strength: ${genome.coreStrength}/100\n`
  }

  if (recentPerformance) {
    contextString += `Recent Performance: ${recentPerformance.labCount} tasks, Avg Score: ${recentPerformance.avgScore}, Trend: ${recentPerformance.improvementTrend}\n`
  }

  return contextString
}
