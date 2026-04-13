import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { verifyCaptcha } from '@/lib/utils/captcha'
import { generateOTP, getOTPExpiry } from '@/lib/utils/otp'
import { normalizeEmail, validateEmail, validatePassword, sanitizeInput } from '@/lib/utils/validation'
import { checkRateLimit } from '@/lib/utils/rate-limit-mongo'
import { sendOTPEmail } from '@/lib/services/email-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, accountType, organizationName, captchaToken } = body

    if (!email || !password || !fullName || !accountType) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
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

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    if (!['learner', 'academic_institution'].includes(accountType)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      )
    }

    if (accountType === 'academic_institution' && !organizationName) {
      return NextResponse.json(
        { error: 'Organization name is required for institutional accounts' },
        { status: 400 }
      )
    }

    const rateLimitKey = `signup:${normalizedEmail}`
    const allowed = await checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later' },
        { status: 429 }
      )
    }

    const isCaptchaValid = await verifyCaptcha(captchaToken)
    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: 'Captcha verification failed. Please try again' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const otp = generateOTP()
    const otpExpiry = getOTPExpiry()
    const cleanFullName = sanitizeInput(fullName)
    const cleanOrgName = organizationName ? sanitizeInput(organizationName) : undefined

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: cleanFullName,
        accountType,
        organizationName: cleanOrgName,
        emailVerified: false,
        verificationOTP: otp,
        otpExpiry,
      },
    })

    await sendOTPEmail(normalizedEmail, otp, cleanFullName)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email for the verification code',
      userId: user.id,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during signup. Please try again' },
      { status: 500 }
    )
  }
}
