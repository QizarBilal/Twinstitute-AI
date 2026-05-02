import { getAuthenticatedUser } from '@/lib/auth-utils'
import { success, unauthorized } from '@/lib/api-auth'

/**
 * Check user's authentication status and get appropriate redirect URL
 * Returns the URL where user should be redirected after login
 */
export async function GET() {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return unauthorized('Not authenticated')
    }

    // If user has completed orientation, send to dashboard
    // Otherwise send to orientation
    const redirectUrl = user.selectedRole ? '/dashboard' : '/orientation'

    return success({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        accountType: user.accountType,
        selectedRole: user.selectedRole,
        selectedDomain: user.selectedDomain,
      },
      redirectUrl,
    })
  } catch (error) {
    console.error('Error checking auth status:', error)
    return unauthorized('Error checking authentication status')
  }
}
