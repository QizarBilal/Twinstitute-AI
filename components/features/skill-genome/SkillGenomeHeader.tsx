'use client'

import { motion } from 'framer-motion'
import { Zap, TrendingUp, BookOpen } from 'lucide-react'
import { GenomeStats } from '@/types/genome'

interface SkillGenomeHeaderProps {
  stats: GenomeStats | null
  loading: boolean
}

export function SkillGenomeHeader({ stats, loading }: SkillGenomeHeaderProps) {
  if (loading || !stats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 mb-6"
      >
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-800 rounded w-1/3" />
          <div className="h-4 bg-gray-800 rounded w-2/3" />
        </div>
      </motion.div>
    )
  }

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center gap-3 hover:border-blue-600/30 transition-colors">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mb-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Skill Genome</h1>
        <p className="text-sm text-gray-400">
          Your neural network of capabilities and growth pathways
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={BookOpen}
          label="Total Skills"
          value={stats.totalSkills}
          color="bg-blue-600/20 border border-blue-600/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Readiness"
          value={`${Math.round(stats.readinessScore)}%`}
          color="bg-emerald-600/20 border border-emerald-600/20"
        />
        <StatCard
          icon={Zap}
          label="Criticality"
          value={`${Math.round(stats.criticality)}%`}
          color="bg-purple-600/20 border border-purple-600/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Learning Velocity"
          value={`${Math.round(stats.learningVelocity)}%`}
          color="bg-cyan-600/20 border border-cyan-600/20"
        />
      </div>
    </motion.div>
  )
}
