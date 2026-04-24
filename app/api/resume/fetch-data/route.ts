/**
 * Resume Data Fetching API
 * Fetches all user data from system and formats for resume
 */

import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ResumeAPIResponse, FetchResumeDataResponse } from '@/types/resume'

export async function GET(req: NextRequest) {
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

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        } as ResumeAPIResponse,
        { status: 404 }
      )
    }

    // Fetch skills from skill genome
    const skillGenome = await prisma.skillGenome.findUnique({
      where: { userId: user.id },
    })

    // Fetch completed labs (projects/experience)
    const submissions = await prisma.labSubmission.findMany({
      where: { userId: user.id, status: 'passed' },
      include: {
        task: true,
        evaluation: true,
      },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    })

    // Fetch capabilities
    const capabilities = await prisma.capabilityProof.findMany({
      where: { userId: user.id },
      include: {
        lab: true,
      },
      take: 10,
    })

    // Fetch user's cohort memberships for semester/education data
    const cohortMemberships = await prisma.cohortMember.findMany({
      where: { userId: user.id },
      include: {
        cohort: {
          include: {
            semester: true,
          },
        },
      },
      take: 5,
    })

    // Extract unique semesters from cohort memberships
    const semesters = Array.from(
      new Map(
        cohortMemberships
          .map((cm) => cm.cohort.semester)
          .filter(Boolean)
          .map((sem: any) => [sem?.id, sem])
      ).values()
    )

    // Parse skills from JSON
    let skillsList: any[] = []
    try {
      skillsList = skillGenome?.nodes ? JSON.parse(skillGenome.nodes) : []
    } catch (e) {
      skillsList = []
    }

    // Build location string
    const location = [user.street, user.city, user.state]
      .filter(Boolean)
      .join(', ')

    // Format data for resume
    const responseData: FetchResumeDataResponse = {
      contact: {
        name: user.fullName || 'John Doe',
        title: user.selectedRole || 'Software Engineer',
        email: user.email || '',
        phone: user.mobile,
        location: location || 'India',
      },
      skills: skillsList
        .map((node: any) => ({
          name: node.skillName || node.name,
          level: node.strength >= 0.7 ? 'verified' : node.strength >= 0.4 ? 'developing' : 'weak',
          strength: node.strength || 0,
          category: node.category || 'Technical',
        })),
      capabilities: capabilities.map((cap) => ({
        id: cap.id,
        name: cap.capability,
        description: `Demonstrated through: ${cap.lab?.title || 'Lab Assignment'}`,
        level: cap.level as 'Basic' | 'Intermediate' | 'Advanced',
        dateAchieved: cap.createdAt.toISOString().split('T')[0],
        isVerified: true,
      })),
      projects: submissions.map((sub) => ({
        id: sub.id,
        title: sub.task?.title || 'Lab Assignment',
        description: sub.task?.description || '',
        skills: sub.task?.skills ? JSON.parse(sub.task.skills) : [],
        startDate: sub.task?.createdAt.toISOString().split('T')[0] || '',
        endDate: sub.submittedAt.toISOString().split('T')[0],
        impact: `Score: ${sub.evaluation?.overallScore || 0}/100 | Credits: ${sub.creditsAwarded}`,
        achievements: [`Completed with score of ${sub.evaluation?.overallScore || 0}%`],
        visibility: 'public' as const,
        isFromLab: true,
        labId: sub.taskId,
      })),
      experience: [
        {
          id: 'twinstitute-formation',
          company: 'Twinstitute AI',
          title: user.selectedRole || 'Software Engineering Formation',
          location: 'Remote',
          startDate: cohortMemberships[0]?.joinedAt.toISOString().split('T')[0] || '2025-01-01',
          isCurrent: true,
          description:
            'Advanced engineering formation with focus on real-world system design, problem solving, and execution excellence.',
          achievements: [
            `Completed ${submissions.length} rigorous engineering assignments`,
            `Accumulated ${capabilities.length} proven capabilities`,
            `Current capability score: ${user.capabilityScore}/100`,
          ],
          skills: skillsList.slice(0, 8).map((n: any) => n.skillName || n.name),
        },
      ],
      education: semesters
        .filter(Boolean)
        .map((sem: any) => ({
          id: sem.id,
          institution: 'Twinstitute AI',
          degree: 'Advanced Engineering Formation',
          field: sem.targetRole || user.selectedDomain || 'Software Engineering',
          startDate: sem.createdAt?.toISOString().split('T')[0] || '2025-01-01',
          endDate: sem.updatedAt?.toISOString().split('T')[0],
          isCurrent: sem.isActive,
          description: `Specialized formation in ${sem.targetRole || user.selectedDomain || 'Software Engineering'}`,
          achievements: [`Completed advanced labs in ${sem.targetRole || 'Software Engineering'}`],
        })),
    }

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString(),
      } as ResumeAPIResponse<FetchResumeDataResponse>
    )
  } catch (error) {
    console.error('Resume data fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch resume data',
        timestamp: new Date().toISOString(),
      } as ResumeAPIResponse,
      { status: 500 }
    )
  }
}
