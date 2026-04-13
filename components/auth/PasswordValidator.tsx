'use client'

interface PasswordRequirement {
  label: string
  met: boolean
}

interface PasswordValidatorProps {
  password: string
}

export default function PasswordValidator({ password }: PasswordValidatorProps) {
  const requirements: PasswordRequirement[] = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) }
  ]

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
      {requirements.map((req, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <div className={`
            w-3 h-3 border flex items-center justify-center flex-shrink-0
            transition-all duration-150
            ${req.met 
              ? 'bg-green-600 border-green-600' 
              : 'border-gray-700'
            }
          `}>
            {req.met && (
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-white">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </div>
          <span className={`
            text-[10px] leading-tight transition-colors duration-150
            ${req.met ? 'text-green-400' : 'text-gray-600'}
          `}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  )
}
