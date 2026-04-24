'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Github,
  Linkedin,
  Zap,
  Target,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
} from 'lucide-react'

interface Analysis {
  overallAssessment: string
  github: {
    strengths: string[]
    gaps: string[]
    improvements: string[]
  }
  linkedin: {
    strengths: string[]
    gaps: string[]
    improvements: string[]
  }
  leetcode: {
    strengths: string[]
    gaps: string[]
    improvements: string[]
  }
  priorityActions: Array<{
    title: string
    impact: 'high' | 'medium' | 'low'
    effort: 'low' | 'medium' | 'high'
  }>
  recruiterPerception: string
}

interface ProfileSnapshot {
  github?: { repos: number; stars: number; languages: string[] }
  linkedin?: { connected: boolean }
  leetcode?: { solved: number; acceptance: number }
}

type Tab = 'github' | 'linkedin' | 'leetcode'

export default function ProfileOptimizationDashboard() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [snapshot, setSnapshot] = useState<ProfileSnapshot>({})
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('github')

  useEffect(() => {
    loadAnalysis()
    loadSnapshot()
  }, [])

  const loadSnapshot = async () => {
    try {
      const res = await fetch('/api/integrations/insights')
      if (res.ok) {
        const data = await res.json()
        const insights = data.data

        const snap: ProfileSnapshot = {}

        if (insights.github?.isConnected) {
          const reposRes = await fetch('/api/integrations/github/repos')
          if (reposRes.ok) {
            const reposData = await reposRes.json()
            const repos = reposData.data || []
            snap.github = {
              repos: repos.length,
              stars: repos.reduce((sum: number, r: any) => sum + (r.stars || 0), 0),
              languages: [...new Set(repos.map((r: any) => r.language).filter(Boolean))] as string[],
            }
          }
        }

        if (insights.linkedin?.isConnected) {
          snap.linkedin = { connected: true }
        }

        if (insights.leetcode?.isConnected) {
          snap.leetcode = {
            solved: insights.leetcode.problemsSolved || 0,
            acceptance: insights.leetcode.acceptedSubmissions && insights.leetcode.totalSubmissions
              ? ((insights.leetcode.acceptedSubmissions / insights.leetcode.totalSubmissions) * 100)
              : 0,
          }
        }

        setSnapshot(snap)
      }
    } catch (err) {
      console.error('Error loading snapshot:', err)
    }
  }

  const loadAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/integrations/profile-optimization', {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Failed to load analysis')
      }

      const data = await res.json()
      setAnalysis(data.data.analysis)
    } catch (err) {
      console.error('Error loading analysis:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analysis')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    setAnalyzing(true)
    await loadAnalysis()
    setAnalyzing(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-gray-800/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-600/10 border border-red-600/30 rounded-lg p-6 text-red-400"
      >
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle size={20} />
          <p className="font-semibold">Unable to Load Analysis</p>
        </div>
        <p className="text-sm mb-4">{error || 'Connect your GitHub, LinkedIn, or LeetCode accounts to get insights.'}</p>
        <button
          onClick={handleRegenerate}
          disabled={analyzing}
          className="text-sm text-red-400 hover:text-red-300 underline"
        >
          Try again
        </button>
      </motion.div>
    )
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'medium':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
      default:
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      default:
        return 'text-red-400'
    }
  }

  const platformIcons = {
    github: <Github size={16} />,
    linkedin: <Linkedin size={16} />,
    leetcode: <span className="text-sm font-bold">LC</span>,
  }

  const platformColors = {
    github: 'text-white',
    linkedin: 'text-blue-400',
    leetcode: 'text-yellow-400',
  }

  const getPlatformData = () => {
    switch (activeTab) {
      case 'github':
        return analysis.github
      case 'linkedin':
        return analysis.linkedin
      case 'leetcode':
        return analysis.leetcode
      default:
        return analysis.github
    }
  }

  const platformData = getPlatformData()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* HEADER WITH ACTION */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Career Readiness Analysis</h3>
          <p className="text-sm text-gray-400">AI-powered insights from your connected profiles</p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={analyzing ? 'animate-spin' : ''} />
          {analyzing ? 'Analyzing...' : 'Regenerate'}
        </button>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: PROFILE SNAPSHOT */}
        <div className="lg:col-span-1 space-y-3">
          <div className="dashboard-card">
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-4 tracking-wider">Profile Snapshot</h4>

            {/* GitHub */}
            {snapshot.github && (
              <div className="mb-4 pb-4 border-b border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white">
                    {platformIcons.github}
                  </div>
                  <span className="text-sm font-medium text-white">GitHub</span>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>
                    <span className="text-gray-500">Repos:</span>{' '}
                    <span className="text-white font-medium">{snapshot.github.repos}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Stars:</span>{' '}
                    <span className="text-white font-medium">{snapshot.github.stars}</span>
                  </p>
                  {snapshot.github.languages.length > 0 && (
                    <p>
                      <span className="text-gray-500">Languages:</span>{' '}
                      <span className="text-white font-medium">{snapshot.github.languages.join(', ')}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* LinkedIn */}
            {snapshot.linkedin && (
              <div className="mb-4 pb-4 border-b border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded flex items-center justify-center text-blue-400">
                    {platformIcons.linkedin}
                  </div>
                  <span className="text-sm font-medium text-white">LinkedIn</span>
                </div>
                <p className="text-xs text-green-400">✓ Connected</p>
              </div>
            )}

            {/* LeetCode */}
            {snapshot.leetcode && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded flex items-center justify-center text-yellow-400">
                    {platformIcons.leetcode}
                  </div>
                  <span className="text-sm font-medium text-white">LeetCode</span>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>
                    <span className="text-gray-500">Solved:</span>{' '}
                    <span className="text-white font-medium">{snapshot.leetcode.solved}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Acceptance:</span>{' '}
                    <span className="text-white font-medium">{snapshot.leetcode.acceptance.toFixed(1)}%</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: AI INSIGHTS */}
        <div className="lg:col-span-2 space-y-4">
          {/* OVERALL ASSESSMENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="dashboard-card border-blue-600/20 bg-gradient-to-br from-blue-600/5 to-transparent"
          >
            <div className="flex items-start gap-3 mb-3">
              <Eye size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <h4 className="text-sm font-semibold text-blue-400">Overall Assessment</h4>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.overallAssessment}</p>
          </motion.div>

          {/* PLATFORM TABS */}
          <div>
            <div className="flex gap-2 mb-4">
              {(['github', 'linkedin', 'leetcode'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <span className={platformColors[tab]}>{platformIcons[tab]}</span>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* STRENGTHS */}
              {platformData.strengths.length > 0 && (
                <div className="dashboard-card border-green-600/20 bg-green-600/5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <h5 className="text-sm font-semibold text-green-400">Strengths</h5>
                  </div>
                  <ul className="space-y-2">
                    {platformData.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex gap-2">
                        <span className="text-green-400 flex-shrink-0">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* GAPS */}
              {platformData.gaps.length > 0 && (
                <div className="dashboard-card border-red-600/20 bg-red-600/5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={16} className="text-red-400" />
                    <h5 className="text-sm font-semibold text-red-400">Gaps</h5>
                  </div>
                  <ul className="space-y-2">
                    {platformData.gaps.map((gap, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex gap-2">
                        <span className="text-red-400 flex-shrink-0">→</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* IMPROVEMENTS */}
              {platformData.improvements.length > 0 && (
                <div className="dashboard-card border-yellow-600/20 bg-yellow-600/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={16} className="text-yellow-400" />
                    <h5 className="text-sm font-semibold text-yellow-400">Improvements</h5>
                  </div>
                  <ul className="space-y-2">
                    {platformData.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex gap-2">
                        <span className="text-yellow-400 flex-shrink-0">→</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* PRIORITY ACTIONS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card border-purple-600/20 bg-gradient-to-r from-purple-600/5 to-transparent"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-purple-400" />
          <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Priority Actions</h4>
        </div>
        <div className="space-y-2">
          {analysis.priorityActions.map((action, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${getImpactColor(
                action.impact
              )}`}
            >
              <div>
                <p className="text-sm font-medium">{action.title}</p>
                <p className={`text-xs mt-1 ${getEffortColor(action.effort)}`}>
                  Effort: {action.effort.charAt(0).toUpperCase() + action.effort.slice(1)}
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-current/20 rounded flex-shrink-0">
                {action.impact.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* RECRUITER PERCEPTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card border-orange-600/20 bg-orange-600/5"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center flex-shrink-0 border border-orange-600/30">
            <Eye size={18} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-orange-400 mb-2">How Recruiters See You</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.recruiterPerception}</p>
          </div>
        </div>
      </motion.div>

      {/* DISCLAIMER */}
      <p className="text-xs text-gray-600 text-center">
        Analysis powered by AI. Last updated: {new Date().toLocaleDateString()}
      </p>
    </motion.div>
  )
}
