/**
 * SKILL GENOME GRAPH VISUALIZATION ENGINE
 * 
 * Elite physics-based visualization with:
 * - Force-directed layout (d3-force)
 * - Dynamic category clustering
 * - Physics simulation (repulsion, attraction, collision)
 * - Smooth animations & interactions
 * - Production-grade rendering
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  Simulation,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force'
import { SkillNode as SkillNodeType, SkillGraph, SkillEdge } from '@/lib/ai/skill-genome-system'
import { motion } from 'framer-motion'

interface SkillGraphVisualizerProps {
  skillGraph: SkillGraph
  onSkillSelect?: (skill: SkillNodeType) => void
}

// Physics node with position & velocity
interface PhysicsNode extends SimulationNodeDatum {
  id: string
  skill: SkillNodeType
  vx?: number
  vy?: number
  x: number
  y: number
  fx?: number | null
  fy?: number | null
}

// Physics edge
interface PhysicsEdge extends SimulationLinkDatum<PhysicsNode> {
  source: PhysicsNode | string | number
  target: PhysicsNode | string | number
  type: 'dependency' | 'related' | 'complementary'
  strength: number
}

// Cluster center positions (by category)
const CLUSTER_POSITIONS: Record<string, { x: number; y: number }> = {
  core: { x: 0, y: 0 },           // Center
  support: { x: -200, y: -150 },  // Left
  advanced: { x: 200, y: -150 },  // Right
  optional: { x: 0, y: 250 },     // Bottom
}

// Color mapping for categories
const CATEGORY_COLORS: Record<string, string> = {
  core: '#00D9FF',      // Cyan
  support: '#0B5FFF',   // Blue
  advanced: '#9D00FF',  // Purple
  optional: '#FF6B00',  // Orange
}



/**
 * Skill node component - rendered with physics position
 */
interface SkillNodeComponentProps {
  node: PhysicsNode
  isSelected: boolean
  color: string
  onSelect: (node: PhysicsNode) => void
  onHover?: (node: PhysicsNode | null) => void
}

const SkillNodeComponent: React.FC<SkillNodeComponentProps> = ({
  node,
  isSelected,
  color,
  onSelect,
  onHover,
}) => {
  const handleRadius = 24
  const scale = isSelected ? 1.2 : 1

  return (
    <motion.g
      key={node.id}
      animate={{ x: node.x, y: node.y, scale }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseEnter={() => onHover?.(node)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onSelect(node)}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow effect */}
      <g filter="url(#glow)">
        <circle
          cx={0}
          cy={0}
          r={handleRadius + 8}
          fill={color}
          opacity={isSelected ? 0.3 : 0.1}
        />
      </g>

      {/* Main circle */}
      <circle
        cx={0}
        cy={0}
        r={handleRadius}
        fill="rgba(15, 23, 42, 0.95)"
        stroke={color}
        strokeWidth={isSelected ? 3 : 2}
        style={{
          filter: `drop-shadow(0 0 12px ${color}80)`,
        }}
      />

      {/* Progress ring */}
      <circle
        cx={0}
        cy={0}
        r={handleRadius - 4}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray={`${((node.skill.mastery || 0) / 100) * (Math.PI * 2 * (handleRadius - 4))} ${Math.PI * 2 * (handleRadius - 4)}`}
        strokeLinecap="round"
        opacity={0.6}
      />

      {/* Text label */}
      <text
        x={0}
        y={5}
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="bold"
        className="pointer-events-none"
      >
        {node.skill.name.substring(0, 8)}
      </text>
    </motion.g>
  )
}

/**
 * Edge component - rendered as SVG line
 */
interface EdgeComponentProps {
  source: PhysicsNode
  target: PhysicsNode
  type: 'dependency' | 'related' | 'complementary'
  strength: number
  isHighlighted: boolean
}

const EdgeComponent: React.FC<EdgeComponentProps> = ({
  source,
  target,
  type,
  strength,
  isHighlighted,
}) => {
  const strokeColor = {
    dependency: '#00D9FF',
    related: '#0B5FFF',
    complementary: '#9D00FF',
  }[type]

  const opacity = isHighlighted ? 0.8 : 0.3
  const strokeWidth = (strength * 2.5) + (isHighlighted ? 1 : 0)

  return (
    <line
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      opacity={opacity}
      style={{
        transition: 'opacity 0.2s, stroke-width 0.2s',
      }}
      pointerEvents="none"
    />
  )
}

/**
 * Main visualizer component
 */
