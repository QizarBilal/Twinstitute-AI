/**
 * AI-Powered Intent Matching
 * Uses GROQ to intelligently match user input to the most relevant role
 */

import { groqClient } from '@/lib/groq-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userInput, candidateRoles, context } = await request.json()

    if (!userInput || !candidateRoles || candidateRoles.length === 0) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Build a prompt that will help GROQ understand which role the user means
    const roleDescriptions = candidateRoles
      .map(
        (role: any, idx: number) =>
          `${idx + 1}. ${role.name}: ${role.description.substring(0, 100)}...`
      )
      .join('\n')

    const prompt = `You are a career guidance expert. A user wants to select a role but their input might not exactly match the role names available.

User Input: "${userInput}"
Context: ${context}

Available Roles:
${roleDescriptions}

Based on the user's input "${userInput}", which role(s) from the available list do they most likely mean? 

Consider:
- Synonyms and common job title variations (e.g., "Software Developer" = Backend Engineer or Frontend Engineer or Full Stack Engineer)
- The user's intent and what they're likely looking for
- Match them to the CLOSEST role name from the available list

Respond in JSON format ONLY:
{
  "bestMatch": "EXACT_ROLE_NAME_FROM_LIST",
  "confidence": 0.95,
  "reasoning": "Why this is the best match"
}

Return ONLY the JSON, no other text.`

    const message = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 200,
    })

    const responseText = message.choices[0]?.message?.content || ''
    console.log(`[match-intent] Raw GROQ response: ${responseText}`)

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[match-intent] Could not parse JSON from response')
      return NextResponse.json({ success: false, error: 'Invalid response format' }, { status: 400 })
    }

    const aiResponse = JSON.parse(jsonMatch[0])
    const bestMatch = aiResponse.bestMatch?.toLowerCase().trim()

    // Find the matching role ID
    const matchedRole = candidateRoles.find(
      (role: any) => role.name.toLowerCase() === bestMatch || role.name.toLowerCase().includes(bestMatch)
    )

    if (!matchedRole) {
      console.log(`[match-intent] Could not find role matching "${bestMatch}"`)
      return NextResponse.json({
        success: false,
        error: 'No matching role found',
      })
    }

    console.log(`[match-intent] Successfully matched "${userInput}" to "${matchedRole.name}"`)

    return NextResponse.json({
      success: true,
      matchedRole: matchedRole.id,
      matchedRoleName: matchedRole.name,
      confidence: aiResponse.confidence,
      reasoning: aiResponse.reasoning,
    })
  } catch (error) {
    console.error('[match-intent] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
