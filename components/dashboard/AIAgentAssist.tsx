'use client'

import { useState } from 'react'

export default function AIAgentAssist() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to your Institutional Mentor Panel. How can I assist with your capability formation today?' }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    
    setMessages([...messages, 
      { role: 'user', content: input },
      { role: 'assistant', content: 'Analyzing your capability twin state and formation progress. Let me retrieve the relevant data from your proof portfolio...' }
    ])
    setInput('')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 w-14 h-14 rounded-full
          bg-gradient-to-br from-blue-600 to-purple-600
          shadow-lg hover:shadow-xl hover:scale-105
          transition-all duration-300
          flex items-center justify-center
          ${isOpen ? 'rotate-180' : ''}
          z-50
        `}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            <circle cx="9" cy="10" r="1"/>
            <circle cx="12" cy="10" r="1"/>
            <circle cx="15" cy="10" r="1"/>
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-40 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-100">Institutional Mentor</div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"/>
                  <span className="text-[10px] text-gray-500">Active</span>
                </div>
              </div>
            </div>
            <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              New Session
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`
                  flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200
                  ${message.role === 'user' ? 'justify-end' : 'justify-start'}
                `}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="2"/>
                    </svg>
                  </div>
                )}
                <div className={`
                  max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed
                  ${message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 border border-gray-700'
                  }
                `}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your capability formation..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-600"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <button className="px-2 py-1 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded text-[10px] text-gray-400 hover:text-gray-300 transition-colors">
                Analyze genome
              </button>
              <button className="px-2 py-1 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded text-[10px] text-gray-400 hover:text-gray-300 transition-colors">
                Formation paths
              </button>
              <button className="px-2 py-1 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded text-[10px] text-gray-400 hover:text-gray-300 transition-colors">
                Proof artifacts
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
