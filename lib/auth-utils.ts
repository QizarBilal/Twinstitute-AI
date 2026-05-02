import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export interface UserSessionData {
  id: string
  email: string
  fullName: string | null
  accountType: string | null
  selectedRole: string | null
  selectedDomain: string | null
  emailVerified: boolean
}

/**
 * Get authenticated user's session data
 * Useful for server-side components and API routes
 */
export async function getAuthenticatedUser(): Promise<UserSessionData | null> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        accountType: true,
        emailVerified: true,
        directionProfile: true,
      },
    })

    if (!user) {
      return null
    }

    let selectedRole = null
    let selectedDomain = null

    // Parse direction profile if it exists
    if (user.directionProfile) {
      try {
        const profile = JSON.parse(user.directionProfile)
        selectedRole = profile?.selectedPath || profile?.selectedRole
        selectedDomain = profile?.selectedDomain
      } catch (e) {
        // If parsing fails, keep as null
      }
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      accountType: user.accountType,
      selectedRole,
      selectedDomain,
      emailVerified: user.emailVerified || false,
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

/**
 * Check if user has completed orientation (selected role)
 */
export async function hasCompletedOrientation(): Promise<boolean> {
  const user = await getAuthenticatedUser()
  return !!user?.selectedRole
}

/**
 * Get user's selected role and domain
 */
export async function getUserOrientation(): Promise<{ role: string | null; domain: string | null } | null> {
  const user = await getAuthenticatedUser()
  if (!user) return null

  return {
    role: user.selectedRole,
    domain: user.selectedDomain,
  }
}
