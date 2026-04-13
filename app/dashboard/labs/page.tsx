'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Code, Play, Lightbulb, CheckCircle, AlertCircle, Zap, BookOpen } from 'lucide-react'
import { useSystem } from '@/lib/system'
import { apiClient, onTaskSubmitted } from '@/lib/system'

type TaskType = 'coding' | 'debugging' | 'system_design' | 'optimization'
type LabStage = 'learning' | 'practicing' | 'evaluating'

interface Message {
    id: string
    role: 'mentor' | 'user'
    content: string
    timestamp: Date
}

interface CurrentTask {
    id: string
    title: string
    description: string
    constraints: string[]
    expectedOutcome: string
    difficulty: number
    taskType: TaskType
    starterCode?: string
    language: 'javascript' | 'python' | 'typescript'
}

interface LabProgress {
    tasksCompleted: number
    successRate: number
    learningVelocity: number
    weakAreas: string[]
    successfulTasks: string[]
}

interface Feedback {
    correctness: number
    efficiency: number
    codeQuality: number
    suggestions: string[]
    nextSteps: string[]
}

export default function LabsPage() {
    const { user, refreshAll } = useSystem()
    const [stage, setStage] = useState<LabStage>('learning')
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [code, setCode] = useState('')
    const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'typescript'>('javascript')
    const [currentTask, setCurrentTask] = useState<CurrentTask | null>(null)
    const [loading, setLoading] = useState(false)
    const [hintLevel, setHintLevel] = useState(0)
    const [feedback, setFeedback] = useState<Feedback | null>(null)
    const [progress, setProgress] = useState<LabProgress>({
        tasksCompleted: 0,
        successRate: 0,
        learningVelocity: 0,
        weakAreas: [],
        successfulTasks: [],
    })
    const [isExecuting, setIsExecuting] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Initialize with welcome message
    useEffect(() => {
        initializeLabSession()
    }, [])

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const initializeLabSession = async () => {
        const welcomeMsg: Message = {
            id: '1',
            role: 'mentor',
            content: 'Welcome to the Twinstitute Labs Engine! I\'m your AI mentor. Today we\'ll focus on building your capabilities through hands-on execution. Let\'s start by loading today\'s first task. What skill would you like to focus on?',
            timestamp: new Date(),
        }
        setMessages([welcomeMsg])
        await loadNextTask()
    }

    const loadNextTask = async () => {
        setLoading(true)
        try {
            // Fetch tasks from the system
            const response = await apiClient.getTasks({ limit: 1, sort: '-difficulty' })
            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to load task')
            }

            const tasks = Array.isArray(response.data) ? response.data : [response.data]
            const task = tasks[0] as any

            // Transform API response to CurrentTask
            const currentTask: CurrentTask = {
                id: task.id || '',
                title: task.title || 'Untitled Task',
                description: task.description || '',
                constraints: task.constraints || [],
                expectedOutcome: task.expectedOutcome || '',
                difficulty: task.difficulty || 1,
                taskType: task.taskType || 'coding',
                starterCode: task.starterCode || '',
                language: task.language || 'javascript',
            }

            setCurrentTask(currentTask)
            setCode(currentTask.starterCode || '')
            setStage('practicing')
            setHintLevel(0)
            setFeedback(null)

            const taskMsg: Message = {
                id: Date.now().toString(),
                role: 'mentor',
                content: `Great! I've loaded a new task: "${currentTask.title}". This task will help you practice ${currentTask.taskType.replace(/_/g, ' ')} skills. Take your time to understand the problem, and feel free to ask questions or request hints. When you're ready, run your code or submit your solution.`,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, taskMsg])
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            console.error('Failed to load task:', error)

            const errorMsg: Message = {
                id: Date.now().toString(),
                role: 'mentor',
                content: `Failed to load task: ${message}. Please try again.`,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setLoading(false)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim()) return

        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        }
        setMessages(prev => [...prev, userMsg])
        setInputValue('')

        // Get AI response via mentor API
        setLoading(true)
        try {
            const response = await apiClient.mentorSession(inputValue, {
                taskId: currentTask?.id,
                taskContext: currentTask,
                conversationHistory: messages.slice(-5), // Last 5 messages for context
            })

            if (!response.success) {
                throw new Error(response.error || 'Failed to get mentor response')
            }

            const mentorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'mentor',
                content: (response.data as any)?.response || 'I understand. What else can I help you with?',
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, mentorMsg])
        } catch (error) {
            console.error('Failed to get mentor response:', error)
        } finally {
            setLoading(false)
        }
    }

    const runCode = async () => {
        setIsExecuting(true)
        try {
            const response = await fetch('/api/labs/run-code', {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language: selectedLanguage,
                    taskId: currentTask?.id,
                }),
            })
            const result = await response.json()

            const executionMsg: Message = {
                id: Date.now().toString(),
                role: 'mentor',
                content: `Output:\n\`\`\`\n${result.output || result.error}\n\`\`\`\n\nAnalyzing your solution...`,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, executionMsg])
        } catch (error) {
            console.error('Execution failed:', error)
        } finally {
            setIsExecuting(false)
        }
    }

    const requestHint = async () => {
        if (hintLevel >= 3) return

        setLoading(true)
        const nextLevel = hintLevel + 1
        try {
            const response = await fetch('/api/labs/hint', {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId: currentTask?.id,
                    level: nextLevel,
                    taskContext: currentTask,
                }),
            })
            const data = await response.json()

            const hintMsg: Message = {
                id: Date.now().toString(),
                role: 'mentor',
                content: `💡 **Hint ${nextLevel}/3:**\n\n${data.hint}`,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, hintMsg])
            setHintLevel(nextLevel)
        } catch (error) {
            console.error('Failed to get hint:', error)
        } finally {
            setLoading(false)
        }
    }

    const submitSolution = async () => {
        if (!currentTask || !user?.id) {
            console.error('Missing task or user context')
            return
        }

        setLoading(true)
        try {
            // STEP 1: Submit the task to create a submission record
            const submitResult = await apiClient.submitTask(currentTask.id, {
                submittedCode: code,
                language: selectedLanguage,
                timeSpentMin: 15, // TODO: Track actual time spent
                approach: messages
                    .filter(m => m.role === 'user')
                    .map(m => m.content)
                    .join('\n'),
            })

            if (!submitResult.success) {
                throw new Error(submitResult.error || 'Failed to submit task')
            }

            const submissionId = (submitResult.data as any)?.id

            // Add submission acknowledgment to chat
            const submitMsg: Message = {
                id: Date.now().toString(),
                role: 'mentor',
                content: '✅ Submission received! Evaluating your solution...',
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, submitMsg])

            // STEP 2: Trigger the complete automation cascade via engine
            const engineResult = await onTaskSubmitted(user.id, submissionId, currentTask.id)

            // Log the result
            console.log('Engine automation result:', engineResult)

            // STEP 3: Create feedback from evaluation
            const evaluation = await apiClient.getEvaluation(submissionId)
            if (evaluation.success) {
                const evalData = evaluation.data as any
                setFeedback({
                    correctness: evalData?.score || 0,
                    efficiency: evalData?.efficiency || 0,
                    codeQuality: evalData?.quality || 0,
                    suggestions: evalData?.suggestions || [],
                    nextSteps: evalData?.nextSteps || [],
                })

                // Add evaluation feedback to chat
                const feedbackMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'mentor',
                    content: `📊 Evaluation Complete!\n\nScore: ${evalData?.score || 0}/100\n\n${evalData?.feedback || 'Great job!'}\n\n${
                        evalData?.proofGenerated ? '✨ Proof artifact created!' : ''
                    }`,
                    timestamp: new Date(),
                }
                setMessages(prev => [...prev, feedbackMsg])
            }

            // STEP 4: Update local progress state
            const score = (evaluation.data as any)?.score || 0
            setProgress(prev => ({
                ...prev,
                tasksCompleted: prev.tasksCompleted + 1,
                successRate:
                    score > 70
                        ? ((prev.successRate * prev.tasksCompleted + 100) /
                              (prev.tasksCompleted + 1))
                               .toFixed(1) as any
                        : prev.successRate,
                successfulTasks:
                    score > 70
                        ? [...prev.successfulTasks, currentTask.id]
                        : prev.successfulTasks,
            }))

            // STEP 5: Update system state to reflect changes
            await refreshAll()

            setStage('evaluating')

            // STEP 6: Offer next action
            setTimeout(() => {
                const nextMsg: Message = {
                    id: (Date.now() + 2).toString(),
                    role: 'mentor',
                    content: score > 70
                        ? '🎉 Excellent work! Your skills have been updated and a proof artifact has been created. Ready to tackle the next challenge?'
                        : '💪 Good attempt! Review the feedback and try again when ready. Each attempt helps you grow.',
                    timestamp: new Date(),
                }
                setMessages(prev => [...prev, nextMsg])
            }, 1000)
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            console.error('Submission error:', error)

            const errorMsg: Message = {
                id: Date.now().toString(),
                role: 'mentor',
                content: `❌ Submission failed: ${message}. Please review your code and try again.`,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen w-full bg-gradient-to-br from-[#040810] via-[#0f172a] to-[#000000] p-4 md:p-8"
        >
            {/* Background gradients */}
            <motion.div
                className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', filter: 'blur(80px)' }}
                animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
                transition={{ duration: 12, repeat: Infinity }}
            />

            <div className="relative z-10 max-w-7xl mx-auto space-y-6">
                {/* Status Header */}
                <LabsStatusHeader stage={stage} progress={progress} currentTask={currentTask} />

                {/* Main Training Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
                    {/* Left: AI Mentor Chat */}
                    <MentorChatPanel messages={messages} inputValue={inputValue} setInputValue={setInputValue} onSendMessage={handleSendMessage} loading={loading} messagesEndRef={messagesEndRef} />

                    {/* Right: Task Execution */}
                    <TaskExecutionPanel currentTask={currentTask} code={code} setCode={setCode} selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} hintLevel={hintLevel} onRunCode={runCode} onRequestHint={requestHint} onSubmitSolution={submitSolution} isExecuting={isExecuting} loading={loading} />
                </div>

                {/* Feedback Section */}
                {feedback && <FeedbackPanelComponent feedback={feedback} onNextTask={loadNextTask} />}

                {/* Progress Tracker */}
                <ProgressTrackerComponent progress={progress} />
            </div>
        </motion.div>
    )
}

