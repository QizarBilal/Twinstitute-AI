'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CohortData {
  id: string
  name: string
  totalStudents: number
  activeStudents: number
  avgCapability: number
  avgReadiness: number
  formationVelocity: number
  completionRate: number
  topSkills: Array<{ name: string; proficiency: number }>
  performanceMetrics: {
    excellent: number
    good: number
    developing: number
    needsSupport: number
  }
}

interface InstitutionMetrics {
  totalStudents: number
  activeCohorts: number
  avgFormationVelocity: number
  overallReadiness: {
    notReady: number
    developing: number
    ready: number
    veryReady: number
  }
  topSkillGaps: Array<{ skill: string; gap: number }>
  institutionalHealth: number
  engagementRate: number
  completionTrend: number
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<InstitutionMetrics | null>(null)
  const [cohorts, setCohorts] = useState<CohortData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'cohorts' | 'insights'>('overview')

  useEffect(() => {
    // Simulated data load with dummy analytics
    const institutionData: InstitutionMetrics = {
      totalStudents: 245,
      activeCohorts: 8,
      avgFormationVelocity: 8.5,
      overallReadiness: {
        notReady: 12,
        developing: 48,
        ready: 112,
        veryReady: 73,
      },
      topSkillGaps: [
        { skill: 'System Design', gap: 78 },
        { skill: 'Machine Learning', gap: 65 },
        { skill: 'DevOps', gap: 58 },
        { skill: 'Advanced React', gap: 52 },
        { skill: 'Database Optimization', gap: 48 },
      ],
      institutionalHealth: 82,
      engagementRate: 76,
      completionTrend: 12,
    }

    const cohortsData: CohortData[] = [
      {
        id: 'cohort-1',
        name: 'Q1 2026 - Full Stack Mastery',
        totalStudents: 32,
        activeStudents: 28,
        avgCapability: 72.5,
        avgReadiness: 68.3,
        formationVelocity: 9.2,
        completionRate: 87.5,
        topSkills: [
          { name: 'React', proficiency: 85 },
          { name: 'TypeScript', proficiency: 82 },
          { name: 'Node.js', proficiency: 78 },
          { name: 'PostgreSQL', proficiency: 75 },
        ],
        performanceMetrics: {
          excellent: 12,
          good: 14,
          developing: 4,
          needsSupport: 2,
        },
      },
      {
        id: 'cohort-2',
        name: 'Q1 2026 - Frontend Excellence',
        totalStudents: 28,
        activeStudents: 26,
        avgCapability: 68.9,
        avgReadiness: 64.2,
        formationVelocity: 8.1,
        completionRate: 82.1,
        topSkills: [
          { name: 'React', proficiency: 88 },
          { name: 'Tailwind CSS', proficiency: 85 },
          { name: 'Next.js', proficiency: 80 },
          { name: 'JavaScript', proficiency: 82 },
        ],
        performanceMetrics: {
          excellent: 10,
          good: 12,
          developing: 3,
          needsSupport: 1,
        },
      },
      {
        id: 'cohort-3',
        name: 'Q2 2026 - Backend Systems',
        totalStudents: 35,
        activeStudents: 30,
        avgCapability: 65.2,
        avgReadiness: 59.8,
        formationVelocity: 7.8,
        completionRate: 78.3,
        topSkills: [
          { name: 'Node.js', proficiency: 79 },
          { name: 'MongoDB', proficiency: 74 },
          { name: 'API Design', proficiency: 76 },
          { name: 'Docker', proficiency: 68 },
        ],
        performanceMetrics: {
          excellent: 8,
          good: 16,
          developing: 5,
          needsSupport: 1,
        },
      },
      {
        id: 'cohort-4',
        name: 'Q2 2026 - Data Engineering',
        totalStudents: 22,
        activeStudents: 18,
        avgCapability: 62.1,
        avgReadiness: 55.6,
        formationVelocity: 7.2,
        completionRate: 71.4,
        topSkills: [
          { name: 'SQL', proficiency: 76 },
          { name: 'Python', proficiency: 74 },
          { name: 'Data Structures', proficiency: 71 },
          { name: 'Analytics', proficiency: 68 },
        ],
        performanceMetrics: {
          excellent: 5,
          good: 10,
          developing: 2,
          needsSupport: 1,
        },
      },
    ]

    setTimeout(() => {
      setMetrics(institutionData)
      setCohorts(cohortsData)
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-8">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading institutional analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-8 space-y-8 min-h-screen bg-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Institutional Analytics</h1>
            <p className="text-slate-400 max-w-2xl">
              Cohort capability maps, formation velocity tracking, and readiness heatmaps
            </p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-3 mt-6 border-t border-slate-700/50 pt-6">
          {(['overview', 'cohorts', 'insights'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                  : 'text-slate-400 hover:text-slate-300 border border-transparent'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === 'overview' && metrics && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur"
              >
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-3">Total Students</p>
                <div className="text-4xl font-bold text-white mb-2">{metrics.totalStudents}</div>
                <p className="text-slate-500 text-xs">Across all cohorts</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur"
              >
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-3">Active Cohorts</p>
                <div className="text-4xl font-bold text-cyan-400 mb-2">{metrics.activeCohorts}</div>
                <p className="text-slate-500 text-xs">Currently running</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur"
              >
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-3">Institutional Health</p>
                <div className="text-4xl font-bold text-emerald-400 mb-2">{metrics.institutionalHealth}%</div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.institutionalHealth}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur"
              >
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-3">Engagement Rate</p>
                <div className="text-4xl font-bold text-blue-400 mb-2">{metrics.engagementRate}%</div>
                <p className="text-slate-500 text-xs">Active participation</p>
              </motion.div>
            </div>

            {/* Readiness Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Interview Readiness Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Not Ready', value: metrics.overallReadiness.notReady, color: 'from-red-500 to-pink-500', bgColor: 'bg-red-500/10' },
                  { label: 'Developing', value: metrics.overallReadiness.developing, color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-500/10' },
                  { label: 'Ready', value: metrics.overallReadiness.ready, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10' },
                  { label: 'Very Ready', value: metrics.overallReadiness.veryReady, color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-500/10' },
                ].map((category, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className={`${category.bgColor} border border-slate-700/50 rounded-xl p-6`}
                  >
                    <p className="text-slate-400 text-sm mb-3">{category.label}</p>
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r" style={{backgroundImage: `linear-gradient(to right, ${category.color.split(' ')[0].replace('from-', 'var(--color-')})`}}>
                      {category.value}
                    </div>
                    <p className="text-slate-500 text-xs mt-2">{Math.round((category.value / metrics.totalStudents) * 100)}% of students</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Formation Velocity & Skill Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formation Velocity */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Formation Velocity</h2>
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <span className="text-slate-400">Current Velocity</span>
                    <span className="text-4xl font-bold text-cyan-400">{metrics.avgFormationVelocity.toFixed(1)} pts/wk</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 pt-2">
                    <span>0 pts/wk</span>
                    <span>10 pts/wk (Target)</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-4">
                    Average learning velocity is at optimal levels. {Math.round(metrics.completionTrend)}% increase from last period.
                  </p>
                </div>
              </motion.div>

              {/* Top Skill Gaps */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Top Skill Gaps</h2>
                <div className="space-y-3">
                  {metrics.topSkillGaps.map((gap, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + idx * 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-medium">{gap.skill}</span>
                        <span className="text-slate-500 text-sm">{gap.gap} students</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(gap.gap / 100) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <p className="text-slate-400 text-sm mt-6">
                  Recommended: Prioritize System Design and ML modules in upcoming curriculum.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Cohorts Tab */}
        {activeTab === 'cohorts' && (
          <motion.div
            key="cohorts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {cohorts.map((cohort, idx) => (
              <motion.div
                key={cohort.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{cohort.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      {cohort.activeStudents}/{cohort.totalStudents} active students
                    </p>
                  </div>
                  <div className={`text-2xl font-bold ${
                    cohort.completionRate > 85 ? 'text-emerald-400' :
                    cohort.completionRate > 75 ? 'text-cyan-400' :
                    cohort.completionRate > 65 ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {cohort.completionRate.toFixed(1)}%
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase mb-2">Capability Score</p>
                    <p className="text-2xl font-bold text-blue-400">{cohort.avgCapability.toFixed(1)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase mb-2">Readiness Score</p>
                    <p className="text-2xl font-bold text-emerald-400">{cohort.avgReadiness.toFixed(1)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase mb-2">Formation Velocity</p>
                    <p className="text-2xl font-bold text-cyan-400">{cohort.formationVelocity.toFixed(1)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase mb-2">Performance Dist.</p>
                    <div className="flex gap-1">
                      <div className="w-1 h-8 bg-emerald-500 rounded-full opacity-80" title="Excellent"></div>
                      <div className="w-1 h-8 bg-blue-500 rounded-full opacity-80" title="Good"></div>
                      <div className="w-1 h-8 bg-amber-500 rounded-full opacity-80" title="Developing"></div>
                      <div className="w-1 h-8 bg-red-500 rounded-full opacity-80" title="Needs Support"></div>
                    </div>
                  </div>
                </div>

                {/* Performance Distribution */}
                <div className="mb-6">
                  <h4 className="text-slate-300 font-semibold mb-3">Student Performance Distribution</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="h-16 bg-emerald-500/20 rounded-lg flex items-end justify-center pb-2 border border-emerald-500/30">
                        <span className="text-emerald-400 font-bold">{cohort.performanceMetrics.excellent}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Excellent</p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 bg-blue-500/20 rounded-lg flex items-end justify-center pb-2 border border-blue-500/30">
                        <span className="text-blue-400 font-bold">{cohort.performanceMetrics.good}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Good</p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 bg-amber-500/20 rounded-lg flex items-end justify-center pb-2 border border-amber-500/30">
                        <span className="text-amber-400 font-bold">{cohort.performanceMetrics.developing}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Developing</p>
                    </div>
                    <div className="text-center">
                      <div className="h-16 bg-red-500/20 rounded-lg flex items-end justify-center pb-2 border border-red-500/30">
                        <span className="text-red-400 font-bold">{cohort.performanceMetrics.needsSupport}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Needs Support</p>
                    </div>
                  </div>
                </div>

                {/* Top Skills */}
                <div>
                  <h4 className="text-slate-300 font-semibold mb-3">Top Skills in Cohort</h4>
                  <div className="space-y-2">
                    {cohort.topSkills.map((skill, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-slate-300">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.proficiency}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            />
                          </div>
                          <span className="text-sm text-slate-500 w-12 text-right">{skill.proficiency}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && metrics && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8 backdrop-blur"
            >
              <h3 className="text-2xl font-bold text-white mb-3">Key Insight: Velocity Momentum</h3>
              <p className="text-slate-300 mb-4">
                Formation velocity has increased by {metrics.completionTrend}% in the last period, indicating strong program effectiveness. Q1 cohorts are significantly outperforming curriculum expectations.
              </p>
              <p className="text-slate-400 text-sm">Recommendation: Replicate Q1 methodology across Q2 cohorts to maintain momentum.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-8 backdrop-blur"
            >
              <h3 className="text-2xl font-bold text-white mb-3">Readiness Status: On Track</h3>
              <p className="text-slate-300 mb-4">
                {metrics.overallReadiness.veryReady + metrics.overallReadiness.ready} out of {metrics.totalStudents} students ({Math.round(((metrics.overallReadiness.veryReady + metrics.overallReadiness.ready) / metrics.totalStudents) * 100)}%) are interview-ready. This exceeds industry benchmarks.
              </p>
              <p className="text-slate-400 text-sm">Action: Focus support on {metrics.overallReadiness.developing} students still in development phase to reach 95% readiness.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8 backdrop-blur"
            >
              <h3 className="text-2xl font-bold text-white mb-3">Curriculum Gaps: System Design Priority</h3>
              <p className="text-slate-300 mb-4">
                System Design is the most prevalent skill gap, affecting {metrics.topSkillGaps[0].gap} students across cohorts. This is critical for senior-level interviews.
              </p>
              <p className="text-slate-400 text-sm">Recommendation: Introduce advanced architecture workshop next cycle. Consider peer mentorship program between Q1-Q2 cohorts.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur"
            >
              <h3 className="text-2xl font-bold text-white mb-3">Engagement Trends: Positive Growth</h3>
              <p className="text-slate-300 mb-4">
                Current engagement rate of {metrics.engagementRate}% indicates high student participation. Institutional health score of {metrics.institutionalHealth}% suggests healthy program ecosystem.
              </p>
              <p className="text-slate-400 text-sm">Best Practice: Maintain current mentorship support levels and expand peer learning groups for maximum effectiveness.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
