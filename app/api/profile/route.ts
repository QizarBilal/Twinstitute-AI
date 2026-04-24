import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/profile
 * Fetch authenticated user's profile with all educational and personal info
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        college: true,
        degree: true,
        stream: true,
        joinYear: true,
        gradYear: true,
        street: true,
        city: true,
        state: true,
        pincode: true,
        emailVerified: true,
        updatedAt: true,
        selectedRole: true,
        selectedDomain: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('[Profile] GET successful for user:', user.id)
    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error('[Profile] GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/profile
 * Update authenticated user's profile with personal, educational, and address information
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Extract fields
    const {
      fullName,
      mobile,
      college,
      degree,
      stream,
      joinYear,
      gradYear,
      street,
      city,
      state,
      pincode,
    } = body

    // Validate required fields
    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    // Validate mobile format if provided
    if (mobile && !/^\d{10}$/.test(mobile.replace(/\D/g, ''))) {
      return NextResponse.json({ error: 'Mobile must be 10 digits' }, { status: 400 })
    }

    // Validate pincode format if provided
    if (pincode && !/^\d{6}$/.test(pincode.replace(/\D/g, ''))) {
      return NextResponse.json({ error: 'Pincode must be 6 digits' }, { status: 400 })
    }

    // Validate year data if both provided
    if (joinYear && gradYear) {
      const joinYearNum = parseInt(joinYear.toString())
      const gradYearNum = parseInt(gradYear.toString())
      if (joinYearNum >= gradYearNum) {
        return NextResponse.json(
          { error: 'Graduation year must be after joining year' },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData = {
      fullName: fullName?.trim(),
      mobile: mobile?.trim() || null,
      college: college?.trim() || null,
      degree: degree?.trim() || null,
      stream: stream?.trim() || null,
      joinYear: joinYear ? parseInt(joinYear.toString()) : null,
      gradYear: gradYear ? parseInt(gradYear.toString()) : null,
      street: street?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      pincode: pincode?.trim() || null,
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        college: true,
        degree: true,
        stream: true,
        joinYear: true,
        gradYear: true,
        street: true,
        city: true,
        state: true,
        pincode: true,
        emailVerified: true,
        updatedAt: true,
        selectedRole: true,
        selectedDomain: true,
      },
    })

    console.log('[Profile] PATCH successful for user:', updatedUser.id)
    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error('[Profile] PATCH error:', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    )
  }
}
