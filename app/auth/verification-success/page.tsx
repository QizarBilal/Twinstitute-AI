'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VerificationSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/auth/login')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

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
        @keyframes checkmark {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[480px] relative z-10"
      >
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-800 p-8 backdrop-blur-sm text-center">
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="flex items-center justify-center mb-6"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center relative">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="absolute">
                <motion.circle
                  cx="24"
                  cy="24"
                  r="22"
                  stroke="#10B981"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                />
                <motion.path
                  d="M14 24L20 30L34 16"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray="100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
                />
              </svg>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Email Verified Successfully
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              Your account has been verified. You can now sign in and access your workspace.
            </p>

            <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Redirecting to sign in...
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
