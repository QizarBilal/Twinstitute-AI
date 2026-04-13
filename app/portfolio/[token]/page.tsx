'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import QRCode from 'qrcode'

interface ProofItem {
  id: string
  type: string
  title: string
  description: string
  skills: string[]
  capabilityLevel: string | null
  recruiterSummary: string | null
  createdAt: string
}

interface LabItem {
  title: string
  domain: string
  difficulty: number
  score: number
  completedAt: string
}

interface Portfolio {
  profile: {
    name: string
    email: string
    avatarUrl: string | null
    role: string | null
    domain: string | null
    stage: string
    joinedDate: string
    publishedDate: string
  }
  capability: {
    overallScore: number
    readinessScore: number
    metrics: {
      executionReliability: number
      learningSpeed: number
      problemSolvingDepth: number
      consistency: number
      designReasoning: number
      abstractionLevel: number
      innovationIndex: number
    }
  }
  proofs: {
    total: number
    items: ProofItem[]
  }
  labs: {
    total: number
    items: LabItem[]
  }
  credits: {
    total: number
  }
}

function getMetricColor(value: number): string {
  if (value >= 80) return 'emerald'
  if (value >= 60) return 'blue'
  if (value >= 40) return 'amber'
  return 'red'
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const color = getMetricColor(value)
  const colorClass = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  }[color]

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-300">{label}</span>
        <span className={`font-semibold ${color === 'emerald' ? 'text-emerald-400' : color === 'blue' ? 'text-blue-400' : color === 'amber' ? 'text-amber-400' : 'text-red-400'}`}>
          {Math.round(value)}/100
        </span>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full ${colorClass} rounded-full`}
        />
      </div>
    </div>
  )
}

export default function PublicPortfolioPage({
  params,
}: {
  params: { token: string }
}) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`/api/portfolio/public?token=${params.token}`)
        const data = await res.json()

        if (!res.ok || !data.success) {
          setError('Portfolio not found or not published')
          return
        }

        setPortfolio(data.data)

        // Generate QR code
        const url = `${window.location.origin}/portfolio/${params.token}`
        const qr = await QRCode.toDataURL(url)
        setQrCode(qr)
      } catch (err) {
        setError('Failed to load portfolio')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()
  }, [params.token])

  const copyLink = () => {
    const url = `${window.location.origin}/portfolio/${params.token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Portfolio Not Found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const p = portfolio

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-blue-900/20 to-black border-b border-gray-800/50 sticky top-0 z-10 backdrop-blur"
      >
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {p.profile.avatarUrl && (
                <img
                  src={p.profile.avatarUrl}
                  alt={p.profile.name}
                  className="w-12 h-12 rounded-full border 2px border-blue-500/50"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{p.profile.name}</h1>
                <p className="text-sm text-gray-400">
                  {p.profile.role || 'Developer'} • {p.profile.domain || 'Full Stack'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyLink}
                className="px-3 py-2 bg-gray-800 hover:border-blue-600/30 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors flex items-center gap-2"
              >
                {copied ? '✓ Copied' : '📋 Copy Link'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQR(!showQR)}
                className="px-3 py-2 bg-gray-800 hover:border-blue-600/30 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
              >
                {showQR ? '✕ Hide QR' : '📱 QR Code'}
              </motion.button>
            </div>
          </div>

          {/* QR Code Section */}
          <AnimatePresence>
            {showQR && qrCode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 flex items-center justify-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-lg"
              >
                <img src={qrCode} alt="QR Code" className="w-32 h-32 bg-white p-2 rounded-lg" />
                <div className="text-sm text-gray-400">
                  <p className="font-semibold text-white mb-2">Share this portfolio</p>
                  <p>Scan with phone camera or share the link with recruiters</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Verification Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-center"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-medium">
            <span>✅ Verified by Twinstitute AI</span>
            <span className="text-xs text-emerald-500/70">v{new Date(p.profile.publishedDate).getFullYear()}</span>
          </div>
        </motion.div>

        {/* Overall Capability Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-8"
        >
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">
              {Math.round(p.capability.overallScore)}/100
            </div>
            <p className="text-gray-400 mb-4">Overall Capability Score</p>
            <div className="text-sm text-gray-500">
              Stage: <span className="text-blue-400 font-semibold">{p.profile.stage}</span>
              {p.capability.readinessScore > 0 && (
                <>
                  {' '}
                  • Readiness: <span className="text-emerald-400 font-semibold">{Math.round(p.capability.readinessScore)}%</span>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Capability Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 grid grid-cols-3 gap-6"
        >
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
              Execution Metrics
            </h3>
            <div className="space-y-4">
              <MetricBar
                label="Reliability"
                value={p.capability.metrics.executionReliability}
              />
              <MetricBar label="Consistency" value={p.capability.metrics.consistency} />
              <MetricBar
                label="Problem Solving"
                value={p.capability.metrics.problemSolvingDepth}
              />
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
              Learning & Growth
            </h3>
            <div className="space-y-4">
              <MetricBar label="Learning Speed" value={p.capability.metrics.learningSpeed} />
              <MetricBar
                label="Innovation Index"
                value={p.capability.metrics.innovationIndex}
              />
              <div className="text-xs text-gray-500 mt-4">
                Joined {new Date(p.profile.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
              Design Thinking
            </h3>
            <div className="space-y-4">
              <MetricBar label="Design Reasoning" value={p.capability.metrics.designReasoning} />
              <MetricBar label="Abstraction Level" value={p.capability.metrics.abstractionLevel} />
            </div>
          </div>
        </motion.div>

        {/* Proof Artifacts */}
        {p.proofs.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold text-white">📜 Verified Proofs</h2>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold">
                {p.proofs.total}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {p.proofs.items.map((proof, i) => (
                <motion.div
                  key={proof.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="bg-gray-900/50 border border-gray-800 hover:border-blue-600/30 rounded-2xl p-6 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg">
                        ✅
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{proof.title}</h3>
                        {proof.capabilityLevel && (
                          <span className="text-xs text-emerald-400">{proof.capabilityLevel}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {proof.description}
                  </p>
                  {proof.recruiterSummary && (
                    <p className="text-xs text-gray-500 italic mb-4 p-3 bg-gray-800/50 rounded border border-gray-700">
                      {proof.recruiterSummary}
                    </p>
                  )}
                  {proof.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {proof.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                      {proof.skills.length > 4 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{proof.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Completed Labs */}
        {p.labs.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold text-white">🧪 Lab Achievements</h2>
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-semibold">
                {p.labs.total}
              </span>
            </div>
            <div className="space-y-3">
              {p.labs.items.slice(0, 6).map((lab, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 hover:border-blue-600/30 rounded-xl transition-colors"
                >
                  <div>
                    <h4 className="font-medium text-white">{lab.title}</h4>
                    <p className="text-xs text-gray-500">
                      {lab.domain} • Difficulty {lab.difficulty}/10
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">
                        {Math.round(lab.score)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(lab.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Credit Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12 p-6 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/20 rounded-2xl text-center"
        >
          <div className="text-4xl font-bold text-amber-400 mb-2">
            {p.credits.total}
          </div>
          <p className="text-gray-400">Capability Credits Earned</p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500"
        >
          <p>
            This portfolio was published on{' '}
            <span className="text-gray-400">
              {new Date(p.profile.publishedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </p>
          <p className="mt-2">
            Learn more at{' '}
            <a
              href="https://twinstitute.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Twinstitute AI
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
