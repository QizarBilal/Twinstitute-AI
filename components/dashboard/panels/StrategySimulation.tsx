'use client'

import { useState } from 'react'

const strategies = [
  { id: 'specialist', label: 'Domain Mastery Path', score: 82, trend: 'up' },
  { id: 'fullstack', label: 'Multi-Capability Path', score: 76, trend: 'stable' },
  { id: 'leadership', label: 'Leadership Formation Track', score: 68, trend: 'up' }
]

export default function CapabilityPathSimulation() {
  const [activeStrategy, setActiveStrategy] = useState('specialist')
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        bg-gray-900 border border-gray-800 rounded-xl p-6 h-full
        transition-all duration-300
        ${isHovered ? 'border-gray-700 shadow-lg shadow-purple-500/5' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Capability Path Simulation
          </h3>
          <p className="text-[10px] text-gray-600">Capability trajectory modeling</p>
        </div>
        <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
          Run New
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {strategies.map((strategy) => (
          <button
            key={strategy.id}
            onClick={() => setActiveStrategy(strategy.id)}
            className={`
              flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
              ${activeStrategy === strategy.id
                ? 'bg-gray-800 text-gray-100 border border-gray-700'
                : 'text-gray-500 hover:text-gray-400 hover:bg-gray-800/50'
              }
            `}
          >
            {strategy.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {strategies.map((strategy) => {
          const isActive = activeStrategy === strategy.id
          const points = Array.from({ length: 20 }, (_, i) => ({
            x: i * 5,
            y: 60 - (strategy.score * 0.5) + Math.sin(i * 0.5) * 8
          }))

          return (
            <div
              key={strategy.id}
              className={`
                transition-all duration-300
                ${isActive ? 'opacity-100' : 'opacity-40'}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`
                    w-1.5 h-1.5 rounded-full
                    ${strategy.id === 'specialist' ? 'bg-blue-500' : ''}
                    ${strategy.id === 'fullstack' ? 'bg-purple-500' : ''}
                    ${strategy.id === 'leadership' ? 'bg-green-500' : ''}
                  `}/>
                  <span className="text-xs text-gray-400">{strategy.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-300">{strategy.score}%</span>
                  {strategy.trend === 'up' && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  )}
                </div>
              </div>
              
              <svg width="100%" height="40" className="overflow-visible">
                <defs>
                  <linearGradient id={`gradient-${strategy.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={
                      strategy.id === 'specialist' ? '#3b82f6' :
                      strategy.id === 'fullstack' ? '#a855f7' : '#10b981'
                    } stopOpacity="0.2"/>
                    <stop offset="100%" stopColor={
                      strategy.id === 'specialist' ? '#3b82f6' :
                      strategy.id === 'fullstack' ? '#a855f7' : '#10b981'
                    } stopOpacity="0.5"/>
                  </linearGradient>
                </defs>
                
                <path
                  d={`M ${points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.x / 100) * 100}% ${p.y}`).join(' ')}`}
                  fill="none"
                  stroke={`url(#gradient-${strategy.id})`}
                  strokeWidth="2"
                  className="transition-all duration-500"
                />
              </svg>
            </div>
          )
        })}
      </div>
    </div>
  )
}
