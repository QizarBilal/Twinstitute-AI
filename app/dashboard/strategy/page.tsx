'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface StrategySignal {
  id: string
  type: 'warning' | 'critical' | 'success' | 'info'
  title: string
  message: string
  recommendation: string
  metric: string
  currentValue: number | string
  targetValue?: number | string
  priority: number
}

interface StrategyData {
  userId: string
  timestamp: string
  signals: StrategySignal[]
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor'
  actionItems: string[]
}

export default function StrategyPage() {
  const [data, setData] = useState<StrategyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStrategySignals()
  }, [])

  const fetchStrategySignals = async () => {
    try {
      const res = await fetch('/api/strategy/signals')
      const result = await res.json()
      setData(result.data)
    } catch (error) {
      console.error('Failed to fetch strategy signals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Analyzing your learning strategy...</span>
        </div>
      </div>
    )
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'from-green-950/40 to-emerald-950/40 border-green-800/50'
      case 'good':
        return 'from-blue-950/40 to-cyan-950/40 border-blue-800/50'
      case 'fair':
        return 'from-amber-950/40 to-orange-950/40 border-amber-800/50'
      case 'poor':
        return 'from-red-950/40 to-rose-950/40 border-red-800/50'
      default:
        return 'from-gray-900 to-gray-900 border-gray-800'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
        return '🟢'
      case 'good':
        return '🟢'
      case 'fair':
        return '🟡'
      case 'poor':
        return '🔴'
      default:
        return '⚪'
    }
  }

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-950/20 border-red-800/50 text-red-300'
      case 'warning':
        return 'bg-amber-950/20 border-amber-800/50 text-amber-300'
      case 'success':
        return 'bg-green-950/20 border-green-800/50 text-green-300'
      case 'info':
        return 'bg-blue-950/20 border-blue-800/50 text-blue-300'
      default:
        return 'bg-gray-900/20 border-gray-800/50 text-gray-300'
    }
  }

  const criticalSignals = data.signals.filter(s => s.type === 'critical')
  const warningSignals = data.signals.filter(s => s.type === 'warning')
  const successSignals = data.signals.filter(s => s.type === 'success')

  return (
    <div className="px-8 py-8 space-y-6 min-h-screen bg-black">
      {/* Header with Health Status */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-white">Strategic Insights</h1>
          <span className="text-4xl">{getHealthIcon(data.overallHealth)}</span>
        </div>
        <p className="text-slate-400">Personalized guidance based on your learning data</p>
        <div className="mt-4">
          <p className="text-sm text-slate-300 mb-1">Overall Health Status</p>
          <p className="text-2xl font-bold text-white capitalize">{data.overallHealth}</p>
        </div>
      </motion.div>

      {/* Action Items */}
      {data.actionItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span> Recommended Actions
          </h3>
          <div className="space-y-2">
            {data.actionItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg"
              >
                <span className="text-cyan-400 flex-shrink-0">→</span>
                <p className="text-slate-300">{item}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Critical Signals */}
      {criticalSignals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
            <span className="text-2xl">🚨</span> Critical Issues
          </h3>
          {criticalSignals.map((signal, idx) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + idx * 0.05 }}
              className={`border rounded-xl p-5 backdrop-blur-sm ${getSignalColor(signal.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">{signal.title}</h4>
                  <p className="text-sm mb-2">{signal.message}</p>
                  <p className="text-xs opacity-75 mb-3">{signal.recommendation}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{signal.metric}</span>
                    <span>
                      Current: <span className="font-bold">{signal.currentValue}</span>
                      {signal.targetValue && (
                        <>
                          {' '}/ Target: <span className="font-bold">{signal.targetValue}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-2xl">⚠️</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Warning Signals */}
      {warningSignals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
            <span className="text-2xl">⚠️</span> Warnings
          </h3>
          {warningSignals.map((signal, idx) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + idx * 0.05 }}
              className={`border rounded-xl p-5 backdrop-blur-sm ${getSignalColor(signal.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">{signal.title}</h4>
                  <p className="text-sm mb-2">{signal.message}</p>
                  <p className="text-xs opacity-75 mb-3">{signal.recommendation}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{signal.metric}</span>
                    <span>
                      Current: <span className="font-bold">{signal.currentValue}</span>
                      {signal.targetValue && (
                        <>
                          {' '}/ Target: <span className="font-bold">{signal.targetValue}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-2xl">📌</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Success Signals */}
      {successSignals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
            <span className="text-2xl">✅</span> Strengths
          </h3>
          {successSignals.map((signal, idx) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + idx * 0.05 }}
              className={`border rounded-xl p-5 backdrop-blur-sm ${getSignalColor(signal.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">{signal.title}</h4>
                  <p className="text-sm mb-2">{signal.message}</p>
                  <p className="text-xs opacity-75 mb-3">{signal.recommendation}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{signal.metric}</span>
                    <span>
                      Current: <span className="font-bold">{signal.currentValue}</span>
                      {signal.targetValue && (
                        <>
                          {' '}/ Target: <span className="font-bold">{signal.targetValue}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-2xl">⭐</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {data.signals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-4xl mb-4">🎯</p>
          <h3 className="text-lg font-semibold text-white mb-2">No Issues Detected</h3>
          <p className="text-slate-400">Your learning strategy is on track!</p>
        </motion.div>
      )}
    </div>
  )
}
