'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface ProofArtifactCardProps {
  id: string
  artifactType: string
  title: string
  description: string
  skills: string[]
  score?: number
  difficulty?: number
  capabilityLevel?: string
  timestamp: string
  isPublic?: boolean
  onViewDetails?: () => void
  onTogglePublic?: (isPublic: boolean) => void
}

const artifactTypeIcons: Record<string, string> = {
  execution_trace: '⚡',
  reasoning_log: '🧠',
  design_decision: '🏗️',
  solution_transcript: '📝',
  architecture_justification: '🔧',
  project_proof: '🚀',
}

const artifactTypeLabels: Record<string, string> = {
  execution_trace: 'Execution Trace',
  reasoning_log: 'Reasoning Log',
  design_decision: 'Design Decision',
  solution_transcript: 'Solution Transcript',
  architecture_justification: 'Architecture Justification',
  project_proof: 'Project Proof',
}

const getLevelColor = (level?: string) => {
  switch (level?.toLowerCase()) {
    case 'advanced':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    case 'intermediate':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    case 'foundation':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
  }
}

const getScoreColor = (score?: number) => {
  if (!score) return 'text-gray-400'
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-blue-400'
  return 'text-amber-400'
}

const getDifficultyColor = (difficulty?: number) => {
  if (!difficulty) return 'text-gray-400'
  if (difficulty >= 8) return 'text-red-400'
  if (difficulty >= 6) return 'text-amber-400'
  if (difficulty >= 4) return 'text-blue-400'
  return 'text-emerald-400'
}

export default function ProofArtifactCard({
  id,
  artifactType,
  title,
  description,
  skills,
  score,
  difficulty,
  capabilityLevel,
  timestamp,
  isPublic = false,
  onViewDetails,
  onTogglePublic,
}: ProofArtifactCardProps) {
  const formattedDate = new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-gray-900/50 border border-gray-800 rounded-lg p-5 hover:border-blue-600/30 transition-all duration-300 overflow-hidden"
    >
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-cyan-600/0 group-hover:from-blue-600/10 group-hover:to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="text-3xl">{artifactTypeIcons[artifactType]}</div>
          <div className="flex items-center gap-2">
            {isPublic && (
              <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30 rounded-full">
                Public ✓
              </span>
            )}
            <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2 mt-1">
            {description}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-800/50">
          {score !== undefined && (
            <div>
              <div className={`text-xs text-gray-500 uppercase tracking-wide`}>
                Score
              </div>
              <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
            </div>
          )}
          {difficulty !== undefined && (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Difficulty
              </div>
              <div className={`text-lg font-bold ${getDifficultyColor(difficulty)}`}>
                {difficulty}/10
              </div>
            </div>
          )}
          {capabilityLevel && (
            <div className="col-span-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Level
              </div>
              <span className={`inline-block px-2 py-1 text-xs font-medium border rounded-full ${getLevelColor(capabilityLevel)}`}>
                {capabilityLevel}
              </span>
            </div>
          )}
        </div>

        {/* Skills */}
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Skills Demonstrated
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 2).map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
            {skills.length > 2 && (
              <span className="px-2 py-1 text-xs bg-gray-500/10 text-gray-400 border border-gray-500/30 rounded-full">
                +{skills.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Type badge */}
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          {artifactTypeLabels[artifactType]}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-800/50">
          <button
            onClick={onViewDetails}
            className="flex-1 px-3 py-2 text-sm font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => onTogglePublic?.(!isPublic)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              isPublic
                ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30'
                : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border-gray-500/30'
            }`}
          >
            {isPublic ? '👁️ Public' : '🔒 Private'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
