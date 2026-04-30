import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
      accountType: string
      selectedRole?: string
      selectedDomain?: string
      emailVerified?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: string
    accountType: string
    rememberMe?: boolean
    provider?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    accountType: string
    selectedRole?: string
    selectedDomain?: string
    rememberMe?: boolean
    emailVerified?: boolean
    provider?: string
  }
}
