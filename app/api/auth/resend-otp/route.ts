import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeEmail, validateEmail } from '@/lib/utils/validation'
import { generateOTP, getOTPExpiry } from '@/lib/utils/otp'
import { checkRateLimit } from '@/lib/utils/rate-limit-mongo'
import { sendOTPEmail } from '@/lib/services/email-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    const rateLimitKey = `send-otp:${normalizedEmail}`
    const allowed = await checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000)
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please try again later' },
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

    const otp = generateOTP()
    const otpExpiry = getOTPExpiry()

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationOTP: otp,
        otpExpiry,
      },
    })

    await sendOTPEmail(normalizedEmail, otp, user.fullName)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code. Please try again' },
      { status: 500 }
    )
  }
}
