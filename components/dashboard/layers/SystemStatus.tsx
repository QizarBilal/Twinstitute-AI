'use client'

import { motion } from 'framer-motion'
import { Activity, Zap, Target, AlertTriangle } from 'lucide-react'

interface SystemStatusProps {
  stage: string
  capabilityScore: number
  labsCompleted: number
  loading: boolean
}

const stageConfig: Record<string, { color: string; label: string; description: string }> = {
  foundation: {
    color: 'text-gray-400',
    label: '🏗️ FOUNDATION',
    description: 'Building core capabilities'
  },
  building: {
    color: 'text-amber-400',
    label: '⚙️ BUILDING',
    description: 'Accelerating skill development'
  },
  advancing: {
    color: 'text-blue-400',
    label: '📈 ADVANCING',
    description: 'Mastering complex problems'
  },
  expert: {
    color: 'text-emerald-400',
    label: '⭐ EXPERT',
    description: 'Ready for professional challenges'
  },
}

const intelligenceSteps = [
  '🔍 Scanning your execution patterns...',
  '🧠 Analyzing problem-solving depth...',
  '⚡ Injecting next learning task...',
  '📊 Evaluating response quality...',
  '🔄 Updating capability model...',
]

export default function SystemStatus({ stage, capabilityScore, labsCompleted, loading }: SystemStatusProps) {
  const config = stageConfig[stage] || stageConfig.foundation
  const activeStep = Math.floor(Date.now() / 2000) % intelligenceSteps.length
  const riskLevel = capabilityScore > 70 ? 'low' : capabilityScore > 40 ? 'medium' : 'high'
  const riskMessages: Record<string, string> = {
    low: '✓ Excellent pace — maintain momentum',
    medium: '⚠ Moderate pace — increase task frequency',
    high: '⚠ Getting started — complete first lab to activate engine'
  }

  return (
    <div className="bg-gradient-to-r from-gray-900/40 via-gray-900/20 to-gray-900/40 border border-gray-800/60 rounded-2xl p-6 backdrop-blur-sm">
      {/* Top Row: Phase + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Phase */}
        <div>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-3">Current Phase</p>
          <motion.div
            className={`flex items-center gap-2 text-lg font-black ${config.color}`}
            animate={{ opacity: [1, 0.8, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Activity size={16} />
            {config.label}
          </motion.div>
          <p className="text-[12px] text-gray-500 mt-2">{config.description}</p>
        </div>

        {/* Active Intelligence Step */}
        <div>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-3">System Activity</p>
          <motion.div
            className="text-[13px] text-blue-300 font-semibold h-8 flex items-center"
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            {intelligenceSteps[activeStep]}
          </motion.div>
          <p className="text-[11px] text-gray-600 mt-2">Real-time capability analysis</p>
        </div>

        {/* Risk Signal */}
        <div>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-3">
            {riskLevel === 'high' ? '⚠️ Status Alert' : riskLevel === 'medium' ? '📢 Attention' : '✅ Status'}
          </p>
          <p className={`text-[13px] font-semibold ${
            riskLevel === 'high' ? 'text-amber-400' :
            riskLevel === 'medium' ? 'text-amber-300' :
            'text-emerald-400'
          }`}>
            {riskMessages[riskLevel]}
          </p>
          <p className="text-[11px] text-gray-600 mt-2">Capability velocity</p>
        </div>
      </div>

      {/* Bottom: Current Objective */}
      <div className="pt-6 border-t border-gray-800/40">
        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-3">Current Objective</p>
        <motion.div
          className="flex items-start gap-3 p-4 bg-blue-600/5 border border-blue-500/20 rounded-xl"
          animate={{ borderColor: ['rgb(37, 99, 235, 0.2)', 'rgb(37, 99, 235, 0.4)', 'rgb(37, 99, 235, 0.2)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Target size={16} className="text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <p className="text-white font-semibold text-[13px] leading-relaxed">
              {loading
                ? 'Loading your objective...'
                : labsCompleted === 0
                ? 'Complete your first lab task to initialize the intelligence engine'
                : capabilityScore < 40
                ? 'Build execution consistency — complete 3+ labs this week'
                : capabilityScore < 70
                ? 'Deepen problem-solving skills — tackle medium difficulty tasks'
                : 'Master advanced patterns — prepare for expert-level challenges'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
