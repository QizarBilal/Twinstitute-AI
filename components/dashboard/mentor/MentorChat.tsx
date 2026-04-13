'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COLORS, TYPOGRAPHY, SPACING, MOTION } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'
import {
  synthesizeConsensus,
  generateCareerAgentResponse,
  generateSkillAgentResponse,
  generateExecutionAgentResponse,
  generateRiskAgentResponse,
  generateEvaluationAgentResponse,
  type MentorContext,
  type AgentResponse,
  type MentorConsensus,
} from '@/lib/services/mentor-utils'
import TypingIndicator from '@/components/shared/animations/TypingIndicator'

interface Message {
  id: string
  role: 'user' | 'mentor'
  content: string
  timestamp: Date
  agentResponses?: AgentResponse[]
  synthesized?: boolean
  confidence?: number
}

interface MentorChatProps {
  onSuggestionSelect?: (suggestion: string) => void
}

export default function MentorChat({ onSuggestionSelect }: MentorChatProps) {
  // Fetch context data
  const { data: twin } = useDataFetch('/api/user/twin')
  const { data: genome } = useDataFetch('/api/genome')
  const { data: recentPerformance } = useDataFetch('/api/user/recent-performance')

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'mentor',
      content: `Hey! I'm your AI mentor, powered by five specialized agents: 🎯Career Intelligence, 📚Skill Development, ⚡Execution, ⚠️Risk Assessment, and 📊Evaluation.\n\nI understand your goals, analyze your progress, and guide your next moves. Ask me anything about your career path, skills, performance, or how to overcome challenges.`,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Build mentor context
  const mentorContext: MentorContext = {
    twin,
    genome,
    recentPerformance,
  }

  // Handle message submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      // Generate all agent responses
      const agentResponses: AgentResponse[] = [
        generateCareerAgentResponse(userMessage.content, mentorContext),
        generateSkillAgentResponse(userMessage.content, mentorContext),
        generateExecutionAgentResponse(userMessage.content, mentorContext),
        generateRiskAgentResponse(userMessage.content, mentorContext),
        generateEvaluationAgentResponse(userMessage.content, mentorContext),
      ]

      // Synthesize consensus
      const consensus = synthesizeConsensus(userMessage.content, agentResponses)

      // Create mentor response
      const avgConfidence =
        agentResponses.reduce((sum, r) => sum + r.confidence, 0) / agentResponses.length

      const mentorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'mentor',
        content: consensus.synthesizedAdvice,
        timestamp: new Date(),
        agentResponses,
        synthesized: true,
        confidence: avgConfidence,
      }

      setMessages(prev => [...prev, mentorMessage])
      inputRef.current?.focus()
    } catch (error) {
      console.error('Error generating mentor response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'mentor',
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion)
    onSuggestionSelect?.(suggestion)
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: COLORS.background.primary,
        color: COLORS.text.primary,
      }}
    >
      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin"
        style={{
          scrollbarColor: `${COLORS.accent.primary} ${COLORS.background.secondary}`,
        }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl w-full ${
                  message.role === 'user'
                    ? 'px-4 py-3 rounded-lg'
                    : 'px-4 py-3 rounded-lg border-l-2'
                }`}
                style={{
                  backgroundColor:
                    message.role === 'user'
                      ? COLORS.background.secondary
                      : 'transparent',
                  borderLeftColor:
                    message.role === 'mentor' ? COLORS.accent.primary : 'transparent',
                  borderColor:
                    message.role === 'user'
                      ? COLORS.background.tertiary
                      : 'transparent',
                }}
              >
                {/* Message Content */}
                {message.role === 'mentor' && message.synthesized ? (
                  <div className="space-y-4">
                    {/* Synthesized Message */}
                    <div>
                      <p
                        className="text-sm leading-relaxed whitespace-pre-line"
                        style={{ color: COLORS.text.primary }}
                      >
                        {message.content}
                      </p>
                      {message.confidence && (
                        <div className="mt-3 flex items-center gap-2">
                          <span
                            className="text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            Confidence:
                          </span>
                          <div
                            className="flex-1 h-1 rounded-full overflow-hidden"
                            style={{ backgroundColor: COLORS.background.tertiary }}
                          >
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${message.confidence * 100}%`,
                                backgroundColor: COLORS.accent.primary,
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-medium"
                            style={{ color: COLORS.accent.primary }}
                          >
                            {(message.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Agent Responses Expandable */}
                    {message.agentResponses && message.agentResponses.length > 0 && (
                      <div className="border-t" style={{ borderColor: COLORS.background.tertiary }}>
                        <button
                          onClick={() =>
                            setExpandedAgent(
                              expandedAgent === message.id ? null : message.id
                            )
                          }
                          className="w-full py-2 px-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide transition-colors"
                          style={{
                            color: COLORS.accent.primary,
                          }}
                        >
                          <span>View Agent Insights ({message.agentResponses.length})</span>
                          <span
                            className={`transition-transform ${
                              expandedAgent === message.id ? 'rotate-180' : ''
                            }`}
                          >
                            ▼
                          </span>
                        </button>

                        <AnimatePresence>
                          {expandedAgent === message.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-2 pt-2"
                            >
                              {message.agentResponses.map(agent => (
                                <div
                                  key={agent.agentId}
                                  className="p-2 rounded border"
                                  style={{
                                    backgroundColor: COLORS.background.secondary,
                                    borderColor: COLORS.background.tertiary,
                                  }}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="text-lg">{agent.emoji}</span>
                                    <div className="flex-1">
                                      <div className="font-semibold text-xs flex items-center justify-between">
                                        <span>{agent.agentName}</span>
                                        <span
                                          className="text-xs"
                                          style={{ color: COLORS.accent.primary }}
                                        >
                                          {(agent.confidence * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                      <p
                                        className="text-xs mt-1 leading-relaxed"
                                        style={{ color: COLORS.text.secondary }}
                                      >
                                        {agent.recommendation}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                ) : (
                  <p
                    style={{ color: COLORS.text.primary }}
                    className="text-sm leading-relaxed"
                  >
                    {message.content}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg">
              <TypingIndicator />
              <span
                className="text-xs"
                style={{ color: COLORS.text.secondary }}
              >
                Analyzing context across 5 mentor perspectives...
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions (if last message is initial greeting) */}
      {messages.length === 1 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 py-4 border-t"
          style={{ borderColor: COLORS.background.tertiary }}
        >
          <p
            className="text-xs font-semibold uppercase mb-3"
            style={{ color: COLORS.text.secondary }}
          >
            Quick Prompts
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              '📈 How am I progressing?',
              '🎯 What should I focus on next?',
              '⚠️ Am I burning out?',
              '📚 What skills should I learn?',
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleQuickSuggestion(suggestion)}
                className="p-2 rounded border text-xs transition-all hover:border-opacity-100"
                style={{
                  borderColor: COLORS.accent.primary,
                  color: COLORS.accent.primary,
                  backgroundColor: COLORS.background.secondary,
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t p-4"
        style={{ borderColor: COLORS.background.tertiary }}
      >
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask your mentor anything about your growth..."
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:border-opacity-100 transition-colors text-sm"
            style={{
              backgroundColor: COLORS.background.secondary,
              borderColor: COLORS.background.tertiary,
              color: COLORS.text.primary,
            }}
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: COLORS.accent.primary,
              color: COLORS.background.primary,
              opacity: loading || !inputValue.trim() ? 0.6 : 1,
            }}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
