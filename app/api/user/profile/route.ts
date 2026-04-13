import { getAuthSession, unauthorized, serverError, success } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getAuthSession()

    if (!session?.user?.email) {
      return unauthorized()
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        directionProfile: true,
      }
    })

    if (!user) {
      return serverError('User not found')
    }

    // Parse direction profile if it exists
    let profile = null
    let selectedDomain = null
    let selectedRole = null
    let cognitiveProfile = null
    let skills = null
    let recommendation = null

    if (user.directionProfile) {
      try {
        profile = JSON.parse(user.directionProfile)
        selectedDomain = profile?.selectedDomain
        selectedRole = profile?.selectedPath || profile?.selectedRole
        cognitiveProfile = profile?.cognitiveProfile
        skills = profile?.skills
        recommendation = profile?.recommendation
      } catch (e) {
        // If it fails to parse, just use null
      }
    }

    return success({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      selectedDomain,
      selectedRole: selectedRole || user.directionProfile ? JSON.parse(user.directionProfile as string)?.selectedRole : null,
      cognitiveProfile,
      skills,
      recommendation,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return serverError()
  }
}
