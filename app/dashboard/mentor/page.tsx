'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useDataFetch } from '@/lib/hooks/useDataFetch'

interface Message {
  id: string
  role: 'user' | 'mentor'
  content: string
  timestamp: Date
}

interface MentorData {
  analysis: string
  insights: string[]
  nextSteps: string[]
  risks: string[]
  metrics: {
    capabilityScore: number
    executionRate: number
    progressCount: number
    progressTotal: number
  }
}

export default function MentorPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mentorData, setMentorData] = useState<MentorData | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: twinData } = useDataFetch('/api/user/twin')
  const { data: performanceData } = useDataFetch('/api/user/recent-performance')
  const { data: labsData } = useDataFetch('/api/labs/progress')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleStartTask = () => {
    router.push('/dashboard/labs')
  }

  const handleImproveSkill = () => {
    router.push('/dashboard/skills')
  }

  const handleViewSkills = () => {
    router.push('/dashboard/skills')
  }

  const handleCheckProgress = () => {
    router.push('/dashboard/analytics')
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) throw new Error('Failed to get mentor response')

      const data = await response.json()
      const mentorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'mentor',
        content: formatMentorResponse(data.data),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, mentorMessage])
      setMentorData(data.data)
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'mentor',
        content: 'I encountered an issue processing your question. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Left Panel - Chat */}
      <div className="flex-1 flex flex-col bg-black border-r border-slate-700/30">
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-b border-slate-700/30 p-6 backdrop-blur">
          <h1 className="text-2xl font-bold text-white mb-2">Mentor</h1>
          <p className="text-slate-400 text-sm">Your personalized intelligence layer for growth and execution</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center"
              >
                <div className="text-center max-w-md">
                  <div className="text-slate-400 text-lg mb-4">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <span className="text-xl">💡</span>
                    </div>
                    Ask about your progress, skills, or next steps. Your mentor analyzes your data to provide actionable guidance.
                  </div>
                  <p className="text-slate-500 text-sm">Example: "How am I doing this week?" or "What should I focus on next?"</p>
                </div>
              </motion.div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl rounded-tr-lg'
                      : 'bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-2xl rounded-tl-lg'
                  } p-4`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      msg.role === 'user' ? 'text-blue-100/50' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2"
              >
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700/30 p-6 bg-slate-900/30 backdrop-blur">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your progress, skills, or next steps..."
              rows={3}
              className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 h-fit rounded-lg transition-all self-end"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Intelligence Board */}
      <div className="w-80 bg-slate-900/50 border-l border-slate-700/30 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="border-b border-slate-700/30 pb-4">
            <h2 className="text-lg font-bold text-white">Intelligence Board</h2>
            <p className="text-xs text-slate-500 mt-1">Real-time mentor context</p>
          </div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-white">Next Steps</h3>
            {mentorData?.nextSteps?.length > 0 ? (
              mentorData.nextSteps.map((step, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-3">
                  <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
                  <p className="text-xs text-slate-600 mt-2">~{2 + idx} hours</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">Ask your mentor for guidance</p>
            )}
          </motion.div>

          {/* Risk Signals */}
          {mentorData?.risks && mentorData.risks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-amber-400">Risk Signals</h3>
              {mentorData.risks.map((risk, idx) => (
                <div key={idx} className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-xs text-amber-200">{risk}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Performance Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 border-t border-slate-700/30 pt-6"
          >
            <h3 className="text-sm font-semibold text-white">Performance Snapshot</h3>
            <div className="grid gap-2">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Capability Score</p>
                <p className="text-xl font-bold text-cyan-400 mt-1">{mentorData?.metrics?.capabilityScore || 0}%</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Execution Rate</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">
                  {mentorData?.metrics?.executionRate || 0}%
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Progress</p>
                <p className="text-xl font-bold text-blue-400 mt-1">
                  {mentorData?.metrics?.progressCount || 0}/{mentorData?.metrics?.progressTotal || 0}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2 border-t border-slate-700/30 pt-6"
          >
            <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
            <button onClick={handleStartTask} className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 rounded-lg px-3 py-2 text-sm text-slate-300 transition-all text-left">
              Start Task
            </button>
            <button onClick={handleImproveSkill} className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 rounded-lg px-3 py-2 text-sm text-slate-300 transition-all text-left">
              Improve Weak Skill
            </button>
            <button onClick={handleViewSkills} className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 rounded-lg px-3 py-2 text-sm text-slate-300 transition-all text-left">
              View Skills
            </button>
            <button onClick={handleCheckProgress} className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 rounded-lg px-3 py-2 text-sm text-slate-300 transition-all text-left">
              Check Progress
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function formatMentorResponse(data: MentorData): string {
  // Return ONLY the analysis for the chat message
  // Insights, nextSteps, risks are displayed in Intelligence Board (no duplication)
  if (!data || !data.analysis) return 'Unable to process response'
  return data.analysis
}
