'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Github, 
  Linkedin, 
  ExternalLink, 
  Star, 
  GitFork,
  Code2,
  TrendingUp,
  Award,
  CheckCircle2,
  Loader
} from 'lucide-react'

interface GitHubRepo {
  id: number
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  forks: number
  watchers: number
  isPrivate: boolean
  updatedAt: string
  topics: string[]
}

interface LinkedInProfile {
  isConnected: boolean
  username: string
  name?: string
  headline?: string
  location?: string
}

interface LeetCodeStats {
  isConnected: boolean
  username: string
  problemsSolved?: number
  totalSubmissions?: number
  acceptedSubmissions?: number
  realName?: string
  country?: string
}

interface SocialInsights {
  github: any | null
  linkedin: LinkedInProfile | null
  leetcode: LeetCodeStats | null
}

export default function SocialMediaInsights() {
  const [insights, setInsights] = useState<SocialInsights>({
    github: null,
    linkedin: null,
    leetcode: null,
  })
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/integrations/insights')
      if (!res.ok) {
        throw new Error('Failed to load insights')
      }

      const data = await res.json()
      setInsights(data.data)

      // Load GitHub repos if connected
      if (data.data.github?.isConnected) {
        loadGitHubRepos()
      }
    } catch (err) {
      console.error('Error loading insights:', err)
      setError(err instanceof Error ? err.message : 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  const loadGitHubRepos = async () => {
    try {
      setLoadingRepos(true)
      const res = await fetch('/api/integrations/github/repos')
      if (res.ok) {
        const data = await res.json()
        setRepos(data.data || [])
      }
    } catch (err) {
      console.error('Error loading repos:', err)
    } finally {
      setLoadingRepos(false)
    }
  }

  if (loading) {
    return (
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-40 bg-gray-800/50 rounded-lg animate-pulse" />
        <div className="h-40 bg-gray-800/50 rounded-lg animate-pulse" />
        <div className="h-40 bg-gray-800/50 rounded-lg animate-pulse" />
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 text-red-400"
      >
        <p className="text-sm">{error}</p>
      </motion.div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* GitHub Section */}
      {insights.github?.isConnected && (
        <motion.div variants={itemVariants} className="dashboard-card overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
              <Github size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">GitHub Profile</h3>
              <a
                href={`https://github.com/${insights.github.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
              >
                @{insights.github.username}
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* GitHub Repos */}
          {loadingRepos ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : repos.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">Top Repositories</p>
                <span className="text-xs bg-gray-800/50 px-2 py-1 rounded text-gray-300">
                  {repos.length} repos
                </span>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {repos.slice(0, 10).map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg border border-gray-700/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Code2 size={14} className="text-blue-400 flex-shrink-0" />
                          <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                            {repo.name}
                          </p>
                          {repo.isPrivate && (
                            <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded flex-shrink-0">
                              Private
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {repo.language && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              {repo.language}
                            </span>
                          )}
                          {repo.stars > 0 && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Star size={12} className="text-yellow-500" />
                              {repo.stars}
                            </span>
                          )}
                          {repo.forks > 0 && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <GitFork size={12} />
                              {repo.forks}
                            </span>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>

              {repos.length > 10 && (
                <a
                  href={`https://github.com/${insights.github.username}?tab=repositories`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-blue-400 hover:text-blue-300 py-2 mt-2"
                >
                  View all {repos.length} repositories →
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No public repositories yet</p>
          )}
        </motion.div>
      )}

      {/* LinkedIn Section */}
      {insights.linkedin?.isConnected && (
        <motion.div variants={itemVariants} className="dashboard-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center border border-blue-600/30">
              <Linkedin size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">LinkedIn Profile</h3>
              <p className="text-xs text-gray-400 mt-1">
                {insights.linkedin.name || insights.linkedin.username || 'LinkedIn User'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">
                <span className="text-gray-400">Username:</span>{' '}
                <span className="font-medium text-white">{insights.linkedin.username}</span>
              </p>
              {insights.linkedin.headline && (
                <p className="text-sm text-gray-300 mb-2">
                  <span className="text-gray-400">Headline:</span>{' '}
                  <span className="font-medium text-white">{insights.linkedin.headline}</span>
                </p>
              )}
              {insights.linkedin.location && (
                <p className="text-sm text-gray-300">
                  <span className="text-gray-400">Location:</span>{' '}
                  <span className="font-medium text-white">{insights.linkedin.location}</span>
                </p>
              )}
            </div>
            
            <a
              href={`https://www.linkedin.com/in/${insights.linkedin.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View Full Profile <ExternalLink size={14} />
            </a>
          </div>
        </motion.div>
      )}

      {/* LeetCode Section */}
      {insights.leetcode?.isConnected && (
        <motion.div variants={itemVariants} className="dashboard-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-600/30">
              <span className="text-lg font-bold text-yellow-500">LC</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">LeetCode Profile</h3>
              <a
                href={`https://leetcode.com/${insights.leetcode.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 mt-1"
              >
                @{insights.leetcode.username}
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Problems Solved */}
              <div className="p-3 bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-600/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <p className="text-xs text-gray-400">Problems Solved</p>
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {insights.leetcode.problemsSolved || 0}
                </p>
              </div>

              {/* Total Submissions */}
              <div className="p-3 bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-600/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-blue-400" />
                  <p className="text-xs text-gray-400">Submissions</p>
                </div>
                <p className="text-2xl font-bold text-blue-400">
                  {insights.leetcode.totalSubmissions || 0}
                </p>
              </div>

              {/* Acceptance Rate */}
              {insights.leetcode.acceptedSubmissions && insights.leetcode.totalSubmissions ? (
                <div className="p-3 bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-600/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Award size={16} className="text-purple-400" />
                    <p className="text-xs text-gray-400">Acceptance</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">
                    {((insights.leetcode.acceptedSubmissions / insights.leetcode.totalSubmissions) * 100).toFixed(1)}%
                  </p>
                </div>
              ) : null}

              {/* Country (if available) */}
              {insights.leetcode.country && (
                <div className="p-3 bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-600/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-gray-400">Country</p>
                  </div>
                  <p className="text-lg font-medium text-orange-400">
                    {insights.leetcode.country}
                  </p>
                </div>
              )}
            </div>

            {/* Achievement Info */}
            {insights.leetcode.problemsSolved && insights.leetcode.problemsSolved > 0 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-600/20 rounded-lg">
                <p className="text-xs text-yellow-400 font-medium">
                  ✨ {insights.leetcode.realName || insights.leetcode.username} has solved {insights.leetcode.problemsSolved} LeetCode problems!
                </p>
              </div>
            )}

            <a
              href={`https://leetcode.com/${insights.leetcode.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              View Full Profile <ExternalLink size={14} />
            </a>
          </div>
        </motion.div>
      )}

      {/* No Connections Message */}
      {!insights.github?.isConnected && !insights.linkedin?.isConnected && !insights.leetcode?.isConnected && (
        <motion.div variants={itemVariants} className="p-6 bg-gray-800/30 border border-gray-700/50 rounded-lg text-center">
          <p className="text-gray-400">
            No social media insights available. Connect your GitHub, LinkedIn, or LeetCode to get started!
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
