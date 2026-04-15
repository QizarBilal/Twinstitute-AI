/**
 * SKILL GENOME API ENDPOINT
 * 
 * GET /api/skill-genome - Fetch user's skill genome graph
 * POST /api/skill-genome/generate - Generate skill genome for a role
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { buildSkillGenome } from '@/lib/ai/skill-genome-system'

interface RoadmapModule {
  id: string
  title: string
  skills: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  completed?: boolean
  completionPercentage?: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        selectedRole: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.selectedRole) {
      return NextResponse.json({ error: 'User has not selected a role. Complete orientation first.' }, { status: 400 })
    }

    // Fetch user's roadmap
    const roadmap = await prisma.roadmap.findFirst({
      where: { userId: user.id },
    })

    if (!roadmap) {
      return NextResponse.json({ error: 'No roadmap found' }, { status: 404 })
    }

    // Parse roadmap data
    let roadmapData: any = {}
    try {
      if (typeof roadmap.roadmapData === 'string') {
        roadmapData = JSON.parse(roadmap.roadmapData)
      } else {
        roadmapData = roadmap.roadmapData
      }
    } catch (e) {
      console.error('Failed to parse roadmap data')
      return NextResponse.json({ error: 'Invalid roadmap data' }, { status: 500 })
    }

    // Flatten phases and modules
    const modules: RoadmapModule[] = []
    const moduleProgress = new Map<string, number>()

    if (Array.isArray(roadmapData)) {
      roadmapData.forEach((phase: any) => {
        if (phase.modules && Array.isArray(phase.modules)) {
          phase.modules.forEach((module: any) => {
            modules.push({
              id: module.id || module.title.toLowerCase().replace(/\s+/g, '-'),
              title: module.title,
              skills: module.skills || [],
              difficulty: module.difficulty || 'Intermediate',
              completed: module.userHasSkill || false,
              completionPercentage: module.completionPercentage || 0,
            })

            // Track progress
            const progress = module.completionPercentage || (module.userHasSkill ? 100 : 0)
            moduleProgress.set(
              module.id || module.title.toLowerCase().replace(/\s+/g, '-'),
              progress
            )
          })
        }
      })
    }

    // Build skill genome using user's selected role
    const skillGenome = await buildSkillGenome(user.selectedRole, modules, moduleProgress)

    return NextResponse.json(
      {
        success: true,
        skillGenome,
        role: user.selectedRole,
        totalModules: modules.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Skill genome fetch failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch skill genome',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role, modules } = body

    if (!role || !modules || !Array.isArray(modules)) {
      return NextResponse.json(
        { error: 'Missing required fields: role, modules' },
        { status: 400 }
      )
    }

    // Build skill genome
    const skillGenome = await buildSkillGenome(role, modules as RoadmapModule[])

    return NextResponse.json(
      {
        success: true,
        skillGenome,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Skill genome generation failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate skill genome',
      },
      { status: 500 }
    )
  }
}