export const SkillGraphVisualizer: React.FC<SkillGraphVisualizerProps> = ({
  skillGraph,
  onSkillSelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<Simulation<PhysicsNode, PhysicsEdge> | null>(null)
  const [nodes, setNodes] = useState<PhysicsNode[]>([])
  const [edges, setEdges] = useState<PhysicsEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<PhysicsNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<PhysicsNode | null>(null)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const containerWidth = 900
  const containerHeight = 600

  // Initialize nodes with random positions
  const initialNodes = useMemo(() => {
    return skillGraph.nodes.map((skill) => ({
      id: skill.id,
      skill,
      x: containerWidth / 2 + (Math.random() - 0.5) * 200,
      y: containerHeight / 2 + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
    } as PhysicsNode))
  }, [skillGraph.nodes, containerWidth, containerHeight])

  // Create cluster force function
  const clusterForce = useCallback((alpha: number) => {
    nodes.forEach((node) => {
      const cluster = CLUSTER_POSITIONS[node.skill.category] || CLUSTER_POSITIONS.optional
      const strength = 0.1 * alpha

      node.vx = (node.vx || 0) + (cluster.x - node.x) * strength
      node.vy = (node.vy || 0) + (cluster.y - node.y) * strength
    })
  }, [nodes])

  // Initialize physics simulation
  useEffect(() => {
    setNodes(initialNodes)

    // Create a map of node IDs to node objects for edge linking
    const nodeMap = new Map<string, PhysicsNode>()
    initialNodes.forEach((node) => {
      nodeMap.set(node.id, node)
    })

    // Create edges with proper node object references
    const nodeIds = new Set(skillGraph.nodes.map((n) => n.id))
    const physicsEdges = skillGraph.edges
      .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
      .map((edge) => {
        const sourceNode = nodeMap.get(edge.source)
        const targetNode = nodeMap.get(edge.target)
        if (!sourceNode || !targetNode) return null
        
        return {
          source: sourceNode,
          target: targetNode,
          type: edge.type || 'related',
          strength: edge.strength || 0.5,
        } as PhysicsEdge
      })
      .filter((edge): edge is PhysicsEdge => edge !== null)

    setEdges(physicsEdges)

    // Cancel previous simulation if it exists
    if (simulationRef.current) {
      simulationRef.current.stop()
    }

    // Create new simulation
    const simulation = forceSimulation<PhysicsNode, PhysicsEdge>(initialNodes)
      .force('charge', forceManyBody().strength(-350))
      .force('link', forceLink<PhysicsNode, PhysicsEdge>(physicsEdges).distance(130).strength(0.5))
      .force('center', forceCenter(containerWidth / 2, containerHeight / 2).strength(0.06))
      .force('collision', forceCollide().radius(55).iterations(2))
      .force('cluster', clusterForce)
      .alphaDecay(0.015)
      .on('tick', () => {
        setNodes([...initialNodes])
      })

    simulationRef.current = simulation

    return () => {
      simulation.stop()
    }
  }, [initialNodes, skillGraph.edges, skillGraph.nodes, clusterForce, containerWidth, containerHeight])

  // Handle node selection
  const handleNodeSelect = useCallback(
    (node: PhysicsNode) => {
      setSelectedNode(node)
      onSkillSelect?.(node.skill)
    },
    [onSkillSelect]
  )

  // Get highlighted edge IDs
  const highlightedEdgeIds = useMemo(() => {
    if (!hoveredNode) return new Set<string>()
    return new Set(
      edges
        .filter(
          (edge) =>
            (typeof edge.source === 'string' && edge.source === hoveredNode.id) ||
            (typeof edge.source === 'object' && edge.source.id === hoveredNode.id) ||
            (typeof edge.target === 'string' && edge.target === hoveredNode.id) ||
            (typeof edge.target === 'object' && edge.target.id === hoveredNode.id)
        )
        .map(
          (edge) =>
            `${typeof edge.source === 'string' ? edge.source : edge.source.id}-${typeof edge.target === 'string' ? edge.target : edge.target.id}`
        )
    )
  }, [hoveredNode, edges])

  // Pan/Zoom handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
    }
  }, [panX, panY])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x)
      setPanY(e.clientY - dragStart.y)
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(Math.max(zoom * delta, 0.3), 3)
    setZoom(newZoom)
  }, [zoom])

  // Reset view handler
  const resetView = useCallback(() => {
    setPanX(0)
    setPanY(0)
    setZoom(1)
  }, [])

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800" style={{ aspectRatio: '900/600' }}>
      {/* SVG Canvas with Pan/Zoom */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1E293B 100%)',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Transform container for pan/zoom */}
        <g transform={`translate(${panX / zoom}, ${panY / zoom}) scale(${zoom})`}>
          {/* Gradient glow filter */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#0F172A', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#1E3A8A', stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: '#1E293B', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Background grid */}
          <g opacity="0.05">
            {Array.from({ length: 30 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 30} y1={0} x2={i * 30} y2={containerHeight} stroke="#0B5FFF" />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`h-${i}`} x1={0} y1={i * 30} x2={containerWidth} y2={i * 30} stroke="#0B5FFF" />
            ))}
          </g>

          {/* Edges */}
          {edges.map((edge, idx) => {
            const sourceNode = nodes.find(
              (n) => n.id === (typeof edge.source === 'string' ? edge.source : edge.source.id)
            )
            const targetNode = nodes.find(
              (n) => n.id === (typeof edge.target === 'string' ? edge.target : edge.target.id)
            )

            if (!sourceNode || !targetNode) return null

            const edgeId = `${sourceNode.id}-${targetNode.id}`
            const isHighlighted = highlightedEdgeIds.has(edgeId)

            return (
              <EdgeComponent
                key={edgeId}
                source={sourceNode}
                target={targetNode}
                type={edge.type}
                strength={edge.strength}
                isHighlighted={isHighlighted}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <SkillNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              color={CATEGORY_COLORS[node.skill.category] || CATEGORY_COLORS.optional}
              onSelect={handleNodeSelect}
              onHover={setHoveredNode}
            />
          ))}
        </g>
      </svg>

      {/* Category Legend */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 text-xs text-slate-300 z-20">
        <div className="font-bold text-slate-100 mb-3">Skill Categories</div>
        <div className="space-y-2">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{cat} Skills</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 text-xs text-slate-300 z-20">
        <div className="font-bold text-slate-100 mb-2">Overall Progress</div>
        <div className="mb-3">
          <div className="text-xs text-slate-400 mb-1">Total: {skillGraph.totalProgress || 0}%</div>
          <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              style={{ width: `${skillGraph.totalProgress || 0}%` }}
            />
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Core Skills: {skillGraph.coreSkillsProgress || 0}%</div>
          <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500"
              style={{ width: `${skillGraph.coreSkillsProgress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Zoom & Pan Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <button
          onClick={resetView}
          className="px-3 py-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded text-xs font-semibold text-slate-100 hover:bg-slate-800 transition-colors"
          title="Reset view (Ctrl+0)"
        >
          Reset View
        </button>
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded p-2 flex flex-col gap-1">
          <span className="text-xs text-slate-400 text-center">Zoom: {(zoom * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Help Text */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-3 text-xs text-slate-300 z-20 max-w-xs">
        <div className="font-semibold text-slate-100 mb-2">Navigation</div>
        <div className="space-y-1 text-slate-400">
          <div>🖱️ <strong>Drag</strong> to pan</div>
          <div>🔄 <strong>Scroll</strong> to zoom</div>
          <div>📍 <strong>Click</strong> to select skill</div>
        </div>
      </div>

      {/* Selected Skill Info Panel */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 w-64 z-30"
        >
          <div
            className="h-2 w-full mb-3 bg-slate-800 rounded-full overflow-hidden"
            style={{ backgroundColor: `${CATEGORY_COLORS[selectedNode.skill.category] || CATEGORY_COLORS.optional}20` }}
          >
            <div
              className="h-full bg-gradient-to-r"
              style={{
                background: `linear-gradient(90deg, ${CATEGORY_COLORS[selectedNode.skill.category] || CATEGORY_COLORS.optional}, ${CATEGORY_COLORS[selectedNode.skill.category] || CATEGORY_COLORS.optional}80)`,
                width: `${selectedNode.skill.mastery || 0}%`,
              }}
            />
          </div>
          <h3 className="font-bold text-slate-100 mb-1">{selectedNode.skill.name}</h3>
          <p className="text-xs text-slate-400 mb-2">{selectedNode.skill.description}</p>
          <div className="text-xs text-slate-300 space-y-1">
            <div>
              <span className="text-slate-400">Category:</span> <span className="capitalize">{selectedNode.skill.category}</span>
            </div>
            <div>
              <span className="text-slate-400">Mastery:</span> <span>{selectedNode.skill.mastery || 0}%</span>
            </div>
            <div>
              <span className="text-slate-400">Type:</span> <span>{selectedNode.skill.type}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SkillGraphVisualizer
