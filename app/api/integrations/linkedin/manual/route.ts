import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/integrations/linkedin/manual
 * Connect LinkedIn manually by profile URL (when OAuth fails)
 * Body: { profileUrl: "https://linkedin.com/in/username" or "username" }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { profileUrl } = await request.json()

    if (!profileUrl || typeof profileUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid LinkedIn profile URL or username' },
        { status: 400 }
      )
    }

    // Extract username from URL or use as-is
    let linkedinUsername = profileUrl.trim()
    if (linkedinUsername.includes('linkedin.com/in/')) {
      linkedinUsername = linkedinUsername.split('linkedin.com/in/')[1]?.split('/')[0] || linkedinUsername
    }

    // Validate format (basic check)
    if (!linkedinUsername || linkedinUsername.length < 2) {
      return NextResponse.json(
        { error: 'Invalid LinkedIn username or profile URL' },
        { status: 400 }
      )
    }

    // Store in database
    const integration = await prisma.oAuthIntegration.upsert({
      where: { userId_platform: { userId: session.user.id, platform: 'linkedin' } },
      create: {
        userId: session.user.id,
        platform: 'linkedin',
        platformId: linkedinUsername,
        platformUsername: linkedinUsername,
        platformEmail: '',
        accessToken: '',
        isConnected: true,
        profileData: JSON.stringify({
          method: 'manual',
          profileUrl: profileUrl,
          connectedAt: new Date(),
        }),
      },
      update: {
        platformId: linkedinUsername,
        platformUsername: linkedinUsername,
        isConnected: true,
        profileData: JSON.stringify({
          method: 'manual',
          profileUrl: profileUrl,
          connectedAt: new Date(),
        }),
      },
    })

    console.log('[LinkedIn Manual] Connected successfully for user:', session.user.id, 'username:', linkedinUsername)

    return NextResponse.json({
      success: true,
      message: 'LinkedIn profile connected successfully',
      integration: {
        platform: 'linkedin',
        platformUsername: linkedinUsername,
        isConnected: true,
      },
    })
  } catch (error) {
    console.error('[LinkedIn Manual] Connect error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect LinkedIn' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/integrations/linkedin/manual
 * Disconnect LinkedIn manual connection
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await prisma.oAuthIntegration.deleteMany({
      where: {
        userId: session.user.id,
        platform: 'linkedin',
      },
    })

    console.log('[LinkedIn Manual] Disconnected for user:', session.user.id)

    return NextResponse.json({ success: true, message: 'LinkedIn disconnected' })
  } catch (error) {
    console.error('[LinkedIn Manual] Disconnect error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
