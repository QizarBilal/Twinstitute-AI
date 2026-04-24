/**
 * JD Comparison UI Component
 * Compare resume with job description inline
 * Uses AI for intelligent matching and recommendations
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, CheckCircle, AlertCircle, TrendingUp, Loader, Copy } from 'lucide-react'
import { useResumeAIEnhancement } from '@/hooks/useResumeAIEnhancement'

interface JDComparisonProps {
  resumeContent: string
  targetRole?: string
  onSuggestions?: (suggestions: string[]) => void
}

export function JDComparisonUI({
  resumeContent,
  targetRole,
  onSuggestions,
}: JDComparisonProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [comparisonResult, setComparisonResult] = useState<any>(null)
  const { compareWithJob, isLoading: isComparing, error } = useResumeAIEnhancement()

  const handleCompare = async () => {
    if (!jobDescription.trim()) {
      return
    }

    const result = await compareWithJob(resumeContent, jobDescription, targetRole)
    if (result) {
      setComparisonResult(result)
      onSuggestions?.(result.suggestedImprovements)
      setIsExpanded(true)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-200 mb-2">Compare with Job Description</h3>
        <p className="text-sm text-slate-400">Paste a job description to see how well your resume matches</p>
      </div>

      {/* Job Description Input */}
      <textarea
        value={jobDescription}
        onChange={e => setJobDescription(e.target.value)}
        placeholder="Paste job description here..."
        className="w-full min-h-32 px-4 py-3 rounded-lg bg-slate-900/30 border border-slate-700 text-slate-200 placeholder-slate-600 focus:border-cyan-500/60 focus:outline-none resize-none"
      />

      <button
        onClick={handleCompare}
        disabled={isComparing || !jobDescription.trim()}
        className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {isComparing ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Analyze Fit
          </>
        )}
      </button>

      {error && (
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/50 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      {/* Comparison Results */}
      {comparisonResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700"
        >
          {/* Match Score */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Overall Match Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-cyan-400">
                  {comparisonResult.matchScore}%
                </span>
              </div>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" strokeWidth="4" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="4"
                  strokeDasharray={`${2 * 45 * 3.14159 * (comparisonResult.matchScore / 100)} ${2 * 45 * 3.14159}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-cyan-400">{comparisonResult.matchScore}%</span>
              </div>
            </div>
          </div>

          {/* Matched Skills */}
          {comparisonResult.matchedSkills?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-sm font-medium text-green-400">Matched Skills</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {comparisonResult.matchedSkills.map((skill: string, i: number) => (
                  <span key={i} className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-300 border border-green-700/50">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {comparisonResult.missingSkills?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-medium text-amber-400">Missing Skills</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {comparisonResult.missingSkills.map((skill: string, i: number) => (
                  <span key={i} className="px-2 py-1 text-xs rounded-full bg-amber-900/30 text-amber-300 border border-amber-700/50">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Improvements */}
          {comparisonResult.suggestedImprovements?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <p className="text-sm font-medium text-blue-400">Improvements</p>
              </div>
              <ul className="space-y-2">
                {comparisonResult.suggestedImprovements.map((improvement: string, i: number) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-2">
                    <span className="text-cyan-400 flex-shrink-0">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ATS Recommendations */}
          {comparisonResult.atsRecommendations?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-indigo-400 mb-2">ATS Recommendations</p>
              <ul className="space-y-1">
                {comparisonResult.atsRecommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-2">
                    <span className="text-indigo-400 flex-shrink-0">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
