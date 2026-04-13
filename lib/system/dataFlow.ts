/**
 * SYSTEM DATA FLOW ORCHESTRATION
 * Manages the complete user journey and ensures all systems stay synchronized
 */

import { apiClient } from './apiClient'
import { ApiResponse, FlowEvent, FlowEventType, SystemState, UserProfile } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// FLOW EVENT LOGGING
// ─────────────────────────────────────────────────────────────────────────────

const flowLog: FlowEvent[] = []

export function logFlowEvent(event: FlowEvent) {
    flowLog.push(event)
    console.log(`[SYSTEM FLOW] ${event.type} → ${event.nextStep}`, event.data)
}

export function getFlowLog() {
    return flowLog
}

export function clearFlowLog() {
    flowLog.length = 0
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────

export async function initializeUserSession(userId: string) {
    try {
        // Fetch current user
        const userResponse = await apiClient.getUser()
        if (!userResponse.success) {
            return {
                success: false,
                error: 'Failed to load user profile',
            }
        }

        logFlowEvent({
            type: 'AUTH_COMPLETE',
            userId,
            timestamp: new Date().toISOString(),
            data: userResponse.data,
            nextStep: 'Check if domain selected',
        })

        return { success: true, user: userResponse.data as UserProfile }
    } catch (error) {
        console.error('Failed to initialize user session:', error)
        return { success: false, error: String(error) }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: DOMAIN DISCOVERY & SELECTION
// ─────────────────────────────────────────────────────────────────────────────

export async function selectDomain(userId: string, domain: string, role: string) {
    try {
        // Store selection
        const domainResponse = await apiClient.selectDomain(domain, role)
        if (!domainResponse.success) {
            return {
                success: false,
                error: 'Failed to select domain',
            }
        }

        logFlowEvent({
            type: 'DOMAIN_SELECTED',
            userId,
            timestamp: new Date().toISOString(),
            data: { domain, role },
            nextStep: 'Initialize profile',
        })

        // Next: Initialize profile
        return initializeUserProfile(userId, domain, role)
    } catch (error) {
        console.error('Failed to select domain:', error)
        return { success: false, error: String(error) }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: PROFILE & GENOME INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

export async function initializeUserProfile(userId: string, domain: string, role: string) {
    try {
        // Create/update capability twin
        const twinResponse = await apiClient.updateTwin({
            targetDomain: domain,
            targetRole: role,
            currentStage: 'foundation',
        })

        if (!twinResponse.success) {
            return {
                success: false,
                error: 'Failed to initialize capability twin',
            }
        }

        logFlowEvent({
            type: 'PROFILE_INITIALIZED',
            userId,
            timestamp: new Date().toISOString(),
            data: { domain, role },
            nextStep: 'Generate skill genome',
        })

        // Next: Generate roadmap
        return generatePersonalizedRoadmap(userId, domain, role)
    } catch (error) {
        console.error('Failed to initialize profile:', error)
        return { success: false, error: String(error) }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: ROADMAP GENERATION
// ─────────────────────────────────────────────────────────────────────────────

export async function generatePersonalizedRoadmap(userId: string, domain: string, role: string) {
    try {
        const roadmapResponse = await apiClient.generateRoadmap(domain, role)

        if (!roadmapResponse.success) {
            return {
                success: false,
                error: 'Failed to generate roadmap',
            }
        }

        logFlowEvent({
            type: 'ROADMAP_GENERATED',
            userId,
            timestamp: new Date().toISOString(),
            data: { domain, role, roadmapId: (roadmapResponse.data as any)?.id || '' },
            nextStep: 'Generate initial lab tasks',
        })

        // Next: Generate initial tasks
        return generateInitialTasks(userId)
    } catch (error) {
        console.error('Failed to generate roadmap:', error)
        return { success: false, error: String(error) }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5: LAB TASK GENERATION
// ─────────────────────────────────────────────────────────────────────────────

export async function generateInitialTasks(userId: string, count: number = 5) {
    try {
        const tasksResponse = await apiClient.generateTasks(count)

        if (!tasksResponse.success) {
            return {
                success: false,
                error: 'Failed to generate tasks',
            }
        }

        logFlowEvent({
            type: 'TASK_GENERATED',
            userId,
            timestamp: new Date().toISOString(),
            data: { taskCount: count, tasks: tasksResponse.data },
            nextStep: 'User can start executing tasks',
        })

        return { success: true, tasks: tasksResponse.data }
    } catch (error) {
        console.error('Failed to generate tasks:', error)
        return { success: false, error: String(error) }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 6: TASK SUBMISSION
// ─────────────────────────────────────────────────────────────────────────────

export async function submitTaskForEvaluation(
    userId: string,
    taskId: string,
    submissionData: {
        submittedCode?: string
        submittedAnswer?: string
        approach?: string
        timeSpentMin: number
    }
) {
    try {
        const submitResponse = await apiClient.submitTask(taskId, submissionData)

        if (!submitResponse.success) {
            return {
                success: false,
                error: 'Failed to submit task',
            }
        }

        const submissionId = (submitResponse.data as any)?.id || ''

        logFlowEvent({
            type: 'TASK_SUBMITTED',
            userId,
            timestamp: new Date().toISOString(),
            data: { taskId, submissionId, timeSpent: submissionData.timeSpentMin },
            nextStep: 'Evaluate submission',
        })

        // Next: Auto-trigger evaluation
        return evaluateSubmissionAndUpdate(userId, submissionId)
    } catch (error) {
        console.error('Failed to submit task:', error)
        return { success: false, error: String(error) }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 7 & 8: EVALUATION + GENOME UPDATE
// ─────────────────────────────────────────────────────────────────────────────

export async function evaluateSubmissionAndUpdate(userId: string, submissionId: string) {
    try {
        // Evaluate
        const evalResponse = await apiClient.evaluateSubmission(submissionId)

        if (!evalResponse.success) {
            return {
                success: false,
                error: 'Evaluation failed',
            }
        }

        logFlowEvent({
            type: 'EVALUATION_COMPLETE',
            userId,
            timestamp: new Date().toISOString(),
            data: evalResponse.data,
            nextStep: 'Update genome and twin',
        })

        // Update genome with new skill proficiency
        const genome = await apiClient.getGenome()
        if (genome.success && evalResponse.data) {
            const evalData = evalResponse.data as any
            // Simulate genetic update
            await apiClient.updateGenome({
                newScore: evalData?.overallScore || 0,
                evaluationData: evalData,
            })

            logFlowEvent({
                type: 'GENOME_UPDATED',
                userId,
                timestamp: new Date().toISOString(),
                data: { newScore: evalData?.overallScore || 0 },
                nextStep: 'Generate proof artifacts or next task',
            })
        }

        // Also update twin
        await apiClient.getTwin()

        return { success: true, evaluation: evalResponse.data }
    } catch (error) {
        console.error('Failed to evaluate and update:', error)
        return { success: false, error: String(error) }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 9: PROOF GENERATION
// ─────────────────────────────────────────────────────────────────────────────

export async function generateProofArtifact(
    userId: string,
    submissionId: string,
    data: {
        artifactType: string
        title: string
        description: string
        content: string
        skills: string[]
    }
) {
    try {
        const proofResponse = await apiClient.createProof({
            ...data,
            labSubmissionId: submissionId,
        })

        if (!proofResponse.success) {
            return {
                success: false,
                error: 'Proof generation failed',
            }
        }

        logFlowEvent({
            type: 'PROOF_CREATED',
            userId,
            timestamp: new Date().toISOString(),
            data: { proofId: (proofResponse.data as any)?.id || '', type: data.artifactType },
            nextStep: 'User can share or continue learning',
        })

        return { success: true, proof: proofResponse.data }
    } catch (error) {
        console.error('Failed to generate proof:', error)
        return { success: false, error: String(error) }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 10: AI MENTOR CONSULTATION
// ─────────────────────────────────────────────────────────────────────────────

export async function consultMentor(userId: string, query: string, context?: any) {
    try {
        // Fetch all current state for mentor context
        const [userRes, twinRes, genomeRes, roadmapRes] = await Promise.all([
            apiClient.getUser(),
            apiClient.getTwin(),
            apiClient.getGenome(),
            apiClient.getRoadmap(),
        ])

        const mentorContext = {
            user: userRes.data,
            twin: twinRes.data,
            genome: genomeRes.data,
            roadmap: roadmapRes.data,
            ...context,
        }

        const mentorResponse = await apiClient.mentorSession(query, mentorContext)

        if (!mentorResponse.success) {
            return {
                success: false,
                error: 'Mentor session failed',
            }
        }

        return { success: true, session: mentorResponse.data }
    } catch (error) {
        console.error('Failed to consult mentor:', error)
        return { success: false, error: String(error) }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 11: OUTCOME SIMULATION
// ─────────────────────────────────────────────────────────────────────────────

export async function simulateCareerOutcome(userId: string, params?: any) {
    try {
        const simResponse = await apiClient.runSimulation(params || {})

        if (!simResponse.success) {
            return {
                success: false,
                error: 'Simulation failed',
            }
        }

        logFlowEvent({
            type: 'SIMULATION_COMPLETE',
            userId,
            timestamp: new Date().toISOString(),
            data: simResponse.data,
            nextStep: 'Display results to user',
        })

        return { success: true, simulation: simResponse.data }
    } catch (error) {
        console.error('Failed to simulate outcome:', error)
        return { success: false, error: String(error) }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM STATE SNAPSHOT
// ─────────────────────────────────────────────────────────────────────────────

export async function getSystemState(userId: string): Promise<ApiResponse<SystemState>> {
    try {
        const [user, twin, genome, roadmap, submissionsRes] = await Promise.all([
            apiClient.getUser(),
            apiClient.getTwin(),
            apiClient.getGenome(),
            apiClient.getRoadmap(),
            apiClient.getSubmissions({ limit: 1, sort: '-submittedAt' }),
        ])

        const userData = user.data as any
        const submissionsData = submissionsRes.data as any[]

        const systemState: SystemState = {
            user: userData,
            domain: {
                domain: userData?.selectedDomain || '',
                role: userData?.selectedRole || '',
                confidenceScore: 0,
                timestamp: new Date().toISOString(),
            },
            twin: twin.data as any,
            genome: genome.data as any,
            roadmap: roadmap.data as any,
            lastRevenueActivity: submissionsData && submissionsData.length > 0
                ? {
                    type: 'task_submitted',
                    timestamp: submissionsData[0]?.submittedAt,
                    data: submissionsData[0],
                }
                : null,
            isLoading: false,
            error: null,
            updatedAt: new Date().toISOString(),
        }

        return {
            success: true,
            data: systemState,
            error: null,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        console.error('Failed to get system state:', error)
        return {
            success: false,
            data: null,
            error: String(error),
            timestamp: new Date().toISOString(),
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIGGER AUTOMATIONS ON EVENTS
// ─────────────────────────────────────────────────────────────────────────────

export async function onDomainSelected(userId: string, domain: string, role: string) {
    console.log('EVENT: Domain selected → AUTO: Generating roadmap')
    return generatePersonalizedRoadmap(userId, domain, role)
}

export async function onTaskCompleted(userId: string, submissionId: string) {
    console.log('EVENT: Task completed → AUTO: Evaluating and updating genome')
    return evaluateSubmissionAndUpdate(userId, submissionId)
}

export async function onSkillUpdated(userId: string) {
    console.log('EVENT: Skill updated → AUTO: Updating roadmap recommendations')
    // Fetch current roadmap and recalculate next nodes
    return apiClient.getRoadmap()
}
