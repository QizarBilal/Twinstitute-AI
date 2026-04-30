import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Check if user has completed role selection (orientation)
    const hasSelectedRole = token.selectedRole

    // If trying to access dashboard without role selected, redirect to orientation
    if ((path === '/dashboard' || path.startsWith('/dashboard/')) && !hasSelectedRole) {
      return NextResponse.redirect(new URL('/orientation', req.url))
    }

    // If on orientation and already has role, redirect to dashboard
    if (path.startsWith('/orientation') && hasSelectedRole) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // After login, redirect home to dashboard
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
