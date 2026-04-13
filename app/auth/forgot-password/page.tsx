'use client'

import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReCAPTCHA from 'react-google-recaptcha'
import FloatingInput from '@/components/shared/forms/FloatingInput'
import { validateEmail } from '@/lib/validation'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  
  const [email, setEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setError('')
    setEmailError('')
    
    if (!validateEmail(email)) {
      setEmailError('Invalid email address')
      return
    }
    
    if (!captchaToken) {
      setError('Please complete verification')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaToken }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link')
      }
      
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link')
      recaptchaRef.current?.reset()
      setCaptchaToken('')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-[#0a0e1a] dark:via-[#0f1419] dark:to-[#0a0e1a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 max-w-md text-center"
        >
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-500">
              <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
              <polyline points="3 7 12 13 21 7"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Check Your Email</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            We've sent password reset instructions to<br />
            <span className="font-medium text-gray-900 dark:text-white">{email}</span>
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Back to Sign In
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Didn't receive the email? Check your spam folder
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-[#0a0e1a] dark:via-[#0f1419] dark:to-[#0a0e1a] flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
        backgroundImage: `
          linear-gradient(rgba(100,100,100,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100,100,100,0.3) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        animation: 'gridMove 20s linear infinite'
      }} />

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(48px, 48px); }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[480px] relative z-10"
      >
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-800 p-8 backdrop-blur-sm">
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-500">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Forgot Password?
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your email and we'll send you reset instructions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FloatingInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError('')
              }}
              error={emailError}
              success={validateEmail(email) && !emailError}
            />
            
            <div className="flex justify-center py-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                onChange={(token) => setCaptchaToken(token || '')}
                onExpired={() => setCaptchaToken('')}
                theme="light"
                size="normal"
              />
            </div>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
            <button
              onClick={() => router.push('/auth')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
