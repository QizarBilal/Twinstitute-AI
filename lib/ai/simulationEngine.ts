/**
 * Career Simulation Engine
 *
 * Predicts user career outcomes based on:
 * - Current skill levels (genome)
 * - Lab task performance
 * - Roadmap progress
 * - Learning velocity
 * - Consistency metrics
 * - Target role requirements
 */

export interface SkillProfile {
    skillId: string
    name: string
    proficiency: number // 0-100
    targetProficiency: number // 0-100
    category: string
    importance: number // 0-100: how important for target role
    developmentRate: number // points per week
}

export interface SimulationContext {
    targetRole: string
    currentScore: number // 0-100
    averageScore: number // 0-100
    consistency: number // 0-100
    completionRate: number // 0-1
    learningVelocity: number // points per week
    roadmapProgress: number // 0-100%
    labsCompleted: number
    tasksCompleted: number
    burnoutRisk: number // 0-100
    skillProfiles: SkillProfile[]
}

export interface SimulationResult {
    readinessScore: number // 0-100
    jobReadyWeeks: number // estimated weeks to 80+ score
    jobReadyDate: string // ISO date
    placementProbability: number // 0-100%
    confidenceLevel: number // 0-100% (confidence in prediction)
    riskLevel: 'low' | 'medium' | 'high'
    riskFactors: string[]
    strengthAreas: string[]
    weakAreas: string[]
    recommendations: {
        action: string
        impact: number // 0-100: how much this improves readiness
        priority: 'critical' | 'high' | 'medium'
        effort: 'low' | 'medium' | 'high'
    }[]
}

export interface ScenarioModifier {
    type: 'skill_improvement' | 'task_completion' | 'domain_skip' | 'pace_increase' | 'consistency_boost'
    skillId?: string
    improvementPoints?: number // additional proficiency gain
    additionalTasks?: number
    paaceMultiplier?: number // 1.2 = 20% faster learning
    consistencyBoost?: number // additional consistency points
}

/**
 * Core simulation engine - predicts career outcomes
 */
