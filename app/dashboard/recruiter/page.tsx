'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { completeInterviewFlow, getInterviewHistory } from '@/lib/api/interviewClient'

interface Question {
  id: string
  text: string
  category: 'behavioral' | 'technical' | 'system-design' | 'problem-solving'
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number
}

interface InterviewResult {
  id: string
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  feedback: string
  detailedScores: {
    technicalDepth: number
    clarity: number
    structure: number
    confidence: number
    completeness: number
  }
}

interface PastInterview {
  id: string
  score: number
  feedback: string
  question: string
  role: string
  createdAt: string
  category: string
  difficulty: string
}

const categoryEmojis: Record<string, string> = {
  behavioral: '🤝',
  technical: '💻',
  'system-design': '🏗️',
  'problem-solving': '🧩',
}

export default function RecruiterEvaluatorPage() {
  const [roleInput, setRoleInput] = useState('Full Stack Developer')
  const [recording, setRecording] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [currentResult, setCurrentResult] = useState<InterviewResult | null>(null)
  const [pastInterviews, setPastInterviews] = useState<PastInterview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [averageScore, setAverageScore] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questionsToShow, setQuestionsToShow] = useState<Question[]>(generateQuestionsForRole('Full Stack Developer'))

  // Load past interviews on mount
  useEffect(() => {
    loadPastInterviews()
  }, [])

  // Timer for recording
  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((t) => t + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [recording])

  const loadPastInterviews = async () => {
    try {
      setLoading(true)
      const result = await getInterviewHistory({ limit: 10 })
      if (result.success && result.data?.interviews) {
        const interviews = result.data.interviews.map((i: any) => ({
          id: i.id,
          score: i.score,
          feedback: i.feedback.substring(0, 80) + '...',
          question: i.question.substring(0, 60) + '...',
          role: i.role,
          category: i.category || 'general',
          difficulty: i.difficulty || 'medium',
          createdAt: new Date(i.storedAt).toLocaleDateString(),
        }))
        setPastInterviews(interviews)

        // Calculate average score
        if (interviews.length > 0) {
          const avg = Math.round(interviews.reduce((sum: number, i: PastInterview) => sum + i.score, 0) / interviews.length)
          setAverageScore(avg)
        }
      }
    } catch (err) {
      console.error('Failed to load past interviews:', err)
    } finally {
      setLoading(false)
    }
  }

  // Generate dynamic question set: 5 soft-skill (behavioral) + 5 role-specific
  function generateQuestionsForRole(role: string): Question[] {
    const softQuestions = [
      `Tell me about a time you had to work with someone difficult. How did you handle it?`,
      `Describe a project where you took on a leadership role. What was the outcome?`,
      `Tell me about a time you failed. What did you learn from it?`,
      `How do you prioritize work when you have multiple competing deadlines?`,
      `Describe a situation where you had to adapt to major changes in a project.`,
    ].map((text, i): Question => ({
      id: `soft-${i + 1}`,
      text,
      category: 'behavioral',
      difficulty: 'medium',
      estimatedTime: 120,
    }))

    // Simple role-based templates — adapt based on keywords in the role name
    const lower = role.toLowerCase()
    let roleQuestions: string[] = []
    if (lower.includes('front') || lower.includes('frontend')) {
      roleQuestions = [
        `How would you optimize the rendering performance of a complex React application?`,
        `Explain how you would structure CSS for a large-scale web app to avoid conflicts.`,
        `How do you approach accessibility (a11y) in front-end development?`,
        `Describe how you would implement client-side caching for API responses.`,
        `Walk me through debugging a tricky UI race condition.`,
      ]
    } else if (lower.includes('back') || lower.includes('backend')) {
      roleQuestions = [
        `How would you design an API to support multi-tenant access with rate limiting?`,
        `Explain your approach to database indexing for large read-heavy tables.`,
        `How do you design systems for fault-tolerance and graceful degradation?`,
        `Describe strategies to prevent and debug memory leaks in server applications.`,
        `How would you implement transactional operations across multiple services?`,
      ]
    } else if (lower.includes('data') || lower.includes('ml') || lower.includes('machine')) {
      roleQuestions = [
        `How would you preprocess messy dataset for a supervised learning model?`,
        `Explain bias-variance tradeoff and how you'd address it in model selection.`,
        `Describe how you'd evaluate model performance in production.`,
        `How would you design an experiment to compare two model variants?`,
        `Explain feature engineering strategies for categorical-heavy datasets.`,
      ]
    } else {
      // Default Full Stack / general software role
      roleQuestions = [
        `Design a URL shortener and describe key components and data model.`,
        `How would you ensure consistency and availability in a distributed system?`,
        `Describe your approach to performance profiling and optimization for a web service.`,
        `How would you secure APIs exposed to third-party clients?`,
        `Explain a challenging bug you fixed and the debugging approach you used.`,
      ]
    }

    const roleQs = roleQuestions.map((text, i): Question => ({
      id: `role-${i + 1}`,
      text,
      category: 'technical',
      difficulty: 'medium',
      estimatedTime: 150,
    }))

    return [...softQuestions.slice(0, 5), ...roleQs.slice(0, 5)]
  }

  const filterQuestions = () => {
    let filtered = generateQuestionsForRole(roleInput)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((q) => q.category === categoryFilter)
    }
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === difficultyFilter)
    }

    if (filtered.length === 0) {
      filtered = generateQuestionsForRole(roleInput)
    }

    setQuestionsToShow(filtered)
    setCurrentQuestionIndex(0)
  }

  useEffect(() => {
    filterQuestions()
  }, [categoryFilter, difficultyFilter])

  useEffect(() => {
    // Regenerate when role changes
    setQuestionsToShow(generateQuestionsForRole(roleInput))
    setCurrentQuestionIndex(0)
  }, [roleInput])

  const currentQuestion =
    questionsToShow[currentQuestionIndex] ||
    questionsToShow[0] ||
    generateQuestionsForRole(roleInput)[0]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      setError(null)
      setTimeElapsed(0)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.')
      console.error('Microphone error:', err)
    }
  }

  const stopRecordingAndEvaluate = async () => {
    try {
      setError(null)
      if (!mediaRecorderRef.current) return

      mediaRecorderRef.current.stop()
      setRecording(false)

      // Wait for the stop event
      await new Promise((resolve) => {
        mediaRecorderRef.current!.onstop = resolve
      })

      // Create blob from chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      audioChunksRef.current = []

      if (audioBlob.size === 0) {
        setError('No audio recorded. Please try again.')
        return
      }

      // Stop audio stream
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())

      // Evaluate
      setEvaluating(true)
      const result = await completeInterviewFlow({
        audioBlob,
        question: currentQuestion.text,
        role: roleInput,
        domain: 'Software Engineering',
        onProgress: (stage: string) => {
          console.log('Interview stage:', stage)
        },
      })

      if (result.success && result.data) {
        setCurrentResult(result.data)
        await loadPastInterviews()
      } else {
        setError(result.error || 'Evaluation failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Evaluation error:', err)
    } finally {
      setEvaluating(false)
    }
  }

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev + 1) % questionsToShow.length)
    setCurrentResult(null)
    setTimeElapsed(0)
  }

  const prevQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev - 1 + questionsToShow.length) % questionsToShow.length)
    setCurrentResult(null)
    setTimeElapsed(0)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400'
      case 'medium':
        return 'text-amber-400'
      case 'hard':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-700/30 pb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Interview Evaluator</h1>
            <p className="text-slate-400 text-sm mt-2">AI-powered mock interviews with real-time evaluation</p>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Role</label>
              <input
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="ml-2 mt-1 bg-slate-900/50 border border-slate-700/30 text-sm text-white rounded px-3 py-2 focus:outline-none"
                placeholder="Finalized Job Role (e.g., Full Stack Developer)"
              />
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-400">{averageScore}%</div>
              <div className="text-xs text-slate-400">Average Score</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="mt-1 bg-slate-900/50 border border-slate-700/30 text-sm text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Categories</option>
              <option value="behavioral">🤝 Behavioral</option>
              <option value="technical">💻 Technical</option>
              <option value="system-design">🏗️ System Design</option>
              <option value="problem-solving">🧩 Problem Solving</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase">Difficulty</label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="mt-1 bg-slate-900/50 border border-slate-700/30 text-sm text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Interview Section */}
        <div className="col-span-8 space-y-6">
          {/* Interview Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-slate-900/50 to-slate-900/20 border border-slate-700/30 rounded-2xl p-8 min-h-[500px] flex flex-col"
          >
            {!currentResult ? (
              <div className="flex-1 flex flex-col justify-between">
                {/* Question Section */}
                <div>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{categoryEmojis[currentQuestion.category]}</span>
                        <div>
                          <span className="text-xs font-semibold text-slate-400 uppercase">
                            Question {currentQuestionIndex + 1} of {questionsToShow.length}
                          </span>
                          <span className={`ml-3 text-xs font-semibold uppercase ${getDifficultyColor(currentQuestion.difficulty)}`}>
                            {currentQuestion.difficulty}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">Est. {currentQuestion.estimatedTime}s</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white leading-relaxed">{currentQuestion.text}</h2>
                  </div>
                </div>

                {/* Recording Indicator */}
                <div className="bg-slate-950 border border-slate-700/50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 font-semibold uppercase mb-2">Recording Status</div>
                      {recording ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-sm font-semibold text-red-400">Recording in progress...</span>
                        </div>
                      ) : evaluating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-spin" />
                          <span className="text-sm font-semibold text-blue-400">Evaluating with AI...</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Ready to record</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Duration</div>
                      <div className={`text-lg font-bold font-mono ${recording ? 'text-red-400' : 'text-slate-400'}`}>
                        {formatTime(timeElapsed)}
                      </div>
                    </div>
                  </div>

                  {/* Waveform Animation */}
                  {recording && (
                    <div className="mt-4 flex items-center justify-center gap-1 h-8">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full"
                          style={{
                            height: recording ? Math.random() * 30 + 4 : 4,
                            animation: recording ? `pulse 0.3s ease-in-out ${i * 0.05}s infinite` : 'none',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-950/50 border border-red-700/50 text-red-300 p-4 rounded-lg text-sm mb-6"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                {/* Controls */}
                <div className="flex gap-3 items-center justify-center">
                  <button
                    onClick={prevQuestion}
                    disabled={evaluating || questionsToShow.length === 1}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg transition-all"
                  >
                    ← Previous
                  </button>

                  <button
                    onClick={recording ? stopRecordingAndEvaluate : startRecording}
                    disabled={evaluating}
                    className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white transition-all shadow-xl disabled:opacity-50 text-lg ${
                      recording
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 scale-105'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/20'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${recording ? 'bg-white animate-pulse' : 'bg-red-300'}`} />
                    {evaluating ? 'Evaluating...' : recording ? '⏹ Stop & Evaluate' : '🎤 Start Recording'}
                  </button>

                  <button
                    onClick={nextQuestion}
                    disabled={evaluating || questionsToShow.length === 1}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              /* Evaluation Results */
              <AnimatePresence mode="wait">
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Overall Score */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-8 text-center"
                  >
                    <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                      {currentResult.score}
                    </div>
                    <div className="text-sm text-slate-300">Overall Performance Score</div>
                    <div className="mt-4 w-full bg-slate-700/30 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${currentResult.score}%` }}
                      />
                    </div>
                  </motion.div>

                  {/* Detailed Scores */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-5 gap-3"
                  >
                    {[
                      { label: 'Technical Depth', score: currentResult.detailedScores.technicalDepth, color: 'from-purple-500' },
                      { label: 'Clarity', score: currentResult.detailedScores.clarity, color: 'from-green-500' },
                      { label: 'Structure', score: currentResult.detailedScores.structure, color: 'from-orange-500' },
                      { label: 'Confidence', score: currentResult.detailedScores.confidence, color: 'from-pink-500' },
                      { label: 'Completeness', score: currentResult.detailedScores.completeness, color: 'from-blue-500' },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4 text-center">
                        <div
                          className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${item.color} to-slate-700 flex items-center justify-center mb-2 border-2 border-slate-600`}
                        >
                          <span className="text-sm font-bold text-white">{item.score}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-300">{item.label}</div>
                      </div>
                    ))}
                  </motion.div>

                  {/* Strengths & Areas to Improve */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-green-900/20 border border-green-700/40 rounded-lg p-4"
                    >
                      <h4 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                        <span>✓</span> Strengths
                      </h4>
                      <ul className="space-y-2">
                        {currentResult.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-slate-300 leading-relaxed">
                            • {s}
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-4"
                    >
                      <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                        <span>⚠</span> Areas to Improve
                      </h4>
                      <ul className="space-y-2">
                        {currentResult.weaknesses.map((w, i) => (
                          <li key={i} className="text-xs text-slate-300 leading-relaxed">
                            • {w}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>

                  {/* Next Steps */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4"
                  >
                    <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                      <span>💡</span> Recommended Next Steps
                    </h4>
                    <ol className="space-y-2">
                      {currentResult.suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-slate-300 leading-relaxed">
                          {i + 1}. {s}
                        </li>
                      ))}
                    </ol>
                  </motion.div>

                  {/* Detailed Feedback */}
                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-slate-300 mb-3">Detailed Feedback</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{currentResult.feedback}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={nextQuestion}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
                    >
                      Next Question →
                    </button>
                    <button
                      onClick={() => {
                        setCurrentResult(null)
                        setTimeElapsed(0)
                      }}
                      className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>

          {/* Question Navigation */}
          {!currentResult && (
            <div className="bg-slate-900/30 border border-slate-700/30 rounded-lg p-4">
              <div className="text-xs text-slate-500 font-semibold uppercase mb-3">Questions Available</div>
              <div className="flex gap-2 flex-wrap">
                {questionsToShow.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(idx)
                      setCurrentResult(null)
                    }}
                    className={`px-3 py-2 rounded text-xs font-semibold transition-all ${
                      idx === currentQuestionIndex
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Performance & History */}
        <div className="col-span-4 space-y-6">
          {/* Performance Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-white">Performance Overview</h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Interviews Completed</span>
                  <span className="font-bold text-cyan-400">{pastInterviews.length}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Average Score</span>
                  <span className="font-bold text-cyan-400">{averageScore}%</span>
                </div>
                <div className="w-full bg-slate-700/30 rounded-full h-1.5">
                  <div
                    className="bg-cyan-500 h-1.5 rounded-full"
                    style={{ width: `${averageScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Best Score</span>
                  <span className="font-bold text-green-400">{Math.max(0, ...pastInterviews.map((i) => i.score))}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Interview History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-white">Recent Interviews</h3>

            {loading ? (
              <div className="text-xs text-slate-400 text-center py-4">Loading...</div>
            ) : pastInterviews.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-8">
                <div className="text-2xl mb-2">🎤</div>
                No interviews yet. Record your first one!
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pastInterviews.map((interview) => (
                  <motion.div
                    key={interview.id}
                    whileHover={{ x: 4 }}
                    className="bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 rounded-lg p-3 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center flex-shrink-0 text-sm ${
                          interview.score >= 75
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : interview.score >= 50
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {interview.score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-300 truncate">{interview.question}</div>
                        <div className="text-xs text-slate-500 mt-1 flex gap-2">
                          <span>{interview.createdAt}</span>
                          <span>•</span>
                          <span>{interview.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
