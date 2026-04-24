import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/integrations/status
 * Get status of all integrations for current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const integrations = await prisma.oAuthIntegration.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        platform: true,
        platformUsername: true,
        isConnected: true,
        lastSyncedAt: true,
        syncStatus: true,
        profileData: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: integrations.map(integration => ({
        ...integration,
        profileData: integration.profileData ? JSON.parse(integration.profileData) : {},
      })),
    })
  } catch (error) {
    console.error('[Integrations] Status error:', error)
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 })
  }
}

/**
 * DELETE /api/integrations/[platform]
 * Disconnect an integration
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const platform = request.nextUrl.pathname.split('/').pop()

    if (!platform || !['github', 'linkedin', 'leetcode'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    const integration = await prisma.oAuthIntegration.findUnique({
      where: { userId_platform: { userId: session.user.id, platform } },
    })

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Soft delete - mark as disconnected
    await prisma.oAuthIntegration.update({
      where: { id: integration.id },
      data: {
        isConnected: false,
        disconnectedAt: new Date(),
      },
    })

    console.log('[Integrations] Disconnected:', platform, 'for user:', session.user.id)

    return NextResponse.json({
      success: true,
      message: `${platform} disconnected successfully`,
    })
  } catch (error) {
    console.error('[Integrations] Disconnect error:', error)
    return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 })
  }
}
