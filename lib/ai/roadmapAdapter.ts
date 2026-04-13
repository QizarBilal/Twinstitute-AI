/**
 * Adaptive Roadmap Engine
 *
 * Adjusts learning path based on:
 * - Current performance (score, consistency)
 * - Target role alignment
 * - Skill gaps identified in genome
 * - Historical progress patterns
 */

export interface RoadmapNode {
    id: string
    title: string
    description: string
    type: 'skill' | 'milestone' | 'project'
    category: string
    skills: string[]
    linkedTasks: string[]
    estimatedHours: number
    difficulty: 'foundation' | 'intermediate' | 'advanced'

    // Adaptive state
    status: 'completed' | 'active' | 'unlocked' | 'locked'
    prerequisites: string[]
    recommendedOrder: number
    unlockReason?: string

    // Why this matters
    relevance: number // 0-100: how relevant to target role
    skillGainValue: number // 0-100: skill improvement potential
    careerImpact: string
}

export interface RoadmapEdge {
    from: string
    to: string
    type: 'prerequisite' | 'recommended' | 'optional'
}

export interface AdaptiveContext {
    targetRole: string
    currentScore: number
    averageScore: number
    consistency: number
    strugglingSkills: string[]
    excellenceAreas: string[]
    completionRate: number
    learningVelocity: number // points per week
    burnoutRisk: number
}

/**
 * Adapts roadmap based on user performance and context
 */
export function generateAdaptiveRoadmap(
    baseRoadmap: RoadmapNode[],
    context: AdaptiveContext
): { nodes: RoadmapNode[]; edges: RoadmapEdge[]; reasoning: string } {
    const adaptedNodes = [...baseRoadmap]
    const reasoning: string[] = []

    // SCENARIO 1: User struggling (score < 40% or consistency low)
    if (context.currentScore < 40 || context.consistency < 30) {
        reasoning.push('📉 You are currently challenged. Breaking complex nodes into micro-steps for better progress.')

        // Break advanced nodes into foundation + intermediate
        adaptedNodes.forEach((node) => {
            if (node.difficulty === 'advanced' && node.status !== 'completed') {
                // Lock advanced nodes temporarily
                node.status = 'locked'
                node.unlockReason = 'Complete intermediate skills first'
            }
        })

        // Prioritize foundation-level nodes
        adaptedNodes.forEach((node) => {
            if (node.difficulty === 'foundation') {
                node.recommendedOrder = Math.max(node.recommendedOrder - 3, 0)
            }
        })
    }

    // SCENARIO 2: User excelling (score > 75% and consistency high)
    if (context.currentScore > 75 && context.consistency > 70) {
        reasoning.push('🚀 You are excelling! Accelerating to advanced content and role-specific skills.')

        // Unlock advanced nodes
        adaptedNodes.forEach((node) => {
            if (node.difficulty === 'advanced' && node.status === 'locked') {
                node.status = 'unlocked'
            }
        })

        // Lower recommended order for advanced nodes
        adaptedNodes.forEach((node) => {
            if (node.difficulty === 'advanced' && node.status !== 'completed') {
                node.recommendedOrder = Math.min(node.recommendedOrder + 2, adaptedNodes.length - 1)
            }
        })
    }

    // SCENARIO 3: Skill gaps identified
    if (context.strugglingSkills.length > 0) {
        reasoning.push(`⚠️ Skill gaps detected: ${context.strugglingSkills.join(', ')}. Adding targeted learning nodes.`)

        // Prioritize nodes that teach struggling skills
        adaptedNodes.forEach((node) => {
            const hasGapSkill = context.strugglingSkills.some((skill) =>
                node.skills.some((nodeSkill) => nodeSkill.toLowerCase().includes(skill.toLowerCase()))
            )
            if (hasGapSkill) {
                node.relevance = Math.min(node.relevance + 20, 100)
                node.recommendedOrder = Math.max(node.recommendedOrder - 2, 0)
            }
        })
    }

    // SCENARIO 4: Strong in certain areas
    if (context.excellenceAreas.length > 0) {
        reasoning.push(`✨ Strong areas: ${context.excellenceAreas.join(', ')}. Leveraging strengths for advanced work.`)

        // Reduce prerequisite requirements for nodes building on excellence areas
        adaptedNodes.forEach((node) => {
            const leveragesStrength = context.excellenceAreas.some((area) =>
                node.skills.some((skill) => skill.toLowerCase().includes(area.toLowerCase()))
            )
            if (leveragesStrength) {
                node.prerequisites = node.prerequisites.slice(0, Math.ceil(node.prerequisites.length * 0.5))
            }
        })
    }

    // SCENARIO 5: Burnout risk
    if (context.burnoutRisk > 60) {
        reasoning.push('🔥 High burnout risk detected. Recommending lighter pace and foundational content.')

        // Reduce estimated hours for current and upcoming nodes
        adaptedNodes.forEach((node) => {
            if (node.status === 'active' || node.status === 'unlocked') {
                node.estimatedHours = Math.max(node.estimatedHours * 0.7, 1)
            }
        })
    }

    // SCENARIO 6: Optimize based on learning velocity
    if (context.learningVelocity > 3) {
        reasoning.push('⚡ Fast learning velocity detected. Adding bonus advanced nodes to maintain challenge.')
        // Could add optional advanced challenge nodes here
    } else if (context.learningVelocity < 0.5 && context.learningVelocity > 0) {
        reasoning.push('🐢 Slower pace detected. Extending estimated time and breaking into smaller steps.')
        adaptedNodes.forEach((node) => {
            node.estimatedHours = Math.ceil(node.estimatedHours * 1.5)
        })
    }

    // SCENARIO 7: Role-specific alignment
    if (context.targetRole) {
        reasoning.push(`🎯 Optimizing for target role: ${context.targetRole}. Prioritizing relevant skills.`)

        // Increase relevance for role-aligned nodes
        adaptedNodes.forEach((node) => {
            const isRoleRelevant =
                node.category.toLowerCase().includes(context.targetRole.toLowerCase()) ||
                node.careerImpact.toLowerCase().includes(context.targetRole.toLowerCase())

            if (isRoleRelevant) {
                node.relevance = Math.min(node.relevance + 30, 100)
            }
        })
    }

    // Sort by recommended order
    adaptedNodes.sort((a, b) => a.recommendedOrder - b.recommendedOrder)

    // Set active node (first unlocked/active)
    const activeNode = adaptedNodes.find((n) => n.status === 'active' || n.status === 'unlocked')
    if (activeNode) {
        activeNode.status = 'active'
    }

    // Build edges based on prerequisites
    const edges: RoadmapEdge[] = []
    adaptedNodes.forEach((node) => {
        node.prerequisites.forEach((prereqId) => {
            const prereqNode = adaptedNodes.find((n) => n.id === prereqId)
            if (prereqNode) {
                edges.push({
                    from: prereqId,
                    to: node.id,
                    type: 'prerequisite',
                })
            }
        })
    })

    return {
        nodes: adaptedNodes,
        edges,
        reasoning: reasoning.join('\n'),
    }
}

