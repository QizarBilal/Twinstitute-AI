'use client'

import { motion } from 'framer-motion'
import { TrendingUp, AlertTriangle, Lightbulb, Calendar, Target } from 'lucide-react'
import Link from 'next/link'

interface StrategicInsightPanelProps {
  capabilityScore: number
  readiness: number
  learningSpeed: number
  stage: string
  labsCompleted: number
  loading: boolean
}

export default function StrategicInsightPanel({
  capabilityScore,
  readiness,
  learningSpeed,
  labsCompleted,
  loading
}: StrategicInsightPanelProps) {
  // Calculate projection
  const weeksToReadiness = loading
    ? 0
    : labsCompleted === 0
    ? 24
    : Math.max(2, Math.ceil((80 - readiness) / (readiness / Math.max(1, labsCompleted / 2))))

  const monthsToReadiness = Math.ceil(weeksToReadiness / 4.3)

  // Determine recommendations
  const getRecommendation = (): string => {
    if (labsCompleted === 0) return 'Start your first lab task today'
    if (capabilityScore < 30) return 'Increase task frequency to 3+ per week'
    if (capabilityScore < 50) return 'Focus on medium-difficulty problems'
    if (capabilityScore < 70) return 'Begin system design and architecture tasks'
    if (capabilityScore < 85) return 'Take on advanced challenges and mentoring'
    return 'You are ready for professional opportunities'
  }

  const getRisk = (): { level: string; message: string; color: string } => {
    if (labsCompleted === 0) {
      return {
        level: 'HIGH',
        message: 'No activity detected. Engine not activated.',
        color: 'text-red-400'
      }
    }
    if (readiness < 40) {
      return {
        level: 'MEDIUM',
        message: 'Slow progress. Accelerate with more frequent submissions.',
        color: 'text-amber-400'
      }
    }
    if (readiness < 70) {
      return {
        level: 'LOW',
        message: 'Steady growth. Maintain momentum.',
        color: 'text-blue-400'
      }
    }
    return {
      level: 'OPTIMAL',
      message: 'On track for expert status. Keep pushing.',
      color: 'text-emerald-400'
    }
  }

  const risk = getRisk()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Career Trajectory */}
      <motion.div
        className="bg-gradient-to-br from-purple-600/20 to-purple-700/10 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
            <Calendar size={16} className="text-purple-400" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Career Projection</p>
            <h4 className="text-[15px] font-black text-purple-300">Timeline to Ready</h4>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 bg-gray-800 rounded animate-pulse" />
              <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse" />
            </div>
          ) : (
            <>
              <div>
                <div className="text-4xl font-black text-purple-300 leading-none mb-1">
                  {monthsToReadiness}.{weeksToReadiness % 4}
                </div>
                <p className="text-[12px] text-gray-400">months at current pace</p>
              </div>

              {/* Progress bar to readiness */}
              <div className="pt-2">
                <div className="flex justify-between text-[11px] mb-2">
                  <span className="text-gray-500">Interview Ready</span>
                  <span className="font-bold text-purple-300">{readiness}%</span>
                </div>
                <div className="h-2 w-full bg-gray-900/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${readiness}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-purple-500/20">
                <p className="text-[11px] text-gray-500">
                  {readiness >= 80
                    ? '✓ You are ready for interviews'
                    : `${Math.ceil(80 - readiness)} points to 80%`}
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Risk Assessment */}
      <motion.div
        className="bg-gradient-to-br from-amber-600/20 to-amber-700/10 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Risk Analysis</p>
            <h4 className="text-[15px] font-black text-amber-300">Growth Velocity</h4>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-6 bg-gray-800 rounded animate-pulse" />
              <div className="h-3 bg-gray-800 rounded w-3/4 animate-pulse" />
            </div>
          ) : (
            <>
              <div className={`text-lg font-black ${risk.color}`}>
                {risk.level} RISK
              </div>

              <p className="text-[12px] text-gray-400 leading-relaxed">
                {risk.message}
              </p>

              {labsCompleted > 0 && (
                <div className="pt-3 border-t border-amber-500/20">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Completion rate</span>
                    <span className="font-bold text-amber-300">
                      {Math.round((labsCompleted / Math.max(1, labsCompleted * 0.7)) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Strategic Recommendation */}
      <motion.div
        className="bg-gradient-to-br from-emerald-600/20 to-emerald-700/10 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-sm"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
            <Lightbulb size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">AI Strategy</p>
            <h4 className="text-[15px] font-black text-emerald-300">Next Focus Area</h4>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 bg-gray-800 rounded animate-pulse" />
              <div className="h-3 bg-gray-800 rounded w-full animate-pulse" />
            </div>
          ) : (
            <>
              <p className="text-[13px] font-semibold text-emerald-300">
                {getRecommendation()}
              </p>

              <p className="text-[12px] text-gray-400 leading-relaxed">
                {capabilityScore === 0
                  ? 'Getting started with your first lab will initialize all systems and personalized guidance.'
                  : capabilityScore < 50
                  ? 'Build a strong foundation by completing diverse task types and focusing on consistency.'
                  : capabilityScore < 80
                  ? 'Progress to advanced problem-solving. This is where roles differ most.'
                  : 'You are in the expert tier. Focus on specialization and mentoring others.'}
              </p>

              <div className="pt-3 border-t border-emerald-500/20">
                <Link
                  href="/dashboard/strategy"
                  className="inline-flex items-center gap-1 text-[12px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                >
                  View AI Strategy
                  <TrendingUp size={12} />
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Optional: Multi-Agent Insights Row */}
      {!loading && capabilityScore > 0 && (
        <motion.div
          className="col-span-full bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-gray-800/40 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <h4 className="text-[13px] font-bold text-white uppercase tracking-wider">Multi-Agent Insights</h4>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🎯', name: 'Career', insight: 'On track' },
              { icon: '🧠', name: 'Learning', insight: `${learningSpeed > 60 ? 'Fast' : 'Steady'} pace` },
              { icon: '⚙️', name: 'Execution', insight: 'Building' },
              { icon: '📊', name: 'Evaluation', insight: `${readiness}% ready` },
            ].map((agent, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <span className="text-xl">{agent.icon}</span>
                <div>
                  <p className="text-gray-500 text-[10px] font-bold">Agent</p>
                  <p className="text-gray-300 font-semibold">{agent.insight}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
