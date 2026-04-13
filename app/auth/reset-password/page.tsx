'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SecureInput from '@/components/auth/SecureInput'
import PasswordValidator from '@/components/auth/PasswordValidator'
import AuthorityPanel from '@/components/auth/AuthorityPanel'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  const passwordValid = password.length >= 8 && 
    /[A-Z]/.test(password) && 
    /[a-z]/.test(password) && 
    /[0-9]/.test(password) && 
    /[^A-Za-z0-9]/.test(password)
  
  const confirmPasswordValid = confirmPassword === password && confirmPassword.length > 0

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      return
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        setTokenValid(response.ok)
      } catch {
        setTokenValid(false)
      }
    }

    verifyToken()
  }, [token])

  const handlePasswordChange = (value: string) => {
    const trimmed = value.trimStart()
    if (trimmed.length <= 128) {
      setPassword(trimmed)
      if (error) setError('')
    }
  }

  const handleConfirmPasswordChange = (value: string) => {
    const trimmed = value.trimStart()
    if (trimmed.length <= 128) {
      setConfirmPassword(trimmed)
      if (error) setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordValid || !confirmPasswordValid) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: password
        })
      })

      if (response.ok) {
        router.push('/auth/login?reset=success')
      } else {
        const data = await response.json()
        throw new Error(data.message || 'Password reset failed')
      }
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span className="text-sm">Verifying reset link</span>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-red-950/30 border border-red-900/50 mx-auto flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">Invalid Reset Link</h1>
            <p className="text-sm text-gray-500">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <button
            onClick={() => router.push('/auth/login')}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors duration-150"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black grid grid-cols-2">
      <div className="relative flex items-center justify-center p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-blue-600 flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <SecureInput
              label="New Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Create secure password"
              autoComplete="new-password"
              error={error && !confirmPassword ? error : ''}
              isValid={passwordValid}
            />

            {password && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <PasswordValidator password={password} />
              </div>
            )}

            <SecureInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Re-enter password"
              autoComplete="new-password"
              error={confirmPassword && !confirmPasswordValid ? 'Passwords do not match' : error}
              isValid={confirmPasswordValid}
            />

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="w-0.5 h-4 bg-red-600 mt-0.5 flex-shrink-0"/>
                <span className="text-xs text-red-400 leading-tight">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!passwordValid || !confirmPasswordValid || isLoading}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Resetting
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="w-full text-sm text-gray-500 hover:text-gray-400 transition-colors duration-150"
            >
              Back to login
            </button>
          </form>

          <div className="pt-6 border-t border-gray-900 space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Password will be encrypted before storage</span>
            </div>
          </div>
        </div>
      </div>

      <AuthorityPanel position="right" />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-900 border-t-blue-600"/>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