// Status Header Component
function LabsStatusHeader({ stage, progress, currentTask }: { stage: LabStage; progress: LabProgress; currentTask: CurrentTask | null }) {
    const stageConfig = {
        learning: { icon: BookOpen, color: 'from-blue-600 to-blue-500', label: 'Learning' },
        practicing: { icon: Code, color: 'from-purple-600 to-purple-500', label: 'Executing' },
        evaluating: { icon: CheckCircle, color: 'from-emerald-600 to-emerald-500', label: 'Evaluating' },
    }

    const config = stageConfig[stage]
    const Icon = config.icon

    return (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Current Skill Focus */}
            <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Skill Focus</p>
                <p className="text-lg font-bold text-cyan-300">{currentTask?.title || 'Loading...'}</p>
                <p className="text-xs text-gray-500 mt-2">Task Type: {currentTask?.taskType.replace(/_/g, ' ')}</p>
            </div>

            {/* Current Stage */}
            <div className={`bg-gradient-to-br ${config.color}/10 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-sm`}>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Stage</p>
                <div className="flex items-center gap-2">
                    <Icon size={20} className="text-cyan-400" />
                    <p className="text-lg font-bold text-cyan-300">{config.label}</p>
                </div>
            </div>

            {/* Completion Progress */}
            <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Progress</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-emerald-400">{progress.tasksCompleted}</p>
                    <p className="text-sm text-gray-500">tasks</p>
                </div>
                <div className="text-xs text-gray-500 mt-2">Success Rate: {Math.round(progress.successRate / Math.max(progress.tasksCompleted, 1) * 100)}%</div>
            </div>

            {/* Capability Impact */}
            <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Impact</p>
                <div className="flex items-center gap-2">
                    <Zap size={20} className="text-amber-400" />
                    <p className="text-lg font-bold text-amber-300">+{Math.min(progress.tasksCompleted * 3, 100)}%</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">Capability gain</p>
            </div>
        </motion.div>
    )
}

