/**
 * MASTER SYSTEM TYPES
 * Central data models for the unified Twinstitute AI system
 */

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE FORMAT (STANDARDIZED ACROSS ALL ENDPOINTS)
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = any> {
    success: boolean
    data: T | null
    error: string | null
    timestamp: string
}

// ─────────────────────────────────────────────────────────────────────────────
// USER & AUTH
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
    id: string
    email: string
    fullName: string
    selectedDomain: string | null
    selectedRole: string | null
    capabilityScore: number
    currentLevel: 'foundation' | 'building' | 'advancing' | 'expert'
    avatarUrl: string | null
    createdAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN & STRATEGY
// ─────────────────────────────────────────────────────────────────────────────

export interface DomainSelection {
    domain: string
    role: string
    confidenceScore: number
    timestamp: string
}

export interface ActionItem {
    id: string
    title: string
    priority: number
    estimatedHoursRequired: number
    expectedImpact: number
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPABILITY TWIN
// ─────────────────────────────────────────────────────────────────────────────

export interface CapabilityTwin {
    id: string
    userId: string
    overallScore: number
    executionReliability: number
    learningSpeed: number
    problemSolvingDepth: number
    consistency: number
    designReasoning: number
    abstractionLevel: number
    burnoutRisk: number
    improvementSlope: number
    innovationIndex: number
    currentStage: string
    targetRole: string | null
    targetDomain: string | null
    formationVelocity: number
    readinessScore: number
    lastUpdated: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILL GENOME
// ─────────────────────────────────────────────────────────────────────────────

export interface SkillNode {
    id: string
    name: string
    category: string
    proficiency: number // 0-100
    targetProficiency: number
    lastUpdated: string
    importance: number // 0-100
    developmentRate: number // points per week
}

export interface SkillEdge {
    from: string
    to: string
    strength: number // 0-100, how connected they are
}

export interface SkillGenome {
    id: string
    userId: string
    nodes: SkillNode[]
    edges: SkillEdge[]
    weakClusters: string[] // skill IDs forming weak clusters
    bridgeSkills: string[] // skills that bridge clusters
    compoundingSkills: string[] // skills that improve other skills
    coreStrength: number
    breadthScore: number
    depthScore: number
    lastAnalyzed: string
}

// ─────────────────────────────────────────────────────────────────────────────
// ROADMAP
// ─────────────────────────────────────────────────────────────────────────────

export interface RoadmapNodeData {
    id: string
    nodeId: string
    title: string
    description: string
    type: 'foundation' | 'skill' | 'system' | 'project' | 'evaluation'
    difficulty: 'easy' | 'intermediate' | 'advanced' | 'expert'
    estimatedHours: number
    skillsGained: string[]
    why: string
    impactExecution: number
    impactProblemSolving: number
    dependencies: string[]
}

export interface RoadmapProgressData {
    id: string
    nodeId: string
    status: 'locked' | 'available' | 'in_progress' | 'completed'
    startedAt: string | null
    completedAt: string | null
}

export interface Roadmap {
    id: string
    userId: string
    role: string
    domain: string
    estimatedCompletionMonths: number
    readinessScore: number
    nodes: RoadmapNodeData[]
    progress: RoadmapProgressData[]
    createdAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// LAB TASKS & SUBMISSIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface LabTask {
    id: string
    title: string
    description: string
    taskType: 'coding' | 'debugging' | 'system_design' | 'integration' | 'optimization' | 'mini_project'
    difficulty: number // 1-10
    domain: string
    skills: string[]
    timeEstimateMin: number
    instructions: string
    testCases: any[]
    evaluationRubric: Record<string, any>
    creditReward: number
    isActive: boolean
    createdAt: string
}

export interface LabSubmission {
    id: string
    userId: string
    taskId: string
    submittedCode: string | null
    submittedAnswer: string | null
    approach: string | null
    timeSpentMin: number
    attemptNumber: number
    status: 'pending' | 'evaluated' | 'passed' | 'failed'
    scoreTotal: number
    scoreBreakdown: Record<string, number>
    executionTrace: string | null
    feedback: string | null
    creditsAwarded: number
    submittedAt: string
    evaluatedAt: string | null
}

export interface LabEvaluation {
    id: string
    submissionId: string
    correctnessScore: number
    codeQualityScore: number
    efficiencyScore: number
    creativityScore: number
    clarityScore: number
    overallScore: number
    technicalMentorFeedback: string | null
    strategyMentorFeedback: string | null
    riskMentorFeedback: string | null
    evaluatorReport: string | null
    strengthsIdentified: string[]
    gapsIdentified: string[]
    nextStepsRecommended: string[]
    evaluatedAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION
// ─────────────────────────────────────────────────────────────────────────────

export interface SimulationResult {
    jobReadyWeeks: number
    jobReadyDate: string
    placementProbability: number
    riskLevel: 'low' | 'medium' | 'high'
    confidenceLevel: number
    keyRisks: string[]
    accelerators: string[]
    recommendations: string[]
}

export interface SimulationContext {
    targetRole: string
    currentScore: number
    averageScore: number
    consistency: number
    completionRate: number
    learningVelocity: number
    roadmapProgress: number
    labsCompleted: number
    tasksCompleted: number
    burnoutRisk: number
    skillProfiles: SkillProfileData[]
}

export interface SkillProfileData {
    skillId: string
    name: string
    proficiency: number
    targetProficiency: number
    category: string
    importance: number
    developmentRate: number
}

// ─────────────────────────────────────────────────────────────────────────────
// PROOF ARTIFACTS
// ─────────────────────────────────────────────────────────────────────────────

export interface ProofArtifact {
    id: string
    userId: string
    artifactType: 'execution_trace' | 'reasoning_log' | 'design_decision' | 'solution_transcript' | 'architecture_justification' | 'project_proof'
    title: string
    description: string
    content: string
    skills: string[]
    labSubmissionId: string | null
    projectId: string | null
    recruiterSummary: string | null
    capabilityLevel: string | null
    isPublic: boolean
    shareToken: string | null
    createdAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// MENTOR SESSION
// ─────────────────────────────────────────────────────────────────────────────

export interface MentorSession {
    id: string
    userId: string
    sessionType: 'technical' | 'strategy' | 'risk' | 'evaluation' | 'panel_debate'
    agentRoles: string[]
    userQuery: string
    sessionContext: Record<string, any>
    debateLog: any[]
    consensusReport: string | null
    actionableOutput: string | null
    durationMin: number
    isCompleted: boolean
    completedAt: string | null
    createdAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPABILITY CREDITS
// ─────────────────────────────────────────────────────────────────────────────

export interface CapabilityCredit {
    id: string
    userId: string
    creditType: 'execution' | 'design' | 'reliability' | 'innovation' | 'problem_solving' | 'consistency'
    amount: number
    source: string
    sourceId: string | null
    description: string
    awardedAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM STATE (UNIFIED CONTEXT)
// ─────────────────────────────────────────────────────────────────────────────

export interface SystemState {
    user: UserProfile | null
    domain: DomainSelection | null
    twin: CapabilityTwin | null
    genome: SkillGenome | null
    roadmap: Roadmap | null
    lastRevenueActivity: {
        type: string
        timestamp: string
        data: any
    } | null
    isLoading: boolean
    error: string | null
    updatedAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW EVENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type FlowEventType =
    | 'AUTH_COMPLETE'
    | 'DOMAIN_SELECTED'
    | 'PROFILE_INITIALIZED'
    | 'ROADMAP_GENERATED'
    | 'TASK_GENERATED'
    | 'TASK_SUBMITTED'
    | 'EVALUATION_COMPLETE'
    | 'GENOME_UPDATED'
    | 'PROOF_CREATED'
    | 'SIMULATION_COMPLETE'

export interface FlowEvent {
    type: FlowEventType
    userId: string
    timestamp: string
    data: any
    nextStep: string
}

// ─────────────────────────────────────────────────────────────────────────────
// MILESTONE
// ─────────────────────────────────────────────────────────────────────────────

export interface Milestone {
    id: string
    userId: string
    milestoneType: 'formation' | 'lab_completion' | 'credit_threshold' | 'readiness' | 'project' | 'interview_ready'
    title: string
    description: string
    targetValue: number
    currentValue: number
    isCompleted: boolean
    creditsAwarded: number
    completedAt: string | null
    createdAt: string
}
