/**
 * ORIENTATION CONVERSATIONAL ENGINE
 * Two-panel conversational UI with real mentor experience
 * Not a form. Not a chatbot. A real intelligent guide.
 */

'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, ArrowRight, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import FlowSelectionScreen from './FlowSelectionScreen'
import WorkflowInputForm from './WorkflowInputForm'

interface Message {
  id: string
  role: 'mentor' | 'user'
  content: string
  timestamp: number
  insights?: any
}

interface UIState {
  type: 'input' | 'roles' | 'comparison' | 'decision' | 'confirmation' | 'completion'
  data: any
}

interface StateSnapshot {
  messages: Message[]
  currentUI: UIState | null
  selectedWorkflow: string | null
}

export default function TheOrientationConversationalEngine() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUI, setCurrentUI] = useState<UIState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [flowStarted, setFlowStarted] = useState(false)
  const [stateHistory, setStateHistory] = useState<StateSnapshot[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Create a snapshot of current state
  const createStateSnapshot = useCallback((): StateSnapshot => {
    return {
      messages,
      currentUI,
      selectedWorkflow,
    }
  }, [messages, currentUI, selectedWorkflow])

  // Save state to history
  const saveToHistory = useCallback(() => {
    const snapshot = createStateSnapshot()
    setStateHistory(prev => {
      const newHistory = prev.slice(0, currentHistoryIndex + 1)
      newHistory.push(snapshot)
      return newHistory
    })
    setCurrentHistoryIndex(prev => prev + 1)
  }, [createStateSnapshot])

  // Go back to previous state
  const goBack = useCallback(() => {
    if (currentHistoryIndex > -1) {
      const newIndex = Math.max(-1, currentHistoryIndex - 1)
      
      if (newIndex === -1) {
        // Reset to initial state
        setMessages([])
        setCurrentUI(null)
        setSelectedWorkflow(null)
        setFlowStarted(false)
      } else {
        const snapshot = stateHistory[newIndex]
        setMessages(snapshot.messages)
        setCurrentUI(snapshot.currentUI)
        setSelectedWorkflow(snapshot.selectedWorkflow)
      }
      
      setCurrentHistoryIndex(newIndex)
    }
  }, [currentHistoryIndex, stateHistory])

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = useCallback(
    async (action: string, input: any) => {
      try {
        // Only save to history if this is a meaningful state change
        if (action !== 'start') {
          saveToHistory()
        }
        
        setIsLoading(true)

        // Add user message to chat
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: typeof input === 'string' ? input : JSON.stringify(input),
          timestamp: Date.now(),
        }
        setMessages(prev => [...prev, userMessage])

        // Call agent API
        const response = await fetch('/api/orientation/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, input }),
        })

        const data = await response.json()

        if (response.ok) {
          // Add mentor message
          const mentorMessage: Message = {
            id: `mentor-${Date.now()}`,
            role: 'mentor',
            content: data.message,
            timestamp: Date.now(),
            insights: data.insights,
          }
          setMessages(prev => [...prev, mentorMessage])

          // Update UI state
          setCurrentUI(data.ui)
        } else {
          console.error('Agent error:', data)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
        setUserInput('')
      }
    },
    [saveToHistory]
  )

  // Handle workflow selection from FlowSelectionScreen
  const handleWorkflowSelect = (workflowId: 'goal' | 'compare' | 'explore') => {
    setSelectedWorkflow(workflowId)
    setFlowStarted(true)
    
    // Start the selected workflow
    sendMessage('select-workflow', { workflow: workflowId })
  }

  // Handle role selection
  const handleSelectRoles = (selectedRoles: string[]) => {
    sendMessage('select-roles', { selectedRoles })
  }

  // Handle role decision
  const handleSelectRole = (roleId: string) => {
    sendMessage('finalize-role', { selectedRole: roleId })
  }

  // Handle workflow selection in the UI
  const handleWorkflowSelection = (workflowId: string) => {
    sendMessage('workflow-option-select', { option: workflowId })
  }

  // If flow hasn't started, show the workflow selection screen
  if (!flowStarted) {
    return <FlowSelectionScreen onWorkflowSelect={handleWorkflowSelect} />
  }

  // After workflow is selected, show the conversational UI
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen bg-black overflow-hidden">
      {/* LEFT PANEL - CONVERSATION */}
      <div className="flex flex-col border-r border-gray-800 h-full overflow-hidden">
        {/* Header with back button */}
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between flex-shrink-0">
          <button
            onClick={goBack}
            disabled={currentHistoryIndex <= -1}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Go back to previous state"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold">Career Mentor</h1>
              <p className="text-gray-400 text-sm">Let's find your path together</p>
            </div>
          </div>
          
          {/* Logo */}
          <div className="w-10 h-10">
            <Image
              src="/Logo.png"
              alt="Twinstitute Logo"
              width={40}
              height={40}
              loading="eager"
              className="rounded-lg w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {messages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm'
                  } px-4 py-3`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50 flex-shrink-0 overflow-y-auto max-h-[40vh]">
          {currentUI?.type === 'input' && currentUI.data.type === 'workflow-selection' ? (
            <div className="space-y-2">
              {currentUI.data.options?.map((option: any) => (
                <button
                  key={option.id}
                  onClick={() => handleWorkflowSelection(option.id)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-lg border border-gray-700 hover:border-cyan-500 hover:bg-gray-800/50 transition-colors disabled:opacity-50"
                >
                  <div className="font-semibold text-sm text-white">{option.label}</div>
                  <div className="text-xs text-gray-400">{option.description}</div>
                </button>
              ))}
            </div>
          ) : currentUI?.type === 'input' && currentUI.data.type === 'interest-assessment-expanded' ? (
            <WorkflowInputForm
              type="interest-assessment-expanded"
              onSubmit={(data) => sendMessage('assess-interests', data)}
              isLoading={isLoading}
            />
          ) : currentUI?.type === 'input' && currentUI.data.type === 'interest-assessment' ? (
            <WorkflowInputForm
              type="interest-assessment"
              onSubmit={(data) => sendMessage('assess-interests', data)}
              isLoading={isLoading}
            />
          ) : currentUI?.type === 'input' && currentUI.data.questions ? (
            <WorkflowInputForm
              type="skill-entry"
              onSubmit={(data) => sendMessage('submit-target-role', data)}
              isLoading={isLoading}
            />
          ) : currentUI?.type === 'completion' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <button
                onClick={() => {
                  const roleId = currentUI.data.selectedRole?.id || currentUI.data.selectedRole?.name || currentUI.data.selectedRole
                  sendMessage('finalize-role', { selectedRole: roleId, confirmed: true })
                }}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-bold text-sm disabled:opacity-50 transition-colors"
              >
                Start My Learning Roadmap
              </button>
              <button
                onClick={goBack}
                disabled={isLoading || currentHistoryIndex <= 0}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 font-semibold text-sm disabled:opacity-50"
              >
                Go Back
              </button>
            </motion.div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && userInput.trim()) {
                      // Determine action based on context
                      if (currentUI?.type === 'roles') {
                        sendMessage('clarification', { text: userInput })
                      } else {
                        sendMessage('clarification', { input: userInput })
                      }
                    }
                  }}
                  placeholder={currentUI?.type === 'roles' ? "Explain these roles, or ask questions..." : currentUI?.type === 'comparison' ? "Select a role to choose" : "Ask me anything..."}
                  disabled={isLoading}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
                <button
                  onClick={() => {
                    if (userInput.trim()) {
                      if (currentUI?.type === 'roles') {
                        sendMessage('clarification', { text: userInput })
                      } else {
                        sendMessage('clarification', { input: userInput })
                      }
                    }
                  }}
                  disabled={isLoading || !userInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {currentUI?.type === 'roles' && (
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Type "Explain these roles" to learn more, or click a role to analyze it
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - INTELLIGENCE & INSIGHTS */}
      <div className="hidden lg:flex flex-col bg-gray-900/30 border-l border-gray-800 h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-white font-semibold">Your Insights</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {currentUI?.type === 'roles' ? (
            <RolesPanel
              roles={currentUI.data.roles}
              onSelect={handleSelectRoles}
              canMultiSelect={currentUI.data.canMultiSelect}
              isLoading={isLoading}
            />
          ) : currentUI?.type === 'comparison' ? (
            <ComparisonPanel
              data={currentUI.data}
              onSelect={handleSelectRole}
              isLoading={isLoading}
            />
          ) : currentUI?.type === 'completion' ? (
            <CompletionPanel role={currentUI.data.selectedRole} redirect={currentUI.data.redirect} />
          ) : (
            <DefaultInsights insights={messages[messages.length - 1]?.insights} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PANEL COMPONENTS
// ─────────────────────────────────────────────────────────────

function RolesPanel({
  roles,
  onSelect,
  canMultiSelect,
  isLoading,
}: {
  roles: any[]
  onSelect: (ids: string[]) => void
  canMultiSelect?: boolean
  isLoading: boolean
}) {
  const [selected, setSelected] = useState<string[]>([])

  const handleSelect = (roleId: string) => {
    if (canMultiSelect) {
      const newSelected = selected.includes(roleId)
        ? selected.filter(id => id !== roleId)
        : [...selected, roleId]
      setSelected(newSelected)
    } else {
      // For single select, immediately call onSelect with the role
      onSelect([roleId])
      setSelected([roleId])
    }
  }

  const handleConfirm = () => {
    if (selected.length > 0) {
      onSelect(selected)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-cyan-400 text-sm font-semibold">Available Roles</h3>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {roles && roles.length > 0 ? (
          roles.map((role: any) => {
            const roleId = role.id || role.name
            if (!roleId) return null
            return (
              <motion.button
                key={roleId}
                layout
                onClick={() => handleSelect(roleId)}
                disabled={isLoading}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selected.includes(roleId)
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-700 hover:border-cyan-500/50'
                }`}
              >
                <div className="font-semibold text-sm text-white">{role.name || 'Unknown'}</div>
                <div className="text-xs text-gray-400 mt-1">{role.domain || 'N/A'}</div>
                <div className="text-xs text-cyan-300 mt-2">Demand: {role.demandLevel || 'N/A'}</div>
              </motion.button>
            )
          })
        ) : (
          <p className="text-gray-400 text-sm">No roles available</p>
        )}
      </div>
      {canMultiSelect && selected.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleConfirm}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold text-sm disabled:opacity-50"
        >
          Compare {selected.length} Role{selected.length !== 1 ? 's' : ''}
          <ArrowRight className="w-4 h-4 inline ml-2" />
        </motion.button>
      )}
    </div>
  )
}

