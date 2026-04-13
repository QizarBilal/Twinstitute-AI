'use client'

import { useState } from 'react'

const dataPoints = [
  { month: 'Feb', score: 72 },
  { month: 'Mar', score: 76 },
  { month: 'Apr', score: 79 },
  { month: 'May', score: 82 },
  { month: 'Jun', score: 85 },
  { month: 'Jul', score: 87 }
]

export default function CapabilityTwinProjection() {
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  const maxScore = Math.max(...dataPoints.map(d => d.score))
  const minScore = Math.min(...dataPoints.map(d => d.score))
  const range = maxScore - minScore

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        bg-gray-900 border border-gray-800 rounded-xl p-6 h-full
        transition-all duration-300
        ${isHovered ? 'border-gray-700 shadow-lg shadow-indigo-500/5' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Capability Twin Projection
          </h3>
          <p className="text-[10px] text-gray-600">Twin state trajectory analysis</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"/>
          <span className="text-[10px] text-gray-500">Live</span>
        </div>
      </div>

      <div className="relative h-40 mb-4">
        <svg width="100%" height="100%" className="overflow-visible">
          <defs>
            <linearGradient id="projection-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
            </linearGradient>
          </defs>

          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 4"
            className="text-gray-800"
          />

          {dataPoints.map((point, idx) => {
            const x = (idx / (dataPoints.length - 1)) * 100
            const y = 100 - ((point.score - minScore) / range * 80 + 10)
            const nextPoint = dataPoints[idx + 1]

            return (
              <g key={idx}>
                {nextPoint && (
                  <>
                    <path
                      d={`
                        M ${x}% ${y}%
                        L ${((idx + 1) / (dataPoints.length - 1)) * 100}% ${100 - ((nextPoint.score - minScore) / range * 80 + 10)}%
                        L ${((idx + 1) / (dataPoints.length - 1)) * 100}% 100%
                        L ${x}% 100%
                        Z
                      `}
                      fill="url(#projection-gradient)"
                      className="transition-all duration-500"
                    />
                    <line
                      x1={`${x}%`}
                      y1={`${y}%`}
                      x2={`${((idx + 1) / (dataPoints.length - 1)) * 100}%`}
                      y2={`${100 - ((nextPoint.score - minScore) / range * 80 + 10)}%`}
                      stroke="#6366f1"
                      strokeWidth="2"
                      className="transition-all duration-500"
                    />
                  </>
                )}

                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r={hoveredPoint === idx ? "5" : "3"}
                  fill="#6366f1"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                {hoveredPoint === idx && (
                  <g className="animate-in fade-in duration-150">
                    <rect
                      x={`${x}%`}
                      y={`${y - 35}%`}
                      width="60"
                      height="28"
                      rx="4"
                      fill="#1f2937"
                      stroke="#374151"
                      transform={`translate(-30, 0)`}
                    />
                    <text
                      x={`${x}%`}
                      y={`${y - 25}%`}
                      textAnchor="middle"
                      className="text-[10px] fill-gray-400"
                    >
                      {point.month}
                    </text>
                    <text
                      x={`${x}%`}
                      y={`${y - 15}%`}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-indigo-400"
                    >
                      {point.score}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-500 px-1">
        {dataPoints.map((point, idx) => (
          <div key={idx} className="text-center">
            {point.month}
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-800 grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] text-gray-500 mb-1">Current</div>
          <div className="text-sm font-semibold text-gray-300">{dataPoints[dataPoints.length - 1].score}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-1">Growth</div>
          <div className="text-sm font-semibold text-indigo-400">+{dataPoints[dataPoints.length - 1].score - dataPoints[0].score}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-1">Target</div>
          <div className="text-sm font-semibold text-gray-300">95</div>
        </div>
      </div>
    </div>
  )
}
