'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader, TrendingUp, Zap, Target } from 'lucide-react'
import { SkillsAnalysisResult, Skill } from '@/types/resume'

interface SkillsAnalyzerUIProps {
  skills: Skill[]
  targetRole?: string
  isAnalyzing: boolean
  onAnalyze: () => void
  analysisResult?: SkillsAnalysisResult
}

export function SkillsAnalyzerUI({
  skills,
  targetRole,
  isAnalyzing,
  onAnalyze,
  analysisResult,
}: SkillsAnalyzerUIProps) {
  return (
    <div className="space-y-6">
      {/* Button & Info */}
      {!isAnalyzing && !analysisResult && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Skills Analyzer
            </label>
            <p className="text-sm text-slate-400 mb-4">
              Get AI-powered insights on your skills, identify gaps, and receive personalized recommendations.
            </p>
          </div>

          {/* Skills Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">
                {skills.filter((s) => s.level === 'verified').length}
              </p>
              <p className="text-xs text-slate-400 mt-1">Verified</p>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {skills.filter((s) => s.level === 'developing').length}
              </p>
              <p className="text-xs text-slate-400 mt-1">Developing</p>
            </div>
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{skills.filter((s) => s.level === 'weak').length}</p>
              <p className="text-xs text-slate-400 mt-1">Weak</p>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || skills.length === 0}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Zap size={18} />
            {isAnalyzing ? 'Analyzing Skills...' : 'Analyze Skills'}
          </button>
        </motion.div>
      )}

      {/* Loading */}
      {isAnalyzing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-slate-300">Analyzing your skills...</p>
          <p className="text-xs text-slate-500 mt-2">Comparing with industry benchmarks</p>
        </motion.div>
      )}

      {/* Results */}
      {analysisResult && !isAnalyzing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Skills Breakdown */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4">Skills Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Verified', count: analysisResult.byLevel.verified, color: 'green' },
                { label: 'Developing', count: analysisResult.byLevel.developing, color: 'yellow' },
                { label: 'Weak', count: analysisResult.byLevel.weak, color: 'red' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`bg-${item.color}-900/20 border border-${item.color}-700/50 rounded-lg p-4 text-center`}
                >
                  <p className={`text-2xl font-bold text-${item.color}-400`}>{item.count}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Skills */}
          {analysisResult.topSkills.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-300 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-400" />
                Top Skills
              </h4>
              {analysisResult.topSkills.map((skill, idx) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-300">{skill.name}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        skill.level === 'verified'
                          ? 'bg-green-900/50 text-green-300'
                          : skill.level === 'developing'
                            ? 'bg-yellow-900/50 text-yellow-300'
                            : 'bg-red-900/50 text-red-300'
                      }`}
                    >
                      {skill.level}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-green-500 to-cyan-500"
                      style={{ width: `${skill.strength * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Strength: {Math.round(skill.strength * 100)}%</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Industry Benchmark */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <h4 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
              <Target size={18} />
              Industry Benchmark
            </h4>
            <p className="text-sm text-slate-300 mb-3">{analysisResult.industryBenchmark.comparison}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Your Skills</p>
                <p className="text-2xl font-bold text-blue-400">{analysisResult.industryBenchmark.yourSkillCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Recommended</p>
                <p className="text-2xl font-bold text-slate-400">{analysisResult.industryBenchmark.averageSkillsForRole}</p>
              </div>
            </div>
          </div>

          {/* Skill Gaps */}
          {analysisResult.skillGaps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-300">Areas for Growth</h4>
              {analysisResult.skillGaps.slice(0, 3).map((gap, idx) => (
                <motion.div
                  key={gap.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4"
                >
                  <p className="font-medium text-orange-300 mb-2">{gap.category}</p>
                  <p className="text-sm text-slate-400 mb-2">
                    Current: <span className="text-slate-300">{gap.currentLevel}</span> → Recommended:{' '}
                    <span className="text-slate-300">{gap.recommendedLevel}</span>
                  </p>
                  {gap.suggestions.length > 0 && (
                    <ul className="space-y-1">
                      {gap.suggestions.slice(0, 2).map((suggestion, sidx) => (
                        <li key={sidx} className="text-xs text-orange-300/80">
                          • {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {analysisResult.recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-700/50 rounded-lg p-4">
              <h4 className="font-medium text-cyan-300 mb-3">Key Recommendations</h4>
              <ul className="space-y-2">
                {analysisResult.recommendations.slice(0, 4).map((rec, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Analyze Again */}
          <button
            onClick={() => {}}
            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-all"
          >
            Analyze Again
          </button>
        </motion.div>
      )}
    </div>
  )
}
