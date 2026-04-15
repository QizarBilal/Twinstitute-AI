'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { useSkillGenome } from '@/lib/hooks/useSkillGenome'
import { SkillDetailPanel } from '@/components/dashboard/skill-genome/SkillDetailPanel'
import { SkillNode } from '@/lib/ai/skill-genome-system'
import { Zap, RefreshCw, AlertCircle } from 'lucide-react'

// Dynamic import for React Flow (heavy library)
const SkillGraphVisualizer = dynamic(() =>
  import('@/components/dashboard/skill-genome/SkillGraphVisualizer').then((mod) => ({
    default: mod.SkillGraphVisualizer,
  })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gray-900/50 border border-gray-800 rounded-lg">
        <div className="text-center space-y-3">
          <Zap className="w-12 h-12 text-cyan-400 mx-auto animate-spin opacity-50" />
          <p className="text-gray-400">Loading skill network...</p>
        </div>
      </div>
    ),
  }
)

export default function SkillsPage() {
  const { data: session } = useSession()
  const { skillGenome, role, totalModules, loading, error, refetch } = useSkillGenome()
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null)

  // Calculate stats from skill genome
  const stats = useMemo(() => {
    if (!skillGenome) return null

    const coreSkills = skillGenome.nodes.filter((s) => s.category === 'core')
    const supportSkills = skillGenome.nodes.filter((s) => s.category === 'support')
    const advancedSkills = skillGenome.nodes.filter((s) => s.category === 'advanced')
    const optionalSkills = skillGenome.nodes.filter((s) => s.category === 'optional')

    const avgProgress =
      skillGenome.nodes.length > 0
        ? skillGenome.nodes.reduce((sum, s) => sum + s.progress, 0) / skillGenome.nodes.length
        : 0

    const coreProgress = coreSkills.length > 0
      ? coreSkills.reduce((sum, s) => sum + s.progress, 0) / coreSkills.length
      : 0

    return {
      totalSkills: skillGenome.nodes.length,
      coreSkills: coreSkills.length,
      supportSkills: supportSkills.length,
      advancedSkills: advancedSkills.length,
      optionalSkills: optionalSkills.length,
      averageProgress: Math.round(avgProgress),
      coreProgress: Math.round(coreProgress),
    }
  }, [skillGenome])

  // Get weak areas (skills with <30% progress)
  const weakAreas = useMemo(() => {
    if (!skillGenome) return []
    return skillGenome.nodes
      .filter((s) => s.progress < 30 && s.category === 'core')
      .sort((a, b) => a.progress - b.progress)
  }, [skillGenome])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Skill Genome</h1>
            {role && (
              <p className="text-gray-400 mt-1">Interactive skill network for {role}</p>
            )}
          </div>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh skill genome"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          <StatCard label="Total Skills" value={stats.totalSkills} color="cyan" />
          <StatCard label="Core" value={stats.coreSkills} color="cyan" />
          <StatCard label="Support" value={stats.supportSkills} color="blue" />
          <StatCard label="Advanced" value={stats.advancedSkills} color="purple" />
          <StatCard label="Optional" value={stats.optionalSkills} color="orange" />
          <StatCard label="Avg Progress" value={`${stats.averageProgress}%`} color="emerald" />
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-950/30 border border-red-900/50 rounded-lg p-6 flex items-center gap-4"
        >
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-medium mb-2">{error}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}

      {!error && skillGenome && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Graph - 2 cols */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Neural Network</h2>
              <p className="text-sm text-gray-400 mb-4">
                Your interconnected skills network. Click a node to explore details.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-96 bg-gray-900/50">
                  <div className="text-center space-y-3">
                    <Zap className="w-12 h-12 text-cyan-400 mx-auto animate-spin opacity-50" />
                    <p className="text-gray-400">Building skill network...</p>
                  </div>
                </div>
              ) : (
                <SkillGraphVisualizer
                  skillGraph={skillGenome}
                  onSkillSelect={(skill) => setSelectedSkill(skill)}
                />
              )}
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {/* Skill Details Panel */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Skill Details</h2>
              <SkillDetailPanel
                skill={selectedSkill}
                onClose={() => setSelectedSkill(null)}
              />
            </div>

            {/* Weak Areas */}
            {weakAreas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-orange-950/30 border border-orange-900/50 rounded-lg p-4 space-y-3"
              >
                <h3 className="font-semibold text-orange-400 text-sm uppercase tracking-wide">
                  Focus Areas
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {weakAreas.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className="w-full text-left p-2 rounded-lg bg-orange-900/20 hover:bg-orange-900/30 transition-colors"
                    >
                      <p className="text-sm font-medium text-orange-400">{skill.name}</p>
                      <div className="w-full bg-orange-900/30 rounded-full h-1 mt-1">
                        <div
                          className="bg-orange-600 h-1 rounded-full"
                          style={{ width: `${skill.progress}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {!error && loading && !skillGenome && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 h-96 bg-gray-900/50 border border-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-3">
              <Zap className="w-12 h-12 text-cyan-400 mx-auto animate-spin opacity-50" />
              <p className="text-gray-400">Analyzing your skills...</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-900/50 border border-gray-800 rounded-lg animate-pulse" />
            <div className="h-48 bg-gray-900/50 border border-gray-800 rounded-lg animate-pulse" />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Stat Card Component
interface StatCardProps {
  label: string
  value: string | number
  color: 'cyan' | 'blue' | 'purple' | 'orange' | 'emerald'
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorClasses = {
    cyan: 'bg-cyan-950/30 border-cyan-900/50 text-cyan-400',
    blue: 'bg-blue-950/30 border-blue-900/50 text-blue-400',
    purple: 'bg-purple-950/30 border-purple-900/50 text-purple-400',
    orange: 'bg-orange-950/30 border-orange-900/50 text-orange-400',
    emerald: 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400',
  }

  return (
    <div className={`rounded-lg border p-3 ${colorClasses[color]}`}>
      <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
