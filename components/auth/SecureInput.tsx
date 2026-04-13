'use client'

import { forwardRef, InputHTMLAttributes, useState } from 'react'

interface SecureInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  error?: string
  validating?: boolean
  isValid?: boolean
  onChange: (value: string) => void
  value: string
}

const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ label, error, validating, isValid, onChange, value, type, maxLength, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    
    const isPasswordField = type === 'password'
    const inputType = isPasswordField && showPassword ? 'text' : type

    return (
      <div className="space-y-1">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </label>
        
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={maxLength}
            className={`
              w-full px-3.5 py-2 bg-gray-900
              ${isPasswordField ? 'pr-20' : 'pr-10'}
              border text-sm text-gray-100 placeholder-gray-600
              transition-all duration-150
              ${error 
                ? 'border-red-600/60 focus:border-red-600 focus:ring-1 focus:ring-red-600/30' 
                : isValid
                  ? 'border-green-600/60 focus:border-green-600 focus:ring-1 focus:ring-green-600/30'
                  : focused
                    ? 'border-blue-600/60 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30'
                    : 'border-gray-800 hover:border-gray-700'
              }
              focus:outline-none
            `}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isPasswordField && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-600 hover:text-gray-400 transition-colors"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            )}
            
            {(validating || isValid || error) && (
              <div>
                {validating && (
                  <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                )}
                {!validating && isValid && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {!validating && error && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="h-3.5">
          {error && (
            <div className="flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="w-0.5 h-3 bg-red-600 mt-0.5 flex-shrink-0"/>
              <span className="text-xs text-red-400 leading-tight">{error}</span>
            </div>
          )}
        </div>
      </div>
    )
  }
)

SecureInput.displayName = 'SecureInput'

export default SecureInput
