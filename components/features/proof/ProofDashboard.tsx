'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProofArtifactCard from './ProofArtifactCard'
import CapabilityScore from './CapabilityScore'
import TrustScore from './TrustScore'
import ProofDetails from './ProofDetails'
import SkillValidationTag from './SkillValidationTag'

interface Artifact {
  id: string
  artifactType: string
  title: string
  description: string
  skills: string[]
  capabilityLevel: string
  isPublic: boolean
  createdAt: string
  labSubmissionId?: string
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
  skillGenome: {
    coreStrength: number
    breadthScore: number
    depthScore: number
  }
}

interface SubmissionData {
  time_spent_min?: number
  difficulty?: number
  score?: number
}

export default function ProofDashboard() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'details'>('grid')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [artifactsRes, scoreRes] = await Promise.all([
          fetch('/api/proof'),
          fetch('/api/proof/score'),
        ])

        if (artifactsRes.ok) {
          const data = await artifactsRes.json()
          setArtifacts(data || [])
        }

        if (scoreRes.ok) {
          const data = await scoreRes.json()
          setScoreData(data)
        }
      } catch (error) {
        console.error('Failed to load proof data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredArtifacts = artifacts.filter(
    (artifact) => filter === 'all' || artifact.artifactType === filter
  )

  const getSubmissionMetrics = (artifact: Artifact): SubmissionData => {
    // These would come from the related submission data
    return {
      time_spent_min: 45,
      difficulty: 7,
      score: 85,
    }
  }

  const togglePublic = async (artifactId: string, currentIsPublic: boolean) => {
    try {
      const res = await fetch(`/api/proof/${artifactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !currentIsPublic }),
      })

      if (res.ok) {
        setArtifacts((prev) =>
          prev.map((a) =>
            a.id === artifactId ? { ...a, isPublic: !currentIsPublic } : a
          )
        )

        if (selectedArtifact?.id === artifactId) {
          setSelectedArtifact({ ...selectedArtifact, isPublic: !currentIsPublic })
        }
      }
    } catch (error) {
      console.error('Failed to update artifact:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Analyzing your proof artifacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">Capability Proof Engine</h1>
            <div className="text-cyan-400 text-3xl">🛡️</div>
          </div>
          <p className="text-gray-400">
            Recruiter-ready proof of your execution ability. Built from your lab submissions, evaluations, and performance metrics.
          </p>
        </motion.div>

        {/* Score Overview */}
        {scoreData && (
          <div className="grid grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <CapabilityScore
                overallScore={scoreData.capabilityScore}
                skillBreakdown={scoreData.skillBreakdown}
                summary={scoreData.summary}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TrustScore
                score={scoreData.trustScore}
                level={scoreData.trustLevel}
                details={scoreData.trustDetails}
                size="lg"
                showDetails={true}
              />
            </motion.div>
          </div>
        )}

        {/* Verified Skills */}
        {scoreData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 border border-gray-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Verified Skills</h2>
              <span className="text-sm text-gray-400">
                {scoreData.summary.verifiedSkillsCount} verified
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {Object.entries(scoreData.skillBreakdown)
                .filter(([, data]) => data.level === 'verified')
                .slice(0, 8)
                .map(([skill, data]) => (
                  <SkillValidationTag
                    key={skill}
                    skill={skill}
                    level="verified"
                    strength={data.strength}
                    proofCount={data.proofCount}
                    size="md"
                  />
                ))}
            </div>

            {Object.values(scoreData.skillBreakdown).filter((d) => d.level === 'verified').length === 0 && (
              <p className="text-gray-400 text-sm">
                Complete more lab tasks to verify your skills and build proof documents.
              </p>
            )}
          </motion.div>
        )}

        {/* Proof Artifacts */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Proof Artifacts</h2>
              <p className="text-sm text-gray-400 mt-1">
                {filteredArtifacts.length} artifact{filteredArtifacts.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:border-cyan-500 focus:outline-none hover:border-gray-600 transition-colors"
            >
              <option value="all">All Types</option>
              <option value="execution_trace">Execution Traces</option>
              <option value="reasoning_log">Reasoning Logs</option>
              <option value="design_decision">Design Decisions</option>
              <option value="solution_transcript">Solution Transcripts</option>
              <option value="architecture_justification">Architecture Justifications</option>
              <option value="project_proof">Project Proofs</option>
            </select>
          </div>

          {filteredArtifacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredArtifacts.map((artifact) => {
                  const metrics = getSubmissionMetrics(artifact)
                  return (
                    <ProofArtifactCard
                      key={artifact.id}
                      id={artifact.id}
                      artifactType={artifact.artifactType}
                      title={artifact.title}
                      description={artifact.description}
                      skills={artifact.skills}
                      score={metrics.score}
                      difficulty={metrics.difficulty}
                      capabilityLevel={artifact.capabilityLevel}
                      timestamp={artifact.createdAt}
                      isPublic={artifact.isPublic}
                      onViewDetails={() => {
                        setSelectedArtifact(artifact)
                        setViewMode('details')
                      }}
                      onTogglePublic={() => togglePublic(artifact.id, artifact.isPublic)}
                    />
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-900/30 border border-gray-800 rounded-lg">
              <div className="text-4xl mb-3">📜</div>
              <h3 className="text-lg font-semibold text-white mb-2">No Proof Artifacts Yet</h3>
              <p className="text-gray-400 text-sm">
                Complete lab tasks to generate recruiter-ready proof of your capabilities.
              </p>
            </div>
          )}
        </motion.div>

        {/* Skill Development Path */}
        {scoreData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 border border-gray-800 rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Skill Development Path</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="text-3xl font-bold text-emerald-400">
                  {scoreData.summary.verifiedSkillsCount}
                </div>
                <div className="text-sm text-gray-400 mt-1">✅ Verified Skills</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">
                  {scoreData.summary.developingSkillsCount}
                </div>
                <div className="text-sm text-gray-400 mt-1">⚠️ Developing</div>
              </div>
              <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="text-3xl font-bold text-red-400">
                  {scoreData.summary.weakSkillsCount}
                </div>
                <div className="text-sm text-gray-400 mt-1">❌ Weak Areas</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedArtifact && viewMode === 'details' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4 overflow-y-auto"
            onClick={() => setViewMode('grid')}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl mx-auto"
            >
              <ProofDetails artifactId={selectedArtifact.id} />
              <div className="text-center mt-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
