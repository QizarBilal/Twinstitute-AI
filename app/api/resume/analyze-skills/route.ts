/**
 * Skills Analysis API
 * OpenRouter-first with Groq fallback and deterministic local fallback.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Groq from 'groq-sdk'
import { SkillsAnalysisResult, ResumeAPIResponse } from '@/types/resume'

const OPENROUTER_API_KEY = process.env.Open_Router_AI_Mentor_Key
const OPENROUTER_MODEL = process.env.OPENROUTER_RESUME_MODEL || 'openai/gpt-4o-mini'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const GROQ_API_KEY = process.env.GROQ_RESUME_BUILDER_KEY
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'] as const

interface SkillsAnalysisRequest {
  skills: Array<{ name: string; level: 'verified' | 'developing' | 'weak'; strength: number }>
  targetRole?: string
}

function buildLocalSkillsAnalysis(
  skills: SkillsAnalysisRequest['skills'],
  targetRole?: string
): SkillsAnalysisResult {
  const skillsByLevel = {
    verified: skills.filter((s) => s.level === 'verified').length,
    developing: skills.filter((s) => s.level === 'developing').length,
    weak: skills.filter((s) => s.level === 'weak').length,
  }

  const topSkills = [...skills]
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 8)
    .map((s) => ({
      name: s.name,
      level: s.level,
      strength: s.strength,
    }))

  const total = skills.length
  const benchmark = 12
  const recommendations: string[] = []

  if (skillsByLevel.verified < 5) {
    recommendations.push('Increase depth in your strongest skills and convert developing skills to verified.')
  }
  if (skillsByLevel.weak > 0) {
    recommendations.push('Prioritize 2-3 weak skills that are most relevant to your target role.')
  }
  if (total < benchmark) {
    recommendations.push('Add role-specific tools and frameworks to match current market expectations.')
  }
  if (recommendations.length === 0) {
    recommendations.push('Your profile is balanced. Keep adding measurable proof for top skills in projects and experience.')
  }

  return {
    timestamp: new Date().toISOString(),
    totalSkills: total,
    byLevel: skillsByLevel,
    topSkills,
    skillGaps: [
      {
        category: targetRole || 'Target Role',
        currentLevel: skillsByLevel.verified >= 5 ? 'proficient' : 'developing',
        recommendedLevel: 'expert',
        suggestions: [
          'Align top skills with target job descriptions.',
          'Use ATS keywords in summary and experience bullets.',
          'Show quantified outcomes for key skills.',
        ],
      },
    ],
    industryBenchmark: {
      averageSkillsForRole: benchmark,
      yourSkillCount: total,
      comparison:
        total >= benchmark
          ? 'Your skill count is competitive for the market.'
          : 'Add more role-relevant skills to improve competitiveness.',
    },
    recommendations,
  }
}

function mapAiAnalysisToResult(aiAnalysis: any, localResult: SkillsAnalysisResult): SkillsAnalysisResult {
  return {
    ...localResult,
    topSkills: (aiAnalysis?.topSkills || localResult.topSkills).map((s: any) => ({
      name: s.name || 'Skill',
      level: s.level || 'developing',
      strength: typeof s.strength === 'number' ? s.strength : 0.6,
    })),
    skillGaps: aiAnalysis?.skillGaps || localResult.skillGaps,
    industryBenchmark: {
      averageSkillsForRole:
        aiAnalysis?.industryBenchmark?.recommendedSkillCount ||
        localResult.industryBenchmark.averageSkillsForRole,
      yourSkillCount: localResult.industryBenchmark.yourSkillCount,
      comparison: localResult.industryBenchmark.comparison,
    },
    recommendations: aiAnalysis?.recommendations || localResult.recommendations,
  }
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

async function runOpenRouterSkillsAnalysis(prompt: string): Promise<any | null> {
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
        max_tokens: 1400,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
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

async function runGroqSkillsAnalysis(prompt: string): Promise<any | null> {
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
        max_tokens: 1400,
      })

      const analysisText = response.choices?.[0]?.message?.content || '{}'
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

    const { skills, targetRole } = (await req.json()) as SkillsAnalysisRequest

    if (!skills || skills.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Skills array is required',
          timestamp: new Date().toISOString(),
        } as ResumeAPIResponse,
        { status: 400 }
      )
    }

    const localResult = buildLocalSkillsAnalysis(skills, targetRole)
    const skillsList = skills
      .map((s) => `- ${s.name} (${s.level}, strength: ${(s.strength * 100).toFixed(0)}%)`)
      .join('\n')

    const analysisPrompt = `You are an expert career coach and skills analyst. Analyze this skills profile and return JSON only.

SKILLS PROFILE:\n${skillsList}
TARGET ROLE: ${targetRole || 'Not specified'}

JSON schema:
{
  "topSkills": [{"name": "", "level": "verified|developing|weak", "strength": 0.0}],
  "skillGaps": [{"category": "", "currentLevel": "", "recommendedLevel": "", "suggestions": [""]}],
  "industryBenchmark": {"recommendedSkillCount": 12},
  "recommendations": [""]
}`

    const openRouterAnalysis = await runOpenRouterSkillsAnalysis(analysisPrompt)
    if (openRouterAnalysis) {
      return NextResponse.json(
        {
          success: true,
          data: mapAiAnalysisToResult(openRouterAnalysis, localResult),
          timestamp: new Date().toISOString(),
        } as ResumeAPIResponse<SkillsAnalysisResult>
      )
    }

    const groqAnalysis = await runGroqSkillsAnalysis(analysisPrompt)
    if (groqAnalysis) {
      return NextResponse.json(
        {
          success: true,
          data: mapAiAnalysisToResult(groqAnalysis, localResult),
          timestamp: new Date().toISOString(),
        } as ResumeAPIResponse<SkillsAnalysisResult>
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: localResult,
        timestamp: new Date().toISOString(),
      } as ResumeAPIResponse<SkillsAnalysisResult>
    )
  } catch (error) {
    console.error('Skills analysis error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze skills',
        timestamp: new Date().toISOString(),
      } as ResumeAPIResponse,
      { status: 500 }
    )
  }
}
