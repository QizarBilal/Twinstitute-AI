'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'

interface SignOutButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
  children?: React.ReactNode
}

export default function SignOutButton({
  className = '',
  variant = 'secondary',
  fullWidth = true,
  children,
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({
        redirect: true,
        callbackUrl: '/',
      })
    } catch (error) {
      console.error('Sign-out error:', error)
      setIsLoading(false)
    }
  }

  const baseClasses = `
    px-4 py-2 rounded-lg
    font-semibold text-sm
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
  `

  const variantClasses = {
    primary: `
      bg-white text-black hover:bg-gray-100
      border border-white
      focus:ring-white/50
    `,
    secondary: `
      bg-gray-900 text-white hover:bg-gray-800
      border border-gray-800
      focus:ring-blue-500/50
    `,
    danger: `
      bg-red-900/20 text-red-400 hover:bg-red-900/40
      border border-red-900/50
      focus:ring-red-500/50
    `,
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Signing out...
        </span>
      ) : (
        children || 'Sign Out'
      )}
    </button>
  )
}
