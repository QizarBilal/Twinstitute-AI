'use client'

interface PasswordStrengthProps {
  password: string
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const calculateStrength = (): { level: 'weak' | 'medium' | 'strong'; label: string; color: string; width: string } => {
    if (!password) return { level: 'weak', label: 'Weak', color: 'bg-red-600', width: 'w-0' }
    
    let score = 0
    
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    
    if (score <= 2) {
      return { level: 'weak', label: 'Weak', color: 'bg-red-600', width: 'w-1/3' }
    } else if (score <= 4) {
      return { level: 'medium', label: 'Medium', color: 'bg-yellow-600', width: 'w-2/3' }
    } else {
      return { level: 'strong', label: 'Strong', color: 'bg-green-600', width: 'w-full' }
    }
  }

  const strength = calculateStrength()

  if (!password) return null

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
          Password Strength
        </span>
        <span className={`text-[10px] font-semibold ${
          strength.level === 'weak' ? 'text-red-400' : 
          strength.level === 'medium' ? 'text-yellow-400' : 
          'text-green-400'
        }`}>
          {strength.label}
        </span>
      </div>
      <div className="h-1 bg-gray-800 overflow-hidden">
        <div 
          className={`h-full ${strength.color} transition-all duration-300`}
          style={{ width: strength.width }}
        />
      </div>
    </div>
  )
}
