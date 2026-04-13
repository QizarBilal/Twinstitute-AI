'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { COLORS } from '@/lib/design-system'
import { useDataFetch } from '@/lib/hooks/useDataFetch'
import { useSystem } from '@/lib/system'
import {
    generateAdaptiveRoadmap,
    calculateRoadmapProgress,
    estimateTimeToCompletion,
    getNodeReasoning,
    AdaptiveContext,
} from '@/lib/ai/roadmapAdapter'
import RoadmapGraph from '@/components/dashboard/roadmap/RoadmapGraph'
import NodeDetailsPanel from '@/components/dashboard/roadmap/NodeDetailsPanel'

// Empty state component - user needs to select a domain first
const EmptyRoadmapState = () => (
    <div
        className="flex flex-col items-center justify-center min-h-screen"
        style={{ backgroundColor: COLORS.background.primary }}
    >
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
        >
            <div>
                <h2 style={{ color: COLORS.text.primary }} className="text-2xl font-semibold mb-4">
                    No Roadmap Yet
                </h2>
                <p style={{ color: COLORS.text.secondary }} className="mb-6 text-lg">
                    Select a domain to generate your personalized learning roadmap
                </p>
            </div>

            <motion.a
                href="/dashboard/strategy"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-8 py-4 rounded-lg font-semibold transition-all"
                style={{
                    backgroundColor: COLORS.accent.primary,
                    color: '#ffffff',
                }}
            >
                Choose Your Learning Path
            </motion.a>

            <p style={{ color: COLORS.text.secondary }} className="text-sm">
                A well-structured roadmap awaits once you select your area of focus
            </p>
        </motion.div>
    </div>
)

// Loading state component
const RoadmapLoadingState = () => (
    <div className="space-y-6">
        <div className="h-8 bg-gray-800/50 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-800/50 rounded animate-pulse" />
            ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-96 bg-gray-800/50 rounded animate-pulse" />
            <div className="h-96 bg-gray-800/50 rounded animate-pulse" />
        </div>
    </div>
)

