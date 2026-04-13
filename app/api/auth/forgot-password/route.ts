import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeEmail, validateEmail } from '@/lib/utils/validation'
import { generateResetToken, getResetExpiry, hashToken } from '@/lib/utils/token'
import { checkRateLimit } from '@/lib/utils/rate-limit-mongo'
import { verifyCaptcha } from '@/lib/utils/captcha'
import { sendPasswordResetEmail } from '@/lib/services/email-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, captchaToken } = body

    if (!email || !captchaToken) {
      return NextResponse.json(
        { error: 'Email and captcha are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = normalizeEmail(email)

    if (!validateEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const rateLimitKey = `forgot-password:${normalizedEmail}`
    const allowed = await checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later' },
        { status: 429 }
      )
    }

    const isCaptchaValid = await verifyCaptcha(captchaToken)
    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: 'Captcha verification failed' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      })
    }

    const resetToken = generateResetToken()
    const hashedToken = hashToken(resetToken)
    const resetExpiry = getResetExpiry()

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: hashedToken,
        resetExpiry,
      },
    })

    await sendPasswordResetEmail(normalizedEmail, resetToken, user.fullName)

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again' },
      { status: 500 }
    )
  }
}
