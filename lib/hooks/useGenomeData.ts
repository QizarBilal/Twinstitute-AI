'use client'

import { useEffect, useState } from 'react'
import { GenomeData, GenomeStats } from '@/types/genome'

interface UseGenomeDataReturn {
  data: GenomeData | null
  stats: GenomeStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useGenomeData(): UseGenomeDataReturn {
  const [data, setData] = useState<GenomeData | null>(null)
  const [stats, setStats] = useState<GenomeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGenomeData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/genome')
      if (!response.ok) {
        throw new Error('Failed to fetch genome data')
      }

      const genomeData: GenomeData = await response.json()
      setData(genomeData)

      // Calculate stats
      const stats: GenomeStats = {
        totalSkills: genomeData.nodes.length,
        strongSkills: genomeData.nodes.filter(n => n.type === 'strong').length,
        mediumSkills: genomeData.nodes.filter(n => n.type === 'medium').length,
        weakSkills: genomeData.nodes.filter(n => n.type === 'weak').length,
        criticality: genomeData.coreStrength,
        learningVelocity: calculateLearningVelocity(genomeData),
        readinessScore: genomeData.breadthScore * 0.4 + genomeData.depthScore * 0.6,
      }
      setStats(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setData(null)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGenomeData()
  }, [])

  return {
    data,
    stats,
    loading,
    error,
    refetch: fetchGenomeData,
  }
}

function calculateLearningVelocity(data: GenomeData): number {
  // Calculate based on recent practice and progress
  const recentSkills = data.nodes.filter(n => {
    if (!n.lastPracticed) return false
    const daysSince = (Date.now() - new Date(n.lastPracticed).getTime()) / (1000 * 60 * 60 * 24)
    return daysSince < 30
  })

  if (recentSkills.length === 0) return 30 // Low velocity if no recent practice
  
  const avgProficiency = recentSkills.reduce((sum, s) => sum + s.proficiency, 0) / recentSkills.length
  return Math.min(avgProficiency + 20, 100)
}
