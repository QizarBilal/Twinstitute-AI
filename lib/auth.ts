import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { normalizeEmail } from '@/lib/utils/validation'
import { checkLoginRateLimit } from '@/lib/utils/rate-limit-mongo'

function isInstitutionalEmail(email: string): boolean {
  const institutionalDomains = ['.edu', '.ac.', '.edu.', 'university', 'college', 'institute']
  return institutionalDomains.some(domain => email.toLowerCase().includes(domain))
}

export const authOptions: NextAuthOptions = {
  debug: false,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Authentication failed')
        }

        const email = normalizeEmail(credentials.email)
        const rateLimitKey = `login:${email}`
        
        const allowed = await checkLoginRateLimit(rateLimitKey, 5, 15 * 60 * 1000)
        
        if (!allowed) {
          throw new Error('Too many login attempts. Please try again later')
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) {
          throw new Error('Authentication failed')
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          throw new Error('Authentication failed')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName || null,
          role: 'user',
          accountType: user.accountType || 'learner',
          rememberMe: credentials?.rememberMe === 'true',
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days default
    updateAge: 24 * 60 * 60, // Update session daily to refresh expiration
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = normalizeEmail(user.email || '')
        if (!email) return false

        const existingUser = await prisma.user.findUnique({
          where: { email },
        })

        if (!existingUser) {
          const accountType = isInstitutionalEmail(email) ? 'academic_institution' : 'learner'
          
          await prisma.user.create({
            data: {
              email,
              fullName: user.name || '',
              accountType,
              emailVerified: true,
            },
          })
        } else if (!existingUser.emailVerified) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: true },
          })
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.rememberMe = user.rememberMe || false
        token.provider = account?.provider
      }
      
      // Refresh user state from database
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { 
            fullName: true,
            accountType: true,
            selectedRole: true,
            selectedDomain: true,
            emailVerified: true,
          },
        })

        if (dbUser) {
          token.name = dbUser.fullName || token.name
          token.accountType = dbUser.accountType
          token.selectedRole = dbUser.selectedRole
          token.selectedDomain = dbUser.selectedDomain
          token.emailVerified = dbUser.emailVerified
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.accountType = token.accountType as string
        session.user.selectedRole = token.selectedRole as string
        session.user.selectedDomain = token.selectedDomain as string
        session.user.emailVerified = token.emailVerified as boolean
        
        // Extend session expiration if Remember Me is checked
        if (token.rememberMe) {
          // Set session to expire in 30 days instead of 7
          session.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirects are only to valid URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + '/dashboard'
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
}
