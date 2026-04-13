import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth/crypto'
import { generateToken } from '@/lib/auth/token'
import { verifyCaptcha } from '@/lib/auth/captcha'
import { validateEmail } from '@/lib/auth/validation'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const checkRateLimit = (email: string): boolean => {
  const now = Date.now()
  const limit = rateLimitMap.get(email)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(email, { count: 1, resetTime: now + 15 * 60 * 1000 })
    return true
  }
  
  if (limit.count >= 5) {
    return false
  }
  
  limit.count++
  return true
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, captchaToken } = body

    if (!email || !password || !captchaToken) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 })
    }

    const captchaValid = await verifyCaptcha(captchaToken)
    if (!captchaValid) {
      return NextResponse.json({ message: 'CAPTCHA verification failed' }, { status: 400 })
    }

    if (!checkRateLimit(email.toLowerCase())) {
      return NextResponse.json({ message: 'Too many login attempts. Please try again later.' }, { status: 429 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user || !user.passwordHash) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
      return NextResponse.json({ 
        message: `Account is temporarily locked. Please try again in ${remainingTime} minutes.` 
      }, { status: 423 })
    }

    const passwordValid = await verifyPassword(password, user.passwordHash)

    if (!passwordValid) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1
      const lockedUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      })

      const remainingAttempts = Math.max(0, 5 - failedAttempts)
      return NextResponse.json({ 
        message: remainingAttempts > 0 
          ? `Invalid email or password. ${remainingAttempts} attempts remaining.`
          : 'Account locked due to too many failed attempts. Please try again in 30 minutes.'
      }, { status: 401 })
    }

    if (!user.isVerified) {
      return NextResponse.json({ 
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email
      }, { status: 403 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    })

    const token = generateToken(64)

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        accountType: user.accountType,
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
