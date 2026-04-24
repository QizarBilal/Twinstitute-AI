import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { exchangeCodeForToken, fetchOAuthUserInfo, encryptToken } from '@/lib/oauth-utils'

/**
 * GET /api/integrations/linkedin/callback
 * LinkedIn OAuth2 callback handler
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for OAuth errors
    if (error) {
      console.error('[LinkedIn OAuth] Error:', error)
      return NextResponse.redirect(
        new URL(`/dashboard/settings?integration_error=linkedin&message=${error}`, request.nextUrl.origin)
      )
    }

    if (!code || !state) {
      console.error('[LinkedIn OAuth] Missing code or state')
      return NextResponse.redirect(
        new URL('/dashboard/settings?integration_error=linkedin&message=Invalid OAuth state', request.nextUrl.origin)
      )
    }

    // Verify session
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL('/auth/login?redirect=/dashboard/settings', request.nextUrl.origin)
      )
    }

    // Exchange code for token
    const tokenData = await exchangeCodeForToken('linkedin', code)
    const userInfo = await fetchOAuthUserInfo('linkedin', tokenData.access_token)

    // Store in database
    const integration = await prisma.oAuthIntegration.upsert({
      where: { userId_platform: { userId: session.user.id, platform: 'linkedin' } },
      create: {
        userId: session.user.id,
        platform: 'linkedin',
        platformId: userInfo.id,
        platformUsername: userInfo.username,
        platformEmail: userInfo.email,
        accessToken: encryptToken(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        profileData: JSON.stringify({
          name: userInfo.name,
          avatar_url: userInfo.avatar_url,
        }),
        isConnected: true,
      },
      update: {
        platformId: userInfo.id,
        platformUsername: userInfo.username,
        platformEmail: userInfo.email,
        accessToken: encryptToken(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        profileData: JSON.stringify({
          name: userInfo.name,
          avatar_url: userInfo.avatar_url,
        }),
        isConnected: true,
        disconnectedAt: null,
        lastSyncedAt: new Date(),
      },
    })

    console.log('[LinkedIn OAuth] Connected successfully for user:', session.user.id)

    // Redirect back to settings with success
    return NextResponse.redirect(
      new URL('/dashboard/settings?integration_success=linkedin', request.nextUrl.origin)
    )
  } catch (error) {
    console.error('[LinkedIn OAuth] Callback error:', error)
    const message = error instanceof Error ? error.message : 'OAuth callback failed'
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?integration_error=linkedin&message=${encodeURIComponent(message)}`,
        request.nextUrl.origin
      )
    )
  }
}
