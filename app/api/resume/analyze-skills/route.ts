/**
 * Skills Analysis API
 * Uses Claude to analyze and suggest skill improvements
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { SkillsAnalysisResult, ResumeAPIResponse } from '@/types/resume'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-1'
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

interface SkillsAnalysisRequest {
  skills: Array<{ name: string; level: 'verified' | 'developing' | 'weak'; strength: number }>
  targetRole?: string
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

    // Prepare skills summary
    const skillsByLevel = {
      verified: skills.filter((s) => s.level === 'verified').length,
      developing: skills.filter((s) => s.level === 'developing').length,
      weak: skills.filter((s) => s.level === 'weak').length,
    }

    const topSkills = skills.sort((a, b) => b.strength - a.strength).slice(0, 5)
    const skillsList = skills.map((s) => `- ${s.name} (${s.level}, strength: ${(s.strength * 100).toFixed(0)}%)`).join('\n')

    // Call Claude API for analysis
    const claudePrompt = `You are an expert career coach and skills analyst. Analyze the following skills profile and provide detailed insights and recommendations.

SKILLS PROFILE:
${skillsList}

TARGET ROLE: ${targetRole || 'Not specified'}

Skills Summary:
- Verified Skills (70%+ proficiency): ${skillsByLevel.verified}
- Developing Skills (40-69% proficiency): ${skillsByLevel.developing}
- Weak Skills (<40% proficiency): ${skillsByLevel.weak}
- Total Skills: ${skills.length}

Provide your analysis in JSON format:
{
  "skillsCount": ${skills.length},
  "topSkills": [
    {
      "name": "<skill>",
      "level": "verified | developing | weak",
      "strength": <0-1>,
      "importance": "critical | high | medium"
    }
  ],
  "skillGaps": [
    {
      "category": "<category>",
      "currentLevel": "<minimal | developing | proficient>",
      "recommendedLevel": "<developing | proficient | expert>",
      "suggestions": ["<suggestion1>", "<suggestion2>"]
    }
  ],
  "strengths": ["<strength1>", "<strength2>"],
  "areasForGrowth": ["<area1>", "<area2>"],
  "industryBenchmark": {
    "roleTitle": "${targetRole || 'Software Engineer'}",
    "recommendedSkillCount": <number>,
    "recommendation": "<brief recommendation>"
  },
  "recommendations": [
    "<priority recommendation 1>",
    "<priority recommendation 2>"
  ]
}

Consider:
1. Skill balance and diversity
2. Technical depth vs breadth
3. Industry relevance (especially for ${targetRole || 'tech roles'})
4. Skill progression and development potential
5. Complementary skills that would enhance the profile
6. Market demand for the target role

Be specific and actionable.`;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
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
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = (await response.json()) as any
    let analysisText = data.content[0]?.text || '{}'

    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse Claude response')
    }

    const analysis = JSON.parse(jsonMatch[0])

    const result: SkillsAnalysisResult = {
      timestamp: new Date().toISOString(),
      totalSkills: skills.length,
      byLevel: skillsByLevel,
      topSkills: (analysis.topSkills || topSkills).map((s: any) => ({
        name: s.name || s,
        level: s.level || 'verified',
        strength: s.strength || 0.8,
      })),
      skillGaps: (analysis.skillGaps || []).map((g: any) => ({
        category: g.category,
        currentLevel: g.currentLevel,
        recommendedLevel: g.recommendedLevel,
        suggestions: g.suggestions || [],
      })),
      industryBenchmark: {
        averageSkillsForRole: analysis.industryBenchmark?.recommendedSkillCount || 12,
        yourSkillCount: skills.length,
        comparison:
          skills.length >= 12
            ? 'Your skill count is competitive for the market'
            : 'Consider developing additional skills for competitive advantage',
      },
      recommendations: analysis.recommendations || [
        'Focus on deepening expertise in your top 3 skills',
        'Develop complementary technical skills in your domain',
        'Document and demonstrate your proven capabilities',
      ],
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
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
