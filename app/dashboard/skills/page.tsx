'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { SkillGenomeHeader } from '@/components/features/skill-genome/SkillGenomeHeader'
import { GenomeGraph } from '@/components/features/skill-genome/GenomeGraph'
import { SkillIntelligencePanel } from '@/components/features/skill-genome/SkillIntelligencePanel'
import { GapAnalysisPanel } from '@/components/features/skill-genome/GapAnalysisPanel'
import { useGenomeData } from '@/lib/hooks/useGenomeData'
import { SkillNode, SkillAnalysis, SkillGap } from '@/types/genome'

export default function SkillsPage() {
  const { data: session } = useSession()
  const { data: genomeData, stats, loading, error, refetch } = useGenomeData()

  const [selectedSkill, setSelectedSkill] = useState<SkillAnalysis | null>(null)
  const [selectedGap, setSelectedGap] = useState<SkillGap | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refetch()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, refetch])

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Please log in to view your skill genome</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SkillGenomeHeader stats={null} loading={false} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-950/30 border border-red-900/50 rounded-lg p-6 text-center"
        >
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  const handleSelectNode = (node: SkillNode) => {
    try {
      if (!node || !node.id) {
        console.warn('Invalid node selected')
        return
      }

      if (genomeData?.skillAnalyses && node.id in genomeData.skillAnalyses) {
        const analysis = genomeData.skillAnalyses[node.id]
        setSelectedSkill(analysis)
      } else {
        // Create a basic analysis if not found
        setSelectedSkill({
          skillId: node.id,
          name: node.label || 'Unknown Skill',
          proficiency: node.proficiency || 0,
          meaning: 'Skill analysis pending',
          workContext: 'Being analyzed',
          capabilityAnalysis: 'Capability analysis pending',
          dependencies: [],
          dependents: [],
          growthImpact: 'Analyzing growth potential',
          strategicInsight: 'Strategic analysis pending',
          relatedSkills: [],
          nextSteps: [],
        })
      }
    } catch (error) {
      console.error('Error selecting node:', error)
    }
  }

  const handleSelectGap = (gap: SkillGap) => {
    try {
      if (gap && gap.id) {
        setSelectedGap(gap)
      }
    } catch (error) {
      console.error('Error selecting gap:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <SkillGenomeHeader stats={stats} loading={loading} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Section - 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Neural Network</h2>
            <p className="text-sm text-gray-400 mb-4">
              Your interconnected skills network. Click nodes to explore details.
            </p>
          </div>

          <GenomeGraph
            nodes={genomeData?.nodes || []}
            edges={genomeData?.edges || []}
            onSelectNode={handleSelectNode}
            selectedNodeId={selectedSkill?.skillId}
            loading={loading}
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Skill Intelligence Panel */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Skill Details</h2>
            <AnimatePresence mode="wait">
              <SkillIntelligencePanel
                key={selectedSkill?.skillId || 'empty'}
                skill={selectedSkill}
                onClose={() => setSelectedSkill(null)}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Section - Gap Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gap Analysis - Takes 1/3 */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-2">Gap Analysis</h2>
          <GapAnalysisPanel
            gaps={genomeData?.gaps || []}
            selectedGapId={selectedGap?.id}
            onSelectGap={handleSelectGap}
            loading={loading}
          />
        </div>

        {/* Gap Details - Takes 2/3 */}
        {selectedGap && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-lg p-6"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{selectedGap.skill}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                      selectedGap.priority === 'critical'
                        ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                        : selectedGap.priority === 'important'
                          ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                          : 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    }`}
                  >
                    {selectedGap.priority}
                  </span>
                  <span className="text-xs text-gray-500">Impact: {selectedGap.impact}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{selectedGap.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Learning Time
                  </p>
                  <p className="text-xl font-bold text-white">{selectedGap.learningTime}h</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Category
                  </p>
                  <p className="text-lg font-bold text-cyan-400">{selectedGap.category}</p>
                </div>
              </div>

              {selectedGap.suggestedPath && selectedGap.suggestedPath.length > 0 && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                    Learning Path ({selectedGap.suggestedPath.length} steps)
                  </label>
                  <ol className="space-y-2">
                    {selectedGap.suggestedPath.map((step, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex gap-2">
                        <span className="font-bold text-cyan-400">{idx + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <button className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors mt-4">
                Enroll in Lab
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Refresh Status */}
      <div className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-lg text-xs text-gray-500">
        <span>Auto-refresh enabled</span>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          {autoRefresh ? '●' : '○'} Live
        </button>
      </div>
    </motion.div>
  )
}