// Mentor Chat Panel
function MentorChatPanel({
    messages,
    inputValue,
    setInputValue,
    onSendMessage,
    loading,
    messagesEndRef,
}: {
    messages: Message[]
    inputValue: string
    setInputValue: (value: string) => void
    onSendMessage: (e: React.FormEvent) => void
    loading: boolean
    messagesEndRef: React.RefObject<HTMLDivElement>
}) {
    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/30 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="font-semibold text-white">AI Mentor</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">Ready to guide your learning</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'mentor' ? 'justify-start' : 'justify-end'}`}>
                            <div
                                className={`max-w-xs px-4 py-2 rounded-lg ${msg.role === 'mentor' ? 'bg-blue-900/30 border border-blue-500/30 text-gray-200' : 'bg-emerald-900/30 border border-emerald-500/30 text-gray-200'}`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={onSendMessage} className="p-4 border-t border-slate-700/30 bg-slate-900/50">
                <div className="flex gap-2">
                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ask me anything..." className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50" disabled={loading} />
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50" disabled={loading}>
                        <Send size={18} />
                    </motion.button>
                </div>
            </form>
        </motion.div>
    )
}

// Task Execution Panel
function TaskExecutionPanel({
    currentTask,
    code,
    setCode,
    selectedLanguage,
    setSelectedLanguage,
    hintLevel,
    onRunCode,
    onRequestHint,
    onSubmitSolution,
    isExecuting,
    loading,
}: {
    currentTask: CurrentTask | null
    code: string
    setCode: (value: string) => void
    selectedLanguage: 'javascript' | 'python' | 'typescript'
    setSelectedLanguage: (value: 'javascript' | 'python' | 'typescript') => void
    hintLevel: number
    onRunCode: () => void
    onRequestHint: () => void
    onSubmitSolution: () => void
    isExecuting: boolean
    loading: boolean
}) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 flex flex-col gap-4">
            {/* Task Description */}
            {currentTask && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">{currentTask.title}</h3>
                            <p className="text-sm text-gray-400">{currentTask.description}</p>
                        </div>
                        <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">Difficulty: {currentTask.difficulty}/10</div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Constraints</p>
                            <ul className="space-y-1">
                                {currentTask.constraints.map((c, i) => (
                                    <li key={i} className="text-sm text-gray-300">• {c}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Expected Outcome</p>
                            <p className="text-sm text-gray-300">{currentTask.expectedOutcome}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Code Editor */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-white">Code Editor</p>
                    <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value as any)} className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1 text-sm text-white">
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                    </select>
                </div>

                <textarea value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-sm text-gray-100 font-mono focus:outline-none focus:border-blue-500/50 resize-none" placeholder="Write your solution here..." />

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onRunCode} disabled={isExecuting} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        <Play size={16} />
                        Run Code
                    </motion.button>

                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onRequestHint} disabled={hintLevel >= 3 || loading} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        <Lightbulb size={16} />
                        Hint {hintLevel}/3
                    </motion.button>

                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onSubmitSolution} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        <CheckCircle size={16} />
                        Submit Solution
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    )
}

