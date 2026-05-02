import { NextRequest, NextResponse } from 'next/server'
import { groqClient } from '@/lib/groq-client'
import { getAuthSession, unauthorized } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

interface GeneratedProject {
  id: string
  title: string
  description: string
  domain: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  estimatedHours: number
  skills: string[]
  deliverables: string[]
  acceptanceCriteria: string[]
  whyItFits: string
  workPlan: string[]
  impact: string
}

function clampCount(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 7
  return Math.min(10, Math.max(5, Math.round(parsed)))
}

function cleanJsonResponse(responseText: string): string {
  if (responseText.includes('```json')) {
    return responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  }

  if (responseText.includes('```')) {
    return responseText.replace(/```\n?/g, '').trim()
  }

  return responseText.trim()
}

function buildFallbackProjects(role: string, domain: string, count: number): GeneratedProject[] {
  const baseSkills = ['Planning', 'Problem Solving', 'Documentation', 'Testing', 'Iteration']
  const difficultyCycle: Array<GeneratedProject['difficulty']> = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

  return Array.from({ length: count }, (_, index) => {
    const step = index + 1
    return {
      id: `project-${step}`,
      title: `${role} Project ${step}`,
      description: `A role-aligned project for ${role} in ${domain}. This project strengthens practical execution, portfolio depth, and decision making.`,
      domain,
      difficulty: difficultyCycle[index % difficultyCycle.length],
      estimatedHours: 8 + index * 3,
      skills: [...baseSkills.slice(0, 3), `${role} Fundamentals`, `Delivery`],
      deliverables: [
        'Problem statement and scope',
        'Functional implementation',
        'Testing and validation',
        'Reflection and next steps',
      ],
      acceptanceCriteria: [
        'Clear scope and constraints',
        'Demonstrates role-specific thinking',
        'Includes practical implementation details',
        'Shows measurable outcome or artifact',
      ],
      whyItFits: `Directly aligned with the finalized role: ${role}.`,
      workPlan: [
        'Define the objective and success criteria',
        'Build the core solution',
        'Test and refine the outcome',
        'Package the result as a proof artifact',
      ],
      impact: 'Portfolio-ready proof of capability',
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { selectedRole: true, selectedDomain: true },
    })

    const body = await req.json().catch(() => ({}))
    const count = clampCount((body as { count?: unknown }).count)

    const role = user?.selectedRole?.trim() || ''
    const domain = user?.selectedDomain?.trim() || 'General Technology'

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'A finalized job role is required to generate projects.' },
        { status: 400 }
      )
    }

    if (!groqClient) {
      return NextResponse.json({
        success: true,
        source: 'fallback',
        role,
        domain,
        projects: buildFallbackProjects(role, domain, count),
      })
    }

    const prompt = `You are a senior project architect. Generate ${count} unique, practical portfolio projects for the finalized job role: "${role}".

User domain: ${domain}

Requirements:
- Create between 5 and 10 projects depending on the requested count.
- Every project must be distinct in scope, difficulty, and output.
- The projects should be realistic, portfolio-worthy, and appropriate for someone actively building proof of capability.
- Rank them from easier to harder.
- Make them directly useful for interviews, portfolio proof, and practical learning.
- Keep them aligned with the finalized role and avoid generic filler ideas.

Return ONLY valid JSON with this exact structure:
{
  "projects": [
    {
      "id": "project-1",
      "title": "Project title",
      "description": "2-4 sentence overview of the project",
      "domain": "${domain}",
      "difficulty": "Beginner|Intermediate|Advanced|Expert",
      "estimatedHours": 12,
      "skills": ["skill 1", "skill 2", "skill 3", "skill 4", "skill 5"],
      "deliverables": ["deliverable 1", "deliverable 2", "deliverable 3", "deliverable 4"],
      "acceptanceCriteria": ["criterion 1", "criterion 2", "criterion 3", "criterion 4"],
      "whyItFits": "Why this project matches the role and helps the user prove capability",
      "workPlan": ["step 1", "step 2", "step 3", "step 4"],
      "impact": "What the project proves or adds to the portfolio"
    }
  ]
}

Rules:
- Use exactly ${count} projects.
- Ensure no duplicate titles.
- Keep descriptions concrete and role-specific.
- Use practical deliverables and criteria.
- Do not wrap in markdown or code fences.`

    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: 'You generate only valid JSON.' },
        { role: 'user', content: prompt },
      ],
    })

    const responseText = completion.choices[0]?.message?.content || ''
    const cleaned = cleanJsonResponse(responseText)
    const parsed = JSON.parse(cleaned) as { projects?: GeneratedProject[] }

    const projects = Array.isArray(parsed.projects) && parsed.projects.length > 0
      ? parsed.projects.slice(0, count)
      : buildFallbackProjects(role, domain, count)

    return NextResponse.json({
      success: true,
      source: 'groq',
      role,
      domain,
      projects,
    })
  } catch (error) {
    console.error('[proof-projects] generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate role-based projects',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}