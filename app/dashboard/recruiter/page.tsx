'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import RecruiterConfidence from '@/components/dashboard/panels/RecruiterConfidence'
import { completeInterviewFlow, getInterviewHistory } from '@/lib/api/interviewClient'

const activeQuestions = [
  'Explain how you would design a scalable URL shortener.',
  'What is the difference between concurrency and parallelism?',
  'How do you handle deadlocks in a distributed database?',
  'Describe a time you failed to meet a project deadline.',
]

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
}

export default function RecruiterSimulatorPage() {
  const [recording, setRecording] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [currentResult, setCurrentResult] = useState<InterviewResult | null>(null)
  const [pastInterviews, setPastInterviews] = useState<PastInterview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Load past interviews on mount
  useEffect(() => {
    loadPastInterviews()
  }, [])

  const loadPastInterviews = async () => {
    try {
      setLoading(true)
      const result = await getInterviewHistory({ limit: 5 })
      if (result.success && result.data?.interviews) {
        setPastInterviews(
          result.data.interviews.map(i => ({
            id: i.id,
            score: i.score,
            feedback: i.feedback.substring(0, 100) + '...',
            question: i.question.substring(0, 50) + '...',
            role: i.role,
            createdAt: new Date(i.storedAt).toLocaleDateString(),
          }))
        )
      }
    } catch (err) {
      console.error('Failed to load past interviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      setError(null)
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
      await new Promise(resolve => {
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
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())

      // Evaluate
      setEvaluating(true)
      const result = await completeInterviewFlow({
        audioBlob,
        question: activeQuestions[currentQuestionIndex],
        role: 'Full Stack Developer',
        domain: 'Software Engineering',
        onProgress: (stage: string) => {
          console.log('Interview stage:', stage)
        },
      })

      if (result.success && result.data) {
        setCurrentResult(result.data)
        // Reload past interviews to include the new one
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
    setCurrentQuestionIndex((prev) => (prev + 1) % activeQuestions.length)
    setCurrentResult(null)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Evaluator Simulator</h1>
          <p className="text-gray-400 text-sm mt-1">
            AI-powered mock interviews with real evaluation and performance tracking.
          </p>
        </div>
        {currentResult && (
          <button
            onClick={nextQuestion}
            className="px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/30 font-medium text-sm rounded-xl hover:bg-blue-600/20 transition-all"
          >
            Next Question →
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 flex flex-col gap-6">
          {/* Live Evaluation Session */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 relative overflow-hidden min-h-[400px] flex flex-col">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Evaluation Session
            </h2>

            {!currentResult ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                <div className="text-sm text-blue-400 font-medium uppercase tracking-widest mb-4">
                  Question {currentQuestionIndex + 1} of {activeQuestions.length}
                </div>
                <h3 className="text-2xl font-bold text-white mb-8 border-l-4 border-blue-500 pl-4 py-2 text-left w-full">
                  {activeQuestions[currentQuestionIndex]}
                </h3>

                <div className="w-full bg-gray-950 border border-gray-800 rounded-xl p-6 relative">
                  <div className="absolute top-4 right-4 flex gap-1">
                    {[0, 1, 2, 3, 4, 5, 6].map(i => (
                      <div
                        key={i}
                        className={`w-1 bg-blue-500 rounded-full transition-all duration-300 ${recording ? 'animate-pulse' : 'opacity-20'}`}
                        style={{ height: recording ? Math.random() * 24 + 4 : 4 }}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 font-medium mb-4 uppercase tracking-widest">
                    Your Answer Feed
                  </div>
                  {recording ? (
                    <p className="text-gray-300 text-left">
                      Recording in progress... <span className="text-blue-500 animate-pulse">●</span>
                    </p>
                  ) : evaluating ? (
                    <p className="text-gray-300 text-center">
                      Evaluating your answer with AI... <span className="text-blue-500 animate-pulse">⟳</span>
                    </p>
                  ) : (
                    <div className="text-gray-600 text-center py-4">
                      Hit record to begin answering. The AI evaluator will analyze audio, clarity, and technical depth.
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 w-full bg-red-900/20 border border-red-700/50 text-red-300 p-4 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              /* Evaluation Results */
              <div className="flex-1 space-y-6">
                {/* Score Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-8"
                >
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold text-blue-400 mb-2">{currentResult.score}</div>
                    <div className="text-sm text-gray-400">Overall Score</div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { label: 'Tech Depth', score: currentResult.detailedScores.technicalDepth },
                      { label: 'Clarity', score: currentResult.detailedScores.clarity },
                      { label: 'Structure', score: currentResult.detailedScores.structure },
                      { label: 'Confidence', score: currentResult.detailedScores.confidence },
                      { label: 'Completeness', score: currentResult.detailedScores.completeness },
                    ].map((item, i) => (
                      <div key={i} className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full border-2 border-blue-500 flex items-center justify-center mb-2">
                          <span className="text-sm font-bold text-blue-400">{item.score}</span>
                        </div>
                        <div className="text-xs text-gray-400">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Strengths */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-green-900/10 border border-green-700/30 rounded-lg p-4"
                  >
                    <h4 className="text-sm font-semibold text-green-400 mb-3">✓ Strengths</h4>
                    <ul className="space-y-2">
                      {currentResult.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-gray-300">
                          • {s}
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Weaknesses */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-amber-900/10 border border-amber-700/30 rounded-lg p-4"
                  >
                    <h4 className="text-sm font-semibold text-amber-400 mb-3">⚠ Areas to Improve</h4>
                    <ul className="space-y-2">
                      {currentResult.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-gray-300">
                          • {w}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Suggestions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-900/10 border border-blue-700/30 rounded-lg p-4"
                >
                  <h4 className="text-sm font-semibold text-blue-400 mb-3">💡 Next Steps</h4>
                  <ul className="space-y-2">
                    {currentResult.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-gray-300">
                        {i + 1}. {s}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Full Feedback */}
                <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Detailed Feedback</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{currentResult.feedback}</p>
                </div>
              </div>
            )}

            {/* Record Button */}
            {!currentResult && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={recording ? stopRecordingAndEvaluate : startRecording}
                  disabled={evaluating}
                  className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white transition-all shadow-xl disabled:opacity-50 ${
                    recording
                      ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 scale-105'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${recording ? 'bg-white animate-pulse' : 'bg-red-400'}`} />
                  {evaluating ? 'Evaluating...' : recording ? 'Stop & Evaluate' : 'Begin Recording'}
                </button>
              </div>
            )}
          </div>

          {/* Past Interviews */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Past Interview Feedback
            </h3>
            {loading ? (
              <div className="text-sm text-gray-400">Loading interview history...</div>
            ) : pastInterviews.length === 0 ? (
              <div className="text-sm text-gray-400">No past interviews yet. Start by recording an answer!</div>
            ) : (
              <div className="space-y-3">
                {pastInterviews.map(f => (
                  <div key={f.id} className="flex items-center gap-4 bg-gray-800 p-4 rounded-xl hover:bg-gray-700/50 transition-all">
                    <div
                      className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold ${
                        f.score >= 70
                          ? 'border-green-500 text-green-400 bg-green-600/10'
                          : 'border-amber-500 text-amber-400 bg-amber-600/10'
                      }`}
                    >
                      {f.score}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-200">{f.createdAt}</div>
                      <div className="text-xs text-gray-400 mt-1">{f.feedback}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-4">
          <RecruiterConfidence />
        </div>
      </div>
    </div>
  )
}
