'use client'

import { useState } from 'react'

const skillClusters = [
  { category: 'Frontend', skills: [
    { name: 'React', level: 4 },
    { name: 'TypeScript', level: 3 },
    { name: 'Next.js', level: 2 },
    { name: 'CSS', level: 4 }
  ]},
  { category: 'Backend', skills: [
    { name: 'Node.js', level: 3 },
    { name: 'PostgreSQL', level: 2 },
    { name: 'Redis', level: 1 },
    { name: 'GraphQL', level: 2 }
  ]},
  { category: 'DevOps', skills: [
    { name: 'Docker', level: 2 },
    { name: 'AWS', level: 1 },
    { name: 'CI/CD', level: 3 },
    { name: 'K8s', level: 0 }
  ]},
  { category: 'Soft Skills', skills: [
    { name: 'Leadership', level: 2 },
    { name: 'Communication', level: 4 },
    { name: 'Mentoring', level: 1 },
    { name: 'Stakeholder Mgmt', level: 2 }
  ]}
]

export default function SkillGenomeWeakClusterMap() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const getColor = (level: number) => {
    if (level === 0) return 'bg-red-500/20 border-red-500/40'
    if (level === 1) return 'bg-orange-500/20 border-orange-500/40'
    if (level === 2) return 'bg-yellow-500/20 border-yellow-500/40'
    if (level === 3) return 'bg-green-500/20 border-green-500/40'
    return 'bg-blue-500/20 border-blue-500/40'
  }

  const getTextColor = (level: number) => {
    if (level === 0) return 'text-red-400'
    if (level === 1) return 'text-orange-400'
    if (level === 2) return 'text-yellow-400'
    if (level === 3) return 'text-green-400'
    return 'text-blue-400'
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        bg-gray-900 border border-gray-800 rounded-xl p-6 h-full
        transition-all duration-300
        ${isHovered ? 'border-gray-700 shadow-lg shadow-green-500/5' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Skill Genome Weak Cluster Map
          </h3>
          <p className="text-[10px] text-gray-600">Weak cluster identification heatmap</p>
        </div>
        <button className="text-xs text-green-400 hover:text-green-300 font-medium">
          Analyze
        </button>
      </div>

      <div className="space-y-4">
        {skillClusters.map((cluster) => (
          <div key={cluster.category}>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {cluster.category}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {cluster.skills.map((skill) => (
                <div
                  key={skill.name}
                  onMouseEnter={() => setHoveredSkill(skill.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  className="relative"
                >
                  <div className={`
                    aspect-square rounded-lg border transition-all duration-200
                    flex flex-col items-center justify-center p-2 cursor-pointer
                    ${getColor(skill.level)}
                    ${hoveredSkill === skill.name ? 'scale-105 shadow-lg' : ''}
                  `}>
                    <div className={`text-xs font-bold ${getTextColor(skill.level)}`}>
                      {skill.level}
                    </div>
                    <div className="text-[9px] text-gray-400 text-center mt-0.5 leading-tight">
                      {skill.name}
                    </div>
                  </div>
                  
                  {hoveredSkill === skill.name && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 animate-in fade-in slide-in-from-bottom-1 duration-150">
                      <div className="bg-gray-800 border border-gray-700 px-2 py-1 rounded text-[10px] text-gray-300 whitespace-nowrap shadow-lg">
                        {skill.name}: Level {skill.level}/4
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-800">
        <div className="text-[10px] text-gray-500">Legend</div>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((level) => (
            <div key={level} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-sm border ${getColor(level)}`}/>
              <span className="text-[9px] text-gray-600">{level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
