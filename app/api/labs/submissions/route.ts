import { NextRequest } from 'next/server'
import { getAuthSession, unauthorized, serverError, success, badRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// GET /api/labs/submissions - Get user's lab submissions
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return unauthorized()
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || '-submittedAt'
    const labId = searchParams.get('labId')

    // Parse sort parameter
    const [sortField, sortOrder] = sort.startsWith('-') 
      ? [sort.slice(1), 'desc' as const]
      : [sort, 'asc' as const]

    const where: Record<string, any> = { userId: session.user.id }
    if (labId) where.taskId = labId

    const submissions = await prisma.labSubmission.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
          }
        }
      },
      orderBy: { [sortField]: sortOrder },
      take: limit,
    })

    return success({
      submissions,
      count: submissions.length,
      limit,
    })
  } catch (error) {
    console.error('Lab submissions GET error:', error)
    return serverError('Failed to fetch lab submissions')
  }
}

// POST /api/labs/submissions - Create a new lab submission
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return unauthorized()
    }

    const body = await req.json()
    const { labId, code, output, passed } = body

    if (!labId) {
      return badRequest('labId is required')
    }

    const submission = await prisma.labSubmission.create({
      data: {
        userId: session.user.id,
        labId,
        code: code || null,
        output: output || null,
        passed: passed || false,
        submittedAt: new Date(),
      },
      include: {
        lab: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          }
        }
      }
    })

    return success(submission)
  } catch (error) {
    console.error('Lab submissions POST error:', error)
    return serverError('Failed to create lab submission')
  }
}
