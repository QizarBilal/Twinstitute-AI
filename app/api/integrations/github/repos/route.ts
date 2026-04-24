import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { decryptToken } from '@/lib/oauth-utils'

/**
 * GET /api/integrations/github/repos
 * Fetch GitHub repositories for the connected user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const integration = await prisma.oAuthIntegration.findUnique({
      where: { userId_platform: { userId: session.user.id, platform: 'github' } },
    })

    if (!integration || !integration.isConnected) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 404 })
    }

    // Decrypt access token
    const accessToken = decryptToken(integration.accessToken)
    
    // Fetch user repos from GitHub API
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=20&type=owner', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Twinstitute-AI',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub repos')
    }

    const repos = await response.json()

    // Format repo data
    const formattedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      isPrivate: repo.private,
      updatedAt: repo.updated_at,
      topics: repo.topics || [],
    }))

    return NextResponse.json({
      success: true,
      data: formattedRepos,
    })
  } catch (error) {
    console.error('[GitHub Repos] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 })
  }
}
