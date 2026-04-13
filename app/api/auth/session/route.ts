import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json(session || {})
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({})
  }
}
