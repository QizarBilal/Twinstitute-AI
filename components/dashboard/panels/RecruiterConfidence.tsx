'use client'

import { useState } from 'react'

const strengths = [
  { signal: 'Technical depth in React/TypeScript', strength: 'high' },
  { signal: 'Active GitHub contributions', strength: 'high' },
  { signal: 'Proof portfolio demonstrates expertise', strength: 'medium' }
]

const weaknesses = [
  { signal: 'Limited leadership examples', severity: 'medium' },
  { signal: 'No AWS certifications', severity: 'low' }
]

export default function CapabilityProofConfidence() {
  const [isHovered, setIsHovered] = useState(false)
  const confidenceScore = 78

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        bg-gray-900 border border-gray-800 rounded-xl p-6 h-full
        transition-all duration-300
        ${isHovered ? 'border-gray-700 shadow-lg shadow-orange-500/5' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Capability Proof Confidence
          </h3>
          <p className="text-[10px] text-gray-600">Proof artifact validation strength</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-gray-100">{confidenceScore}</div>
          <div className="text-[10px] text-gray-500">/ 100</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">
              Proof Signals
            </div>
            <div className="text-[10px] text-gray-500">{strengths.length} detected</div>
          </div>
          <div className="space-y-2">
            {strengths.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-lg bg-gray-800/50 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className={`
                  w-1 h-1 rounded-full mt-1.5 flex-shrink-0
                  ${item.strength === 'high' ? 'bg-green-500' : 'bg-yellow-500'}
                `}/>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-300 leading-tight">{item.signal}</div>
                </div>
                <div className={`
                  px-1.5 py-0.5 rounded text-[9px] font-medium flex-shrink-0
                  ${item.strength === 'high' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                  }
                `}>
                  {item.strength}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">
              Gap Signals
            </div>
            <div className="text-[10px] text-gray-500">{weaknesses.length} flagged</div>
          </div>
          <div className="space-y-2">
            {weaknesses.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-lg bg-gray-800/50 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className={`
                  w-1 h-1 rounded-full mt-1.5 flex-shrink-0
                  ${item.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'}
                `}/>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-300 leading-tight">{item.signal}</div>
                </div>
                <div className={`
                  px-1.5 py-0.5 rounded text-[9px] font-medium flex-shrink-0
                  ${item.severity === 'medium' 
                    ? 'bg-orange-500/20 text-orange-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                  }
                `}>
                  {item.severity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isHovered && (
        <button className="w-full mt-4 py-2 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg text-xs font-medium text-gray-300 transition-colors animate-in fade-in slide-in-from-top-2 duration-200">
          View Full Analysis
        </button>
      )}
    </div>
  )
}
