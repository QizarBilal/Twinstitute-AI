import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token?.id) {
      return NextResponse.json(null, { status: 200 })
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: {
          id: true,
          email: true,
          fullName: true,
          accountType: true,
          selectedRole: true,
          selectedDomain: true,
          emailVerified: true,
        },
      })

      return NextResponse.json({
        user: {
          id: user?.id || (token.id as string),
          name: user?.fullName || (token.name as string) || '',
          email: user?.email || (token.email as string) || '',
          accountType: user?.accountType || (token.accountType as string) || 'learner',
          selectedRole: user?.selectedRole || (token.selectedRole as string) || null,
          selectedDomain: user?.selectedDomain || (token.selectedDomain as string) || null,
          emailVerified: user?.emailVerified ?? Boolean(token.emailVerified),
        },
        expires: token.exp ? new Date(Number(token.exp) * 1000).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
    } catch (dbError) {
      // Database is unavailable - return session data from token only
      console.error('[session] Database error:', dbError instanceof Error ? dbError.message : dbError)
      return NextResponse.json({
        user: {
          id: token.id as string,
          name: (token.name as string) || '',
          email: (token.email as string) || '',
          accountType: (token.accountType as string) || 'learner',
          selectedRole: (token.selectedRole as string) || null,
          selectedDomain: (token.selectedDomain as string) || null,
          emailVerified: Boolean(token.emailVerified),
        },
        expires: token.exp ? new Date(Number(token.exp) * 1000).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(null, { status: 200 })
  }
}
