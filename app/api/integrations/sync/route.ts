import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { decryptToken, fetchOAuthUserInfo, fetchLeetCodeStats } from '@/lib/oauth-utils'

/**
 * POST /api/integrations/sync
 * Sync data from connected platforms and update capability profile
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const integrations = await prisma.oAuthIntegration.findMany({
      where: {
        userId: session.user.id,
        isConnected: true,
      },
    })

    const syncResults: any[] = []

    for (const integration of integrations) {
      try {
        // Update sync status
        await prisma.oAuthIntegration.update({
          where: { id: integration.id },
          data: { syncStatus: 'syncing' },
        })

        let profileData = {}

        if (integration.platform === 'github') {
          const accessToken = decryptToken(integration.accessToken)
          const userInfo = await fetchOAuthUserInfo('github', accessToken)

          // Fetch additional GitHub data
          const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          })

          const repos = reposResponse.ok ? await reposResponse.json() : []

          // Analyze languages and stats
          const languages: Record<string, number> = {}
          let totalStars = 0
          let totalCommits = 0

          for (const repo of repos) {
            if (repo.language) {
              languages[repo.language] = (languages[repo.language] || 0) + 1
            }
            totalStars += repo.stargazers_count || 0
          }

          profileData = {
            name: userInfo.name,
            avatar_url: userInfo.avatar_url,
            bio: userInfo.bio,
            repositories: repos.length,
            languages: languages,
            topLanguages: Object.entries(languages)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([lang, count]) => ({ language: lang, repositories: count })),
            totalStars: totalStars,
            publicRepos: repos.filter((r: any) => !r.private).length,
            syncedAt: new Date().toISOString(),
          }
        } else if (integration.platform === 'linkedin') {
          const accessToken = decryptToken(integration.accessToken)
          const userInfo = await fetchOAuthUserInfo('linkedin', accessToken)

          profileData = {
            name: userInfo.name,
            avatar_url: userInfo.avatar_url,
            email: userInfo.email,
            syncedAt: new Date().toISOString(),
          }
        } else if (integration.platform === 'leetcode') {
          const stats = await fetchLeetCodeStats(integration.platformUsername!)
          profileData = stats
        }

        // Update integration with new data
        await prisma.oAuthIntegration.update({
          where: { id: integration.id },
          data: {
            profileData: JSON.stringify(profileData),
            lastSyncedAt: new Date(),
            syncStatus: 'idle',
            syncError: null,
          },
        })

        syncResults.push({
          platform: integration.platform,
          success: true,
          data: profileData,
        })

        console.log('[Sync] Updated:', integration.platform, 'for user:', session.user.id)
      } catch (error) {
        console.error(`[Sync] Error syncing ${integration.platform}:`, error)

        await prisma.oAuthIntegration.update({
          where: { id: integration.id },
          data: {
            syncStatus: 'failed',
            syncError: error instanceof Error ? error.message : 'Sync failed',
          },
        })

        syncResults.push({
          platform: integration.platform,
          success: false,
          error: error instanceof Error ? error.message : 'Sync failed',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      data: syncResults,
    })
  } catch (error) {
    console.error('[Sync] Error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

/**
 * GET /api/integrations/sync
 * Get sync status for all integrations
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
        platform: true,
        isConnected: true,
        lastSyncedAt: true,
        syncStatus: true,
        syncError: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: integrations,
    })
  } catch (error) {
    console.error('[Sync] Status error:', error)
    return NextResponse.json({ error: 'Failed to fetch sync status' }, { status: 500 })
  }
}
