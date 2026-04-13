import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function getAuthSession() {
  try {
    const session = await getServerSession(authOptions)
    return session
  } catch (error) {
    console.error('Session retrieval error:', error)
    return null
  }
}

export function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized', data: null }, { status: 401 })
}

export function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message, data: null }, { status: 400 })
}

export function serverError(message: string = 'Internal server error') {
  return NextResponse.json({ success: false, error: message, data: null }, { status: 500 })
}

export function notFound(message: string = 'Not found') {
  return NextResponse.json({ success: false, error: message, data: null }, { status: 404 })
}

export function success(data: unknown) {
  return NextResponse.json({ success: true, data, error: null }, { status: 200 })
}
