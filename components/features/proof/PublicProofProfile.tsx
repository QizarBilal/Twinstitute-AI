'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import TrustScore from './TrustScore'
import SkillValidationTag from './SkillValidationTag'

interface PublicProofProfile {
  user: {
    id: string
    fullName: string
    domain: string
    level: string
    avatar?: string
    joinedAt: string
  }
  scores: {
    capability: number
    trust: number
    trustLevel: 'High' | 'Medium' | 'Low'
  }
  proofSummary: {
    totalProofs: number
    verifiedSkillsCount: number
    totalEvaluations: number
  }
  skills: {
    verified: Array<{
      name: string
      strength: number
      level: string
    }>
    count: number
  }
  artifacts: Array<{
    id: string
    type: string
    title: string
    description: string
    shortSummary: string
    skills: string[]
    capabilityLevel: string
    createdAt: string
  }>
}

interface PublicProofPageProps {
  userId: string
}

export default function PublicProofProfile({ userId }: PublicProofPageProps) {
  const [profile, setProfile] = useState<PublicProofProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/proof/public/${userId}`)
        if (!res.ok) throw new Error('Profile not found')
        const data = await res.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-400">{error || 'This profile is private or does not exist'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-600/20 to-blue-600/10 border border-cyan-500/30 rounded-lg p-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{profile.user.fullName}</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <span>🎯 {profile.user.domain}</span>
                <span>📊 {profile.user.level}</span>
              </div>
            </div>
            <div className="text-5xl">👤</div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Member since {new Date(profile.user.joinedAt).toLocaleDateString()}</span>
          </div>
        </motion.div>

        {/* Scores Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Capability Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-cyan-600/20 to-blue-600/10 border border-cyan-500/30 rounded-lg p-6"
          >
            <div className="text-sm text-gray-400 uppercase tracking-wider font-medium mb-3">
              Overall Capability
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <div className="text-4xl font-bold text-cyan-400">{profile.scores.capability}</div>
              <div className="text-gray-400">/100</div>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${profile.scores.capability}%` }}
              />
            </div>
          </motion.div>

          {/* Trust Score */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <TrustScore score={profile.scores.trust} level={profile.scores.trustLevel} size="md" showDetails={false} />
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Proof Artifacts', value: profile.proofSummary.totalProofs, icon: '📜' },
            { label: 'Verified Skills', value: profile.proofSummary.verifiedSkillsCount, icon: '✅' },
            { label: 'Evaluations', value: profile.proofSummary.totalEvaluations, icon: '🎯' },
          ].map(({ label, value, icon }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center hover:border-gray-700 transition-colors"
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Verified Skills */}
        {profile.skills.verified.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 border border-gray-800 rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Verified Skills</h2>
            <div className="flex flex-wrap gap-3">
              {profile.skills.verified.map((skill) => (
                <SkillValidationTag
                  key={skill.name}
                  skill={skill.name}
                  level="verified"
                  strength={skill.strength / 100}
                  size="md"
                />
              ))}
            </div>
            {profile.skills.count > profile.skills.verified.length && (
              <p className="text-sm text-gray-400 mt-3 italic">
                + {profile.skills.count - profile.skills.verified.length} more skills in development
              </p>
            )}
          </motion.div>
        )}

        {/* Featured Artifacts */}
        {profile.artifacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-white">Featured Proof Artifacts</h2>
            <div className="grid gap-4">
              {profile.artifacts.slice(0, 4).map((artifact) => (
                <motion.div
                  key={artifact.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{artifact.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{artifact.description}</p>
                    </div>
                    {artifact.capabilityLevel && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          artifact.capabilityLevel === 'Advanced'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : artifact.capabilityLevel === 'Intermediate'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {artifact.capabilityLevel}
                      </span>
                    )}
                  </div>

                  {artifact.shortSummary && <p className="text-sm text-gray-300 mb-3">{artifact.shortSummary}</p>}

                  <div className="flex flex-wrap gap-1.5">
                    {artifact.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                        {skill}
                      </span>
                    ))}
                    {artifact.skills.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded">
                        +{artifact.skills.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-3">
                    {new Date(artifact.createdAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center py-6 border-t border-gray-800 text-sm text-gray-500">
          <p>🛡️ Verified proof of execution ability • Built on Twinstitute AI Platform</p>
        </div>
      </div>
    </div>
  )
}
