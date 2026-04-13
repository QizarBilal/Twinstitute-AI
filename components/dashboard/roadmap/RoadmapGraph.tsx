'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { RoadmapNode, RoadmapEdge } from '@/lib/ai/roadmapAdapter'

interface RoadmapGraphProps {
    nodes: RoadmapNode[]
    edges: RoadmapEdge[]
    selectedNodeId?: string
    onNodeSelect: (nodeId: string) => void
}

export default function RoadmapGraph({
    nodes,
    edges,
    selectedNodeId,
    onNodeSelect,
}: RoadmapGraphProps) {
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

    // Calculate SVG layout using force-directed positioning
    const layout = useMemo(() => {
        const width = 1000
        const height = 600
        const positions: Record<string, { x: number; y: number }> = {}

        // Simple hierarchical layout based on prerequisites
        const levels: string[][] = []
        const processed = new Set<string>()

        // Sort nodes by number of prerequisites
        const sortedNodes = [...nodes].sort((a, b) => a.prerequisites.length - b.prerequisites.length)

        sortedNodes.forEach((node) => {
            const level = Math.max(
                0,
                ...(node.prerequisites.map((prereqId) => {
                    const prereqIndex = sortedNodes.findIndex((n) => n.id === prereqId)
                    const prereqLevel = levels.findIndex((l) => l.includes(prereqId))
                    return prereqLevel >= 0 ? prereqLevel + 1 : 0
                }) || [0])
            )

            if (!levels[level]) levels[level] = []
            levels[level].push(node.id)
        })

        // Assign positions
        levels.forEach((levelNodes, levelIndex) => {
            const levelHeight = (height * 0.8) / levels.length
            const topMargin = height * 0.1

            levelNodes.forEach((nodeId, indexInLevel) => {
                const y = topMargin + levelIndex * levelHeight + levelHeight / 2
                const totalInLevel = levelNodes.length
                const x = (width / (totalInLevel + 1)) * (indexInLevel + 1)

                positions[nodeId] = { x, y }
            })
        })

        return { width, height, positions }
    }, [nodes])

    // Get node color based on status
    const getNodeColor = (node: RoadmapNode): string => {
        if (node.status === 'completed') return COLORS.accents.success
        if (node.status === 'active') return COLORS.accents.cyan
        if (node.status === 'locked') return COLORS.text.tertiary
        return COLORS.accents.primary
    }

    // Get node border color
    const getNodeBorderColor = (node: RoadmapNode): string => {
        if (node.status === 'completed') return COLORS.accents.success
        if (node.status === 'active') return COLORS.accents.cyan
        if (selectedNodeId === node.id) return COLORS.accents.cyan
        return 'rgba(107, 114, 128, 0.5)'
    }

    const nodeRadius = 45
    const handleNodeClick = (nodeId: string) => {
        onNodeSelect(nodeId)
    }

    return (
        <div className="relative w-full h-full bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden">
            {/* SVG Canvas */}
            <svg
                width={layout.width}
                height={layout.height}
                className="w-full h-full"
                viewBox={`0 0 ${layout.width} ${layout.height}`}
            >
                {/* Gradient definitions */}
                <defs>
                    <linearGradient id="completedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={COLORS.accents.success} stopOpacity={0.1} />
                        <stop offset="100%" stopColor={COLORS.accents.success} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={COLORS.accents.cyan} stopOpacity={0.1} />
                        <stop offset="100%" stopColor={COLORS.accents.cyan} stopOpacity={0.05} />
                    </linearGradient>
                </defs>

                {/* Render edges first (behind nodes) */}
                {edges.map((edge, idx) => {
                    const fromPos = layout.positions[edge.from]
                    const toPos = layout.positions[edge.to]

                    if (!fromPos || !toPos) return null

                    const isHighlighted =
                        selectedNodeId === edge.from ||
                        selectedNodeId === edge.to ||
                        hoveredNodeId === edge.from ||
                        hoveredNodeId === edge.to

                    return (
                        <motion.line
                            key={`edge-${idx}`}
                            x1={fromPos.x}
                            y1={fromPos.y}
                            x2={toPos.x}
                            y2={toPos.y}
                            stroke={isHighlighted ? COLORS.accents.cyan : 'rgba(107, 114, 128, 0.2)'}
                            strokeWidth={isHighlighted ? 2 : 1}
                            strokeDasharray={edge.type === 'optional' ? '5,5' : '0'}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: idx * 0.02 }}
                        />
                    )
                })}

                {/* Render nodes */}
                {nodes.map((node, idx) => {
                    const pos = layout.positions[node.id]
                    if (!pos) return null

                    const isSelected = selectedNodeId === node.id
                    const isHovered = hoveredNodeId === node.id
                    const nodeColor = getNodeColor(node)
                    const borderColor = getNodeBorderColor(node)

                    const isLocked = node.status === 'locked'
                    const scale = isSelected ? 1.2 : isHovered ? 1.1 : 1

                    return (
                        <motion.g
                            key={node.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            onMouseEnter={() => !isLocked && setHoveredNodeId(node.id)}
                            onMouseLeave={() => setHoveredNodeId(null)}
                            onClick={() => !isLocked && handleNodeClick(node.id)}
                            style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                        >
                            {/* Background circle */}
                            <circle
                                cx={pos.x}
                                cy={pos.y}
                                r={nodeRadius + 5}
                                fill={
                                    node.status === 'completed'
                                        ? 'url(#completedGrad)'
                                        : node.status === 'active'
                                          ? 'url(#activeGrad)'
                                          : 'rgba(31, 41, 55, 0.4)'
                                }
                                fillOpacity={isSelected ? 0.3 : 0.15}
                            />

                            {/* Node circle */}
                            <circle
                                cx={pos.x}
                                cy={pos.y}
                                r={nodeRadius}
                                fill={nodeColor}
                                fillOpacity={isLocked ? 0.3 : 0.9}
                                stroke={borderColor}
                                strokeWidth={isSelected ? 3 : 2}
                            />

                            {/* Status icon */}
                            <text
                                x={pos.x}
                                y={pos.y - 8}
                                textAnchor="middle"
                                fontSize="24"
                                fontWeight="bold"
                                fill={isLocked ? 'rgba(255,255,255,0.3)' : 'white'}
                            >
                                {node.status === 'completed' && '✓'}
                                {node.status === 'active' && '○'}
                                {node.status === 'locked' && '🔒'}
                                {node.status === 'unlocked' && '⭐'}
                            </text>

                            {/* Node label */}
                            <text
                                x={pos.x}
                                y={pos.y + 28}
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight="600"
                                fill={isLocked ? 'rgba(255,255,255,0.4)' : 'white'}
                                textLength={nodeRadius * 1.8}
                                lengthAdjust="spacingAndGlyphs"
                            >
                                {node.title.substring(0, 12)}
                            </text>
                        </motion.g>
                    )
                })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS.accents.success }}
                    />
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS.accents.cyan }}
                    />
                    <span>Active</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-700" />
                    <span>Locked</span>
                </div>
            </div>

            {/* Empty state */}
            {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <svg
                            className="w-12 h-12 mx-auto mb-3 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <p>No roadmap data yet</p>
                    </div>
                </div>
            )}
        </div>
    )
}
