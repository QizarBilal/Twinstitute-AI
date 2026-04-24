import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { fetchLeetCodeStats } from '@/lib/oauth-utils'

/**
 * POST /api/integrations/leetcode/connect
 * Connect LeetCode by username (no OAuth needed)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { username } = body

    if (!username || username.trim().length === 0) {
      return NextResponse.json({ error: 'LeetCode username is required' }, { status: 400 })
    }

    // Fetch LeetCode stats to verify username exists
    const leetcodeStats = await fetchLeetCodeStats(username)

    // Store in database
    const integration = await prisma.oAuthIntegration.upsert({
      where: { userId_platform: { userId: session.user.id, platform: 'leetcode' } },
      create: {
        userId: session.user.id,
        platform: 'leetcode',
        platformId: username,
        platformUsername: username,
        accessToken: '', // No token needed for LeetCode
        profileData: JSON.stringify(leetcodeStats),
        isConnected: true,
        lastSyncedAt: new Date(),
      },
      update: {
        platformId: username,
        platformUsername: username,
        profileData: JSON.stringify(leetcodeStats),
        isConnected: true,
        disconnectedAt: null,
        lastSyncedAt: new Date(),
      },
    })

    console.log('[LeetCode] Connected successfully for user:', session.user.id, 'username:', username)

    return NextResponse.json(
      {
        success: true,
        message: 'LeetCode connected successfully',
        data: integration,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[LeetCode] Connect error:', error)
    const message = error instanceof Error ? error.message : 'Failed to connect LeetCode'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * GET /api/integrations/leetcode/verify
 * Verify if a LeetCode username exists
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')

    if (!username || username.trim().length === 0) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const stats = await fetchLeetCodeStats(username)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('[LeetCode] Verify error:', error)
    return NextResponse.json({ error: 'LeetCode username not found' }, { status: 404 })
  }
}
