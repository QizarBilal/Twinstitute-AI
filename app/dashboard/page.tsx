'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Zap, TrendingUp, Target, BookOpen, Award, AlertCircle,
  ChevronRight, Calendar, Clock
} from 'lucide-react'

interface DashboardStats {
  capabilityScore: number
  creditsEarned: number
  labsCompleted: number
  readiness: number
  stage: string
  velocity: number
  targetRole: string
  targetDomain: string
  executionReliability: number
  learningSpeed: number
  problemSolvingDepth: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    capabilityScore: 0, creditsEarned: 0, labsCompleted: 0,
    readiness: 0, stage: 'foundation', velocity: 0,
    targetRole: '', targetDomain: '',
    executionReliability: 0, learningSpeed: 0, problemSolvingDepth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/capability-twin/scoring', { credentials: 'include' })
        const result = await response.json()
        const twin = result.data
        
        setStats({
          capabilityScore:      twin?.overallScore         ?? 0,
          creditsEarned:        twin?.creditsEarned        ?? 0,
          labsCompleted:        twin?.labsCompleted        ?? 0,
          readiness:            twin?.readinessScore       ?? 0,
          stage:                twin?.currentStage         ?? 'foundation',
          velocity:             twin?.formationVelocity    ?? 0,
          targetRole:           twin?.targetRole           ?? '',
          targetDomain:         twin?.targetDomain         ?? '',
          executionReliability: twin?.executionReliability ?? 0,
          learningSpeed:        twin?.learningSpeed        ?? 0,
          problemSolvingDepth:  twin?.problemSolvingDepth  ?? 0,
        })
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const StatCard = ({ label, value, icon: Icon, subtext }: any) => (
    <motion.div
      variants={itemVariants}
      className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value || '—'}</p>
          {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center flex-shrink-0 ml-4">
          <Icon size={20} className="text-blue-600" />
        </div>
      </div>
    </motion.div>
  )

  const ProgressCard = ({ title, current, target, icon: Icon }: any) => {
    const percentage = target > 0 ? (current / target) * 100 : 0
    return (
      <motion.div
        variants={itemVariants}
        className="bg-gray-900/50 border border-gray-800 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
              <Icon size={20} className="text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">{current} of {target}</span>
            <span className="text-sm font-semibold text-blue-400">{Math.round(percentage)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-blue-600/20 rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 text-sm">Loading your dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="px-8 py-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold text-white">
          Welcome back, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-400">
          {session?.user?.selectedRole && `Role: ${session.user.selectedRole}`}
          {session?.user?.selectedDomain && ` • Domain: ${session.user.selectedDomain}`}
        </p>
      </motion.div>

      {/* Key Metrics Section */}
      <motion.div variants={itemVariants}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Your Capability Profile</h2>
          <p className="text-sm text-gray-500 mt-1">Current achievement and capability metrics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Overall Score"
            value={Math.round(stats.capabilityScore)}
            icon={Zap}
            subtext="Capability benchmark"
          />
          <StatCard
            label="Interview Ready"
            value={`${Math.round(stats.readiness)}%`}
            icon={Target}
            subtext="Readiness score"
          />
          <StatCard
            label="Labs Completed"
            value={stats.labsCompleted}
            icon={Award}
            subtext="Active learning tasks"
          />
          <StatCard
            label="Credits Earned"
            value={stats.creditsEarned}
            icon={Zap}
            subtext="Achievement points"
          />
        </div>
      </motion.div>

      {/* Capability Breakdown Section */}
      <motion.div variants={itemVariants}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Capability Breakdown</h2>
          <p className="text-sm text-gray-500 mt-1">Detailed analysis of your core competencies</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Execution Reliability</p>
                <p className="text-2xl font-bold text-white">{Math.round(stats.executionReliability)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Consistency and dependability in task execution</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Learning Speed</p>
                <p className="text-2xl font-bold text-white">{Math.round(stats.learningSpeed)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Velocity of skill acquisition and improvement</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                <BookOpen size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Problem Solving</p>
                <p className="text-2xl font-bold text-white">{Math.round(stats.problemSolvingDepth)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Depth and sophistication in problem analysis</p>
          </div>
        </div>
      </motion.div>

      {/* Recommended Action Section */}
      <motion.div variants={itemVariants}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Recommended Next Steps</h2>
          <p className="text-sm text-gray-500 mt-1">Optimized path to accelerate your growth</p>
        </div>
        <div className="bg-blue-600/5 border border-blue-600/20 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Complete Your First Lab Assignment</p>
              <p className="text-sm text-gray-400">Get hands-on experience with practical challenges matched to your skill level</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Review Learning Roadmap</p>
              <p className="text-sm text-gray-400">Understand the path to reach your target role with milestone tracking</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Set Up Mentor Session</p>
              <p className="text-sm text-gray-400">Connect with industry experts to accelerate your understanding and growth</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Section */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/labs"
            className="group bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-blue-600/50 hover:bg-gray-900/80 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-1">Labs & Tasks</p>
                <p className="text-xs text-gray-500">Explore challenges</p>
              </div>
              <ChevronRight className="text-gray-600 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

          <Link
            href="/dashboard/roadmap"
            className="group bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-blue-600/50 hover:bg-gray-900/80 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-1">Roadmap</p>
                <p className="text-xs text-gray-500">View your path</p>
              </div>
              <ChevronRight className="text-gray-600 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

          <Link
            href="/dashboard/mentor"
            className="group bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-blue-600/50 hover:bg-gray-900/80 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-1">Mentor Sessions</p>
                <p className="text-xs text-gray-500">Get guidance</p>
              </div>
              <ChevronRight className="text-gray-600 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

          <Link
            href="/dashboard/twins"
            className="group bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-blue-600/50 hover:bg-gray-900/80 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-1">Capability Twin</p>
                <p className="text-xs text-gray-500">View analysis</p>
              </div>
              <ChevronRight className="text-gray-600 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Status Section */}
      <motion.div variants={itemVariants}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Current Status</h2>
          <p className="text-sm text-gray-500 mt-1">Your development stage and trajectory</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <p className="text-sm font-semibold text-white">Development Stage</p>
            </div>
            <p className="text-2xl font-bold text-white capitalize">{stats.stage}</p>
            <p className="text-xs text-gray-500 mt-2">Your current learning phase</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <p className="text-sm font-semibold text-white">Growth Velocity</p>
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(stats.velocity * 100)}%</p>
            <p className="text-xs text-gray-500 mt-2">Rate of improvement</p>
          </div>
        </div>
      </motion.div>

      {/* Footer spacing */}
      <div className="text-center text-xs text-gray-600 py-8">
        <p>Dashboard • Updated in real-time • All data is encrypted</p>
      </div>
    </motion.div>
  )
}
