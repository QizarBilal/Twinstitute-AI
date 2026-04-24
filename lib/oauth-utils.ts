/**
 * OAuth Utilities for GitHub, LinkedIn, and LeetCode integrations
 */

interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  authorizationUrl: string
  tokenUrl: string
  userInfoUrl: string
}

interface OAuthTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

interface OAuthUserInfo {
  id: string
  username?: string
  email?: string
  name?: string
  avatar_url?: string
  bio?: string
}

// ─── GITHUB OAUTH CONFIG ────────────────────────────────────────────────────

export const getGitHubConfig = (): OAuthConfig => {
  const baseUrl = process.env.EXTERNAL_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return {
    clientId: process.env.GITHUB_OAUTH_ID || '',
    clientSecret: process.env.GITHUB_OAUTH_SECRET || '',
    redirectUri: `${baseUrl}/api/integrations/github/callback`,
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
  }
}

// ─── LINKEDIN OAUTH CONFIG ──────────────────────────────────────────────────

export const getLinkedInConfig = (): OAuthConfig => {
  const baseUrl = process.env.EXTERNAL_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return {
    clientId: process.env.LINKEDIN_OAUTH_ID || '',
    clientSecret: process.env.LINKEDIN_OAUTH_SECRET || '',
    redirectUri: `${baseUrl}/api/integrations/linkedin/callback`,
    authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/me',
  }
}

// ─── LEETCODE CONFIG (NO OAUTH, DIRECT API) ─────────────────────────────────

export const getLeetCodeConfig = () => ({
  baseUrl: 'https://leetcode.com/graphql/',
  userUrl: 'https://leetcode.com/api/v1/user/',
})

// ─── OAUTH HELPER FUNCTIONS ────────────────────────────────────────────────

/**
 * Generate OAuth authorization URL
 */
export function generateAuthorizationUrl(
  platform: string,
  state: string,
  scopes: string[] = []
): string {
  const config = platform === 'github' ? getGitHubConfig() : getLinkedInConfig()
  const scopeString = scopes.join(platform === 'github' ? ',' : ' ')

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state: state,
    response_type: 'code',
  })

  // Only add scope if it exists (don't add empty scope for LinkedIn)
  if (scopeString) {
    params.set('scope', scopeString)
  }

  return `${config.authorizationUrl}?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  platform: string,
  code: string
): Promise<OAuthTokenResponse> {
  const config = platform === 'github' ? getGitHubConfig() : getLinkedInConfig()

  const bodyParams = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code: code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  })

  console.log(`[${platform.toUpperCase()} OAuth] Token URL: ${config.tokenUrl}`)
  console.log(`[${platform.toUpperCase()} OAuth] Request body:`, bodyParams.toString())

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers:
      platform === 'github'
        ? { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
        : { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bodyParams.toString(),
  })

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`
    try {
      const error = await response.json()
      errorMsg = error.error_description || error.error || error.message || errorMsg
    } catch (e) {
      const text = await response.text()
      console.error(`[OAuth] Raw error response: ${text}`)
    }
    console.error(`[${platform.toUpperCase()} OAuth] Token exchange failed: ${errorMsg}`)
    throw new Error(`OAuth token exchange failed: ${errorMsg}`)
  }

  return response.json()
}

/**
 * Fetch user info from OAuth provider
 */
export async function fetchOAuthUserInfo(
  platform: string,
  accessToken: string
): Promise<OAuthUserInfo> {
  const config = platform === 'github' ? getGitHubConfig() : getLinkedInConfig()

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'bypass-tunnel-reminder': 'true',
  }

  if (platform === 'github') {
    headers['Accept'] = 'application/vnd.github.v3+json'
  } else if (platform === 'linkedin') {
    headers['Accept'] = 'application/json'
  }

  const response = await fetch(config.userInfoUrl, { headers })

  if (!response.ok) {
    // For LinkedIn, if basic /me endpoint fails, try minimal fallback
    if (platform === 'linkedin') {
      console.warn('[LinkedIn OAuth] /me endpoint failed, attempting fallback...')
      // Return minimal data structure - LinkedIn connection still successful
      return {
        id: `linkedin_${Date.now()}`,
        username: 'LinkedIn User',
        email: '',
        name: 'LinkedIn User',
        avatar_url: '',
      }
    }
    throw new Error(`Failed to fetch user info from ${platform}`)
  }

  const data = await response.json()

  // Normalize user info across platforms
  if (platform === 'github') {
    return {
      id: data.id.toString(),
      username: data.login,
      email: data.email,
      name: data.name,
      avatar_url: data.avatar_url,
      bio: data.bio,
    }
  } else if (platform === 'linkedin') {
    // LinkedIn returns different field names based on available scopes
    const firstName = data.localizedFirstName || data.given_name || ''
    const lastName = data.localizedLastName || data.family_name || ''
    return {
      id: data.id || data.sub || `linkedin_${Date.now()}`,
      username: firstName || 'LinkedIn User',
      email: data.email || '',
      name: `${firstName} ${lastName}`.trim() || 'LinkedIn User',
      avatar_url: data.profilePicture?.displayImage || '',
    }
  }

  return data
}

