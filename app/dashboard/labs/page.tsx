'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/useToast'
import {
  Send, Code, Play, Lightbulb, CheckCircle, AlertCircle, Zap, BookOpen,
  ChevronRight, Target, TrendingUp, Clock, Flame, Award, Lock, Unlock,
  FileCode, Terminal, Loader, ArrowRight, Sparkles, Brain, BarChart3,
  GitBranch, Shield, Layers, Calendar, Mountain, Compass, FlaskConical
} from 'lucide-react'

type TaskType = 'coding' | 'debugging' | 'system_design' | 'optimization' | 'architecture'
type LabStage = 'discovery' | 'prerequisite_check' | 'practicing' | 'evaluating' | 'completion'
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'


interface Message {
  id: string
  role: 'mentor' | 'user'
  content: string
  timestamp: Date
  codeBlock?: string
}

interface SkillPrerequisite {
  skill: string
  required: number
  current: number
  isMet: boolean
  alternatePathAvailable: boolean
}

interface TaskRecommendation {
  id: string
  title: string
  description: string
  taskType: TaskType
  difficulty: DifficultyLevel
  estimatedTime: number
  skillsTrained: string[]
  prerequisites: SkillPrerequisite[]
  relatedDomain: string
  alignmentScore: number
  careerImpact: string
  nextSteps?: string[]
}

interface CurrentTask extends TaskRecommendation {
  constraints: string[]
  expectedOutcome: string
  starterCode?: string
  language: 'javascript' | 'python' | 'typescript'
  testCases?: TestCase[]
  hints?: string[]
}

interface Feedback {
  correctness: number
  efficiency: number
  codeQuality: number
  bestPractices: number
  documentation: number
  suggestions: string[]
  nextSteps: string[]
  performanceMetrics?: {
    executionTime: number
    memoryUsage: number
    complexity: string
  }
}

interface LabProgress {
  tasksCompleted: number
  tasksTotalAttempted: number
  successRate: number
  learningVelocity: number
  domainProficiency: Record<string, number>
  weakAreas: string[]
  strongAreas: string[]
  successfulTasks: string[]
  careerProgression: number
  creditsEarned: number
  nextMilestone: string
  estimatedDaysToGoal: number
}

interface TestCase {
  input: string
  expected: string
}

interface TestResult {
  input: string
  expected: string
  output: string
  passed: boolean
  executionTime?: number
  error?: string
}

interface ExecutionResult {
  success: boolean
  output: string
  error?: string
  executionTime: number
  warnings?: string[]
  testResults?: TestResult[]
  testScore?: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const slideInVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
}

