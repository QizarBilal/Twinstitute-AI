'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Send, Loader, CheckCircle2, AlertCircle } from 'lucide-react'

interface SubmissionPanelProps {
  taskId?: string
  onSubmit?: (data: { code?: string; answer?: string; approach?: string }) => Promise<any>
  loading?: boolean
  code?: string
}

export function SubmissionPanel({ taskId, onSubmit, loading = false, code = '' }: SubmissionPanelProps) {
  const [approach, setApproach] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleSubmit = async () => {
    if (!code && !approach) {
      setStatusMessage('Please provide either code or approach')
      setSubmissionStatus('error')
      return
    }

    try {
      setSubmissionStatus('idle')
      const result = await onSubmit?.({
        code: code || undefined,
        approach: approach || undefined,
      })

      if (result?.submission?.isCorrect) {
        setSubmissionStatus('success')
        setStatusMessage('✨ Solution accepted! Great work!')
        setSubmitted(true)
      } else {
        setSubmissionStatus('error')
        setStatusMessage(`Score: ${result?.submission?.score || 0}/100. Keep trying!`)
      }
    } catch (error) {
      setSubmissionStatus('error')
      setStatusMessage('Submission failed. Please try again.')
    }
  }

  if (submitted && submissionStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-6 flex flex-col items-center justify-center text-center"
      >
        <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
        <h3 className="text-xl font-bold text-emerald-300 mb-2">Task Completed!</h3>
        <p className="text-sm text-emerald-200/80 mb-6">
          Excellent work! Your solution has been accepted and credits have been awarded.
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            setSubmissionStatus('idle')
            setApproach('')
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
        >
          Continue to Next Task
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full bg-gray-900/50 border border-gray-800 rounded-lg p-6 flex flex-col"
    >
      <h3 className="text-lg font-bold text-white mb-4">Submit Your Solution</h3>

      {/* APPROACH TEXT */}
      <div className="flex-1 flex flex-col gap-4 mb-6">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Your Approach (Optional)
          </label>
          <textarea
            value={approach}
            onChange={(e) => setApproach(e.target.value)}
            placeholder="Describe your approach, algorithm, or key insights..."
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-600 focus:outline-none resize-none h-32"
          />
          <p className="text-xs text-gray-500 mt-1">Explain your logic for better feedback from mentors</p>
        </div>

        {/* SUBMISSION NOTES */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
          <p className="text-xs text-blue-300 flex items-start gap-2">
            <span className="font-bold">💡</span>
            <span>Your code will be evaluated for correctness, efficiency, and code quality</span>
          </p>
        </div>
      </div>

      {/* STATUS MESSAGE */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 px-4 py-3 rounded-lg flex items-start gap-3 ${
            submissionStatus === 'success'
              ? 'bg-emerald-900/30 border border-emerald-700/50'
              : 'bg-red-900/30 border border-red-700/50'
          }`}
        >
          {submissionStatus === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${submissionStatus === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
            {statusMessage}
          </p>
        </motion.div>
      )}

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleSubmit}
        disabled={loading || !code}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Solution
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        You can submit multiple times to improve your score
      </p>
    </motion.div>
  )
}
