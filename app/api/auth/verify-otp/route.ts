import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeEmail, validateEmail } from '@/lib/utils/validation'
import { isOTPExpired } from '@/lib/utils/otp'
import { checkRateLimit, resetRateLimit } from '@/lib/utils/rate-limit-mongo'
import { sendWelcomeEmail } from '@/lib/services/email-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
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

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      )
    }

    const rateLimitKey = `verify-otp:${normalizedEmail}`
    const allowed = await checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later' },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    if (!user.verificationOTP || !user.otpExpiry) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one' },
        { status: 400 }
      )
    }

    if (isOTPExpired(user.otpExpiry)) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one' },
        { status: 400 }
      )
    }

    if (user.verificationOTP !== otp) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationOTP: null,
        otpExpiry: null,
      },
    })

    await resetRateLimit(rateLimitKey)
    await resetRateLimit(`signup:${normalizedEmail}`)

    await sendWelcomeEmail(normalizedEmail, user.fullName)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed. Please try again' },
      { status: 500 }
    )
  }
}
