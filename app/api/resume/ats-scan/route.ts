/**
 * Advanced ATS Resume Scanner API
 * Comprehensive resume analysis using OpenRouter with Groq fallback
 * Analyzes ATS compatibility, job matching, skill gaps, and provides detailed recommendations
 * Uses Open_Router_AI_Mentor_Key as primary and GROQ_RESUME_BUILDER_KEY as fallback
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ATSScanResult, ResumeAPIResponse } from '@/types/resume'
import Groq from 'groq-sdk'

const GROQ_API_KEY = process.env.GROQ_RESUME_BUILDER_KEY
const OPENROUTER_API_KEY = process.env.Open_Router_AI_Mentor_Key
const OPENROUTER_MODEL = process.env.OPENROUTER_RESUME_MODEL || 'openai/gpt-4o-mini'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'] as const

interface ATSScanRequest {
  resumeText: string
  jobDescription?: string
}

function extractJsonObject(text: string): any | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return null
  }

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

async function runOpenRouterATSAnalysis(prompt: string): Promise<any | null> {
  if (!OPENROUTER_API_KEY) {
    return null
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as any
    const analysisText = data?.choices?.[0]?.message?.content || '{}'
    return extractJsonObject(analysisText)
  } catch {
    return null
  }
}

async function runGroqATSAnalysis(prompt: string): Promise<any | null> {
  if (!GROQ_API_KEY) {
    return null
  }

  const groqClient = new Groq({ apiKey: GROQ_API_KEY })

  for (const model of GROQ_MODELS) {
    try {
      const response = await groqClient.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })

      const analysisText = response.choices[0]?.message?.content || '{}'
      const parsed = extractJsonObject(analysisText)
      if (parsed) {
        return parsed
      }
    } catch {
      continue
    }
  }

  return null
}

// Helper: Extract skills from text
function extractSkills(text: string): string[] {
  const skills = new Set<string>()
  const skillPatterns = [
    /\b(?:python|javascript|typescript|java|c\+\+|c#|ruby|php|go|rust|kotlin|swift|scala|perl)\b/gi,
    /\b(?:react|vue|angular|node\.js|express|django|flask|spring|laravel|rails)\b/gi,
    /\b(?:aws|azure|gcp|docker|kubernetes|terraform|jenkins|gitlab)\b/gi,
    /\b(?:sql|mongodb|postgresql|mysql|redis|elasticsearch|cassandra|dynamodb)\b/gi,
    /\b(?:machine learning|artificial intelligence|deep learning|nlp|computer vision)\b/gi,
    /\b(?:agile|scrum|kanban|ci\/cd|rest api|graphql|microservices)\b/gi,
    /\b(?:communication|leadership|teamwork|project management|problem solving)\b/gi,
  ]

  skillPatterns.forEach((pattern) => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      skills.add(match[0].toLowerCase())
    }
  })

  return Array.from(skills)
}

// Helper: Detect job role from job description
function detectJobRole(jobDescription: string): string {
  const rolePatterns = [
    /(?:position|role|job title|we're looking for a)\s+([a-z\s]+?)(?:\.|$|to\s|who|for)/i,
    /^([a-z\s]+?)(?:\s+role|\s+position)/im,
    /([a-z\s]+?)\s+(?:engineer|developer|manager|analyst|specialist|architect)/i,
  ]

  for (const pattern of rolePatterns) {
    const match = jobDescription.match(pattern)
    if (match && match[1]) {
      return match[1].trim().split('\n')[0]
    }
  }

  return 'Software Engineer'
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          timestamp: new Date().toISOString(),
        } as ResumeAPIResponse,
        { status: 401 }
      )
    }

    const { resumeText, jobDescription } = (await req.json()) as ATSScanRequest

    if (!resumeText) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resume text is required',
          timestamp: new Date().toISOString(),
        } as ResumeAPIResponse,
        { status: 400 }
      )
    }

    // Extract skills locally for quick analysis
    const resumeSkills = extractSkills(resumeText)
    const jobSkills = jobDescription ? extractSkills(jobDescription) : []
    const matchedSkills = resumeSkills.filter((skill) =>
      jobDescription?.toLowerCase().includes(skill.toLowerCase())
    )
    const missingSkills = jobSkills.filter((skill) => !resumeSkills.includes(skill))

    // Calculate basic match score if job description provided
    let baseMatchScore = 75 // Default score for ATS compatibility
    if (jobDescription && jobSkills.length > 0) {
      const skillMatchRatio = matchedSkills.length / jobSkills.length
      baseMatchScore = Math.round(skillMatchRatio * 100 * 0.6 + 75 * 0.4)
    }

    // Use OpenRouter first, then Groq, then local deterministic analysis
    let analysis: any = null

    const analysisPrompt = `You are an expert ATS (Applicant Tracking System) analyst and resume optimization specialist.

Analyze the following resume${jobDescription ? ' against the provided job description' : ''} and provide detailed ATS analysis:

RESUME:
${resumeText}

${jobDescription ? `\nJOB DESCRIPTION:\n${jobDescription}` : ''}

Provide your analysis in valid JSON format (no markdown, just raw JSON):
{
  "atsScore": <number 0-100>,
  "atsCompatibility": {
    "format": <"excellent" | "good" | "poor">,
    "parsing": <"high" | "medium" | "low">,
    "readability": <number 0-100>
  },
  "keywordAnalysis": {
    "totalKeywords": <number>,
    "matchedKeywords": [<string>],
    "missingKeywords": [<string>],
    "recommendedAdditions": [<string>]
  },
  "jobMatchAnalysis": {
    "targetRole": "<detected job title>",
    "roleMatch": <number 0-100>,
    "skillsMatch": <number 0-100>,
    "experienceMatch": <number 0-100>,
    "educationRelevance": <number 0-100>
  },
  "strengths": [<string>],
  "improvements": [
    {
      "priority": <"critical" | "high" | "medium" | "low">,
      "issue": "<issue>",
      "solution": "<solution>",
      "impact": "<improvement>"
    }
  ],
  "formattingIssues": [<string>],
  "recommendations": {
    "shortTerm": [<string>],
    "longTerm": [<string>]
  }
}

Focus on ATS compatibility, keywords, structure, and job fit.`

    analysis = await runOpenRouterATSAnalysis(analysisPrompt)
    if (!analysis) {
      analysis = await runGroqATSAnalysis(analysisPrompt)
    }

    // Build final result
    let finalScore = baseMatchScore
    if (analysis?.jobMatchAnalysis) {
      const weights = {
        skills: 0.4,
        experience: 0.25,
        education: 0.15,
        format: 0.2,
      }

      finalScore = Math.round(
        (analysis.jobMatchAnalysis.skillsMatch || 0) * weights.skills +
          (analysis.jobMatchAnalysis.experienceMatch || 0) * weights.experience +
          (analysis.jobMatchAnalysis.educationRelevance || 0) * weights.education +
          (analysis.atsScore || 85) * weights.format
      )
    }

    const scanResult: ATSScanResult = {
      score: Math.min(100, Math.max(0, finalScore)),
      timestamp: new Date().toISOString(),
      jobDescription,
      missingKeywords: analysis?.keywordAnalysis?.missingKeywords || missingSkills,
      foundKeywords: analysis?.keywordAnalysis?.matchedKeywords || matchedSkills,
      suggestions: (analysis?.improvements || []).map((imp: any) => ({
        priority: imp.priority,
        suggestion: imp.solution,
        section: 'Resume',
      })),
      formatting: {
        atsCompatible: analysis?.atsCompatibility?.parsing !== 'low' ?? true,
        issues: analysis?.formattingIssues || [],
        recommendations: [
          ...(analysis?.recommendations?.shortTerm || []),
          'Use standard fonts and formatting',
          'Avoid tables, images, and special characters',
          'Keep clear section headings',
        ],
      },
      readabilityScore: analysis?.atsCompatibility?.readability || 75,
      competencyMatch: (analysis?.keywordAnalysis?.matchedKeywords || matchedSkills || []).slice(0, 8).map((skill: string) => ({
        skill,
        resumeLevel: 'verified',
        jobRequiredLevel: 'intermediate',
        gap: 'meet',
      })),
    }

    return NextResponse.json(
      {
        success: true,
        data: scanResult,
        timestamp: new Date().toISOString(),
      } as ResumeAPIResponse<ATSScanResult>
    )
  } catch (error) {
    console.error('ATS scan error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to scan resume for ATS compatibility',
        timestamp: new Date().toISOString(),
      } as ResumeAPIResponse,
      { status: 500 }
    )
  }
}