export function simulateCareerOutcome(context: SimulationContext): SimulationResult {
    // Calculate base readiness from multiple factors
    const skillReadiness = calculateSkillReadiness(context.skillProfiles)
    const performanceReadiness = context.averageScore * 0.3
    const consistencyBonus = context.consistency > 70 ? 10 : context.consistency > 50 ? 5 : 0
    const velocityBonus = context.learningVelocity > 2 ? 8 : context.learningVelocity > 1 ? 4 : 0

    const baseReadiness = Math.min((skillReadiness + performanceReadiness + consistencyBonus + velocityBonus) * 0.8, 100)

    // Adjust for burnout risk - high burnout lowers long-term readiness
    const burnoutPenalty = context.burnoutRisk > 70 ? 15 : context.burnoutRisk > 50 ? 8 : 0
    const adjustedReadiness = Math.max(baseReadiness - burnoutPenalty, 0)

    // Identify weak and strong areas
    const { strongSkills, weakSkills } = categorizeSkills(context.skillProfiles)

    // Calculate job-ready timeline
    const jobReadyScore = 80
    const pointsNeeded = Math.max(0, jobReadyScore - adjustedReadiness)
    const weeksToJobReady = context.learningVelocity > 0 
        ? Math.ceil(pointsNeeded / context.learningVelocity)
        : 52 // 1 year if no velocity

    const jobReadyDate = new Date()
    jobReadyDate.setDate(jobReadyDate.getDate() + weeksToJobReady * 7)

    // Calculate placement probability based on multiple factors
    const readinessComponent = (adjustedReadiness / 100) * 0.4
    const consistencyComponent = (context.consistency / 100) * 0.3
    const completionComponent = context.completionRate * 0.2
    const velocityComponent = Math.min(context.learningVelocity / 3, 1) * 0.1

    const placementProbability = Math.round(
        (readinessComponent + consistencyComponent + completionComponent + velocityComponent) * 100
    )

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    const riskFactors: string[] = []

    if (context.learningVelocity < 0.5) {
        riskLevel = 'high'
        riskFactors.push('Very slow learning pace')
    } else if (context.learningVelocity < 1) {
        riskLevel = 'medium'
        riskFactors.push('Below-average learning velocity')
    }

    if (context.burnoutRisk > 70) {
        riskLevel = riskLevel === 'high' ? 'high' : 'medium'
        riskFactors.push('High burnout risk may impact consistency')
    }

    if (context.consistency < 40) {
        riskLevel = 'high'
        riskFactors.push('Low consistency in solving tasks')
    } else if (context.consistency < 60) {
        riskLevel = 'medium'
        riskFactors.push('Inconsistent performance patterns')
    }

    if (weakSkills.length > 2) {
        riskLevel = riskLevel === 'high' ? 'high' : 'medium'
        riskFactors.push(`${weakSkills.length} critical skills below target`)
    }

    if (context.completionRate < 0.3) {
        riskLevel = riskLevel === 'high' ? 'high' : 'medium'
        riskFactors.push('Low task completion rate')
    }

    // Confidence level (how sure are we about this prediction?)
    let confidence = 70 // Base confidence
    if (context.labsCompleted < 5) confidence -= 20 // Not enough data
    if (context.consistency > 80) confidence += 15 // High consistency = more predictable
    if (context.learningVelocity > 0 && context.learningVelocity < 5) confidence += 10 // Stable velocity
    confidence = Math.max(20, Math.min(95, confidence))

    // Generate recommendations
    const recommendations = generateRecommendations(context, weakSkills, strongSkills)

    return {
        readinessScore: Math.round(adjustedReadiness),
        jobReadyWeeks: weeksToJobReady,
        jobReadyDate: jobReadyDate.toISOString().split('T')[0],
        placementProbability: Math.min(placementProbability, 100),
        confidenceLevel: confidence,
        riskLevel,
        riskFactors,
        strengthAreas: strongSkills,
        weakAreas: weakSkills,
        recommendations,
    }
}

/**
 * Simulate a what-if scenario with modified context
 */
export function simulateScenario(
    baseContext: SimulationContext,
    modifiers: ScenarioModifier[]
): SimulationResult {
    const modifiedContext = { ...baseContext }
    let impactDescription = ''

    modifiers.forEach((mod) => {
        switch (mod.type) {
            case 'skill_improvement':
                if (mod.skillId && mod.improvementPoints) {
                    const skillIndex = modifiedContext.skillProfiles.findIndex((s) => s.skillId === mod.skillId)
                    if (skillIndex >= 0) {
                        modifiedContext.skillProfiles[skillIndex].proficiency = Math.min(
                            modifiedContext.skillProfiles[skillIndex].proficiency + mod.improvementPoints,
                            100
                        )
                    }
                }
                break

            case 'task_completion':
                if (mod.additionalTasks) {
                    modifiedContext.tasksCompleted += mod.additionalTasks
                    // Each task improves score slightly
                    modifiedContext.currentScore = Math.min(
                        modifiedContext.currentScore + mod.additionalTasks * 0.5,
                        100
                    )
                    modifiedContext.completionRate = Math.min(modifiedContext.completionRate + 0.05, 1)
                }
                break

            case 'pace_increase':
                if (mod.paaceMultiplier) {
                    modifiedContext.learningVelocity *= mod.paaceMultiplier
                }
                break

            case 'consistency_boost':
                if (mod.consistencyBoost) {
                    modifiedContext.consistency = Math.min(
                        modifiedContext.consistency + mod.consistencyBoost,
                        100
                    )
                }
                break

            case 'domain_skip':
                // Skipping a domain reduces overall readiness
                if (mod.skillId) {
                    modifiedContext.currentScore = Math.max(modifiedContext.currentScore - 10, 0)
                }
                break
        }
    })

    return simulateCareerOutcome(modifiedContext)
}

