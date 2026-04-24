import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { generateAuthorizationUrl, getDefaultScopes, generateOAuthState } from '@/lib/oauth-utils'

/**
 * GET /api/integrations/linkedin/auth
 * Redirects to LinkedIn OAuth authorization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const state = generateOAuthState()
    const scopes = getDefaultScopes('linkedin')
    const authUrl = generateAuthorizationUrl('linkedin', state, scopes)

    console.log('[LinkedIn OAuth] Starting auth flow for user:', session.user.id)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('[LinkedIn OAuth] Auth error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'OAuth initialization failed' },
      { status: 500 }
    )
  }
}
