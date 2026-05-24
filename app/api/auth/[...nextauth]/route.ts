import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Ensure NEXTAUTH_SECRET is set
if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'twinstitute-dev-secret'
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
