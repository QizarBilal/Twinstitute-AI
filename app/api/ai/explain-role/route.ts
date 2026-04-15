/**
 * AI-Powered Role Explanation
 * Generates comprehensive role information for ANY job role the user wants
 * No limitations - accepts any role name and creates detailed information
 */

import { groqClient } from '@/lib/groq-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { roleTitle } = await request.json()

    if (!roleTitle || roleTitle.trim().length === 0) {
      return NextResponse.json({ error: 'Role title is required' }, { status: 400 })
    }

    if (!groqClient) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI role explanation is unavailable because GROQ_API_KEY is not configured',
        },
        { status: 503 }
      )
    }

    const cleanRoleTitle = roleTitle.trim()

    // Use AI to generate comprehensive role information
    const prompt = `You are a career expert. Generate detailed information about the role: "${cleanRoleTitle}"

Generate ONLY valid JSON with this exact structure (no markdown, no code blocks, pure JSON):
{
  "id": "role-${Date.now()}",
  "name": "Exact role title",
  "domain": "One of: Software Engineering, Data & AI, Cybersecurity, Cloud & DevOps, Product & Design, Mobile & Game Dev, or Other",
  "description": "2-3 sentence description of what this role does",
  "dailyWork": [
    "Daily task 1",
    "Daily task 2",
    "Daily task 3",
    "Daily task 4",
    "Daily task 5"
  ],
  "requiredSkills": [
    { "name": "Skill1", "level": "basic|intermediate|advanced" },
    { "name": "Skill2", "level": "basic|intermediate|advanced" },
    { "name": "Skill3", "level": "basic|intermediate|advanced" },
    { "name": "Skill4", "level": "basic|intermediate|advanced" },
    { "name": "Skill5", "level": "basic|intermediate|advanced" }
  ],
  "optionalSkills": ["Optional skill 1", "Optional skill 2", "Optional skill 3"],
  "difficulty": "foundation|intermediate|advanced",
  "demandLevel": "high|medium|low|emerging",
  "salaryRangeIndia": {
    "entry": 4,
    "mid": 12,
    "senior": 30
  },
  "growthPath": [
    "Career progression 1",
    "Career progression 2",
    "Career progression 3"
  ],
  "workStyle": ["creative", "analytical", "system-focused", "collaborative", "independent"],
  "marketOutlook": "Market outlook and demand for this role in India and globally",
  "companiesHiring": ["Company1", "Company2", "Company3"],
  "typicalCompanies": ["Industry type 1", "Industry type 2", "Industry type 3"],
  "averageExperience": "Years of experience needed"
}

For "${cleanRoleTitle}":
- Use salary values in LPA (Lakhs Per Annum) for India
- Be realistic and accurate about the role
- Include entry, mid-level, and senior salaries
- List 5 main daily tasks
- List 5 required skills with appropriate levels
- Difficulty should match the skill requirements
- Work style should be realistic array of 2-3 styles
- Market outlook should be specific to current industry trends
- Include real companies hiring for this role

Return ONLY the JSON object, nothing else.`

    const message = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 2000,
    })

    const responseText = message.choices[0]?.message?.content || ''
    console.log(`[explain-role] Generated info for "${cleanRoleTitle}"`)

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[explain-role] Could not parse JSON from response')
      return NextResponse.json({ 
        error: 'Failed to generate role information',
        rawResponse: responseText 
      }, { status: 400 })
    }

    const roleInfo = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      roleInfo,
      message: `Great! I found information about ${roleInfo.name}. Here's what you should know about this career path...`,
    })
  } catch (error) {
    console.error('[explain-role] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate role information', details: String(error) },
      { status: 500 }
    )
  }
}
