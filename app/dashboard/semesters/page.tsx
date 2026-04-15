'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface WeeklyProgress {
  weekStart: string
  weekEnd: string
  tasksCompleted: number
  timeSpent: number
  modulesStarted: number
  modulesCompleted: number
  progressPercentage: number
}

interface DailyActivity {
  date: string
  tasksCompleted: number
  timeSpentMinutes: number
  skillsImproved: number
}

interface SemesterData {
  semesterName: string
  startDate: string
  endDate: string
  totalWeeks: number
  currentWeek: number
  weeklyProgress: WeeklyProgress[]
  dailyActivity: DailyActivity[]
  monthlyCompletion: Record<string, number>
  learningVelocity: number
  averageTimePerTask: number
  consistencyScore: number
  totalTasksCompleted: number
  totalTimeSpent: number
}

export default function SemestersPage() {
  const [data, setData] = useState<SemesterData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSemesterProgress()
  }, [])

  const fetchSemesterProgress = async () => {
    try {
      const res = await fetch('/api/semesters/progress')
      const result = await res.json()
      setData(result.data)
    } catch (error) {
      console.error('Failed to fetch semester progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading semester data...</span>
        </div>
      </div>
    )
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }

  // Last 7 days of activity for heatmap
  const last7Days = data.dailyActivity.slice(-7)

  return (
    <div className="px-8 py-8 space-y-6 min-h-screen bg-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl"
      >
        <h1 className="text-3xl font-bold text-white mb-2">📚 Semester Overview</h1>
        <p className="text-slate-400">{data.semesterName}</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Week Progress</div>
          <div className="text-3xl font-bold text-blue-400">{data.currentWeek}/{data.totalWeeks}</div>
          <p className="text-xs text-slate-500 mt-2">{Math.round((data.currentWeek / data.totalWeeks) * 100)}% through</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Learning Velocity</div>
          <div className="text-3xl font-bold text-emerald-400">{data.learningVelocity}</div>
          <p className="text-xs text-slate-500 mt-2">tasks/week</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Avg Time/Task</div>
          <div className="text-3xl font-bold text-cyan-400">{data.averageTimePerTask}</div>
          <p className="text-xs text-slate-500 mt-2">minutes</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Consistency</div>
          <div className="text-3xl font-bold text-purple-400">{data.consistencyScore}%</div>
          <p className="text-xs text-slate-500 mt-2">last 30 days</p>
        </div>
      </motion.div>

      {/* Total Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Semester Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">Total Tasks Completed</p>
            <p className="text-3xl font-bold text-slate-200">{data.totalTasksCompleted}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Total Time Invested</p>
            <p className="text-3xl font-bold text-slate-200">{formatTime(data.totalTimeSpent)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Semester Duration</p>
            <p className="text-3xl font-bold text-slate-200">{data.totalWeeks} weeks</p>
          </div>
        </div>
      </motion.div>

      {/* Activity Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Last 7 Days Activity</h3>
        <div className="grid grid-cols-7 gap-2">
          {last7Days.length > 0 ? (
            last7Days.map((day) => {
              const intensity = Math.min(day.tasksCompleted / 3, 1) // Normalize to 0-1
              return (
                <div key={day.date} className="text-center">
                  <div
                    className={`w-full aspect-square rounded-lg mb-2 flex items-center justify-center font-semibold transition-all ${
                      day.tasksCompleted === 0
                        ? 'bg-slate-800 text-slate-600'
                        : intensity < 0.33
                        ? 'bg-blue-900/40 text-blue-300'
                        : intensity < 0.67
                        ? 'bg-blue-700/60 text-blue-200'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {day.tasksCompleted}
                  </div>
                  <p className="text-xs text-slate-500">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              )
            })
          ) : (
            <p className="text-slate-500 col-span-7 text-center py-8">No activity data available</p>
          )}
        </div>
      </motion.div>

      {/* Weekly Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Weekly Progress</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {data.weeklyProgress.length > 0 ? (
            data.weeklyProgress.map((week, idx) => (
              <div key={idx} className="border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">Week {idx + 1}</p>
                    <p className="text-xs text-slate-500">{new Date(week.weekStart).toLocaleDateString()} - {new Date(week.weekEnd).toLocaleDateString()}</p>
                  </div>
                  <span className="text-lg font-bold text-cyan-400">{week.progressPercentage}%</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tasks: {week.tasksCompleted}</p>
                    <p className="text-xs text-slate-500">Time: {formatTime(week.timeSpent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Modules Started: {week.modulesStarted}</p>
                    <p className="text-xs text-slate-500">Modules Completed: {week.modulesCompleted}</p>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${week.progressPercentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No weekly data available</p>
          )}
        </div>
      </motion.div>

      {/* Monthly Summary */}
      {Object.keys(data.monthlyCompletion).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 backdrop-blur-sm"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Completion</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.monthlyCompletion).map(([month, count]) => (
              <div key={month} className="border border-gray-700/50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">{new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                <p className="text-2xl font-bold text-green-400">{count}</p>
                <p className="text-xs text-gray-600">tasks completed</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}