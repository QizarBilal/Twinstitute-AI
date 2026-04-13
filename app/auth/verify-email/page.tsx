'use client'

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function OTPVerificationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(300)
  const [resendCooldown, setResendCooldown] = useState(0)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timeLeft <= 0) {
      setError('Verification code expired')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      handleVerify()
    }
  }, [otp])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed')
      }

      router.push('/auth/login')
    } catch (err: any) {
      setError(err.message || 'Verification failed')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) throw new Error()

      setTimeLeft(300)
      setResendCooldown(60)
      setError('')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError('Failed to resend code')
    }
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (error) setError('')
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else {
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    
    if (!/^\d{6}$/.test(pastedData)) return

    const newOtp = pastedData.split('')
    setOtp(newOtp)
    inputRefs.current[5]?.focus()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const maskedEmail = email ? email.replace(/(.{3})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length)) : ''

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-blue-600 mx-auto flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          
          <h1 className="text-xl font-bold text-white">
            Email Verification
          </h1>
          <p className="text-sm text-gray-500">
            Enter 6-digit code sent to<br/>
            <span className="text-gray-400 font-medium">{maskedEmail}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Verification Code
            </label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`
                    w-12 h-14 text-center text-xl font-bold bg-gray-900 border
                    transition-all duration-150 focus:outline-none focus:ring-1
                    ${error 
                      ? 'border-red-600/60 text-red-400 focus:border-red-600 focus:ring-red-600/30' 
                      : digit
                        ? 'border-blue-600/60 text-white focus:border-blue-600 focus:ring-blue-600/30'
                        : 'border-gray-800 text-white hover:border-gray-700 focus:border-blue-600 focus:ring-blue-600/30'
                    }
                  `}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="w-0.5 h-4 bg-red-600 mt-0.5 flex-shrink-0"/>
              <span className="text-xs text-red-400 leading-tight">{error}</span>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Verifying
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className={timeLeft < 60 ? 'text-red-400 font-semibold' : 'text-gray-600'}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-blue-400"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-900 space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-gray-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Code expires after 5 minutes</span>
          </div>
          <p className="text-xs text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-blue-400 hover:text-blue-300 font-semibold disabled:opacity-40"
            >
              Resend
            </button>
            {' '}or check spam folder
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-900 border-t-blue-600"/>
      </div>
    }>
      <OTPVerificationContent />
    </Suspense>
  )
}
