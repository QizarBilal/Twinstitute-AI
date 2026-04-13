export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 100
}

export function validatePassword(password: string): boolean {
  return password.length >= 8 && password.length <= 128
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}
