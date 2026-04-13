import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { TaskGenerator, UserProfile } from '@/lib/ai/taskGenerator'
import { calculateSkillGap } from '@/lib/ai/roleSkillMapping'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        capabilityTwin: true,
        skillGenome: true,
        labSubmissions: {
          orderBy: { submittedAt: 'desc' },
          take: 30,
          include: {
            task: {
              select: {
                id: true,
                skills: true,
                domain: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.selectedRole) {
      return NextResponse.json(
        { error: 'Please select a role first' },
        { status: 400 }
      )
    }

    // Build user profile for task generation
    const userSkills = new Map<string, number>()
    if (user.skillGenome) {
      try {
        const nodes = JSON.parse(user.skillGenome.nodes || '[]')
        nodes.forEach((node: any) => {
          userSkills.set(node.name, node.proficiency || 0)
        })
      } catch (e) {
        console.error('Error parsing skill genome:', e)
      }
    }

    // Calculate past performance
    const performanceHistory = user.labSubmissions.map(sub => ({
      taskId: sub.taskId,
      performance: sub.scoreTotal || 0,
      timeSpent: sub.timeSpentMin,
      estimatedTime: 0,
      timestamp: sub.submittedAt,
    }))

    const successRate =
      performanceHistory.length > 0
        ? performanceHistory.filter(p => p.performance > 70).length /
          performanceHistory.length
        : 0.5

    const { gapSkills, strengthSkills } = calculateSkillGap(
      userSkills,
      user.selectedRole
    )

    // Build user profile
    const userProfile: UserProfile = {
      userId: user.id,
      selectedRole: user.selectedRole,
      capabilityScore: user.capabilityTwin?.overallScore || 0,
      skillGenome: userSkills,
      weakSkills: gapSkills,
      performanceHistory,
      completedTaskCount: user.labSubmissions.filter(
        sub => sub.scoreTotal > 70
      ).length,
      successRate,
      learningVelocity:
        performanceHistory.length > 0 ? performanceHistory.length / 4 : 1, // tasks per week (estimate)
      pastErrors: [], // Would be populated from submission feedback
    }

    // Generate personalized task
    const generatedTask = TaskGenerator.generateTask(userProfile)

    // Save task to database for tracking
    const savedTask = await prisma.labTask.create({
      data: {
        title: generatedTask.title,
        description: generatedTask.description,
        taskType: generatedTask.taskType,
        difficulty: generatedTask.difficulty,
        domain: generatedTask.domain || user.selectedRole,
        skills: JSON.stringify(generatedTask.skillsFocused),
        timeEstimateMin: Math.round(generatedTask.estimatedTime),
        instructions: generatedTask.realWorldContext,
        evaluationRubric: JSON.stringify({
          successCriteria: generatedTask.successCriteria,
          personalizationFactors: generatedTask.personalizationFactors,
        }),
        creditReward: Math.round(
          (generatedTask.difficulty / 10) * 50 +
            (generatedTask.estimatedTime / 60) * 10
        ),
        isActive: true,
      },
    })

    return NextResponse.json({
      task: {
        id: savedTask.id,
        title: generatedTask.title,
        description: generatedTask.description,
        realWorldContext: generatedTask.realWorldContext,
        skillsFocused: generatedTask.skillsFocused,
        skillsSecondary: generatedTask.skillsSecondary,
        difficulty: generatedTask.difficulty,
        estimatedTime: Math.round(generatedTask.estimatedTime),
        taskType: generatedTask.taskType,
        domain: generatedTask.domain,
        expectedOutput: generatedTask.expectedOutput,
        successCriteria: generatedTask.successCriteria,
        priority: generatedTask.priority,
        creditReward: savedTask.creditReward,
      },
      personalization: {
        targetedSkills: generatedTask.personalizationFactors.targetedSkills,
        addressesWeakness:
          generatedTask.personalizationFactors.addressesWeakness,
        buildsOnStrength:
          generatedTask.personalizationFactors.buildsOnStrength,
        estimatedCompletion:
          generatedTask.personalizationFactors.estimatedCompletion,
        reason: `Task generated based on your role (${user.selectedRole}), current capability (${Math.round(userProfile.capabilityScore)}/100), and success rate (${Math.round(successRate * 100)}%)`,
      },
      userStats: {
        completedTasks: userProfile.completedTaskCount,
        successRate: Math.round(successRate * 100),
        capability: Math.round(userProfile.capabilityScore),
        skillGaps: gapSkills.length,
        strengths: strengthSkills.slice(0, 3),
      },
    })
  } catch (error) {
    console.error('Task generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate task',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
