import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'
import { nanoid } from 'nanoid'

// GET /api/proof/[id] — Get proof artifact details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const artifact = await prisma.proofArtifact.findUnique({
      where: { id: params.id },
    })

    if (!artifact) return badRequest('Artifact not found')

    // Check authorization
    if (artifact.userId !== session.user.id && !artifact.isPublic) {
      return unauthorized()
    }

    // Get related submission if exists
    let submission = null
    if (artifact.labSubmissionId) {
      submission = await prisma.labSubmission.findUnique({
        where: { id: artifact.labSubmissionId },
        include: {
          task: true,
          evaluation: true,
        },
      })
    }

    return success({
      ...artifact,
      skills: JSON.parse(artifact.skills || '[]'),
      submission,
    })
  } catch (error) {
    console.error('Proof GET detail error:', error)
    return serverError()
  }
}

// PATCH /api/proof/[id] — Update proof artifact
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const artifact = await prisma.proofArtifact.findUnique({
      where: { id: params.id },
    })

    if (!artifact || artifact.userId !== session.user.id) {
      return unauthorized()
    }

    const body = await req.json()
    const { isPublic, title, description } = body

    const updated = await prisma.proofArtifact.update({
      where: { id: params.id },
      data: {
        ...(isPublic !== undefined && {
          isPublic,
          shareToken: isPublic ? artifact.shareToken || require('nanoid').nanoid(16) : null,
        }),
        ...(title && { title }),
        ...(description && { description }),
      },
    })

    return success({
      ...updated,
      skills: JSON.parse(updated.skills || '[]'),
    })
  } catch (error) {
    console.error('Proof PATCH error:', error)
    return serverError()
  }
}

// DELETE /api/proof/[id] — Delete proof artifact
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const artifact = await prisma.proofArtifact.findUnique({
      where: { id: params.id },
    })

    if (!artifact || artifact.userId !== session.user.id) {
      return unauthorized()
    }

    await prisma.proofArtifact.delete({
      where: { id: params.id },
    })

    return success({ message: 'Artifact deleted' })
  } catch (error) {
    console.error('Proof DELETE error:', error)
    return serverError()
  }
}
