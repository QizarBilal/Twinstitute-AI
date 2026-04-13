import { getAuthSession, unauthorized, serverError, success } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// GET /api/user - Get current user
export async function GET() {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return unauthorized()
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        accountType: true,
        selectedRole: true,
        selectedDomain: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return serverError('User not found in database')
    }

    return success(user)
  } catch (error) {
    console.error('User GET error:', error)
    return serverError('Failed to fetch user')
  }
}

// PATCH /api/user - Update current user
export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      return unauthorized()
    }

    const body = await req.json()
    const { fullName, accountType, selectedRole, selectedDomain } = body

    const updateData: Record<string, any> = {}
    
    if (fullName !== undefined) updateData.fullName = fullName
    if (accountType !== undefined) updateData.accountType = accountType
    if (selectedRole !== undefined) updateData.selectedRole = selectedRole
    if (selectedDomain !== undefined) updateData.selectedDomain = selectedDomain
    
    updateData.updatedAt = new Date()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        accountType: true,
        selectedRole: true,
        selectedDomain: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return success(user)
  } catch (error) {
    console.error('User PATCH error:', error)
    return serverError('Failed to update user')
  }
}
