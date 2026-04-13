export interface PasswordStrength {
  score: number
  entropy: number
  feedback: string
  color: string
  isStrong: boolean
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, entropy: 0, feedback: '', color: '#6B7280', isStrong: false }
  }

  let score = 0
  let entropy = 0

  const hasLowerCase = /[a-z]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  
  let charsetSize = 0
  if (hasLowerCase) charsetSize += 26
  if (hasUpperCase) charsetSize += 26
  if (hasNumbers) charsetSize += 10
  if (hasSpecialChars) charsetSize += 32

  if (charsetSize > 0) {
    entropy = password.length * Math.log2(charsetSize)
  }

  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  if (hasLowerCase && hasUpperCase) score += 1
  if (hasNumbers) score += 1
  if (hasSpecialChars) score += 1

  if (!/(.)\1{2,}/.test(password)) score += 1

  const commonPatterns = ['password', '123456', 'qwerty', 'abc123', 'letmein']
  const isCommon = commonPatterns.some(pattern => password.toLowerCase().includes(pattern))
  if (isCommon) score -= 2

  score = Math.max(0, Math.min(score, 7))

  let feedback = ''
  let color = '#6B7280'
  let isStrong = false

  if (score <= 2) {
    feedback = 'Weak password'
    color = '#EF4444'
  } else if (score <= 4) {
    feedback = 'Fair password'
    color = '#F59E0B'
  } else if (score <= 5) {
    feedback = 'Good password'
    color = '#3B82F6'
  } else {
    feedback = 'Strong password'
    color = '#10B981'
    isStrong = true
  }

  return { score, entropy, feedback, color, isStrong }
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePasswordRequirements = (password: string): {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  special: boolean
} => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>&'"]/g, (char) => {
    const map: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&#x27;',
      '"': '&quot;'
    }
    return map[char] || char
  })
}

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp)
}