function ComparisonPanel({
  data,
  onSelect,
  isLoading,
}: {
  data: any
  onSelect: (roleId: string) => void
  isLoading: boolean
}) {
  const comparisonRoles = data?.roles || []
  
  if (!comparisonRoles || comparisonRoles.length === 0) {
    return <p className="text-gray-400 text-sm">No roles to compare</p>
  }

  // Helper function to get display value based on property key
  const getDisplayValue = (role: any, key: string): string => {
    try {
      switch (key) {
        case 'domain':
          return role.domain || 'N/A'
        case 'workStyle':
          if (Array.isArray(role.workStyle)) {
            return role.workStyle.join(', ') || 'N/A'
          }
          return 'N/A'
        case 'difficulty':
          return role.difficulty || 'N/A'
        case 'salaryEntry':
          return role.salaryRangeIndia?.entry ? `${role.salaryRangeIndia.entry}L` : 'N/A'
        case 'salaryMid':
          return role.salaryRangeIndia?.mid ? `${role.salaryRangeIndia.mid}L` : 'N/A'
        case 'salarySenior':
          return role.salaryRangeIndia?.senior ? `${role.salaryRangeIndia.senior}L` : 'N/A'
        case 'demandLevel':
          return role.demandLevel || 'N/A'
        case 'marketOutlook':
          return role.marketOutlook || 'N/A'
        case 'averageExperience':
          return role.averageExperience || 'N/A'
        case 'requiredSkills':
          if (Array.isArray(role.requiredSkills)) {
            return role.requiredSkills.map((s: any) => {
              if (typeof s === 'string') return s
              if (s?.name) return s.name
              return String(s)
            }).join(', ') || 'N/A'
          }
          return 'N/A'
        case 'optionalSkills':
          if (Array.isArray(role.optionalSkills)) {
            return role.optionalSkills.join(', ') || 'N/A'
          }
          return 'N/A'
        case 'growthPath':
          if (Array.isArray(role.growthPath)) {
            return role.growthPath.join(', ') || 'N/A'
          }
          return 'N/A'
        case 'companiesHiring':
          if (Array.isArray(role.companiesHiring)) {
            return role.companiesHiring.join(', ') || 'N/A'
          }
          return 'N/A'
        default:
          return String(role[key] || 'N/A')
      }
    } catch (error) {
      console.error(`Error displaying role data for key ${key}:`, error)
      return 'N/A'
    }
  }

  // Build comparison table rows
  const tableRows = [
    { label: 'Domain', key: 'domain' },
    { label: 'Work Style', key: 'workStyle' },
    { label: 'Difficulty', key: 'difficulty' },
    { label: 'Entry Level Salary', key: 'salaryEntry' },
    { label: 'Mid-Level Salary', key: 'salaryMid' },
    { label: 'Senior Level Salary', key: 'salarySenior' },
    { label: 'Demand Level', key: 'demandLevel' },
    { label: 'Market Outlook', key: 'marketOutlook' },
    { label: 'Avg Experience', key: 'averageExperience' },
    { label: 'Required Skills', key: 'requiredSkills' },
    { label: 'Optional Skills', key: 'optionalSkills' },
    { label: 'Growth Path', key: 'growthPath' },
    { label: 'Companies Hiring', key: 'companiesHiring' },
  ]

  return (
    <div className="space-y-6 w-full">
      <div>
        <h3 className="text-cyan-400 text-sm font-semibold mb-4">Detailed Role Comparison</h3>
        
        {/* Scrollable table wrapper */}
        <div className="overflow-x-auto bg-gray-800/40 rounded-lg border border-gray-700">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/50">
                <th className="px-4 py-3 text-left text-cyan-300 font-semibold sticky left-0 bg-gray-900/50 w-24">Attribute</th>
                {comparisonRoles.map((role: any) => (
                  <th key={role.id} className="px-4 py-3 text-left text-white font-semibold whitespace-nowrap">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, idx) => (
                <tr key={row.key} className={idx % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-900/20'}>
                  <td className="px-4 py-2 text-gray-300 font-medium sticky left-0 z-10 bg-inherit">{row.label}</td>
                  {comparisonRoles.map((role: any) => (
                    <td key={role.id} className="px-4 py-2 text-gray-100">
                      {getDisplayValue(role, row.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selection buttons */}
      <div className="space-y-2 mt-4">
        <p className="text-gray-400 text-xs font-medium">Choose your path:</p>
        <div className="space-y-2">
          {comparisonRoles.map((role: any) => (
            <motion.button
              key={role.id}
              layout
              onClick={() => onSelect(role.id)}
              disabled={isLoading}
              className="w-full text-left p-3 rounded-lg border border-gray-700 hover:border-cyan-500 hover:bg-cyan-500/10 transition-colors disabled:opacity-50"
            >
              <div className="font-semibold text-white text-sm">{role.name}</div>
              <div className="text-xs text-cyan-300 mt-1">CTC: {role.salaryCtc} | Demand: {role.demand}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

function CompletionPanel({ role, redirect }: { role: any; redirect?: string }) {
  const router = useRouter()
  const [navigating, setNavigating] = useState(false)

  const handleNavigateDashboard = () => {
    setNavigating(true)
    router.push('/dashboard')
  }

  // Auto-navigate after progress bar completes
  useEffect(() => {
    if (redirect) {
      const timer = setTimeout(() => {
        handleNavigateDashboard()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [redirect])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-lg p-6 text-center"
    >
      <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
      <h3 className="text-white font-bold text-lg mb-2">You've Chosen!</h3>
      <p className="text-2xl font-bold text-cyan-300 mb-4">{role?.name || 'Your Path'}</p>
      <p className="text-gray-300 text-sm">Your personalized roadmap is being created...</p>
      <div className="mt-6 space-y-2">
        <div className="w-full bg-gray-800 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5 }}
            className="bg-cyan-500 h-2 rounded-full"
          />
        </div>
        <p className="text-gray-400 text-xs mt-2">Redirecting to your dashboard...</p>
      </div>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        onClick={handleNavigateDashboard}
        disabled={navigating}
        className="mt-6 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
      >
        {navigating ? 'Navigating...' : 'Go to Dashboard Now'}
      </motion.button>
    </motion.div>
  )
}

function DefaultInsights({ insights }: { insights?: any }) {
  return (
    <div className="space-y-4 text-sm text-gray-300">
      <h3 className="text-cyan-400 font-semibold">Session Insights</h3>
      {insights?.skillsMatch ? (
        <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700">
          <div className="text-white font-semibold mb-2">Skill Match</div>
          <div className="text-sm">{insights.skillsMatch.matchPercentage}% match</div>
        </div>
      ) : (
        <p className="text-gray-400">Insights will appear as you chat</p>
      )}
    </div>
  )
}
