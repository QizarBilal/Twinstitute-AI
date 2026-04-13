import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { validatePassword } from '@/lib/utils/validation'
import { hashToken, isTokenExpired } from '@/lib/utils/token'
import { sendPasswordChangedEmail } from '@/lib/services/email-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    const hashedToken = hashToken(token)

    const user = await prisma.user.findFirst({
      where: { resetTokenHash: hashedToken },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    if (isTokenExpired(user.resetExpiry)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: null,
          resetExpiry: null,
        },
      })
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetTokenHash: null,
        resetExpiry: null,
      },
    })

    await sendPasswordChangedEmail(user.email, user.fullName)

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An error occurred during password reset' },
      { status: 500 }
    )
  }
}
