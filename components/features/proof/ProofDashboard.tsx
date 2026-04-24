'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Artifact {
  id: string
  artifactType: string
  title: string
  description: string
  skills: string[]
  capabilityLevel: string
  isPublic: boolean
  createdAt: string
}

interface ScoreData {
  capabilityScore: number
  trustScore: number
  trustLevel: 'High' | 'Medium' | 'Low'
  trustDetails: {
    difficultyScore: number
    consistencyScore: number
    qualityScore: number
  }
  skillBreakdown: Record<string, {
    strength: number
    level: 'verified' | 'developing' | 'weak'
    proofCount: number
  }>
  summary: {
    totalProofs: number
    totalSubmissions: number
    verifiedSkillsCount: number
    developingSkillsCount: number
    weakSkillsCount: number
  }
}

export default function ProofDashboard() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [artifactsRes, scoreRes] = await Promise.all([
          fetch('/api/proof'),
          fetch('/api/proof/score'),
        ])

        if (artifactsRes.ok) {
          const data = await artifactsRes.json()
          // Extract from success response wrapper
          const artifactsList = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])
          setArtifacts(artifactsList)
        }

        if (scoreRes.ok) {
          const data = await scoreRes.json()
          // Extract from success response wrapper
          setScoreData(data.data || data)
        }
      } catch (error) {
        console.error('Failed to load proof data:', error)
        setArtifacts([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredArtifacts = Array.isArray(artifacts)
    ? artifacts.filter((artifact) => filter === 'all' || artifact.artifactType === filter)
    : []

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-8">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Analyzing your proof artifacts...</p>
        </div>
      </div>
    )
  }

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'from-emerald-500 to-teal-500'
      case 'Medium':
        return 'from-amber-500 to-orange-500'
      case 'Low':
        return 'from-red-500 to-pink-500'
      default:
        return 'from-blue-500 to-cyan-500'
    }
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'verified':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'developing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'weak':
        return 'bg-slate-700 text-slate-300 border-slate-600/50'
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600/50'
    }
  }

  return (
    <div className="px-8 py-8 space-y-8 min-h-screen bg-black">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Proof of Capability</h1>
            <p className="text-slate-400 max-w-2xl">
              Your verified execution artifacts and capability claims. Industry-ready proof documents demonstrating your skills, mastery, and growth trajectory.
            </p>
          </div>
          <div className="text-6xl opacity-20">🛡️</div>
        </div>
      </motion.div>

      {/* Score Cards */}
      {scoreData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Capability Score */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
            <p className="text-slate-400 text-sm uppercase tracking-wide mb-3">Execution Score</p>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
              {scoreData.capabilityScore}
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scoreData.capabilityScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              />
            </div>
            <p className="text-slate-500 text-xs mt-3">Based on {scoreData.summary.totalSubmissions} submissions</p>
          </div>

          {/* Trust Score */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
            <p className="text-slate-400 text-sm uppercase tracking-wide mb-3">Trust Level</p>
            <div className={`text-5xl font-bold mb-2 ${
              scoreData.trustLevel === 'High' ? 'text-emerald-400' :
              scoreData.trustLevel === 'Medium' ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {scoreData.trustScore}%
            </div>
            <p className={`text-sm font-semibold mt-2 ${
              scoreData.trustLevel === 'High' ? 'text-emerald-400' :
              scoreData.trustLevel === 'Medium' ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {scoreData.trustLevel} Confidence
            </p>
          </div>

          {/* Verified Skills Count */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
            <p className="text-slate-400 text-sm uppercase tracking-wide mb-3">Verified Skills</p>
            <div className="text-5xl font-bold text-emerald-400 mb-2">
              {scoreData.summary.verifiedSkillsCount}
            </div>
            <div className="space-y-1 text-xs text-slate-500">
              <p>Developing: {scoreData.summary.developingSkillsCount}</p>
              <p>Total Artifacts: {scoreData.summary.totalProofs}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Skill Breakdown */}
      {scoreData && Object.keys(scoreData.skillBreakdown).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Skill Verification Matrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(scoreData.skillBreakdown).slice(0, 9).map(([skill, data]) => (
              <motion.div
                key={skill}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-semibold text-slate-200 capitalize">{skill.replace('_', ' ')}</p>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getLevelBadgeColor(data.level)}`}>
                    {data.level === 'verified' ? '✓' : data.level === 'developing' ? '◐' : '○'} {data.level}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Strength</span>
                      <span>{data.strength}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.strength}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{data.proofCount} proof{data.proofCount !== 1 ? 's' : ''}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Proof Artifacts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Proof Artifacts</h2>
            <p className="text-slate-400 text-sm mt-1">{filteredArtifacts.length} artifacts available</p>
          </div>
          {filteredArtifacts.length > 0 && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-200 text-sm rounded-lg focus:outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="all">All Types</option>
              <option value="execution_trace">Execution Traces</option>
              <option value="reasoning_log">Reasoning Logs</option>
              <option value="design_decision">Design Decisions</option>
              <option value="solution_transcript">Solution Transcripts</option>
            </select>
          )}
        </div>

        {filteredArtifacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredArtifacts.map((artifact, idx) => (
                <motion.div
                  key={artifact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedArtifact(artifact)}
                  className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/50 rounded-xl p-6 backdrop-blur cursor-pointer hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">{artifact.title}</h3>
                      <p className="text-xs text-slate-500 capitalize mt-1">{artifact.artifactType.replace('_', ' ')}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      artifact.capabilityLevel === 'Advanced' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      artifact.capabilityLevel === 'Intermediate' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-slate-700 text-slate-300 border-slate-600/50'
                    }`}>
                      {artifact.capabilityLevel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{artifact.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {artifact.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-slate-800/50 text-slate-300 rounded border border-slate-700/50">
                        {skill}
                      </span>
                    ))}
                    {artifact.skills.length > 3 && (
                      <span className="text-xs px-2 py-1 text-slate-500">+{artifact.skills.length - 3}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-700/50">
                    <span>{new Date(artifact.createdAt).toLocaleDateString()}</span>
                    <span>{artifact.isPublic ? '🌐 Public' : '🔒 Private'}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-12 text-center backdrop-blur">
            <p className="text-slate-400 mb-4">No proof artifacts yet</p>
            <p className="text-slate-500 text-sm">Complete lab submissions to generate proof artifacts that showcase your capabilities.</p>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedArtifact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArtifact(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto backdrop-blur-xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedArtifact.title}</h2>
                  <p className="text-slate-400 capitalize">{selectedArtifact.artifactType.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={() => setSelectedArtifact(null)}
                  className="text-slate-400 hover:text-white transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              <p className="text-slate-300 mb-6">{selectedArtifact.description}</p>

              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtifact.skills.map((skill, i) => (
                      <span key={i} className="text-sm px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Level</p>
                    <p className="text-lg font-semibold text-white">{selectedArtifact.capabilityLevel}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Created</p>
                    <p className="text-lg font-semibold text-white">{new Date(selectedArtifact.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
