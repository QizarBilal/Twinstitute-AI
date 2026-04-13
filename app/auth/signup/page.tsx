'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReCAPTCHA from 'react-google-recaptcha'
import SecureInput from '@/components/auth/SecureInput'
import PasswordValidator from '@/components/auth/PasswordValidator'
import PasswordStrength from '@/components/auth/PasswordStrength'
import { validateEmail } from '@/lib/validation'

export default function SignupPage() {
  const router = useRouter()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountType, setAccountType] = useState<'learner' | 'academic_institution'>('learner')
  const [organizationName, setOrganizationName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [organizationError, setOrganizationError] = useState('')
  const [generalError, setGeneralError] = useState('')

  const nameValid = name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim())
  const emailValid = validateEmail(email)
  const passwordValid = password.length >= 8 && 
    /[A-Z]/.test(password) && 
    /[a-z]/.test(password) && 
    /[0-9]/.test(password) && 
    /[^A-Za-z0-9]/.test(password)
  const confirmPasswordValid = Boolean(password && confirmPassword && password === confirmPassword)
  const organizationValid = accountType === 'learner' || organizationName.trim().length >= 2
  const formValid = nameValid && emailValid && passwordValid && confirmPasswordValid && organizationValid && acceptTerms && captchaToken

  const handleNameChange = (value: string) => {
    const cleaned = value.replace(/^\s+/, '').replace(/[^a-zA-Z\s]/g, '')
    if (cleaned.length <= 50) {
      setName(cleaned)
      if (nameError) setNameError('')
      if (generalError) setGeneralError('')
    }
  }

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

  const handleConfirmPasswordChange = (value: string) => {
    if (value.length <= 128) {
      setConfirmPassword(value)
      if (confirmPasswordError) setConfirmPasswordError('')
      if (generalError) setGeneralError('')
    }
  }

  const handleOrganizationChange = (value: string) => {
    const cleaned = value.replace(/^\s+/, '')
    if (cleaned.length <= 100) {
      setOrganizationName(cleaned)
      if (organizationError) setOrganizationError('')
      if (generalError) setGeneralError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameError('')
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')
    setOrganizationError('')
    setGeneralError('')

    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters')
      return
    }

    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      setNameError('Name must contain only letters')
      return
    }

    if (!emailValid) {
      setEmailError('Invalid email address')
      return
    }

    if (!passwordValid) {
      setPasswordError('Password does not meet requirements')
      return
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return
    }

    if (accountType === 'academic_institution' && organizationName.trim().length < 2) {
      setOrganizationError('Organization name is required')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          accountType,
          organizationName: accountType === 'academic_institution' ? organizationName.trim() : null,
          captchaToken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setEmailError('Enrollment already exists')
        } else {
          throw new Error(data.message || 'Registration failed')
        }
        recaptchaRef.current?.reset()
        setCaptchaToken('')
        setIsLoading(false)
        return
      }

      router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim())}`)
    } catch (err: any) {
      setGeneralError(err.message || 'Registration failed')
      recaptchaRef.current?.reset()
      setCaptchaToken('')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-2">
      <div className="relative bg-gray-950 overflow-hidden flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-gray-900"/>
        
        <div className="relative w-full max-w-lg space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600"/>
              <h2 className="text-2xl font-bold text-white">Digital Capability Institution</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              AI-powered capability formation system designed for institutional performance engineering
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-950/30 to-transparent border-l-2 border-blue-600 p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-400">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                <div className="text-sm font-semibold text-blue-400">Multi-Agent Formation Engine</div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Probabilistic capability formation trajectory modeling across 50,000+ validated skill genome paths
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-950/30 to-transparent border-l-2 border-purple-600 p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-purple-400">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                <div className="text-sm font-semibold text-purple-400">Real-Time Capability Intelligence</div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Live skill demand analysis processing 12M+ institutional formation records with genome extraction
              </p>
            </div>

            <div className="bg-gradient-to-r from-cyan-950/30 to-transparent border-l-2 border-cyan-600 p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cyan-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <div className="text-sm font-semibold text-cyan-400">Institutional SSO Federation</div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                SAML 2.0 and OpenID Connect support with automatic learner provisioning and enrollment management
              </p>
            </div>
          </div>

          <div className="bg-black/40 border border-gray-900 p-3 space-y-2.5">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Institutional Capabilities</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-600"/>
                <span className="text-gray-400">Formation trajectory synthesis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-purple-600"/>
                <span className="text-gray-400">Skill genome gap analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-600"/>
                <span className="text-gray-400">Capability proof strength</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-purple-600"/>
                <span className="text-gray-400">Digital capability twin</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-600"/>
                <span className="text-gray-400">Formation cycle tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-purple-600"/>
                <span className="text-gray-400">Strategic formation planner</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-900">
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>End-to-end encrypted · Zero-knowledge architecture · SOC 2 Type II certified</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-black p-8">
        <div className="relative w-full max-w-md space-y-4">
          <div className="absolute top-0 left-0">
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

          <div className="space-y-1 pt-10">
            <h1 className="text-lg font-bold text-white">
              Begin Enrollment
            </h1>
            <p className="text-xs text-gray-500">
              Enroll in digital capability institution and formation systems
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">
                Enrollment Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('learner')}
                  className={`py-2.5 px-3 text-xs font-semibold transition-all border ${
                    accountType === 'learner'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  Learner
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('academic_institution')}
                  className={`py-2.5 px-3 text-xs font-semibold transition-all border ${
                    accountType === 'academic_institution'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  Training Institution
                </button>
              </div>
            </div>

            {accountType === 'academic_institution' && (
              <SecureInput
                label="Institution Name"
                type="text"
                value={organizationName}
                onChange={handleOrganizationChange}
                error={organizationError}
                isValid={organizationName.trim().length >= 2 && !organizationError}
                maxLength={100}
                autoComplete="organization"
                required
              />
            )}

            <SecureInput
              label="Full Name"
              type="text"
              value={name}
              onChange={handleNameChange}
              error={nameError}
              isValid={nameValid && name.length > 0 && !nameError}
              maxLength={50}
              autoComplete="name"
              required
            />

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

            <div>
              <SecureInput
                label="Password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                error={passwordError}
                maxLength={128}
                autoComplete="new-password"
                required
              />
              {password && (
                <div className="mt-2 space-y-2">
                  <PasswordStrength password={password} />
                  <PasswordValidator password={password} />
                </div>
              )}
            </div>

            <SecureInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={confirmPasswordError}
              isValid={confirmPasswordValid && confirmPassword.length > 0}
              maxLength={128}
              autoComplete="new-password"
              required
            />

            <label className="flex items-start gap-2 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-3.5 h-3.5 mt-0.5 bg-gray-900 border border-gray-800 checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600/30 flex-shrink-0"
                required
              />
              <span className="text-xs text-gray-500 leading-snug">
                I accept the{' '}
                <Link href="/terms" className="text-blue-400 hover:text-blue-300 font-semibold">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 font-semibold">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <div className="flex justify-center pt-1">
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
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Processing Enrollment
                </span>
              ) : (
                'Complete Enrollment'
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-gray-900">
            <p className="text-xs text-gray-600 text-center">
              Already enrolled?{' '}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Access institution
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
