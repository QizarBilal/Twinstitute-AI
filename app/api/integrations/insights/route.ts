import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { fetchLeetCodeStats } from '@/lib/oauth-utils'

/**
 * GET /api/integrations/insights
 * Get social media insights for all connected platforms
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const integrations = await prisma.oAuthIntegration.findMany({
      where: { 
        userId: session.user.id,
        isConnected: true 
      },
    })

    const insights: Record<string, any> = {
      github: null,
      linkedin: null,
      leetcode: null,
    }

    for (const integration of integrations) {
      const platformData = integration.profileData 
        ? typeof integration.profileData === 'string' 
          ? JSON.parse(integration.profileData) 
          : integration.profileData
        : {}

      switch (integration.platform) {
        case 'github':
          insights.github = {
            isConnected: true,
            username: integration.platformUsername,
            ...platformData,
          }
          break
        case 'linkedin':
          insights.linkedin = {
            isConnected: true,
            username: integration.platformUsername,
            ...platformData,
          }
          break
        case 'leetcode':
          insights.leetcode = {
            isConnected: true,
            username: integration.platformUsername,
            ...platformData,
          }
          break
      }
    }

    return NextResponse.json({
      success: true,
      data: insights,
    })
  } catch (error) {
    console.error('[Insights] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}
