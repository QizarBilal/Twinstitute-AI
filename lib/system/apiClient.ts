/**
 * UNIFIED API CLIENT
 * Central hub for all API communication with standardized error handling
 */

import { ApiResponse } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// API CLIENT CLASS
// ─────────────────────────────────────────────────────────────────────────────

class ApiClient {
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'

    async request<T>(
        endpoint: string,
        options: RequestInit & { skipValidation?: boolean } = {}
    ): Promise<ApiResponse<T>> {
        const { skipValidation, ...fetchOptions } = options
        const url = `${this.baseUrl}${endpoint}`

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...fetchOptions.headers,
                },
                ...fetchOptions,
            })

            // Check if response is ok
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                return {
                    success: false,
                    data: null,
                    error: errorData.error || `HTTP ${response.status}`,
                    timestamp: new Date().toISOString(),
                }
            }

            const data = await response.json()

            // Validate response format unless skipped
            if (!skipValidation && !this.isValidApiResponse(data)) {
                console.warn('Invalid API response format:', data)
                return {
                    success: true,
                    data: data as T,
                    error: null,
                    timestamp: new Date().toISOString(),
                }
            }

            return {
                ...data,
                timestamp: data.timestamp || new Date().toISOString(),
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            console.error(`API request failed: ${endpoint}`, error)

            return {
                success: false,
                data: null,
                error: message,
                timestamp: new Date().toISOString(),
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER & AUTH
    // ─────────────────────────────────────────────────────────────────────────

    async getUser() {
        return this.request('/user')
    }

    async updateUser(data: any) {
        return this.request('/user', {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DOMAIN & STRATEGY
    // ─────────────────────────────────────────────────────────────────────────

    async selectDomain(domain: string, role: string) {
        return this.request('/domain/select', {
            method: 'POST',
            body: JSON.stringify({ domain, role }),
        })
    }

    async getDomainSelection() {
        return this.request('/domain/selection')
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CAPABILITY TWIN
    // ─────────────────────────────────────────────────────────────────────────

    async getTwin() {
        return this.request('/twin')
    }

    async updateTwin(data: any) {
        return this.request('/twin', {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SKILL GENOME
    // ─────────────────────────────────────────────────────────────────────────

    async getGenome() {
        return this.request('/genome')
    }

    async updateGenome(data: any) {
        return this.request('/genome', {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ROADMAP
    // ─────────────────────────────────────────────────────────────────────────

    async generateRoadmap(domain: string, role: string) {
        return this.request('/roadmap/generate', {
            method: 'POST',
            body: JSON.stringify({ domain, role }),
        })
    }

    async getRoadmap() {
        return this.request('/roadmap')
    }

    async updateRoadmapProgress(nodeId: string, status: string) {
        return this.request('/roadmap/progress', {
            method: 'PUT',
            body: JSON.stringify({ nodeId, status }),
        })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LAB TASKS
    // ─────────────────────────────────────────────────────────────────────────

    async generateTasks(count: number = 5) {
        return this.request('/labs/generate', {
            method: 'POST',
            body: JSON.stringify({ count }),
        })
    }

    async getTasks(filters?: any) {
        const queryString = filters ? `?${new URLSearchParams(filters)}` : ''
        return this.request(`/labs/tasks${queryString}`)
    }

    async getTask(taskId: string) {
        return this.request(`/labs/tasks/${taskId}`)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LAB SUBMISSIONS
    // ─────────────────────────────────────────────────────────────────────────

    async submitTask(taskId: string, submission: any) {
        return this.request('/labs/submit', {
            method: 'POST',
            body: JSON.stringify({ taskId, ...submission }),
        })
    }

    async getSubmission(submissionId: string) {
        return this.request(`/labs/submissions/${submissionId}`)
    }

    async getSubmissions(filters?: any) {
        const queryString = filters ? `?${new URLSearchParams(filters)}` : ''
        return this.request(`/labs/submissions${queryString}`)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EVALUATION
    // ─────────────────────────────────────────────────────────────────────────

    async evaluateSubmission(submissionId: string) {
        return this.request('/evaluation/evaluate', {
            method: 'POST',
            body: JSON.stringify({ submissionId }),
        })
    }

    async getEvaluation(submissionId: string) {
        return this.request(`/evaluation/${submissionId}`)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PROOF
    // ─────────────────────────────────────────────────────────────────────────

    async createProof(data: any) {
        return this.request('/proof/create', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async getProofs() {
        return this.request('/proof')
    }

    async getProof(proofId: string) {
        return this.request(`/proof/${proofId}`)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SIMULATION
    // ─────────────────────────────────────────────────────────────────────────

    async runSimulation(params: any) {
        return this.request('/simulation/run', {
            method: 'POST',
            body: JSON.stringify(params),
        })
    }

    async getSimulation() {
        return this.request('/simulation')
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MENTOR
    // ─────────────────────────────────────────────────────────────────────────

    async mentorSession(query: string, context?: any) {
        return this.request('/mentor/session', {
            method: 'POST',
            body: JSON.stringify({ query, context }),
        })
    }

    async getMentorSessions() {
        return this.request('/mentor/sessions')
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL METHODS
    // ─────────────────────────────────────────────────────────────────────────

    private isValidApiResponse(data: any): boolean {
        return typeof data === 'object' && 'success' in data
    }
}

// Export singleton instance
export const apiClient = new ApiClient()