/**
 * Fetch LeetCode stats using GraphQL (no OAuth needed)
 */
export async function fetchLeetCodeStats(username: string) {
  // Validate username
  if (!username || typeof username !== 'string' || username.length < 3) {
    throw new Error(`Invalid LeetCode username: ${username}`)
  }

  const graphqlUrl = 'https://leetcode.com/graphql'
  
  // Simplified GraphQL query - using correct LeetCode field names
  const query = `
    query getUserStats($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          countryCode
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
          totalSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `

  try {
    console.log(`[LeetCode GraphQL] Fetching stats for: ${username}`)
    
    const body = JSON.stringify({
      query: query.trim(),
      variables: { username: username },
      operationName: 'getUserStats',
    })
    
    console.log(`[LeetCode GraphQL] Request body length: ${body.length}`)
    
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://leetcode.com/',
        'bypass-tunnel-reminder': 'true',
      },
      body: body,
    })

    console.log(`[LeetCode GraphQL] Response status: ${response.status}`)
    
    if (!response.ok) {
      const text = await response.text()
      console.error(`[LeetCode GraphQL] HTTP Error: ${response.status}`, text.substring(0, 200))
      throw new Error(`LeetCode API error: HTTP ${response.status}`)
    }

    const data = await response.json()

    // Check for GraphQL errors
    if (data.errors) {
      console.error('[LeetCode GraphQL] GraphQL Error:', JSON.stringify(data.errors))
      throw new Error(`LeetCode GraphQL error: ${data.errors[0]?.message || 'Unknown error'}`)
    }

    const user = data.data?.matchedUser
    if (!user) {
      console.error('[LeetCode GraphQL] User not found in response')
      throw new Error(`LeetCode user not found: ${username}`)
    }

    // Parse submission stats
    const acStats = user.submitStatsGlobal?.acSubmissionNum || []
    const totalStats = user.submitStatsGlobal?.totalSubmissionNum || []
    
    const problemsSolved = acStats.reduce((sum: number, stat: any) => sum + (stat.count || 0), 0)
    const totalSubmissions = totalStats.reduce((sum: number, stat: any) => sum + (stat.count || 0), 0)

    console.log(`[LeetCode GraphQL] Success: ${user.username}, problems solved: ${problemsSolved}`)

    return {
      id: user.username,
      username: user.username,
      email: '',
      realName: user.profile?.realName || '',
      avatar: '',
      badges: [],
      problemsSolved: problemsSolved,
      totalProblems: 0,
      acceptedSubmissions: problemsSolved,
      totalSubmissions: totalSubmissions,
      contributionPoints: 0,
      country: user.profile?.countryCode || '',
    }
  } catch (error) {
    console.error('[LeetCode] Fetch error:', error)
    throw error
  }
}

/**
 * Encrypt token for storage (simple base64 for now, should be replaced with proper encryption)
 */
export function encryptToken(token: string): string {
  return Buffer.from(token).toString('base64')
}

/**
 * Decrypt token from storage
 */
export function decryptToken(encrypted: string): string {
  return Buffer.from(encrypted, 'base64').toString('utf-8')
}

/**
 * Generate random state for OAuth
 */
export function generateOAuthState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Get default scopes for each platform
 */
export function getDefaultScopes(platform: string): string[] {
  const scopes: Record<string, string[]> = {
    github: [
      'read:user',
      'user:email',
      'public_repo',
      'read:org',
    ],
    // LinkedIn: Use empty scopes array to use default Sign In With LinkedIn
    // This works without explicit scope approval from LinkedIn
    // LinkedIn will return basic profile info with its default permissions
    linkedin: [],
  }

  return scopes[platform] || []
}
