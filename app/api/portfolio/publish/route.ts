import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'
import crypto from 'crypto'

// POST /api/portfolio/publish — Publish portfolio with shareable link
export async function POST(req: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) return badRequest('User not found')

    // Generate unique token
    const portfolioToken = crypto.randomBytes(20).toString('hex')

    // Update user with portfolio publishing info
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        portfolioPublished: true,
        portfolioToken,
        portfolioPublishedAt: new Date(),
      },
    })

    return success({
      published: true,
      publicUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/portfolio/${portfolioToken}`,
      token: portfolioToken,
    })
  } catch (error) {
    console.error('Portfolio publish error:', error)
    return serverError()
  }
}

// PUT /api/portfolio/publish — Update published status
export async function PUT(req: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const { published } = await req.json()

    if (typeof published !== 'boolean') {
      return badRequest('Invalid published value')
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        portfolioPublished: published,
        portfolioPublishedAt: published ? new Date() : null,
      },
    })

    return success({
      published: (updatedUser as any).portfolioPublished,
      publicUrl: (updatedUser as any).portfolioToken
        ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/portfolio/${(updatedUser as any).portfolioToken}`
        : null,
    })
  } catch (error) {
    console.error('Portfolio publish update error:', error)
    return serverError()
  }
}