export default function LabsPage() {
  const { data: session } = useSession()
  const { error: showErrorToast } = useToast()
  const [stage, setStage] = useState<LabStage>('discovery')
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
    tasksTotalAttempted: 0,
    successRate: 0,
    learningVelocity: 0,
    domainProficiency: { 'Software Engineering': 75, 'Web Development': 82, 'System Design': 68 },
    weakAreas: ['System Architecture', 'DevOps'],
    strongAreas: ['Frontend Development', 'JavaScript', 'React'],
    successfulTasks: [],
    careerProgression: 62,
    creditsEarned: 1240,
    nextMilestone: 'Senior Developer Ready',
    estimatedDaysToGoal: 45,
  })
  const [isExecuting, setIsExecuting] = useState(false)
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([])
  const [showPrerequisiteWarning, setShowPrerequisiteWarning] = useState(false)
  const [unmetPrerequisites, setUnmetPrerequisites] = useState<SkillPrerequisite[]>([])
  const [selectedTask, setSelectedTask] = useState<TaskRecommendation | null>(null)
  const [showExecutionResult, setShowExecutionResult] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [verifiedCapabilities, setVerifiedCapabilities] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeLabSession()
    loadVerifiedCapabilities()
  }, [])

  const loadVerifiedCapabilities = async () => {
    try {
      const response = await fetch('/api/labs/proofs')
      if (response.ok) {
        const data = await response.json()
        setVerifiedCapabilities(data.proofs || [])
      }
    } catch (error) {
      console.error('Failed to load capabilities:', error)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeLabSession = async () => {
    const userName = session?.user?.name?.split(' ')[0] || 'Developer'
    
    const welcomeMsg: Message = {
      id: '1',
      role: 'mentor',
      content: `Welcome to Capability Labs, ${userName}! 🚀 I'm your AI mentor. Here you'll master real-world tasks aligned with your Software Developer role and Software Engineering domain. Let me analyze your current skills and load personalized recommendations that will accelerate your career growth.`,
      timestamp: new Date(),
    }
    setMessages([welcomeMsg])
    
    await loadTaskRecommendations()
  }

  const loadTaskRecommendations = async () => {
    setLoading(true)
    try {
      const mockRecommendations: TaskRecommendation[] = [
        {
          id: 'task-001',
          title: 'Build a REST API with Error Handling',
          description: 'Create a production-grade REST API with comprehensive error handling, validation, and logging.',
          taskType: 'coding',
          difficulty: 'intermediate',
          estimatedTime: 90,
          skillsTrained: ['Node.js', 'Express', 'Error Handling', 'API Design'],
          prerequisites: [
            { skill: 'JavaScript', required: 75, current: 88, isMet: true, alternatePathAvailable: false },
            { skill: 'HTTP Fundamentals', required: 60, current: 72, isMet: true, alternatePathAvailable: false },
          ],
          relatedDomain: 'Software Engineering',
          alignmentScore: 94,
          careerImpact: 'Critical for mid-level backend developer roles',
          nextSteps: ['Database Integration', 'Authentication', 'Testing'],
        },
        {
          id: 'task-002',
          title: 'Debug a Memory Leak in Production Code',
          description: 'Analyze and fix a real-world memory leak scenario in a complex Node.js application.',
          taskType: 'debugging',
          difficulty: 'advanced',
          estimatedTime: 120,
          skillsTrained: ['Debugging', 'Performance Analysis', 'Memory Management'],
          prerequisites: [
            { skill: 'JavaScript', required: 80, current: 88, isMet: true, alternatePathAvailable: false },
            { skill: 'Node.js Profiling', required: 70, current: 55, isMet: false, alternatePathAvailable: true },
          ],
          relatedDomain: 'Software Engineering',
          alignmentScore: 87,
          careerImpact: 'Essential for senior developer roles',
          nextSteps: ['Advanced Profiling', 'System Design'],
        },
        {
          id: 'task-003',
          title: 'Design a Scalable Microservices Architecture',
          description: 'Design a microservices-based system for a high-traffic e-commerce platform.',
          taskType: 'system_design',
          difficulty: 'expert',
          estimatedTime: 150,
          skillsTrained: ['System Design', 'Microservices', 'Scalability', 'Load Balancing'],
          prerequisites: [
            { skill: 'System Architecture', required: 85, current: 68, isMet: false, alternatePathAvailable: true },
            { skill: 'Distributed Systems', required: 75, current: 60, isMet: false, alternatePathAvailable: true },
          ],
          relatedDomain: 'Software Engineering',
          alignmentScore: 91,
          careerImpact: 'Critical path to architect-level roles',
          nextSteps: ['DevOps', 'Cloud Architecture'],
        },
        {
          id: 'task-004',
          title: 'Optimize Database Query Performance',
          description: 'Analyze and optimize slow database queries using proper indexing and query optimization techniques.',
          taskType: 'optimization',
          difficulty: 'intermediate',
          estimatedTime: 75,
          skillsTrained: ['Database Optimization', 'SQL', 'Performance Analysis'],
          prerequisites: [
            { skill: 'SQL', required: 70, current: 81, isMet: true, alternatePathAvailable: false },
            { skill: 'Database Design', required: 65, current: 76, isMet: true, alternatePathAvailable: false },
          ],
          relatedDomain: 'Software Engineering',
          alignmentScore: 88,
          careerImpact: 'Key skill for full-stack and backend developers',
          nextSteps: ['Advanced SQL', 'Query Caching'],
        },
        {
          id: 'task-005',
          title: 'Implement Authentication & Authorization',
          description: 'Build a secure authentication and authorization system with JWT and role-based access control.',
          taskType: 'coding',
          difficulty: 'intermediate',
          estimatedTime: 100,
          skillsTrained: ['Security', 'JWT', 'RBAC', 'Password Hashing'],
          prerequisites: [
            { skill: 'JavaScript', required: 70, current: 88, isMet: true, alternatePathAvailable: false },
            { skill: 'Security Basics', required: 60, current: 65, isMet: true, alternatePathAvailable: false },
          ],
          relatedDomain: 'Software Engineering',
          alignmentScore: 95,
          careerImpact: 'Essential for all full-stack roles',
          nextSteps: ['OAuth2', 'Security Testing'],
        },
      ]

      setRecommendations(mockRecommendations)
      setStage('discovery')

      const mentalModelMsg: Message = {
        id: Date.now().toString(),
        role: 'mentor',
        content: `Perfect! I've analyzed your capabilities and identified 5 targeted tasks for your Software Developer role. Your current proficiency profile shows:
        
        ✅ **Strong Areas:** Frontend Development (88%), JavaScript (88%), Database Design (76%)
        ⚠️ **Growth Opportunities:** System Architecture (68%), DevOps (62%), Distributed Systems (60%)
        
        I've ranked these tasks by career impact and alignment with your goals. Some have unmet prerequisites, but I can suggest alternate paths. Ready to get started?`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, mentalModelMsg])
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectTask = (task: TaskRecommendation) => {
    const unmet = task.prerequisites.filter(p => !p.isMet)
    
    if (unmet.length > 0) {
      setUnmetPrerequisites(unmet)
      setShowPrerequisiteWarning(true)
    }
    
    setSelectedTask(task)
    setStage('prerequisite_check')
    
    const taskMsg: Message = {
      id: Date.now().toString(),
      role: 'mentor',
      content: unmet.length > 0
        ? `I've selected "${task.title}"! ⚡ This task is highly aligned with your career goals (${task.alignmentScore}% match). However, I detected ${unmet.length} unmet prerequisite(s). I can provide alternate learning paths or you can proceed with scaffolded support. What's your preference?`
        : `Excellent choice! "${task.title}" is perfectly aligned with your current level (${task.alignmentScore}% match). This task will develop your ${task.skillsTrained.slice(0, 2).join(' and ')} skills. Let me load the task and we can begin!`,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, taskMsg])
  }

  const proceedWithTask = async (task: TaskRecommendation) => {
    setStage('practicing')
    
    const fullTask: CurrentTask = {
      ...task,
      constraints: [
        'Use best practices for code organization',
        'Include comprehensive error handling',
        'Add meaningful comments and documentation',
        'Follow SOLID principles where applicable',
      ],
      expectedOutcome: `A production-ready implementation of ${task.title.toLowerCase()} with passing test cases and clear documentation.`,
      starterCode: generateStarterCode(task.taskType, task.language || 'javascript'),
      language: 'javascript',
      testCases: generateTestCases(task.id),
      hints: [
        'Start by breaking down the problem into smaller functions',
        'Consider error scenarios and edge cases early',
        'Write tests before implementing the solution',
        'Review the expected outcome and constraints frequently',
      ],
    }
    
    setCurrentTask(fullTask)
    setCode(fullTask.starterCode || '')
    setHintLevel(0)
    setFeedback(null)

    const taskMsg: Message = {
      id: Date.now().toString(),
      role: 'mentor',
      content: `Great! Let's dive into "${fullTask.title}". 

**What you'll learn:** ${fullTask.skillsTrained.join(', ')}

**Task Duration:** ~${fullTask.estimatedTime} minutes

**Key Constraints:**
${fullTask.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Start by exploring the starter code. Feel free to ask for hints as you progress. When you're ready, run your code to test it, and then submit for evaluation!`,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, taskMsg])
    setShowPrerequisiteWarning(false)
  }

  const generateStarterCode = (taskType: TaskType, language: string): string => {
    const templates = {
      coding: `// TODO: Implement your solution here
// Remember to handle edge cases and add comments

async function solution(input) {
  try {
    // Your implementation goes here
    
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

module.exports = { solution };`,
      debugging: `// This code has bugs! Find and fix them.
// Hint: Check the logic flow and variable assignments

function buggyFunction(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum = arr[i]; // Bug: Should be +=
  }
  return sum;
}`,
      system_design: `/*
  System Design Template
  
  1. Requirements Analysis
  2. Capacity Estimation
  3. Data Model Design
  4. API Design
  5. Scaling Considerations
*/

const systemDesign = {
  requirements: {
    functional: [],
    nonFunctional: [],
  },
  architecture: {
    components: [],
    communications: [],
  },
  scaling: {
    database: '',
    caching: '',
    loadBalancing: '',
  },
};`,
      optimization: `// Optimize this code for better performance
// Analyze time complexity and space complexity

function inefficientFunction(data) {
  const results = [];
  
  for (let i = 0; i < data.length; i++) {
    // O(n²) nested loop - optimize this!
    for (let j = 0; j < data.length; j++) {
      if (data[i].id === data[j].id) {
        results.push(data[i]);
      }
    }
  }
  
  return results;
}`,
      architecture: `// Design a clean, scalable architecture
// Focus on separation of concerns and modularity

class ArchitecturePattern {
  constructor() {
    this.layers = {
      presentation: {},
      business: {},
      data: {},
    };
  }
  
  // Implement your architecture here
}`,
    }
    
    return templates[taskType] || templates.coding
  }

  const generateTestCases = (taskId: string): TestCase[] => {
    // Test cases specific to each task
    const testCasesByTask: Record<string, TestCase[]> = {
      'task-001': [ // REST API with Error Handling
        { input: 'GET /api/users', expected: '200' },
        { input: 'GET /api/invalid', expected: '404' },
        { input: 'POST /api/users', expected: '400' },
      ],
      'task-002': [ // Debug Memory Leak
        { input: '1000', expected: '1000' },
        { input: '10000', expected: '10000' },
        { input: '100000', expected: '100000' },
      ],
      'task-003': [ // Scalable Microservices
        { input: 'design', expected: 'microservices' },
        { input: 'scale', expected: '1000' },
        { input: 'load', expected: 'balanced' },
      ],
      'task-004': [ // Optimize Database Queries
        { input: 'SELECT * FROM users', expected: 'optimized' },
        { input: 'CREATE INDEX', expected: 'created' },
        { input: 'ANALYZE', expected: 'analyzed' },
      ],
      'task-005': [ // Authentication & Authorization
        { input: 'admin user', expected: 'authenticated' },
        { input: 'regular user', expected: 'authorized' },
        { input: 'guest', expected: 'denied' },
      ],
    }

    return testCasesByTask[taskId] || [
      { input: 'test1', expected: 'output1' },
      { input: 'test2', expected: 'output2' },
    ]
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')

    setLoading(true)
    try {
      const mentorResponses: Record<string, string> = {
        hint: `Great question! Here's a hint: ${currentTask?.hints?.[hintLevel % (currentTask?.hints?.length || 1)] || 'Think about breaking this problem into smaller steps.'}`,
        test: currentTask?.testCases && currentTask.testCases.length > 0
          ? `Here are your test cases:\n${currentTask.testCases.map((tc: TestCase, i: number) => `Test ${i + 1}: Input="${tc.input}" → Expected="${tc.expected}"`).join('\n')}`
          : `Run the code with different inputs to test it thoroughly`,
        constraint: `Remember these constraints:\n${currentTask?.constraints?.slice(0, 2).join('\n')}`,
        next: `Your next steps could be:\n${currentTask?.nextSteps?.join('\n') || 'Move to the next task'}`,
      }

      const keyword = Object.keys(mentorResponses).find(k => 
        userMsg.content.toLowerCase().includes(k)
      ) || 'general'

      const responseText = mentorResponses[keyword] || 
        `That's a great observation! Keep thinking about how to approach this problem. Remember to check the constraints and test your solution thoroughly before submitting. 💡`

      const mentorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'mentor',
        content: responseText,
        timestamp: new Date(),
      }
      
      setTimeout(() => {
        setMessages(prev => [...prev, mentorMsg])
      }, 600)
    } finally {
      setLoading(false)
    }
  }

  const runCode = async () => {
    if (!code.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'mentor',
        content: 'Please write some code first! Start with the starter template or your own solution.',
        timestamp: new Date(),
      }])
      return
    }

    setIsExecuting(true)
    try {
      // Use test cases endpoint if available
      const endpoint = currentTask?.testCases && currentTask.testCases.length > 0 
        ? '/api/labs/run-tests'
        : '/api/execute'

      const payload = currentTask?.testCases && currentTask.testCases.length > 0
        ? {
            code: code,
            language: selectedLanguage,
            testCases: currentTask.testCases,
            taskId: currentTask.id,
          }
        : {
            code: code,
            language: selectedLanguage,
            stdin: '',
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.error || 'Execution service unavailable. Please try again.'
        
        // Show toast notification
        showErrorToast(`⚠️ ${errorMessage}`, 5000)
        
        setExecutionResult({
          success: false,
          output: errorMessage,
          executionTime: 0,
          warnings: [],
          performanceMetrics: {
            executionTime: 0,
            memoryUsage: 0,
            complexity: 'Unknown',
          },
        })
        setShowExecutionResult(true)

        const errorMsg: Message = {
          id: Date.now().toString(),
          role: 'mentor',
          content: `❌ Execution Error: ${errorMessage}\n\n💡 Tip: Judge0 service might be temporarily slow. Try again in a moment, or contact support if this persists.`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMsg])
        return
      }

      // Format the real execution result
      const executionResult: ExecutionResult = {
        success: result.success,
        output: result.output || result.message || 'Execution completed',
        executionTime: result.executionTime ? parseFloat(result.executionTime) * 1000 : 0,
        warnings: result.status === 'Compilation Error' ? [result.status] : [],
        performanceMetrics: {
          executionTime: result.executionTime ? parseFloat(result.executionTime) * 1000 : 0,
          memoryUsage: result.memory ? result.memory / 1024 : 0,
          complexity: 'N/A',
        },
        testResults: result.results,
        testScore: result.score,
      }

      setExecutionResult(executionResult)
      setShowExecutionResult(true)

      // Generate mentor feedback based on test results or execution
      let feedbackContent = ''
      
      if (result.results && Array.isArray(result.results)) {
        // Test case execution results
        const testSummary = result.results
          .map((tr: TestResult, idx: number) => {
            const status = tr.passed ? '✅' : '❌'
            return `${status} Test ${idx + 1}: Input="${tr.input}" → Expected="${tr.expected}", Got="${tr.output}"`
          })
          .join('\n')
        
        feedbackContent = `🧪 Test Execution Results (${result.score}%)\n\n${testSummary}\n\n${result.message}`
      } else {
        // Simple execution results
        feedbackContent = result.success
          ? `✅ Code executed successfully!\n\nOutput:\n${result.output}\n\nExecution time: ${executionResult.executionTime.toFixed(2)}ms\nMemory used: ${executionResult.performanceMetrics.memoryUsage.toFixed(2)}MB\n\nReady to submit for evaluation?`
          : `⚠️ Code execution encountered issues:\n\n${result.output}\n\nLet's debug this together. Check the error message and try again!`
      }

      const feedbackMsg: Message = {
        id: Date.now().toString(),
        role: 'mentor',
        content: feedbackContent,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, feedbackMsg])
    } catch (error) {
      console.error('Execution error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Show toast notification for network/unexpected errors
      showErrorToast(`⚠️ Network error: ${errorMessage}. Please check your connection and try again.`, 5000)
      
      setExecutionResult({
        success: false,
        output: 'Failed to execute code. Please check your connection and try again.',
        executionTime: 0,
        warnings: [],
        performanceMetrics: {
          executionTime: 0,
          memoryUsage: 0,
          complexity: 'Unknown',
        },
      })
      setShowExecutionResult(true)

      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'mentor',
        content: `🔴 Error executing code: ${errorMessage}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsExecuting(false)
    }
  }

  const submitSolution = async () => {
    if (!code.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'mentor',
        content: 'Please write and run your code first before submitting!',
        timestamp: new Date(),
      }])
      return
    }

    if (!executionResult?.success) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'mentor',
        content: 'Your code needs to execute successfully before submission. Please fix any errors and run it again.',
        timestamp: new Date(),
      }])
      return
    }

    setLoading(true)
    try {
      // Prepare evaluation payload with test case results
      const evaluationPayload: any = {
        code: code,
        language: selectedLanguage,
        taskId: currentTask?.id,
        output: executionResult.output,
        executionTime: executionResult.executionTime,
      }

      // Include test case results if available
      if (executionResult.testResults && Array.isArray(executionResult.testResults)) {
        evaluationPayload.testResults = executionResult.testResults
        evaluationPayload.testScore = executionResult.testScore
        evaluationPayload.testSummary = `Passed ${executionResult.testResults.filter((r: TestResult) => r.passed).length}/${executionResult.testResults.length} test cases (${executionResult.testScore}%)`
      }

      // Call real evaluation endpoint
      const evaluationResponse = await fetch('/api/labs/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluationPayload),
      })

      const evaluationData = await evaluationResponse.json()

      if (!evaluationResponse.ok) {
        // Fallback feedback if evaluation fails
        const fallbackFeedback: Feedback = {
          correctness: executionResult.testScore || 70,
          efficiency: 65,
          codeQuality: 70,
          bestPractices: 60,
          documentation: 65,
          suggestions: [
            'Add error handling for edge cases',
            'Consider optimizing the algorithm',
            'Add code comments and documentation',
          ],
          nextSteps: [
            'Review the code structure',
            'Test with more examples',
            'Refactor for better readability',
          ],
          performanceMetrics: {
            executionTime: executionResult.executionTime,
            memoryUsage: executionResult.performanceMetrics.memoryUsage,
            complexity: 'Unknown',
          },
        }
        setFeedback(fallbackFeedback)
      } else {
        // Parse real evaluation response
        const feedback: Feedback = {
          correctness: evaluationData.scores?.correctness || 75,
          efficiency: evaluationData.scores?.efficiency || 70,
          codeQuality: evaluationData.scores?.codeQuality || 75,
          bestPractices: evaluationData.scores?.bestPractices || 70,
          documentation: evaluationData.scores?.documentation || 70,
          suggestions: evaluationData.suggestions || [
            'Code executed successfully',
            'Consider optimizing further',
          ],
          nextSteps: evaluationData.nextSteps || [
            'Review your solution',
            'Move to next task',
          ],
          performanceMetrics: {
            executionTime: executionResult.executionTime,
            memoryUsage: executionResult.performanceMetrics.memoryUsage,
            complexity: evaluationData.complexity || 'Unknown',
          },
        }
        setFeedback(feedback)
      }

      setStage('evaluating')

      // Update progress
      setProgress(prev => ({
        ...prev,
        tasksCompleted: prev.tasksCompleted + 1,
        tasksTotalAttempted: prev.tasksTotalAttempted + 1,
        successRate: Math.min(100, prev.successRate + 2),
        creditsEarned: prev.creditsEarned + 150,
        careerProgression: Math.min(100, prev.careerProgression + 3),
      }))

      // Generate comprehensive feedback message
      const avgScore = Math.round(
        (evaluationData.scores?.correctness ||
          evaluationData.scores?.efficiency ||
          evaluationData.scores?.codeQuality ||
          75) / 4
      )

      const feedbackMsg: Message = {
        id: Date.now().toString(),
        role: 'mentor',
        content: `✨ Evaluation Complete!

${executionResult.testScore !== undefined ? `**Test Cases:** ${executionResult.testScore}%\n` : ''}**Your Scores:**
${evaluationData.scores ? `- Correctness: ${evaluationData.scores.correctness || 'N/A'}/100
- Efficiency: ${evaluationData.scores.efficiency || 'N/A'}/100
- Code Quality: ${evaluationData.scores.codeQuality || 'N/A'}/100
- Best Practices: ${evaluationData.scores.bestPractices || 'N/A'}/100` : 'Code executed successfully!'}

**Credits Earned:** +150 points
**Execution Time:** ${executionResult.executionTime.toFixed(2)}ms

${evaluationData.suggestions?.length ? `**Suggestions:**\n${evaluationData.suggestions.map((s: string) => `• ${s}`).join('\n')}` : ''}

Great work! Ready for the next challenge?`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, feedbackMsg])

      // Save capability proof (only if test score exists)
      if (executionResult.testScore !== undefined && currentTask?.id) {
        try {
          const proofResponse = await fetch('/api/labs/save-proof', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              labId: currentTask.id,
              submissionId: Date.now().toString(), // Use timestamp as submission ID
              score: executionResult.testScore,
              passedTestCases: executionResult.testResults?.filter(
                (r: TestResult) => r.passed
              ).length || 0,
              totalTestCases: executionResult.testResults?.length || 0,
              taskType: currentTask.taskType,
            }),
          })

          const proofData = await proofResponse.json()

          if (proofResponse.ok && proofData.proof) {
            // Add capability verified message
            const capabilityMsg: Message = {
              id: (Date.now() + 2).toString(),
              role: 'mentor',
              content: `🎖️ ${proofData.message}\n\nThis capability has been verified and added to your profile. You can showcase it in your resume and with recruiters!`,
              timestamp: new Date(),
            }
            setMessages(prev => [...prev, capabilityMsg])
          }
        } catch (proofError) {
          console.error('Proof save error:', proofError)
          // Non-fatal error, evaluation already succeeded
        }
      }
    } catch (error) {
      console.error('Evaluation error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      
      // Show toast notification
      showErrorToast(`⚠️ Evaluation service error. Using fallback evaluation.`, 5000)
      
      // Fallback evaluation
      const fallbackFeedback: Feedback = {
        correctness: 75,
        efficiency: 70,
        codeQuality: 72,
        bestPractices: 68,
        documentation: 70,
        suggestions: [
          'Your code executed successfully!',
          'Consider edge cases and optimization',
        ],
        nextSteps: [
          'Review the solution',
          'Continue to next task',
        ],
        performanceMetrics: {
          executionTime: executionResult?.executionTime || 0,
          memoryUsage: executionResult?.performanceMetrics.memoryUsage || 0,
          complexity: 'Unknown',
        },
      }
      setFeedback(fallbackFeedback)
      setStage('evaluating')

      const fallbackMsg: Message = {
        id: Date.now().toString(),
        role: 'mentor',
        content: `✅ Code executed successfully! 

**Fallback Evaluation Applied:**
Using basic scoring since the AI evaluation service is temporarily unavailable. Your code has been recorded, and you'll receive detailed feedback once the service is restored.

💡 Tip: You can resubmit later for a full AI evaluation!`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, fallbackMsg])
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    const colors = {
      beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      intermediate: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      advanced: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      expert: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    }
    return colors[difficulty] || colors.beginner
  }

  return (
    <motion.div
      className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-b from-gray-950 via-gray-950 to-black"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="border-b border-gray-800/50 bg-gradient-to-b from-gray-900/50 to-transparent backdrop-blur-sm px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FlaskConical size={28} className="text-blue-400" />
              Capability Labs & Tasks
            </h1>
            <p className="text-sm text-gray-500 mt-1">Software Developer • Software Engineering Domain</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-xs">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2">
                <Award size={14} className="text-amber-400" />
                <span className="text-gray-300">{progress.creditsEarned} <span className="text-gray-600">Credits</span></span>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <span className="text-gray-300">{progress.tasksCompleted} <span className="text-gray-600">Done</span></span>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2">
                <Mountain size={14} className="text-blue-400" />
                <span className="text-gray-300">{progress.careerProgression}% <span className="text-gray-600">Progress</span></span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 overflow-hidden px-6 py-6">
        {/* Left Panel: Recommendations */}
        <motion.div
          variants={slideInVariants}
          className="w-96 flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        >
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Compass size={16} className="text-blue-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Stage</span>
            </div>
            <div className="space-y-2">
              {stage === 'discovery' && (
                <>
                  <div className="text-sm text-gray-300 font-medium">Browse Available Tasks</div>
                  <p className="text-xs text-gray-500">Select a task to begin. I'll check prerequisites and provide support.</p>
                </>
              )}
              {stage === 'prerequisite_check' && (
                <>
                  <div className="text-sm text-gray-300 font-medium">Prerequisite Analysis</div>
                  <p className="text-xs text-gray-500">Reviewing skill requirements and identifying gaps.</p>
                </>
              )}
              {stage === 'practicing' && (
                <>
                  <div className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <Flame size={14} className="text-orange-400" />
                    Active Practice Session
                  </div>
                  <p className="text-xs text-gray-500">Code, test, and refine your solution.</p>
                </>
              )}
              {stage === 'evaluating' && (
                <>
                  <div className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" />
                    Evaluation Complete
                  </div>
                  <p className="text-xs text-gray-500">Review feedback and plan next steps.</p>
                </>
              )}
            </div>
          </div>

          {/* Verified Capabilities */}
          {verifiedCapabilities.length > 0 && (
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Verified Skills</span>
              </div>
              <div className="space-y-2">
                {verifiedCapabilities.map((proof, idx) => (
                  <div key={idx} className="text-sm bg-emerald-900/30 border border-emerald-700/30 rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-emerald-200">{proof.capability}</div>
                        <div className="text-xs text-emerald-400">{proof.level}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-300">{proof.score}%</div>
                        <div className="text-xs text-emerald-500">{proof.passedTestCases}/{proof.totalTestCases}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stage === 'discovery' && recommendations.length > 0 && (
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Lightbulb size={16} className="text-yellow-400" />
                  Recommended Tasks
                </h2>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                  {recommendations.length} available
                </span>
              </div>

              {recommendations.map((task) => (
                <motion.button
                  key={task.id}
                  variants={itemVariants}
                  onClick={() => selectTask(task)}
                  className="w-full text-left bg-gray-900/50 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/80 rounded-lg p-4 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors mb-1">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${getDifficultyColor(task.difficulty)}`}>
                          <Mountain size={12} />
                          {task.difficulty}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {task.estimatedTime} min
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-blue-400">{task.alignmentScore}%</div>
                      <div className="text-[10px] text-gray-600">Match</div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.skillsTrained.slice(0, 2).map((skill) => (
                      <span key={skill} className="text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {task.skillsTrained.length > 2 && (
                      <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-1 rounded">
                        +{task.skillsTrained.length - 2} more
                      </span>
                    )}
                  </div>

                  {task.prerequisites.some(p => !p.isMet) && (
                    <div className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded px-2 py-1">
                      <AlertCircle size={12} />
                      {task.prerequisites.filter(p => !p.isMet).length} prerequisite gap(s)
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                    <span className="text-xs text-gray-600">Click to select</span>
                    <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          <AnimatePresence>
            {showPrerequisiteWarning && unmetPrerequisites.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4"
              >
                <div className="flex gap-3">
                  <AlertCircle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-orange-300 mb-2">Prerequisites Check</h3>
                    <div className="space-y-2 mb-3">
                      {unmetPrerequisites.map((prereq) => (
                        <div key={prereq.skill} className="text-xs text-gray-300 flex items-center justify-between">
                          <span>{prereq.skill}: {prereq.current}/{prereq.required}</span>
                          {prereq.alternatePathAvailable && (
                            <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded">
                              Alternate path available
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => selectedTask && proceedWithTask(selectedTask)}
                      className="w-full text-xs font-semibold bg-orange-600/40 hover:bg-orange-600/60 text-orange-200 px-3 py-2 rounded transition-colors"
                    >
                      Proceed with Scaffolding
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(stage === 'evaluating' || stage === 'practicing') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3"
            >
              <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Brain size={16} className="text-blue-400" />
                Your Progress
              </h3>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Career Progression</span>
                  <span className="text-xs font-bold text-blue-400">{progress.careerProgression}%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.careerProgression}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">~{progress.estimatedDaysToGoal} days to {progress.nextMilestone}</p>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-gray-400 mb-2">Domain Proficiency</div>
                {Object.entries(progress.domainProficiency).map(([domain, level]) => (
                  <div key={domain}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">{domain}</span>
                      <span className="text-xs font-bold text-gray-300">{level}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{ width: `${level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Center: Chat & Editor */}
        <motion.div
          variants={slideInVariants}
          className="flex-1 flex flex-col gap-4 min-w-0"
        >
          {/* Chat */}
          <div className="flex-1 bg-gray-900/30 border border-gray-800 rounded-lg flex flex-col overflow-hidden min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600/40 text-blue-100 border border-blue-500/20'
                          : 'bg-gray-800/50 text-gray-200 border border-gray-700 text-left'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-xs leading-relaxed">{msg.content}</p>
                      <span className="text-[10px] text-gray-500 mt-2 block">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
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
                  <div className="bg-gray-800/50 border border-gray-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <Loader size={14} className="text-blue-400 animate-spin" />
                    <span className="text-xs text-gray-400">Thinking...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-800 p-4 bg-gray-900/50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask for hints, test results, or guidance..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/80"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Code Editor */}
          {stage !== 'discovery' && currentTask && (
            <motion.div
              variants={itemVariants}
              className="bg-gray-900/30 border border-gray-800 rounded-lg flex flex-col overflow-hidden max-h-80"
            >
              <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Code size={16} className="text-blue-400" />
                  <span className="text-sm font-semibold text-gray-200">Code Editor</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as any)}
                    className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1 rounded"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="typescript">TypeScript</option>
                  </select>
                </div>
                <span className="text-xs text-gray-500">
                  Constraints: {currentTask.constraints.length} | Tests: {currentTask.testCases?.length || 0}
                </span>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Write your solution here..."
                  className="flex-1 bg-gray-950 text-gray-100 p-4 font-mono text-xs border-0 resize-none focus:outline-none focus:ring-0 overflow-auto scrollbar-thin scrollbar-thumb-gray-700"
                />

                <div className="bg-gray-900/50 border-t border-gray-800 px-4 py-3 flex gap-2">
                  <button
                    onClick={runCode}
                    disabled={isExecuting || !code.trim()}
                    className="flex-1 bg-blue-600/40 hover:bg-blue-600/60 disabled:bg-gray-700 disabled:text-gray-600 text-blue-200 font-semibold py-2 px-3 rounded transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Play size={16} />
                    {isExecuting ? 'Running...' : 'Run Code'}
                  </button>

                  <button
                    onClick={() => setHintLevel(Math.min(hintLevel + 1, (currentTask?.hints?.length || 1) - 1))}
                    className="bg-yellow-600/40 hover:bg-yellow-600/60 text-yellow-200 font-semibold py-2 px-4 rounded transition-colors flex items-center gap-2 text-sm"
                  >
                    <Lightbulb size={16} />
                    Hint ({hintLevel + 1})
                  </button>

                  {executionResult?.success && (
                    <button
                      onClick={submitSolution}
                      disabled={loading}
                      className="flex-1 bg-emerald-600/40 hover:bg-emerald-600/60 disabled:bg-gray-700 text-emerald-200 font-semibold py-2 px-3 rounded transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle size={16} />
                      {loading ? 'Evaluating...' : 'Submit'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Right: Task Info & Feedback */}
        <motion.div
          variants={slideInVariants}
          className="w-80 flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        >
          {currentTask && stage !== 'discovery' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 space-y-4"
            >
              <div>
                <h2 className="text-sm font-bold text-white mb-2">{currentTask.title}</h2>
                <p className="text-xs text-gray-400">{currentTask.description}</p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                  <Target size={14} className="text-emerald-400" />
                  Expected Outcome
                </h3>
                <p className="text-xs text-gray-400 bg-gray-800/50 rounded p-2 border border-gray-700">
                  {currentTask.expectedOutcome}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                  <Shield size={14} className="text-blue-400" />
                  Constraints
                </h3>
                <ul className="space-y-1">
                  {currentTask.constraints.map((constraint, i) => (
                    <li key={i} className="text-xs text-gray-400 flex gap-2">
                      <span className="text-blue-400 flex-shrink-0">•</span>
                      <span>{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                  <Zap size={14} className="text-yellow-400" />
                  Skills Trained
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentTask.skillsTrained.map((skill) => (
                    <span key={skill} className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {currentTask.hints && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                  <h3 className="text-xs font-semibold text-yellow-300 mb-1 flex items-center gap-1">
                    <Lightbulb size={14} />
                    Hint ({hintLevel + 1}/{currentTask.hints.length})
                  </h3>
                  <p className="text-xs text-yellow-100">{currentTask.hints[hintLevel % currentTask.hints.length]}</p>
                </div>
              )}
            </motion.div>
          )}

          <AnimatePresence>
            {showExecutionResult && executionResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`border rounded-lg p-4 ${
                  executionResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {executionResult.success ? (
                    <>
                      <CheckCircle size={16} className="text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-300">Execution Successful</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-red-400" />
                      <span className="text-sm font-bold text-red-300">Execution Failed</span>
                    </>
                  )}
                </div>

                <div className="bg-gray-950 border border-gray-800 rounded p-3 mb-3">
                  <p className="text-xs font-mono text-gray-300 whitespace-pre-wrap">{executionResult.output}</p>
                </div>

                {executionResult.performanceMetrics && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>⏱️ Time:</span>
                      <span className="text-gray-300 font-mono">{executionResult.performanceMetrics.executionTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>💾 Memory:</span>
                      <span className="text-gray-300 font-mono">{executionResult.performanceMetrics.memoryUsage}MB</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>📊 Complexity:</span>
                      <span className="text-gray-300 font-mono">{executionResult.performanceMetrics.complexity}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {feedback && stage === 'evaluating' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-lg p-4 space-y-4"
              >
                <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle size={16} />
                  Detailed Feedback
                </h3>

                <div className="space-y-2">
                  {[
                    { label: 'Correctness', value: feedback.correctness, color: 'from-emerald-500 to-teal-500' },
                    { label: 'Code Quality', value: feedback.codeQuality, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Efficiency', value: feedback.efficiency, color: 'from-yellow-500 to-orange-500' },
                    { label: 'Best Practices', value: feedback.bestPractices, color: 'from-purple-500 to-pink-500' },
                    { label: 'Documentation', value: feedback.documentation, color: 'from-indigo-500 to-blue-500' },
                  ].map((score) => (
                    <div key={score.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-300">{score.label}</span>
                        <span className="text-xs font-bold text-gray-200">{score.value}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score.value}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className={`h-full bg-gradient-to-r ${score.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {feedback.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                      <Lightbulb size={13} />
                      Improvement Areas
                    </h4>
                    <ul className="space-y-1">
                      {feedback.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-xs text-gray-400 flex gap-2">
                          <span className="text-yellow-400 flex-shrink-0">→</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.nextSteps.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                      <ArrowRight size={13} />
                      Next Steps
                    </h4>
                    <ul className="space-y-1">
                      {feedback.nextSteps.map((step, i) => (
                        <li key={i} className="text-xs text-gray-400 flex gap-2">
                          <span className="text-emerald-400 flex-shrink-0">→</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => {
                    setStage('discovery')
                    setCurrentTask(null)
                    setFeedback(null)
                    setShowExecutionResult(false)
                  }}
                  className="w-full bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-200 font-semibold py-2 rounded transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Load Next Task
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {currentTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4"
            >
              <h3 className="text-xs font-semibold text-purple-300 mb-2 flex items-center gap-1">
                <Mountain size={14} />
                Career Impact
              </h3>
              <p className="text-xs text-gray-300 mb-3">{currentTask.careerImpact}</p>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Alignment Score:</span>
                  <span className="font-bold text-purple-300">{currentTask.alignmentScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Domain:</span>
                  <span className="font-bold text-purple-300">{currentTask.relatedDomain}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