/**
 * Calculate what percent of roadmap is complete
 */
export function calculateRoadmapProgress(nodes: RoadmapNode[]): {
    percentComplete: number
    completedCount: number
    totalCount: number
} {
    const completedCount = nodes.filter((n) => n.status === 'completed').length
    const totalCount = nodes.length

    return {
        percentComplete: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        completedCount,
        totalCount,
    }
}

/**
 * Calculate estimated time to complete remaining roadmap
 */
export function estimateTimeToCompletion(nodes: RoadmapNode[], learningVelocity: number): {
    estimatedDays: number
    estimatedWeeks: number
} {
    const remainingHours = nodes
        .filter((n) => n.status !== 'completed')
        .reduce((sum, n) => sum + n.estimatedHours, 0)

    const hoursPerWeek = learningVelocity > 0 ? Math.max(learningVelocity * 50, 5) : 10 // Rough estimate
    const estimatedWeeks = remainingHours / hoursPerWeek

    return {
        estimatedDays: Math.ceil(estimatedWeeks * 7),
        estimatedWeeks: Math.ceil(estimatedWeeks),
    }
}

/**
 * Get contextual explanation for why a specific node is in the roadmap
 */
export function getNodeReasoning(node: RoadmapNode, context: AdaptiveContext): string {
    const reasons = []

    if (context.strugglingSkills.some((skill) =>
        node.skills.some((nodeSkill) => nodeSkill.toLowerCase().includes(skill.toLowerCase()))
    )) {
        reasons.push(`This addresses your skill gap in: ${node.skills.join(', ')}`)
    }

    if (node.careerImpact.toLowerCase().includes(context.targetRole.toLowerCase())) {
        reasons.push(`Directly relevant to your target role: ${context.targetRole}`)
    }

    if (node.relevance > 80) {
        reasons.push(`High impact on your capability development (${node.relevance}% relevance)`)
    }

    if (node.prerequisites.length > 0) {
        reasons.push(`Builds on foundational knowledge you'll have from prerequisites`)
    }

    if (context.currentScore < 40 && node.difficulty === 'foundation') {
        reasons.push(`Exactly at the right difficulty level for your current pace`)
    }

    return reasons.length > 0 ? reasons.join('\n' + '• ') : 'Part of your personalized learning path'
}
