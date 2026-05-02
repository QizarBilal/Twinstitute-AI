/**
 * Hook: useResumeAIEnhancement
 * Provides AI-powered content enhancement for resume sections
 * Integrates with GROQ_RESUME_BUILDER_KEY
 */

import { useState, useCallback } from 'react'
import { ResumeData } from '@/types/resume'

export interface AIEnhancementState {
  isLoading: boolean
  error: string | null
  enhanced: string | null
  suggestions: string[]
  atsScore: number
  keywords: string[]
}

export function useResumeAIEnhancement() {
  const [state, setState] = useState<AIEnhancementState>({
    isLoading: false,
    error: null,
    enhanced: null,
    suggestions: [],
    atsScore: 0,
    keywords: [],
  })

  const enhanceContent = useCallback(
    async (section: 'summary' | 'experience' | 'skills' | 'education' | 'projects', currentContent: string, context?: any) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await fetch('/api/resume/ai-enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section,
            currentContent,
            context,
          }),
        })

        if (!response.ok) throw new Error('Failed to enhance content')

        const data = await response.json()

        if (!data.success) throw new Error(data.error || 'Enhancement failed')

        setState({
          isLoading: false,
          error: null,
          enhanced: data.data.enhanced,
          suggestions: data.data.suggestions,
          atsScore: data.data.atsScore,
          keywords: data.data.keywords,
        })

        return data.data
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to enhance'
        setState(prev => ({ ...prev, isLoading: false, error: message, enhanced: null }))
        return null
      }
    },
    []
  )

  const compareWithJob = useCallback(async (resumeContent: string, jobDescription: string, targetRole?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/resume/job-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeContent,
          jobDescription,
          targetRole,
        }),
      })

      if (!response.ok) throw new Error('Failed to compare')

      const data = await response.json()

      if (!data.success) throw new Error(data.error || 'Comparison failed')

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        suggestions: data.data.suggestedImprovements,
      }))

      return data.data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to compare'
      setState(prev => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  const generateContent = useCallback(
    async (role: string, targetPosition: string, yearsExperience: number, skills: string[]) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await fetch('/api/resume/content-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role,
            targetPosition,
            yearsExperience,
            skills,
          }),
        })

        if (!response.ok) throw new Error('Failed to generate')

        const data = await response.json()

        if (!data.success) throw new Error(data.error || 'Generation failed')

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          enhanced: data.data.summary,
          keywords: data.data.keywords,
        }))

        return data.data
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate'
        setState(prev => ({ ...prev, isLoading: false, error: message }))
        return null
      }
    },
    []
  )

  const clearState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      enhanced: null,
      suggestions: [],
      atsScore: 0,
      keywords: [],
    })
  }, [])

  return {
    ...state,
    enhanceContent,
    compareWithJob,
    generateContent,
    clearState,
  }
}
