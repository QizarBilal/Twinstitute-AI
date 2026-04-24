import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { generateAuthorizationUrl, getDefaultScopes, generateOAuthState } from '@/lib/oauth-utils'

/**
 * GET /api/integrations/github/auth
 * Redirects to GitHub OAuth authorization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const state = generateOAuthState()
    const scopes = getDefaultScopes('github')
    const authUrl = generateAuthorizationUrl('github', state, scopes)

    // Optionally store state in session/cache for verification
    // For now, we'll trust the state parameter
    console.log('[GitHub OAuth] Starting auth flow for user:', session.user.id)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('[GitHub OAuth] Auth error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'OAuth initialization failed' },
      { status: 500 }
    )
  }
}
