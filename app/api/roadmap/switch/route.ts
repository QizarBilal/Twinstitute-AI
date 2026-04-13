import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-auth'

// POST /api/roadmap/switch - Switch to a different role/domain roadmap
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { role, domain } = body

    if (!role || !domain) {
      return badRequest('Missing role or domain')
    }

    // Check if roadmap already exists for this role/domain combo
    const existingRoadmap = await (prisma as any).roadmap.findFirst({
      where: {
        userId: session.user.id,
        role,
        domain,
      },
      include: {
        nodes: true,
        progress: {
          where: { userId: session.user.id },
        },
      },
    })

    if (existingRoadmap) {
      return success({
        roadmap: existingRoadmap,
        message: `Switched to existing ${role} - ${domain} roadmap`,
        action: 'switched',
      })
    }

    // Roadmap doesn't exist - call generate endpoint
    const generateResponse = await fetch(
      new URL('/api/roadmap/generate', req.url).toString(),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('cookie') || '',
        },
        body: JSON.stringify({ role, domain }),
      }
    )

    const generateData = await generateResponse.json()

    if (!generateResponse.ok) {
      console.error('Roadmap Generation Failed:', generateData)
      return serverError('Failed to generate new roadmap')
    }

    return success({
      roadmap: generateData.data.roadmap,
      message: `New roadmap generated for ${role} - ${domain}`,
      action: 'generated',
    })
  } catch (error) {
    console.error('Roadmap Switch Error:', error)
    return serverError()
  }
}
