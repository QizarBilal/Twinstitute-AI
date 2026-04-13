/**
 * INTERVIEW API CLIENT
 * Frontend utility for interacting with interview evaluation APIs
 */

export interface InterviewEvaluationData {
  id: string
  question: string
  role: string
  domain?: string
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  feedback: string
  detailedScores: {
    technicalDepth: number
    clarity: number
    structure: number
    confidence: number
    completeness: number
  }
  transcript: string
  storedAt: string
}

export interface InterviewHistoryResponse {
  interviews: InterviewEvaluationData[]
  pagination: {
    limit: number
    offset: number
    total: number
    hasMore: boolean
  }
  statistics: {
    totalEvaluations: number
    averageScore: number
    highestScore: number
    latestScore: number
    uniqueRoles: string[]
    uniqueDomains: string[]
  }
}

/**
 * Upload audio file to storage
 */
export async function uploadAudio(audioBlob: Blob): Promise<{
  success: boolean
  data?: { url: string; filename: string; size: number; type: string }
  error?: string
}> {
  try {
    const formData = new FormData()
    formData.append('audio', audioBlob)

    const response = await fetch('/api/recruiter/upload-audio', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Audio upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Evaluate interview answer
 */
export async function evaluateInterview(params: {
  audioUrl?: string
  audioBlob?: string
  question: string
  role: string
  domain?: string
}): Promise<{
  success: boolean
  data?: InterviewEvaluationData
  error?: string
}> {
  try {
    const response = await fetch('/api/recruiter/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Interview evaluation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Evaluation failed',
    }
  }
}

/**
 * Get interview history
 */
export async function getInterviewHistory(options?: {
  limit?: number
  offset?: number
  role?: string
  domain?: string
}): Promise<{
  success: boolean
  data?: InterviewHistoryResponse
  error?: string
}> {
  try {
    const params = new URLSearchParams()
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.offset) params.append('offset', options.offset.toString())
    if (options?.role) params.append('role', options.role)
    if (options?.domain) params.append('domain', options.domain)

    const response = await fetch(`/api/recruiter/interviews?${params.toString()}`)
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Failed to fetch interview history:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fetch failed',
    }
  }
}

/**
 * Delete an interview evaluation
 */
export async function deleteInterview(interviewId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const response = await fetch(`/api/recruiter/interviews?id=${interviewId}`, {
      method: 'DELETE',
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Failed to delete interview:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

/**
 * Combined flow: record → upload → evaluate
 */
export async function completeInterviewFlow(params: {
  audioBlob: Blob
  question: string
  role: string
  domain?: string
  onProgress?: (stage: string) => void
}): Promise<{
  success: boolean
  data?: InterviewEvaluationData
  error?: string
}> {
  try {
    // Step 1: Upload
    if (params.onProgress) params.onProgress('uploading')
    const uploadResult = await uploadAudio(params.audioBlob)
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed')
    }

    // Step 2: Evaluate
    if (params.onProgress) params.onProgress('evaluating')
    const evaluationResult = await evaluateInterview({
      audioUrl: uploadResult.data?.url,
      question: params.question,
      role: params.role,
      domain: params.domain,
    })

    if (!evaluationResult.success) {
      throw new Error(evaluationResult.error || 'Evaluation failed')
    }

    if (params.onProgress) params.onProgress('complete')

    return evaluationResult
  } catch (error) {
    console.error('Interview flow failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Interview process failed',
    }
  }
}
