'use client'

import { useState } from 'react'

export default function CapabilityStrengthIndex() {
  const [isHovered, setIsHovered] = useState(false)
  
  const score = 87
  const delta = 12
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        bg-gray-900 border border-gray-800 rounded-xl p-6 h-full
        transition-all duration-300
        ${isHovered ? 'border-gray-700 shadow-lg shadow-blue-500/5' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Capability Strength Index
          </h3>
          <p className="text-[10px] text-gray-600">Overall capability strength score</p>
        </div>
        <button className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-750 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center py-6">
        <div className="relative">
          <svg width="140" height="140" className="transform -rotate-90">
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-800"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              className="text-blue-500 transition-all duration-1000"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-100">{score}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Score</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-4">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
          <span className="text-sm font-semibold text-green-500">+{delta}</span>
          <span className="text-xs text-gray-500">from last week</span>
        </div>
      </div>

      {isHovered && (
        <div className="pt-4 border-t border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-gray-500 mb-1">Strengths</div>
              <div className="text-sm font-semibold text-gray-300">8/10</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 mb-1">Gaps</div>
              <div className="text-sm font-semibold text-gray-300">2/10</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
