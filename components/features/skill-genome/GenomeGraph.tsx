'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useMemo } from 'react'
import { SkillNode, SkillEdge } from '@/types/genome'
import { Zap, Circle } from 'lucide-react'

interface GenomeGraphProps {
  nodes: SkillNode[]
  edges: SkillEdge[]
  onSelectNode: (node: SkillNode) => void
  selectedNodeId?: string
  loading: boolean
}

export function GenomeGraph({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
  loading,
}: GenomeGraphProps) {
  // Simulated graph layout using force-directed algorithm
  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {}
    const centerX = 400
    const centerY = 300
    const radius = 250

    nodes.forEach((node, idx) => {
      const angle = (idx / Math.max(nodes.length, 1)) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      
      // Validate coordinates are numbers
      pos[node.id] = {
        x: isNaN(x) ? centerX : x,
        y: isNaN(y) ? centerY : y,
      }
    })

    return pos
  }, [nodes])

  const getNodeColor = (type: string) => {
    if (type === 'strong') return 'rgb(16, 185, 129)'
    if (type === 'medium') return 'rgb(59, 130, 246)'
    if (type === 'weak') return 'rgb(239, 68, 68)'
    return 'rgb(107, 114, 128)'
  }

  const getNodeSize = (proficiency: number): number => {
    if (typeof proficiency !== 'number' || isNaN(proficiency)) {
      return 24 // Default size for invalid proficiency
    }
    return Math.max(24, Math.min(proficiency / 4 + 20, 60)) // Cap max size at 60
  }

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-gray-900/50 border border-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-cyan-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-400">Loading your skill genome...</p>
        </div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gray-900/50 border border-gray-800 rounded-lg flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-4">
          <Zap className="text-blue-400" size={32} />
        </div>
        <h3 className="text-white font-semibold mb-2">No Skills Yet</h3>
        <p className="text-gray-400 text-sm max-w-xs text-center">
          Complete some labs and prove your capabilities to build your skill genome
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden"
    >
      {/* SVG Graph Background */}
      <svg width="100%" height="600" className="bg-gradient-to-br from-gray-900 to-gray-950">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 217, 255, 0.2)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
          </linearGradient>
        </defs>

        {/* Edges (Links between skills) */}
        <g className="edges">
          {edges.map((edge) => {
            const fromNode = nodes.find(n => n.id === edge.from)
            const toNode = nodes.find(n => n.id === edge.to)

            if (!fromNode || !toNode) return null

            const from = positions[edge.from]
            const to = positions[edge.to]

            // Skip if positions are invalid
            if (!from || !to || isNaN(from.x) || isNaN(from.y) || isNaN(to.x) || isNaN(to.y)) {
              return null
            }

            const strength = Math.max(0, Math.min(edge.strength || 0, 1))
            const strokeWidth = Math.max(0.5, strength * 2)

            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={String(from.x)}
                y1={String(from.y)}
                x2={String(to.x)}
                y2={String(to.y)}
                stroke="url(#edgeGradient)"
                strokeWidth={String(strokeWidth)}
                opacity={0.4}
                className="transition-opacity hover:opacity-70"
              />
            )
          })}
        </g>

        {/* Nodes (Skills) */}
        <g className="nodes">
          {nodes.map((node) => {
            const size = getNodeSize(node.proficiency || 0)
            const pos = positions[node.id]
            const color = getNodeColor(node.type)
            const isSelected = selectedNodeId === node.id
            const proficiency = typeof node.proficiency === 'number' ? node.proficiency : 0

            // Skip if position is invalid
            if (!pos || isNaN(pos.x) || isNaN(pos.y)) return null

            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Glow effect for selected */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={String(Math.max(0, size + 12))}
                    fill="rgba(0, 217, 255, 0.15)"
                    filter="url(#glow)"
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={String(Math.max(0, size))}
                  fill={color}
                  fillOpacity={isSelected ? 1 : 0.8}
                  stroke={isSelected ? '#00D9FF' : color}
                  strokeWidth={isSelected ? 3 : 1}
                  className="cursor-pointer transition-all hover:filter hover:brightness-125"
                  onClick={() => {
                    try {
                      if (node && onSelectNode) {
                        onSelectNode(node)
                      }
                    } catch (error) {
                      console.error('Error selecting node:', error)
                    }
                  }}
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 20px rgba(0, 217, 255, 0.4))' : 'none',
                  }}
                />

                {/* Node label */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dy="0.3em"
                  className="text-xs font-bold fill-white pointer-events-none select-none"
                  fontSize="11"
                >
                  {`${Math.round(proficiency)}%`}
                </text>

                {/* Tooltip on hover */}
                <title>{node.label}</title>
              </motion.g>
            )
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 px-4 py-3 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgb(16, 185, 129)' }} />
          <span className="text-xs text-gray-400">Strong</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgb(59, 130, 246)' }} />
          <span className="text-xs text-gray-400">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgb(239, 68, 68)' }} />
          <span className="text-xs text-gray-400">Weak</span>
        </div>
        <div className="text-xs text-gray-500 ml-auto">
          {nodes.length} skills • {edges.length} connections
        </div>
      </div>
    </motion.div>
  )
}
