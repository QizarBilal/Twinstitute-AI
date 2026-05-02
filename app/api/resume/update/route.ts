/**
 * Resume Save API
 * Persists user's resume data to database
 */

import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ResumeData } from '@/types/resume'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', timestamp: new Date().toISOString() },
        { status: 401 }
      )
    }

    const body: ResumeData = await req.json()

    if (!body || !body.contact) {
      return NextResponse.json(
        { success: false, error: 'Invalid resume data', timestamp: new Date().toISOString() },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', timestamp: new Date().toISOString() },
        { status: 404 }
      )
    }

    // Store resume as JSON in database (create or update)
    // Using user metadata or a separate Resume table
    // For now, we'll store it in user profile metadata
    const resumeRecord = await prisma.user.update({
      where: { id: user.id },
      data: {
        resumeData: JSON.stringify({
          templateId: body.templateId,
          contact: body.contact,
          summary: body.summary,
          experience: body.experience,
          education: body.education,
          skills: body.skills,
          projects: body.projects,
          certifications: body.certifications,
          languages: body.languages,
          achievements: body.achievements,
          lastUpdated: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Resume saved successfully',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resume save error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save resume',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