// Feedback Panel Component
function FeedbackPanelComponent({ feedback, onNextTask }: { feedback: Feedback; onNextTask: () => void }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-xs text-blue-300 uppercase mb-1">Correctness</p>
                    <p className="text-2xl font-bold text-blue-400">{feedback.correctness}%</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                    <p className="text-xs text-purple-300 uppercase mb-1">Efficiency</p>
                    <p className="text-2xl font-bold text-purple-400">{feedback.efficiency}%</p>
                </div>
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
                    <p className="text-xs text-emerald-300 uppercase mb-1">Code Quality</p>
                    <p className="text-2xl font-bold text-emerald-400">{feedback.codeQuality}%</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNextTask} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg">
                    Next Task
                </motion.button>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="font-semibold text-white mb-2">Suggestions for Improvement</p>
                    <ul className="space-y-2">
                        {feedback.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="font-semibold text-white mb-2">Next Steps</p>
                    <ul className="space-y-2">
                        {feedback.nextSteps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                {step}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.div>
    )
}

// Progress Tracker Component
function ProgressTrackerComponent({ progress }: { progress: LabProgress }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <h4 className="font-bold text-white mb-4">Your Learning Analytics</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Success Rate */}
                <div>
                    <p className="text-sm text-gray-400 mb-2">Success Rate</p>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-emerald-400">{Math.round(progress.successRate / Math.max(progress.tasksCompleted, 1) * 100)}%</p>
                    </div>
                </div>

                {/* Learning Velocity */}
                <div>
                    <p className="text-sm text-gray-400 mb-2">Learning Velocity</p>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-cyan-400">{(progress.learningVelocity || progress.tasksCompleted * 0.5).toFixed(1)}</p>
                        <span className="text-xs text-gray-500">tasks/day</span>
                    </div>
                </div>

                {/* Weak Areas */}
                <div>
                    <p className="text-sm text-gray-400 mb-2">Areas to Focus</p>
                    {progress.weakAreas.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {progress.weakAreas.slice(0, 2).map((area, i) => (
                                <span key={i} className="px-2 py-1 bg-amber-900/30 border border-amber-500/30 text-amber-300 text-xs rounded">
                                    {area}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Keep up the great work!</p>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
