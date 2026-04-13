'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ProofDetailsPageProps {
  artifactId: string
}

interface ProofData {
  id: string
  title: string
  description: string
  artifactType: string
  content: string
  skills: string[]
  capabilityLevel: string
  recruiterSummary: string
  submission?: {
    id: string
    timeSpentMin: number
    attemptNumber: number
    submittedCode?: string
    approach?: string
    status: string
    evaluation?: {
      correctnessScore: number
      codeQualityScore: number
      efficiencyScore: number
      creativityScore: number
      clarityScore: number
      overallScore: number
      technicalMentorFeedback?: string
      strategyMentorFeedback?: string
      strengthsIdentified?: string
      gapsIdentified?: string
      nextStepsRecommended?: string
    }
    task?: {
      title: string
      description: string
      taskType: string
      domain: string
      difficulty: number
    }
  }
}

export default function ProofDetailsPage({ artifactId }: ProofDetailsPageProps) {
  const [proof, setProof] = useState<ProofData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProof = async () => {
      try {
        const res = await fetch(`/api/proof/${artifactId}`)
        if (!res.ok) throw new Error('Failed to load proof')
        const data = await res.json()
        setProof(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading proof')
      } finally {
        setLoading(false)
      }
    }

    fetchProof()
  }, [artifactId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading proof details...</p>
        </div>
      </div>
    )
  }

  if (error || !proof) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-gray-400">Failed to load proof: {error}</p>
        </div>
      </div>
    )
  }

  const eval_ = proof.submission?.evaluation

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/proof"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors"
          >
            ← Back to Artifacts
          </Link>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold text-white">{proof.title}</h1>
            <p className="text-gray-400">{proof.description}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Capability Level */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/30 rounded-lg p-4"
          >
            <div className="text-sm text-gray-400 mb-1">Capability Level</div>
            <div className="text-2xl font-bold text-emerald-400">{proof.capabilityLevel || 'N/A'}</div>
          </motion.div>

          {/* Time Spent */}
          {proof.submission && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/30 rounded-lg p-4"
            >
              <div className="text-sm text-gray-400 mb-1">Time Spent</div>
              <div className="text-2xl font-bold text-blue-400">{proof.submission.timeSpentMin}m</div>
            </motion.div>
          )}

          {/* Attempts */}
          {proof.submission && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/30 rounded-lg p-4"
            >
              <div className="text-sm text-gray-400 mb-1">Attempt #</div>
              <div className="text-2xl font-bold text-purple-400">{proof.submission.attemptNumber}</div>
            </motion.div>
          )}
        </div>

        {/* Evaluation Scores */}
        {eval_ && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-white mb-6">Evaluation Scores</h2>

            {/* Overall Score */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <div className="text-4xl font-bold text-cyan-400">{eval_.overallScore}</div>
                <div className="text-gray-400">/100</div>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${eval_.overallScore}%` }}
                />
              </div>
            </div>

            {/* Detailed metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { name: 'Correctness', score: eval_.correctnessScore, color: 'text-emerald-400' },
                { name: 'Code Quality', score: eval_.codeQualityScore, color: 'text-blue-400' },
                { name: 'Efficiency', score: eval_.efficiencyScore, color: 'text-purple-400' },
                { name: 'Creativity', score: eval_.creativityScore, color: 'text-pink-400' },
                { name: 'Clarity', score: eval_.clarityScore, color: 'text-cyan-400' },
              ].map(({ name, score, color }) => (
                <div key={name} className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className={`text-2xl font-bold ${color}`}>{score}%</div>
                  <div className="text-xs text-gray-400 mt-1">{name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skills Demonstrated */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Skills Demonstrated</h2>
          <div className="flex flex-wrap gap-2">
            {proof.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full text-sm font-medium"
              >
                ✓ {skill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Recruiter Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-3">Recruiter Summary</h2>
          <p className="text-gray-300 leading-relaxed">{proof.recruiterSummary}</p>
        </motion.div>

        {/* AI Feedback */}
        {eval_ && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 mb-8"
          >
            {eval_.technicalMentorFeedback && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Technical Feedback</h3>
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {eval_.technicalMentorFeedback}
                </div>
              </div>
            )}

            {eval_.strategyMentorFeedback && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Strategy Feedback</h3>
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {eval_.strategyMentorFeedback}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Strengths & Gaps */}
        {eval_ && (
          <div className="grid grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/30 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-emerald-400 mb-3">Strengths</h3>
              <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                {eval_.strengthsIdentified || 'Not specified'}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-amber-500/30 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-amber-400 mb-3">Areas for Improvement</h3>
              <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                {eval_.gapsIdentified || 'Not specified'}
              </div>
            </motion.div>
          </div>
        )}

        {/* Full Proof Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900/50 border border-gray-800 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Full Proof Report</h2>
          <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
            {proof.content}
          </pre>
        </motion.div>
      </div>
    </div>
  )
}