/**
 * Calculate readiness from skill profiles
 */
function calculateSkillReadiness(skillProfiles: SkillProfile[]): number {
    if (skillProfiles.length === 0) return 0

    const weightedScores = skillProfiles.map((skill) => {
        const gap = Math.max(0, skill.targetProficiency - skill.proficiency)
        const gapPenalty = (gap / 100) * (skill.importance / 100) * 30

        return (skill.proficiency / 100) * (skill.importance / 100) * 100 - gapPenalty
    })

    return weightedScores.reduce((a, b) => a + b, 0) / skillProfiles.length
}

/**
 * Categorize skills as strong or weak based on target requirements
 */
function categorizeSkills(skillProfiles: SkillProfile[]): { strongSkills: string[]; weakSkills: string[] } {
    const strongSkills = skillProfiles
        .filter(
            (s) => s.proficiency >= s.targetProficiency - 10 && s.importance > 70
        )
        .map((s) => s.name)
        .slice(0, 3)

    const weakSkills = skillProfiles
        .filter(
            (s) => s.proficiency < s.targetProficiency - 20 && s.importance > 60
        )
        .map((s) => s.name)
        .slice(0, 3)

    return { strongSkills, weakSkills }
}

/**
 * Generate smart recommendations based on simulation context
 */
function generateRecommendations(
    context: SimulationContext,
    weakSkills: string[],
    strongSkills: string[]
): SimulationResult['recommendations'] {
    const recommendations: SimulationResult['recommendations'] = []

    // Critical: Address weak skills
    if (weakSkills.length > 0) {
        recommendations.push({
            action: `Master ${weakSkills[0]} - this is blocking your progress`,
            impact: 25,
            priority: 'critical',
            effort: 'high',
        })
    }

    // High priority: Increase consistency if low
    if (context.consistency < 60) {
        recommendations.push({
            action: 'Focus on consistency - complete more tasks with >80% quality',
            impact: 18,
            priority: 'high',
            effort: 'medium',
        })
    }

    // High priority: Boost learning velocity
    if (context.learningVelocity < 1.5) {
        recommendations.push({
            action: `Accelerate learning pace - target ${Math.ceil(context.learningVelocity * 2)} points/week`,
            impact: 20,
            priority: 'high',
            effort: 'medium',
        })
    }

    // Medium: Leverage strengths
    if (strongSkills.length > 0) {
        recommendations.push({
            action: `Build on your strength in ${strongSkills[0]} - apply to advanced projects`,
            impact: 12,
            priority: 'medium',
            effort: 'low',
        })
    }

    // Medium: Reduce burnout if high
    if (context.burnoutRisk > 60) {
        recommendations.push({
            action: 'Manage burnout - take recovery breaks to maintain long-term progress',
            impact: 10,
            priority: 'medium',
            effort: 'low',
        })
    }

    // Output top 3 sorted by priority and impact
    return recommendations
        .sort(
            (a, b) =>
                (b.priority === 'critical' ? 3 : b.priority === 'high' ? 2 : 1) -
                (a.priority === 'critical' ? 3 : a.priority === 'high' ? 2 : 1)
        )
        .slice(0, 3)
}

/**
 * Calculate impact of a specific action
 */
export function calculateActionImpact(
    baseSimulation: SimulationResult,
    scenarios: ScenarioModifier[],
    context: SimulationContext
): {
    readinessDelta: number
    placementDelta: number
    timelineDelta: number
} {
    const modifiedSimulation = simulateScenario(context, scenarios)

    return {
        readinessDelta: modifiedSimulation.readinessScore - baseSimulation.readinessScore,
        placementDelta: modifiedSimulation.placementProbability - baseSimulation.placementProbability,
        timelineDelta: baseSimulation.jobReadyWeeks - modifiedSimulation.jobReadyWeeks,
    }
}
