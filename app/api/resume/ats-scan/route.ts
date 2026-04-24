/**
 * Advanced ATS Resume Scanner API
 * Comprehensive resume analysis inspired by SkillMatch-AI
 * Analyzes ATS compatibility, job matching, skill gaps, and provides detailed recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ATSScanResult, ResumeAPIResponse } from '@/types/resume'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-1'
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

interface ATSScanRequest {
  resumeText: string
  jobDescription?: string
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
    const session = await getServerSession()

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

    // Call Claude API for comprehensive analysis
    const claudePrompt = `You are an expert ATS (Applicant Tracking System) analyst and resume optimization specialist working with enterprise recruiting teams.

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
  "sections": {
    "<section_name>": {
      "present": <boolean>,
      "quality": <"strong" | "adequate" | "weak">,
      "suggestion": "<actionable suggestion>"
    }
  },
  "jobMatchAnalysis": {
    "targetRole": "<detected job title>",
    "roleMatch": <number 0-100>,
    "skillsMatch": <number 0-100>,
    "experienceMatch": <number 0-100>,
    "educationRelevance": <number 0-100>,
    "overallFit": <"strong" | "moderate" | "weak">
  },
  "strengths": [<string>],
  "improvements": [
    {
      "priority": <"critical" | "high" | "medium" | "low">,
      "issue": "<issue description>",
      "solution": "<specific solution>",
      "impact": "<expected improvement>"
    }
  ],
  "formattingIssues": [<string>],
  "recommendations": {
    "shortTerm": [<string>],
    "longTerm": [<string>]
  }
}

Focus on:
1. ATS parsing compatibility (format, structure, special characters)
2. Keyword density and relevance to job (if provided)
3. Section completeness and organization
4. Quantified achievements and metrics
5. Technical terminology precision
6. Experience duration and progression
7. Education alignment
8. Modern resume best practices

Be specific, actionable, and data-driven.`

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2500,
        messages: [
          {
            role: 'user',
            content: claudePrompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)

      // Return partial analysis using local extraction
      const scanResult: ATSScanResult = {
        score: baseMatchScore,
        timestamp: new Date().toISOString(),
        jobDescription,
        missingKeywords: missingSkills,
        foundKeywords: matchedSkills,
        suggestions: [
          {
            priority: 'high',
            suggestion: 'Use an online resume checker to verify ATS compatibility',
            section: 'General',
          },
        ],
        formatting: {
          atsCompatible: true,
          issues: [],
          recommendations: ['Consider using standard fonts (Arial, Calibri)', 'Avoid tables and complex formatting'],
        },
        readabilityScore: 70,
        competencyMatch: jobSkills.slice(0, 5).map((skill) => ({
          skill,
          resumeLevel: resumeSkills.includes(skill) ? 'verified' : 'weak',
          jobRequiredLevel: 'intermediate',
          gap: resumeSkills.includes(skill) ? 'meet' : 'below',
        })),
      }

      return NextResponse.json(
        {
          success: true,
          data: scanResult,
          timestamp: new Date().toISOString(),
        } as ResumeAPIResponse<ATSScanResult>
      )
    }

    const data = (await response.json()) as any
    let analysisText = data.content[0]?.text || '{}'

    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse Claude response')
    }

    const analysis = JSON.parse(jsonMatch[0])

    // Calculate weighted final score
    let finalScore = baseMatchScore
    if (jobDescription && analysis.jobMatchAnalysis) {
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
          (analysis.atsScore || analysis.atsCompatibility?.parseability === 'high' ? 85 : 65) * weights.format
      )
    }

    const scanResult: ATSScanResult = {
      score: Math.min(100, Math.max(0, finalScore)),
      timestamp: new Date().toISOString(),
      jobDescription,
      missingKeywords: analysis.keywordAnalysis?.missingKeywords || missingSkills,
      foundKeywords: analysis.keywordAnalysis?.matchedKeywords || matchedSkills,
      suggestions: (analysis.improvements || []).map((imp: any) => ({
        priority: imp.priority,
        suggestion: imp.solution,
        section: 'Resume',
      })),
      formatting: {
        atsCompatible: analysis.atsCompatibility?.parsing !== 'low',
        issues: analysis.formattingIssues || [],
        recommendations: [
          ...(analysis.recommendations?.shortTerm || []),
          'Use standard fonts and formatting',
          'Avoid tables, images, and special characters',
        ],
      },
      readabilityScore: analysis.atsCompatibility?.readability || 75,
      competencyMatch: (analysis.keywordAnalysis?.matchedKeywords || []).slice(0, 8).map((skill: string) => ({
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
