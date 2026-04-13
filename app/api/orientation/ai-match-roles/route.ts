/**
 * GROQ-POWERED INTELLIGENT ROLE MATCHING
 * Uses GROQ AI to understand user intent and match best roles
 */

import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getAllRoles } from '@/lib/orientation/role-database'

const GROQ_API_KEY = process.env.GROQ_ORIENTATION_KEY || process.env.GROQ_API_KEY
const groqClient = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null

export async function POST(request: NextRequest) {
  try {
    const { userInput, skills, context } = await request.json()

    if (!userInput) {
      return NextResponse.json({ error: 'Missing userInput' }, { status: 400 })
    }

    // Get all available roles
    const allRoles = getAllRoles()
    const rolesData = allRoles.map(r => ({
      id: r.id,
      name: r.name,
      domain: r.domain,
      description: r.description,
      requiredSkills: r.requiredSkills.map(s => s.name),
      difficulty: r.difficulty,
      demandLevel: r.demandLevel,
      salaryRange: r.salaryRangeIndia,
      workStyle: r.workStyle,
    }))

    // Use GROQ to intelligently match roles
    if (!groqClient) {
      // Fallback to local search if GROQ not available
      const localMatch = allRoles.filter(r =>
        r.name.toLowerCase().includes(userInput.toLowerCase()) ||
        r.domain.toLowerCase().includes(userInput.toLowerCase())
      )
      return NextResponse.json({
        success: true,
        roles: localMatch,
        explanation: 'Using local matching (GROQ not available)',
      })
    }

    const systemPrompt = `You are a career advisor. Analyze the user's input and recommend the best matching roles from the provided list.

Available roles and their metadata:
${JSON.stringify(rolesData, null, 2)}

The user said: "${userInput}"
${skills ? `Their skills: ${skills}` : ''}
${context ? `Context: ${context}` : ''}

Respond with a JSON object containing:
{
  "matchedRoleIds": ["id1", "id2", "id3"],
  "explanation": "Why these roles match...",
  "insight": "One-line insight about their path",
  "salaryInsight": "Current market CTC/salary trends for matched roles",
  "trendInsight": "Current industry trends relevant to their choice"
}

Match based on:
1. Role name similarity
2. Skill alignment
3. Career progression logic
4. Their expressed interest

Return ONLY valid JSON, no markdown.`

    const response = await groqClient.messages.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: systemPrompt,
        },
      ],
    } as any)

    const responseText = (response.content[0] as any)?.text || ''

    // Parse JSON response
    let analysis
    try {
      // Extract JSON from response (handle potential markdown wrappers)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch (parseError) {
      console.error('Failed to parse GROQ response:', responseText)
      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI response',
        rawResponse: responseText,
      })
    }

    if (!analysis || !analysis.matchedRoleIds) {
      return NextResponse.json({
        success: false,
        error: 'No roles matched',
        analysis,
      })
    }

    // Get matched role objects
    const matchedRoles = analysis.matchedRoleIds
      .map((id: string) => allRoles.find(r => r.id === id))
      .filter(Boolean)

    return NextResponse.json({
      success: true,
      roles: matchedRoles,
      explanation: analysis.explanation,
      insight: analysis.insight,
      salaryInsight: analysis.salaryInsight,
      trendInsight: analysis.trendInsight,
    })
  } catch (error) {
    console.error('Role matching error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
