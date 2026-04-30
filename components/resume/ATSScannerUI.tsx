'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader, AlertCircle, CheckCircle, TrendingUp, Zap } from 'lucide-react'
import { ATSScanResult } from '@/types/resume'

interface ATSScannerUIProps {
  resume: any
  isScanning: boolean
  onScan: () => void
  scanResult?: ATSScanResult
}

export function ATSScannerUI({ resume, isScanning, onScan, scanResult }: ATSScannerUIProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [showJobDescInput, setShowJobDescInput] = useState(false)

  return (
    <div className="space-y-6">
      {/* Input Section */}
      {!isScanning && !scanResult && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ATS Resume Scanner
            </label>
            <p className="text-sm text-slate-400 mb-4">
              Analyze your resume for ATS compatibility and get optimization suggestions.
            </p>
          </div>

          {/* Optional Job Description */}
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showJobDescInput}
                onChange={(e) => setShowJobDescInput(e.target.checked)}
                className="rounded border-slate-600 text-cyan-500"
              />
              <span className="text-sm text-slate-300">Include job description for matching analysis</span>
            </label>

            <AnimatePresence>
              {showJobDescInput && (
                <motion.textarea
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  placeholder="Paste the job description here for a comprehensive match analysis..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full h-32 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none resize-none"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Scan Button */}
          <button
            onClick={onScan}
            disabled={isScanning}
            className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Zap size={18} />
            {isScanning ? 'Scanning Resume...' : 'Scan for ATS Compatibility'}
          </button>
        </motion.div>
      )}

      {/* Loading State */}
      {isScanning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12">
          <Loader className="w-8 h-8 text-cyan-500 animate-spin mb-3" />
          <p className="text-slate-300">Analyzing your resume with AI...</p>
          <p className="text-xs text-slate-500 mt-2">This typically takes 10-15 seconds</p>
        </motion.div>
      )}

      {/* Results */}
      {scanResult && !isScanning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Score */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-200">ATS Compatibility Score</h3>
              <div
                className="text-4xl font-bold"
                style={{
                  color: scanResult.score >= 75 ? '#10b981' : scanResult.score >= 50 ? '#f59e0b' : '#ef4444',
                }}
              >
                {scanResult.score}/100
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${scanResult.score}%`,
                  backgroundColor:
                    scanResult.score >= 75 ? '#10b981' : scanResult.score >= 50 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <p className="text-sm text-slate-400 mt-3">
              {scanResult.atsCompatible ? (
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle size={16} />
                  Your resume is ATS compatible
                </span>
              ) : (
                <span className="text-yellow-400 flex items-center gap-1">
                  <AlertCircle size={16} />
                  Some ATS compatibility issues detected
                </span>
              )}
            </p>
          </div>

          {/* Readability & Competency */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">Readability Score</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-blue-400">{scanResult.readabilityScore}</span>
                <span className="text-sm text-slate-500">/100</span>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">Keywords Found</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-green-400">{scanResult.foundKeywords.length}</span>
                <span className="text-sm text-slate-500">of {scanResult.foundKeywords.length + scanResult.missingKeywords.length}</span>
              </div>
            </div>
          </div>

          {/* Missing Keywords */}
          {scanResult.missingKeywords.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-300 mb-3 flex items-center gap-2">
                <AlertCircle size={18} />
                Missing Keywords ({scanResult.missingKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {scanResult.missingKeywords.slice(0, 10).map((keyword, index) => (
                  <span key={`${keyword}-${index}`} className="px-3 py-1 bg-yellow-900/40 border border-yellow-700/50 rounded-full text-sm text-yellow-300">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {scanResult.suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-300 flex items-center gap-2">
                <TrendingUp size={18} className="text-cyan-400" />
                Optimization Suggestions
              </h4>
              {scanResult.suggestions.slice(0, 5).map((suggestion, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    suggestion.priority === 'high'
                      ? 'bg-red-900/20 border-red-700/50'
                      : suggestion.priority === 'medium'
                        ? 'bg-yellow-900/20 border-yellow-700/50'
                        : 'bg-blue-900/20 border-blue-700/50'
                  }`}
                >
                  <div className="flex gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        suggestion.priority === 'high'
                          ? 'bg-red-900/50 text-red-300'
                          : suggestion.priority === 'medium'
                            ? 'bg-yellow-900/50 text-yellow-300'
                            : 'bg-blue-900/50 text-blue-300'
                      }`}
                    >
                      {suggestion.priority.toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm text-slate-300 font-medium">{suggestion.suggestion}</p>
                      <p className="text-xs text-slate-500 mt-1">In {suggestion.section} section</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Formatting Issues */}
          {scanResult.formatting.issues.length > 0 && (
            <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
              <h4 className="font-medium text-orange-300 mb-3">Formatting Issues</h4>
              <ul className="space-y-1">
                {scanResult.formatting.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-orange-300 flex gap-2">
                    <span>•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={() => setJobDescription('')}
            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-all"
          >
            Scan Again
          </button>
        </motion.div>
      )}
    </div>
  )
}
