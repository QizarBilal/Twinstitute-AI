import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { decryptToken } from '@/lib/oauth-utils'

const GROQ_API_KEY = process.env.GROQ_CAREER_KEY || process.env.GROQ_API_KEY

interface AnalysisRequest {
  role: string
  github?: {
    repos: any[]
    topLanguages?: string[]
    totalStars?: number
  }
  leetcode?: {
    solved: number
    totalSubmissions: number
    acceptanceRate: number
  }
  linkedin?: {
    username?: string
    headline?: string
  }
}

/**
 * POST /api/integrations/profile-optimization
 * Analyze user profile using Groq AI
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { capabilityTwin: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get target role
    const targetRole = user.selectedRole || user.capabilityTwin?.targetRole || 'Software Engineer'

    // Fetch integrations data
    const integrations = await prisma.oAuthIntegration.findMany({
      where: { userId: session.user.id, isConnected: true },
    })

    // Prepare profile data
    const profileData: AnalysisRequest = {
      role: targetRole,
    }

    // Process GitHub data
    const gitHubIntegration = integrations.find(i => i.platform === 'github')
    if (gitHubIntegration) {
      try {
        const accessToken = decryptToken(gitHubIntegration.accessToken)
        const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50&type=owner', {
          headers: {
            'Authorization': `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Twinstitute-AI',
          },
        })

        if (reposRes.ok) {
          const repos = await reposRes.json()
          const languages = new Set<string>()
          
          repos.forEach((repo: any) => {
            if (repo.language) languages.add(repo.language)
          })

          profileData.github = {
            repos: repos.map((repo: any) => ({
              name: repo.name,
              stars: repo.stargazers_count,
              description: repo.description,
              language: repo.language,
              private: repo.private,
            })),
            topLanguages: Array.from(languages),
            totalStars: repos.reduce((sum: number, r: any) => sum + r.stargazers_count, 0),
          }
        }
      } catch (err) {
        console.error('[Profile Optimization] GitHub error:', err)
      }
    }

    // Process LeetCode data
    const leetCodeIntegration = integrations.find(i => i.platform === 'leetcode')
    if (leetCodeIntegration && leetCodeIntegration.profileData) {
      try {
        const profileData_ = typeof leetCodeIntegration.profileData === 'string'
          ? JSON.parse(leetCodeIntegration.profileData)
          : leetCodeIntegration.profileData

        const solved = profileData_.problemsSolved || 0
        const total = profileData_.totalSubmissions || 1
        
        profileData.leetcode = {
          solved: solved,
          totalSubmissions: total,
          acceptanceRate: (solved / total) * 100,
        }
      } catch (err) {
        console.error('[Profile Optimization] LeetCode error:', err)
      }
    }

    // Process LinkedIn data
    const linkedInIntegration = integrations.find(i => i.platform === 'linkedin')
    if (linkedInIntegration) {
      profileData.linkedin = {
        username: linkedInIntegration.platformUsername || undefined,
        headline: linkedInIntegration.platformUsername ? `LinkedIn user ${linkedInIntegration.platformUsername}` : undefined,
      }
    }

    // Call Groq API for analysis
    const analysis = await analyzeProfileWithGroq(profileData)

    return NextResponse.json({
      success: true,
      data: {
        role: targetRole,
        analysis: analysis,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[Profile Optimization] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze profile' },
      { status: 500 }
    )
  }
}

async function analyzeProfileWithGroq(profileData: AnalysisRequest) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured')
  }

  const systemPrompt = `You are a senior hiring manager and career strategist with 20+ years of experience at FAANG companies.

Your job: Evaluate candidates based on REAL hiring standards, not generic advice.

You analyze profiles and give sharp, actionable feedback. You identify what will actually move the needle for hiring.

When evaluating a candidate for their TARGET ROLE:
- Analyze gaps vs industry expectations
- Identify weak signals that recruiters notice
- Suggest HIGH-IMPACT improvements only
- Be honest about areas holding them back
- Give specific, not generic, advice

Your goal: Make them stand out in the top 1% for their role.

Return ONLY valid JSON, nothing else.`

  const userPrompt = `Analyze this candidate's profile for the role: ${profileData.role}

PROFILE DATA:
${JSON.stringify(profileData, null, 2)}

Return this exact JSON structure:
{
  "overallAssessment": "paragraph analyzing their current position vs target role",
  "github": {
    "strengths": ["specific strength 1", "specific strength 2"],
    "gaps": ["specific gap 1", "specific gap 2"],
    "improvements": ["actionable improvement 1", "actionable improvement 2"]
  },
  "linkedin": {
    "strengths": ["strength 1", "strength 2"],
    "gaps": ["gap 1", "gap 2"],
    "improvements": ["improvement 1", "improvement 2"]
  },
  "leetcode": {
    "strengths": ["strength 1", "strength 2"],
    "gaps": ["gap 1", "gap 2"],
    "improvements": ["improvement 1", "improvement 2"]
  },
  "priorityActions": [
    {"title": "Action 1", "impact": "high/medium", "effort": "low/medium/high"},
    {"title": "Action 2", "impact": "high", "effort": "medium"}
  ],
  "recruiterPerception": "How they currently appear to recruiters - be specific and honest"
}`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Groq API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No response from Groq API')
    }

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format from Groq')
    }

    const analysis = JSON.parse(jsonMatch[0])
    return analysis
  } catch (error) {
    console.error('[Groq Analysis] Error:', error)
    throw error
  }
}