export default function RoadmapPage() {
    const { user, roadmap, isLoading } = useSystem()
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

    // Fetch required data
    const { data: performanceData } = useDataFetch('/api/user/recent-performance')
    const { data: genomeData } = useDataFetch('/api/genome')
    const { data: twinData } = useDataFetch('/api/user/twin')

    // Build adaptive context
    const adaptiveContext = useMemo<AdaptiveContext | null>(() => {
        if (!performanceData || !genomeData || !twinData) return null

        return {
            targetRole: twinData.targetRole || 'Full Stack Developer',
            currentScore: twinData.overallScore || 50,
            averageScore: performanceData.averageScore || 50,
            consistency: performanceData.consistency || 50,
            strugglingSkills: genomeData.weakSkills?.slice(0, 3) || [],
            excellenceAreas: genomeData.strengthSkills?.slice(0, 3) || [],
            completionRate: performanceData.completionRate || 0.5,
            learningVelocity: twinData.formationVelocity || 1,
            burnoutRisk: twinData.burnoutRisk || 30,
        }
    }, [performanceData, genomeData, twinData])

    // Extract roadmap from system state
    const roadmapNodes = useMemo(() => {
        if (!roadmap || !roadmap.nodes) return []
        return roadmap.nodes
    }, [roadmap])

    // Generate adaptive roadmap
    const { adaptedNodes, edges, progress, timeEstimate, reasoning } = useMemo(() => {
        if (!adaptiveContext || roadmapNodes.length === 0) {
            return {
                adaptedNodes: roadmapNodes,
                edges: [],
                progress: calculateRoadmapProgress(roadmapNodes as any),
                timeEstimate: estimateTimeToCompletion(roadmapNodes as any, 0),
                reasoning: '',
            }
        }

        const { nodes, edges, reasoning } = generateAdaptiveRoadmap(roadmapNodes as any, adaptiveContext)
        const progress = calculateRoadmapProgress(nodes as any)
        const timeEstimate = estimateTimeToCompletion(nodes, adaptiveContext.learningVelocity)

        return {
            adaptedNodes: nodes,
            edges,
            progress,
            timeEstimate,
            reasoning,
        }
    }, [adaptiveContext, roadmapNodes])

    const selectedNode = adaptedNodes.find((n: any) => n.id === selectedNodeId) || null

    // Show empty state if no roadmap
    if (!roadmap || roadmapNodes.length === 0) {
        return <EmptyRoadmapState />
    }

    // Loading skeleton
    if (isLoading || !adaptiveContext) {
        return <RoadmapLoadingState />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h1 className="text-3xl font-bold text-white">Adaptive Learning Roadmap</h1>
                <p className="text-gray-400">
                    Your personalized path to {adaptiveContext?.targetRole || 'success'} — evolving with your performance
                </p>
            </motion.div>

            {/* Progress Overview */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-4 gap-4"
            >
                {/* Progress */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-semibold mb-2">PROGRESS</div>
                    <div className="flex items-end gap-2">
                        <div className="text-3xl font-bold text-cyan-400">{progress.percentComplete}%</div>
                        <div className="text-xs text-gray-500 mb-1">
                            {progress.completedCount}/{progress.totalCount}
                        </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentComplete}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        />
                    </div>
                </div>

                {/* Estimated Time */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-semibold mb-2">ESTIMATED TIME</div>
                    <div className="text-3xl font-bold text-white">{timeEstimate.estimatedWeeks}w</div>
                    <div className="text-xs text-gray-500 mt-2">~{timeEstimate.estimatedDays} days</div>
                </div>

                {/* Current Node */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-semibold mb-2">CURRENT STAGE</div>
                    <div className="text-sm font-bold text-white truncate">
                        {selectedNode?.title || 'Ready to start'}
                    </div>
                    <div
                        className="text-xs mt-2 inline-block px-2 py-1 rounded"
                        style={{
                            backgroundColor: COLORS.accents.primary + '20',
                            color: COLORS.accents.primary,
                        }}
                    >
                        {'READY'}
                    </div>
                </div>

                {/* Learning Velocity */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-semibold mb-2">VELOCITY</div>
                    <div className="text-3xl font-bold text-green-400">
                        {adaptiveContext.learningVelocity.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">pts/week</div>
                </div>
            </motion.div>

            {/* Main Content: Graph + Details */}
            <div className="grid grid-cols-3 gap-6">
                {/* Graph (2 columns) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-2 bg-gray-900/60 border border-gray-800 rounded-lg overflow-hidden"
                    style={{ minHeight: '500px' }}
                >
                    <RoadmapGraph
                        nodes={adaptedNodes as any}
                        edges={edges}
                        selectedNodeId={selectedNodeId || undefined}
                        onNodeSelect={setSelectedNodeId}
                    />
                </motion.div>

                {/* Details Panel (1 column) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 overflow-hidden flex flex-col"
                    style={{ minHeight: '500px' }}
                >
                    <NodeDetailsPanel
                        node={(selectedNode as any) || null}
                        onStartTask={(nodeId) => {
                            console.log('Start task:', nodeId)
                            // Navigate to labs/tasks for this node
                        }}
                        onViewRelated={(nodeId) => {
                            console.log('View related:', nodeId)
                            // Navigate to related tasks
                        }}
                    />
                </motion.div>
            </div>

            {/* AI Reasoning Panel */}
            {reasoning && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-lg p-4"
                >
                    <h3 className="text-sm font-bold text-purple-300 mb-3">🧠 Why This Roadmap?</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                        {reasoning.split('\n').map((line, idx) => (
                            line.trim() && (
                                <div key={idx} className="flex gap-2">
                                    <span>{line}</span>
                                </div>
                            )
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Bottom Actions */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-4"
            >
                {/* Resume Current */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 rounded-lg transition-all"
                    onClick={() => {
                        const activeNode = adaptedNodes.find((n: any) => n.status === 'active')
                        if (activeNode) {
                            window.location.href = `/dashboard/labs?node=${activeNode.id}`
                        }
                    }}
                >
                    ▶ Resume Current Node
                </motion.button>

                {/* Jump to Weak Skill */}
                {adaptiveContext.strugglingSkills.length > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-3 rounded-lg transition-all"
                        onClick={() => {
                            const weakSkillNode = adaptedNodes.find(
                                (n: any) =>
                                    n.status !== 'completed' &&
                                    adaptiveContext.strugglingSkills.some((skill: any) =>
                                        n.skills.some((nodeSkill: any) => nodeSkill.toLowerCase().includes(skill.toLowerCase()))
                                    )
                            )
                            if (weakSkillNode) setSelectedNodeId(weakSkillNode.id)
                        }}
                    >
                        🎯 Focus on Weak Skill
                    </motion.button>
                )}

                {/* View Twin Dashboard */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-3 rounded-lg transition-all"
                    onClick={() => {
                        window.location.href = '/dashboard/twin'
                    }}
                >
                    📊 View Twin Dashboard
                </motion.button>
            </motion.div>

            {/* Footer Info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="border-t border-gray-800 pt-4 text-xs text-gray-500 space-y-2"
            >
                <div>
                    <span className="font-semibold text-gray-400">Legend:</span> Green = Completed • Cyan = Current • Gray = Locked
                </div>
                <div>
                    <span className="font-semibold text-gray-400">How it works:</span> Your roadmap adapts based on your performance,
                    target role, and skill gaps. Complete nodes to unlock advanced content.
                </div>
            </motion.div>
        </div>
    )
}

