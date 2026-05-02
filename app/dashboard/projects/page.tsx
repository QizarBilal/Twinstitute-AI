'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  Zap,
  Code2,
  Loader,
  ArrowRight,
  Sparkles,
  BookOpen,
  Plus,
  AlertCircle,
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  skills: string[]
  status: 'Not Started' | 'In Progress' | 'Completed'
  progress?: number
  timeSpent?: number
  estimatedDuration: number
  lastActivity?: string
}

interface PipelineItem {
  id: string
  name: string
  status: 'Compiling' | 'Pending' | 'Ready'
  estimatedTime: number
}

export default function ProjectLabPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [pipeline, setPipeline] = useState<PipelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'projects' | 'execution'>('projects')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      // Fetch task queue from API
      const queueRes = await fetch('/api/labs/queue')
      const queueData = await queueRes.json()
      const proofProjectRaw = typeof window !== 'undefined'
        ? window.localStorage.getItem('twinstitute:selected-proof-project')
        : null

      if (queueData.queue) {
        const queue = queueData.queue
        const nextTasks = Array.isArray(queue.nextTasks) ? queue.nextTasks : []
        const recommendedTasks = Array.isArray(queue.recommendedTasks) ? queue.recommendedTasks : []
        
        // Transform queue into projects format
        const projects: Project[] = nextTasks.map((task: any, idx: number) => ({
          id: task.id,
          name: task.title,
          description: task.description,
          difficulty: task.difficulty > 7 ? 'Hard' : task.difficulty > 4 ? 'Medium' : 'Easy',
          skills: task.skillsFocused || [],
          status: idx === 0 ? 'In Progress' : 'Not Started',
          progress: idx === 0 ? 45 : 0,
          timeSpent: idx === 0 ? 3 : 0,
          estimatedDuration: Math.round(task.estimatedTime / 60),
          lastActivity: idx === 0 ? '1 hour ago' : undefined,
        }))

        // Add recommended tasks
        const recommendedProjects: Project[] = recommendedTasks
          .slice(0, 2)
          .map((task: any) => ({
            id: task.id,
            name: task.title,
            description: task.description,
            difficulty: task.difficulty > 7 ? 'Hard' : task.difficulty > 4 ? 'Medium' : 'Easy',
            skills: task.skillsFocused || [],
            status: 'Not Started' as const,
            progress: 0,
            timeSpent: 0,
            estimatedDuration: Math.round(task.estimatedTime / 60),
          }))

        const combinedProjects = [...projects, ...recommendedProjects]

        let proofProject: Project | null = null
        if (proofProjectRaw) {
          try {
            proofProject = JSON.parse(proofProjectRaw) as Project
          } catch {
            proofProject = null
          }
        }

        const nextProjects = proofProject
          ? [proofProject, ...combinedProjects.filter(project => project.id !== proofProject.id)]
          : combinedProjects

        setProjects(nextProjects)
        setActiveProject(proofProject || nextProjects[0] || null)

        // Simulate pipeline with generating tasks
        const mockPipeline: PipelineItem[] = [
          { 
            id: '1', 
            name: 'Advanced System Design Challenge', 
            status: 'Compiling', 
            estimatedTime: 2 
          },
          {
            id: '2',
            name: 'Real-time Data Processing Pipeline',
            status: 'Pending',
            estimatedTime: 5,
          },
        ]
        setPipeline(mockPipeline)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
      // Fallback to demo data
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Build Production API',
          description: 'Design and implement a scalable REST API with proper error handling',
          difficulty: 'Hard',
          skills: ['Node.js', 'REST APIs', 'Database Design'],
          status: 'In Progress',
          progress: 65,
          timeSpent: 8.5,
          estimatedDuration: 12,
          lastActivity: '2 hours ago',
        },
      ]
      setProjects(mockProjects)
      setActiveProject(mockProjects[0])
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
      case 'Medium':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      case 'Hard':
        return 'bg-red-500/10 border-red-500/30 text-red-300'
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-300'
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-300'
      default:
        return 'bg-gray-500/10 text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />
      case 'In Progress':
        return <Loader className="w-4 h-4 animate-spin" />
      default:
        return <Play className="w-4 h-4" />
    }
  }

  const getPipelineStatusColor = (status: string) => {
    switch (status) {
      case 'Compiling':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      case 'Pending':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300'
      case 'Ready':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-300'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Project Lab</h1>
          <p className="text-gray-400 text-sm mt-1">
            Design, execute, and evaluate larger multi-day capstone modules.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Suggest New Project
        </motion.button>
      </motion.div>

      {/* AI GENERATION STATUS (REDESIGNED) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm hover:border-gray-700 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
            >
              <Sparkles className="w-6 h-6 text-blue-400" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-white mb-1">AI Project Generation in Progress</h3>
              <p className="text-sm text-gray-400">
                Autonomous agents are compiling verified multi-day projects fitted to your capability level.
                They evaluate GitHub repos directly, enforcing test-driven execution.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex gap-3"
            >
              <span className="px-3 py-1 bg-gray-800 rounded text-xs font-semibold text-gray-300">
                Compiling
              </span>
              <span className="px-3 py-1 bg-gray-800 rounded text-xs font-semibold text-gray-300">
                Pending
              </span>
            </motion.div>
            <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'projects'
              ? 'text-cyan-400 border-cyan-500/50'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Available Projects
        </button>
        <button
          onClick={() => setActiveTab('execution')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'execution'
              ? 'text-cyan-400 border-cyan-500/50'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Current Execution
        </button>
      </div>

      {/* ACTIVE PROJECTS SECTION */}
      <AnimatePresence mode="wait">
        {activeTab === 'projects' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 animate-pulse"
                  >
                    <div className="h-6 bg-gray-800 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-gray-800 rounded w-full mb-3" />
                    <div className="h-4 bg-gray-800 rounded w-2/3 mb-4" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-800 rounded-full w-16" />
                      <div className="h-6 bg-gray-800 rounded-full w-16" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => setActiveProject(project)}
                    className="group bg-gray-900/50 border border-gray-800 hover:border-blue-600/30 rounded-lg p-6 cursor-pointer transition-all"
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-white text-lg group-hover:text-cyan-300 transition-colors">
                        {project.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold border flex items-center gap-1 ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {getStatusIcon(project.status)}
                        {project.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Difficulty & Skills */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold border ${getDifficultyColor(
                          project.difficulty
                        )}`}
                      >
                        {project.difficulty}
                      </span>
                      {project.skills.slice(0, 2).map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-1 rounded text-xs bg-gray-800/50 text-gray-300 border border-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Progress Bar (if in progress or completed) */}
                    {project.progress !== undefined && project.progress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Progress</span>
                          <span className="text-xs font-semibold text-cyan-300">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-t border-gray-800">
                      <div className="flex items-center gap-1 pt-4">
                        <Clock className="w-3.5 h-3.5" />
                        {project.timeSpent ? `${project.timeSpent}h / ${project.estimatedDuration}h` : `${project.estimatedDuration}h est.`}
                      </div>
                      {project.lastActivity && (
                        <span className="text-gray-600">{project.lastActivity}</span>
                      )}
                    </div>

                    {/* CTA */}
                    <motion.button
                      whileHover={{ x: 4 }}
                      className="w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      {project.status === 'In Progress' ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Continue Project
                        </>
                      ) : project.status === 'Completed' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          View Results
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Start Project
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState onStart={() => setActiveTab('execution')} />
            )}

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-300 font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4" />
                Resume Last Project
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-300 font-medium flex items-center justify-center gap-2 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                View All Projects
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-300 font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Code2 className="w-4 h-4" />
                Open Code Lab
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CURRENT EXECUTION PANEL */}
      <AnimatePresence mode="wait">
        {activeTab === 'execution' && activeProject && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-lg p-8 backdrop-blur-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Current Task */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Current Task
                  </p>
                  <p className="text-lg font-semibold text-white">{activeProject.name}</p>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                    {activeProject.description}
                  </p>
                </div>

                {/* Time Spent */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Time Spent
                  </p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {activeProject.timeSpent || 0}h
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    of {activeProject.estimatedDuration}h
                  </p>
                </div>

                {/* Progress */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Progress
                  </p>
                  <p className="text-3xl font-bold text-blue-400">
                    {activeProject.progress || 0}%
                  </p>
                  <div className="w-full h-1 bg-gray-800 rounded mt-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${activeProject.progress || 0}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    />
                  </div>
                </div>

                {/* Last Activity */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Last Activity
                  </p>
                  <p className="text-white font-semibold">
                    {activeProject.lastActivity || 'Not started'}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-3 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-all"
                  >
                    Resume
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* PROJECT PIPELINE */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Generation Pipeline</h3>
              <div className="space-y-3">
                {pipeline.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`border rounded-lg p-4 flex items-center justify-between backdrop-blur-sm ${getPipelineStatusColor(
                      item.status
                    )}`}
                  >
                    <div className="flex items-center gap-3">
                      {item.status === 'Compiling' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Zap className="w-5 h-5" />
                        </motion.div>
                      ) : item.status === 'Pending' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs opacity-75">
                          Estimated: {item.estimatedTime}h
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold uppercase">
                      {item.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* EMPTY STATE COMPONENT */
function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-5xl mb-4 opacity-50"
      >
        <Code2 className="w-16 h-16 mx-auto text-gray-600" />
      </motion.div>
      <h3 className="text-xl font-semibold text-white mb-2">
        No projects started yet
      </h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Begin your first project to start building real-world capabilities through hands-on execution.
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all inline-flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Start Your First Project
      </motion.button>
    </motion.div>
  )
}
