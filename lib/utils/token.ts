import crypto from 'crypto'

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function getResetExpiry(): Date {
  const expiry = new Date()
  expiry.setMinutes(expiry.getMinutes() + 20)
  return expiry
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function isTokenExpired(expiry: Date | null): boolean {
  if (!expiry) return true
  return new Date() > expiry
}
