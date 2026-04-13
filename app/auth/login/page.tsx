'use client'

import { useState, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReCAPTCHA from 'react-google-recaptcha'
import SecureInput from '@/components/auth/SecureInput'
import { validateEmail } from '@/lib/validation'

export default function LoginPage() {
  const router = useRouter()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResetPanel, setShowResetPanel] = useState(false)
  
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')

  const emailValid = validateEmail(email)
  const formValid = emailValid && password.length > 0 && captchaToken

  const handleEmailChange = (value: string) => {
    const cleaned = value.replace(/^\s+/, '')
    if (cleaned.length <= 100) {
      setEmail(cleaned)
      if (emailError) setEmailError('')
      if (generalError) setGeneralError('')
    }
  }

  const handlePasswordChange = (value: string) => {
    if (value.length <= 128) {
      setPassword(value)
      if (passwordError) setPasswordError('')
      if (generalError) setGeneralError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formValid) return
    
    setEmailError('')
    setPasswordError('')
    setGeneralError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        rememberMe: rememberMe ? 'true' : 'false',
        redirect: false
      })

      if (!result?.ok) {
        setGeneralError('Authentication failed. Please verify your credentials.')
        recaptchaRef.current?.reset()
        setCaptchaToken('')
      } else {
        // Store Remember Me preference in localStorage
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        } else {
          localStorage.removeItem('rememberMe')
        }
        
        // Redirect based on orientation completion status
        // Fetch the session to check if orientation is completed
        try {
          const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
          
          if (response.ok) {
            const data = await response.json()
            // If user has selected role, go to dashboard; otherwise go to dashboard for initial setup
            if (data.selectedRole) {
              router.push('/dashboard')
            } else {
              router.push('/dashboard')
            }
          } else {
            // Default to dashboard
            router.push('/dashboard')
          }
        } catch (err) {
          console.error('Error checking user status:', err)
          // Default to dashboard
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setGeneralError('Authentication service unavailable. Please try again.')
      recaptchaRef.current?.reset()
      setCaptchaToken('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-2">
      <div className="flex items-center justify-center bg-black p-12">
        <div className="absolute top-6 left-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-5">
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">
              Institutional Authentication
            </h1>
            <p className="text-sm text-gray-500">
              Access Digital Capability Institution enrollment and training systems
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <SecureInput
              label="Email Address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              error={emailError}
              isValid={emailValid && email.length > 0 && !emailError}
              maxLength={100}
              autoComplete="email"
              required
            />

            <SecureInput
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              error={passwordError}
              maxLength={128}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 bg-gray-900 border border-gray-800 checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600/30"
                />
                <span className="text-xs text-gray-500">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowResetPanel(true)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <div className="flex justify-center pt-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                onChange={(token) => setCaptchaToken(token || '')}
                onExpired={() => setCaptchaToken('')}
                theme="dark"
              />
            </div>

            {generalError && (
              <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/50">
                <div className="w-0.5 h-4 bg-red-600 mt-0.5 flex-shrink-0"/>
                <span className="text-xs text-red-400 leading-tight">{generalError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!formValid || isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Authenticating
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-900">
            <p className="text-xs text-gray-600 text-center">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-semibold">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="relative bg-gray-950 overflow-hidden flex items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-950"/>
        
        <div className="relative w-full max-w-lg space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-600"/>
              <h2 className="text-xl font-bold text-white">Capability Data Protection</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Military-grade infrastructure securing institutional performance records and capability models
            </p>
          </div>

          <div className="bg-black/40 border border-gray-900 p-6 space-y-4 font-mono text-[11px]">
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-green-600/20 border border-green-600/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500"/>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400">Transport Layer Security</div>
                <div className="text-gray-600 text-[10px]">TLS 1.3 with perfect forward secrecy · ChaCha20-Poly1305 cipher suite</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-green-600/20 border border-green-600/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500"/>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400">Zero-Knowledge Architecture</div>
                <div className="text-gray-600 text-[10px]">AES-256-GCM encryption · Client-side key derivation · Argon2id hashing</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-green-600/20 border border-green-600/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500"/>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400">Multi-Region Redundancy</div>
                <div className="text-gray-600 text-[10px]">Active-active deployment · Sub-50ms failover · 99.99% SLA guarantee</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-green-600/20 border border-green-600/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500"/>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400">Behavioral Analytics</div>
                <div className="text-gray-600 text-[10px]">Real-time anomaly detection · Device fingerprinting · Geo-velocity tracking</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/30 border border-gray-900 p-4 space-y-2">
              <div className="text-2xl font-bold text-white">SOC 2</div>
              <div className="text-[9px] uppercase tracking-wider text-gray-600">Type II Certified</div>
            </div>
            <div className="bg-black/30 border border-gray-900 p-4 space-y-2">
              <div className="text-2xl font-bold text-white">ISO 27001</div>
              <div className="text-[9px] uppercase tracking-wider text-gray-600">ISMS Compliant</div>
            </div>
            <div className="bg-black/30 border border-gray-900 p-4 space-y-2">
              <div className="text-2xl font-bold text-white">GDPR</div>
              <div className="text-[9px] uppercase tracking-wider text-gray-600">EU Certified</div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-900 space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">Trusted by Enterprise Leaders</div>
            <div className="flex items-center gap-6 opacity-40">
              <div className="text-gray-700 font-bold text-xs">FORTUNE 500</div>
              <div className="w-px h-4 bg-gray-800"/>
              <div className="text-gray-700 font-bold text-xs">NASDAQ 100</div>
              <div className="w-px h-4 bg-gray-800"/>
              <div className="text-gray-700 font-bold text-xs">S&P 500</div>
            </div>
          </div>
        </div>
      </div>

      {showResetPanel && (
        <ResetPasswordPanel onClose={() => setShowResetPanel(false)} />
      )}
    </div>
  )
}

function ResetPasswordPanel({ onClose }: { onClose: () => void }) {
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [email, setEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const emailValid = validateEmail(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailValid || !captchaToken) return
    
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), captchaToken })
      })

      if (!response.ok) throw new Error('Request failed')
      
      setSuccess(true)
    } catch (err) {
      setError('Unable to process request')
      recaptchaRef.current?.reset()
      setCaptchaToken('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={onClose}>
        <div 
          className="w-full max-w-md bg-black border border-gray-900 z-50 animate-in fade-in zoom-in-95 duration-200" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-900">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Reset Password
            </h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="p-6">
            {success ? (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-950/30 border border-green-900/50 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">
                    Reset Link Sent
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Password reset instructions have been sent to <span className="text-gray-400 font-medium">{email}</span>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-850 border border-gray-800 text-sm font-semibold text-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Enter your account email address to receive password reset instructions
                </p>

                <SecureInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(value) => {
                    setEmail(value.replace(/^\s+/, ''))
                    if (error) setError('')
                  }}
                  error={error}
                  isValid={emailValid && email.length > 0}
                  maxLength={100}
                />

                <div className="flex justify-center pt-2">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                    onChange={(token) => setCaptchaToken(token || '')}
                    onExpired={() => setCaptchaToken('')}
                    theme="dark"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!emailValid || !captchaToken || isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
