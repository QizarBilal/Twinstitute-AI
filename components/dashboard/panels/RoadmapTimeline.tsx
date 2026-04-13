'use client'

import { useState } from 'react'

const milestones = [
  { id: 1, label: 'Baseline Formation', status: 'complete', date: 'Q1 2026' },
  { id: 2, label: 'Capability Proof', status: 'complete', date: 'Q1 2026' },
  { id: 3, label: 'Institutional Network', status: 'active', date: 'Q2 2026' },
  { id: 4, label: 'Leadership Capability', status: 'pending', date: 'Q3 2026' },
  { id: 5, label: 'External Validation', status: 'pending', date: 'Q4 2026' }
]

export default function FormationMilestoneTimeline() {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        bg-gray-900 border border-gray-800 rounded-xl p-6 h-full
        transition-all duration-300
        ${isHovered ? 'border-gray-700 shadow-lg shadow-cyan-500/5' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Formation Milestone Timeline
          </h3>
          <p className="text-[10px] text-gray-600">Capability formation milestone tracking</p>
        </div>
        <div className="text-xs text-gray-400">
          <span className="font-semibold text-cyan-400">2/5</span> Complete
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-800"/>
        <div className="absolute top-4 left-0 h-0.5 bg-cyan-500 transition-all duration-1000" style={{ width: '40%' }}/>

        <div className="relative flex justify-between">
          {milestones.map((milestone, idx) => {
            const isHoveredItem = hoveredMilestone === milestone.id
            
            return (
              <div
                key={milestone.id}
                onMouseEnter={() => setHoveredMilestone(milestone.id)}
                onMouseLeave={() => setHoveredMilestone(null)}
                className="flex flex-col items-center"
                style={{ width: `${100 / milestones.length}%` }}
              >
                <div className="relative">
                  <div className={`
                    w-8 h-8 rounded-full border-2 transition-all duration-200 cursor-pointer
                    flex items-center justify-center
                    ${milestone.status === 'complete' 
                      ? 'bg-cyan-500 border-cyan-500' 
                      : milestone.status === 'active'
                        ? 'bg-gray-900 border-cyan-500'
                        : 'bg-gray-900 border-gray-700'
                    }
                    ${isHoveredItem ? 'scale-125 shadow-lg' : ''}
                  `}>
                    {milestone.status === 'complete' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : milestone.status === 'active' ? (
                      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"/>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-700"/>
                    )}
                  </div>

                  {isHoveredItem && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-10 animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <div className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg shadow-xl min-w-max">
                        <div className="text-xs font-semibold text-gray-200 mb-0.5">{milestone.label}</div>
                        <div className="text-[10px] text-gray-500">{milestone.date}</div>
                        <div className={`
                          text-[10px] font-medium mt-1
                          ${milestone.status === 'complete' ? 'text-cyan-400' : ''}
                          ${milestone.status === 'active' ? 'text-yellow-400' : ''}
                          ${milestone.status === 'pending' ? 'text-gray-500' : ''}
                        `}>
                          {milestone.status === 'complete' ? 'Completed' : ''}
                          {milestone.status === 'active' ? 'In Progress' : ''}
                          {milestone.status === 'pending' ? 'Upcoming' : ''}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-center">
                  <div className="text-[10px] font-medium text-gray-400 mb-0.5">
                    {milestone.label}
                  </div>
                  <div className="text-[9px] text-gray-600">
                    {milestone.date}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800 grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] text-gray-500 mb-1">Completed</div>
          <div className="text-sm font-semibold text-cyan-400">2</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-1">Active</div>
          <div className="text-sm font-semibold text-yellow-400">1</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-1">Upcoming</div>
          <div className="text-sm font-semibold text-gray-500">2</div>
        </div>
      </div>
    </div>
  )
}
