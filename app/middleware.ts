import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Check if user is trying to access dashboard but hasn't completed orientation
    if (path === '/dashboard' || path.startsWith('/dashboard/')) {
      // In production, check user.selectedRole in database
      // For now, this check happens in the dashboard layout
      // The orientation system will redirect from dashboard if needed
    }

    // After login, redirect home to dashboard (orientation handled inside)
    if (path === '/home') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/orientation/:path*', '/home', '/dashboard/:path*'],
}
