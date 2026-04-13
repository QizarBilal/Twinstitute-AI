'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Copy, Loader, Code2 } from 'lucide-react'

interface CodeEditorPanelProps {
  language?: 'python' | 'javascript'
  onSubmit?: (code: string) => void
  loading?: boolean
}

export function CodeEditorPanel({ language = 'python', onSubmit, loading = false }: CodeEditorPanelProps) {
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const handleRun = async () => {
    if (!code.trim()) return

    setIsRunning(true)
    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 800))

      // Mock output based on language
      const mockOutput = language === 'python'
        ? 'Hello, World!\nExecution completed successfully.\n✓ All tests passed'
        : 'Hello, World!\nExecution completed successfully.\n✓ All tests passed'

      setOutput(mockOutput)
    } finally {
      setIsRunning(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col"
    >
      {/* HEADER */}
      <div className="bg-gray-800/50 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">
            {language === 'python' ? 'Python' : 'JavaScript'}
          </span>
        </div>
        <button
          onClick={handleCopyCode}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Copy code"
        >
          <Copy className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* EDITOR */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="# Write your solution here..."
          className="flex-1 bg-gray-950 text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none border-0"
          spellCheck="false"
        />
      </div>

      {/* RUN BUTTON */}
      <div className="border-t border-gray-800 p-4 bg-gray-900/50">
        <button
          onClick={handleRun}
          disabled={!code.trim() || isRunning || loading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          {isRunning || loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Code
            </>
          )}
        </button>
      </div>

      {/* OUTPUT CONSOLE */}
      {output && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-gray-800 bg-gray-950/50 p-4 max-h-48 overflow-y-auto"
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Output</p>
          <div className="bg-gray-900 rounded p-3 font-mono text-xs text-green-400 space-y-1">
            {output.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
