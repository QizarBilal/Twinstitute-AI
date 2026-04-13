'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle2 } from 'lucide-react'

interface IntelligenceLoopLiveProps {
  labsCompleted: number
  loading: boolean
}

const loopSteps = [
  { name: 'Model Student', desc: 'Creating your digital twin' },
  { name: 'Measure', desc: 'Analyzing performance data' },
  { name: 'Inject Task', desc: 'Selecting next challenge' },
  { name: 'Capture Execution', desc: 'Recording solution patterns' },
  { name: 'Evaluate', desc: 'Assessing quality & effort' },
  { name: 'Update Twin', desc: 'Updating capability profile' },
  { name: 'Simulate', desc: 'Projecting career path' },
  { name: 'Strategy', desc: 'Generating recommendations' },
  { name: 'Adjust', desc: 'Refining task sequence' },
  { name: 'Repeat', desc: 'Starting next cycle' },
]

export default function IntelligenceLoopLive({ labsCompleted, loading }: IntelligenceLoopLiveProps) {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (labsCompleted === 0) return

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % loopSteps.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [labsCompleted])

  return (
    <div className="bg-gray-900/30 border border-gray-800/60 rounded-2xl p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              className="w-2 h-2 bg-blue-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Intelligence Loop</p>
          </div>
          <h3 className="text-lg font-black text-white">Live System Engine</h3>
        </div>
        {!loading && labsCompleted > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">Cycle</p>
            <p className="text-2xl font-black text-blue-400">{Math.ceil(labsCompleted / 3)}</p>
          </div>
        )}
      </div>

      {/* Status Message */}
      <motion.div
        className="mb-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-[12px] text-blue-300 font-semibold">
          {loading
            ? 'Initializing intelligence engine...'
            : labsCompleted === 0
            ? '⏸️ Loop paused — Start a lab task to activate'
            : `▶️ Currently in step: ${loopSteps[activeStep].desc}`}
        </p>
      </motion.div>

      {/* Loop visualization - Circular for desktop, Linear for mobile */}
      {!loading && labsCompleted > 0 ? (
        <>
          {/* Desktop circular visualization */}
          <div className="hidden lg:block relative h-64 mb-8">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 0 20px rgba(37, 99, 235, 0.1))' }}
            >
              {/* Circle background */}
              <circle
                cx="200"
                cy="200"
                r="140"
                fill="none"
                stroke="rgba(37, 99, 235, 0.1)"
                strokeWidth="2"
                strokeDasharray="880"
              />

              {/* Animated circle */}
              <motion.circle
                cx="200"
                cy="200"
                r="140"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="880"
                strokeDashoffset="0"
                animate={{ strokeDashoffset: [880, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>

              {/* Step nodes */}
              {loopSteps.map((step, i) => {
                const angle = (i / loopSteps.length) * 360 * (Math.PI / 180)
                const x = 200 + 140 * Math.cos(angle - Math.PI / 2)
                const y = 200 + 140 * Math.sin(angle - Math.PI / 2)
                const isActive = i === activeStep
                const isDone = i < activeStep || (activeStep === 0 && i === loopSteps.length - 1)

                return (
                  <motion.g key={i} animate={{ opacity: isActive ? 1 : 0.6 }}>
                    {/* Circle node */}
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={isActive ? 8 : 5}
                      fill={isActive ? '#2563eb' : isDone ? '#10b981' : '#6b7280'}
                      animate={isActive ? { r: [8, 12, 8] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />

                    {/* Label */}
                    <text
                      x={x}
                      y={y + 25}
                      textAnchor="middle"
                      className="text-[10px] font-bold"
                      fill={isActive ? '#93c5fd' : '#9ca3af'}
                    >
                      {i + 1}
                    </text>
                  </motion.g>
                )
              })}
            </svg>
          </div>

          {/* Mobile linear visualization */}
          <div className="lg:hidden mb-8 space-y-3">
            {loopSteps.map((step, i) => {
              const isActive = i === activeStep
              const isDone = i < activeStep || (activeStep === 0 && i === loopSteps.length - 1)

              return (
                <motion.div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-600/20 border border-blue-500/40'
                      : isDone
                      ? 'bg-emerald-600/5 border border-emerald-500/10'
                      : 'bg-gray-800/30 border border-gray-700/30'
                  }`}
                  animate={isActive ? { x: [0, 4, 0] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive ? 'bg-blue-500 text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {isDone ? '✓' : isActive ? '●' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-bold ${
                      isActive ? 'text-blue-300' : isDone ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-[11px] text-gray-600">{step.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Current step Details - Desktop */}
          <div className="hidden lg:block p-6 bg-gray-800/30 border border-gray-700/40 rounded-xl mb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wider mb-2">Current Step</p>
                <h4 className="text-[18px] font-black text-white mb-1">{loopSteps[activeStep].name}</h4>
                <p className="text-[13px] text-gray-400">{loopSteps[activeStep].desc}</p>
              </div>
              <motion.div
                className="flex items-center gap-2 text-sm font-bold text-blue-400"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                Active
              </motion.div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <Clock size={24} className="text-gray-600" />
          </div>
          <p className="text-[13px] text-gray-500 font-medium">
            {loading ? 'Loading intelligence loop...' : 'The Intelligence Loop activates when you complete your first lab task.'}
          </p>
        </div>
      )}

      {/* Footer stats */}
      <div className="pt-6 border-t border-gray-800/40 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-[11px] text-gray-600 font-bold uppercase mb-1">Labs Analyzed</p>
          <p className="text-2xl font-black text-blue-400">{loading ? '—' : labsCompleted}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-600 font-bold uppercase mb-1">System Cycles</p>
          <p className="text-2xl font-black text-purple-400">{loading ? '—' : Math.ceil(labsCompleted / 3)}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-600 font-bold uppercase mb-1">Data Points</p>
          <p className="text-2xl font-black text-emerald-400">{loading ? '—' : labsCompleted * 12}</p>
        </div>
      </div>
    </div>
  )
}
