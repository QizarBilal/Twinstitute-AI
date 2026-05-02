/**
 * INTERVIEW EVALUATION ENGINE
 * Evaluates interview answers using Groq AI
 */

import { callGroqAPI, GroqMessage } from '@/lib/groq-client'

export interface InterviewEvaluationResult {
  success: boolean
  score: number // 0-100
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
}

/**
 * Evaluate an interview answer using AI
 *
 * @param transcript - The text of the user's answer
 * @param question - The interview question asked
 * @param role - The target role/position
 * @param domain - The technical domain (optional)
 * @returns Detailed evaluation with scores and feedback
 */
export async function evaluateInterview(
  transcript: string,
  question: string,
  role: string,
  domain?: string
): Promise<InterviewEvaluationResult> {
  try {
    if (!transcript || transcript.length < 10) {
      return {
        success: false,
        score: 0,
        strengths: [],
        weaknesses: ['Answer is too short to evaluate properly'],
        suggestions: ['Provide a more detailed answer with specific examples'],
        feedback: 'The answer provided was insufficient for proper evaluation.',
        detailedScores: {
          technicalDepth: 0,
          clarity: 0,
          structure: 0,
          confidence: 0,
          completeness: 0,
        },
      }
    }

    const domainContext = domain ? `Domain: ${domain}\n` : ''

    const evaluationPrompt = `You are an expert technical interviewer evaluating interview responses for a ${role} position.

${domainContext}
Question Asked: "${question}"

Candidate's Answer:
"${transcript}"

Evaluate this answer and provide your assessment in the following JSON format:
{
  "score": <number 0-100>,
  "technicalDepth": <number 0-100>,
  "clarity": <number 0-100>,
  "structure": <number 0-100>,
  "confidence": <number 0-100>,
  "completeness": <number 0-100>,
  "strengths": [<array of 3-5 key strengths identified>],
  "weaknesses": [<array of 3-5 key weaknesses>],
  "suggestions": [<array of 3-5 specific improvement suggestions>],
  "feedback": "Detailed paragraph of feedback explaining the evaluation"
}

Scoring criteria:
- Technical Depth (0-100): How deep and technically accurate is the answer?
- Clarity (0-100): How well-explained and easy to follow is the answer?
- Structure (0-100): Is the answer well-organized with clear logical flow?
- Confidence (0-100): Does the candidate demonstrate confidence and expertise?
- Completeness (0-100): Does the answer fully address the question?

Overall Score should be the weighted average of these five metrics.`

    const messages: GroqMessage[] = [
      {
        role: 'user',
        content: evaluationPrompt,
      },
    ]

    const response = await callGroqAPI(messages, 0.7, 2000)

    // Parse the response
    const parsed = parseEvaluationResponse(response)
    return {
      success: true,
      ...parsed,
    }
  } catch (error) {
    console.error('Interview evaluation error:', error)
    return {
      success: false,
      score: 0,
      strengths: [],
      weaknesses: [`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      suggestions: ['Please try again'],
      feedback: 'There was an error evaluating your interview response.',
      detailedScores: {
        technicalDepth: 0,
        clarity: 0,
        structure: 0,
        confidence: 0,
        completeness: 0,
      },
    }
  }
}

/**
 * Parse the evaluation JSON response from Groq
 */
function parseEvaluationResponse(response: string): Omit<InterviewEvaluationResult, 'success'> {
  try {
    // Extract JSON from the response (handle cases where there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate and normalize the response
    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 50)),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      feedback: String(parsed.feedback || ''),
      detailedScores: {
        technicalDepth: Math.min(100, Math.max(0, Number(parsed.technicalDepth) || 50)),
        clarity: Math.min(100, Math.max(0, Number(parsed.clarity) || 50)),
        structure: Math.min(100, Math.max(0, Number(parsed.structure) || 50)),
        confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 50)),
        completeness: Math.min(100, Math.max(0, Number(parsed.completeness) || 50)),
      },
    }
  } catch (error) {
    console.error('Failed to parse evaluation response:', error, response)
    // If the response is the demo/fallback string returned when no GROQ key is configured,
    // return a friendly mock evaluation so the UI can display something useful instead
    const lower = String(response || '').toLowerCase()
    if (lower.includes('demo response') || lower.includes('groq key') || lower.includes('please configure')) {
      return {
        score: 60,
        strengths: ['Answer was captured (demo evaluation)'],
        weaknesses: ['Detailed AI evaluation unavailable - configure GROQ key'],
        suggestions: ['Set GROQ_RECRUITER_KEY in environment to enable full evaluation', 'Retry after configuring the key'],
        feedback: 'This is a demo evaluation. The platform could not contact the Groq API because an API key was not configured. Configure GROQ_RECRUITER_KEY or GROQ_API_KEY to receive full AI evaluations.',
        detailedScores: {
          technicalDepth: 60,
          clarity: 60,
          structure: 60,
          confidence: 60,
          completeness: 60,
        },
      }
    }

    // Generic fallback response if parsing fails for other reasons
    return {
      score: 50,
      strengths: ['Unable to parse detailed feedback'],
      weaknesses: ['Parsing error occurred'],
      suggestions: ['Please contact support if this persists'],
      feedback: `Raw evaluation: ${String(response || '').substring(0, 200)}...`,
      detailedScores: {
        technicalDepth: 50,
        clarity: 50,
        structure: 50,
        confidence: 50,
        completeness: 50,
      },
    }
  }
}

/**
 * Generate improvement recommendations based on evaluation
 */
export function generateImprovementPlan(
  evaluation: InterviewEvaluationResult
): {
  priority: string[]
  shortTerm: string[]
  longTerm: string[]
} {
  const priority = evaluation.suggestions.slice(0, 3)

  const shortTerm = [
    evaluation.weaknesses[0] || 'Focus on clarity of expression',
    'Practice answering similar questions',
    'Record yourself and listen back for improvements',
  ].filter(Boolean)

  const longTerm = [
    `Study deeper into technical depth (currently ${evaluation.detailedScores.technicalDepth}/100)`,
    `Improve answer structure and organization (currently ${evaluation.detailedScores.structure}/100)`,
    'Build a portfolio of solved problems to reference',
  ]

  return { priority, shortTerm, longTerm }
}

/**
 * Calculate performance trend and recommendations
 */
export function calculatePerformanceTrend(
  evaluations: InterviewEvaluationResult[]
): {
  averageScore: number
  trend: 'improving' | 'declining' | 'stable'
  improvementAreas: string[]
  strengtheningAreas: string[]
} {
  if (evaluations.length === 0) {
    return {
      averageScore: 0,
      trend: 'stable',
      improvementAreas: [],
      strengtheningAreas: [],
    }
  }

  const scores = evaluations.map(e => e.score)
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length

  let trend: 'improving' | 'declining' | 'stable' = 'stable'
  if (scores.length > 1) {
    const recent = scores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length)
    const older = scores.slice(0, -1).reduce((a, b) => a + b, 0) / Math.max(1, scores.length - 1)
    if (recent > older + 5) trend = 'improving'
    if (recent < older - 5) trend = 'declining'
  }

  // Aggregate weaknesses to find improvement areas
  const weaknessMap = new Map<string, number>()
  evaluations.forEach(e => {
    e.weaknesses.forEach(w => {
      weaknessMap.set(w, (weaknessMap.get(w) || 0) + 1)
    })
  })

  const improvementAreas = Array.from(weaknessMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area]) => area)

  // Aggregate strengths
  const strengthMap = new Map<string, number>()
  evaluations.forEach(e => {
    e.strengths.forEach(s => {
      strengthMap.set(s, (strengthMap.get(s) || 0) + 1)
    })
  })

  const strengtheningAreas = Array.from(strengthMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area]) => area)

  return {
    averageScore: Math.round(averageScore),
    trend,
    improvementAreas,
    strengtheningAreas,
  }
}
