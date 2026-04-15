'use client'

import { useEffect, useState } from 'react'
import { SkillGraph, SkillNode } from '@/lib/ai/skill-genome-system'

interface UseSkillGenomeReturn {
  skillGenome: SkillGraph | null
  role: string | null
  totalModules: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useSkillGenome(): UseSkillGenomeReturn {
  const [skillGenome, setSkillGenome] = useState<SkillGraph | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [totalModules, setTotalModules] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSkillGenome = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/skill-genome')
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your skill genome')
        }
        if (response.status === 404) {
          throw new Error('No roadmap found. Please create a roadmap first.')
        }
        throw new Error('Failed to fetch skill genome')
      }

      const data = await response.json()
      setSkillGenome(data.skillGenome)
      setRole(data.role)
      setTotalModules(data.totalModules)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSkillGenome(null)
      setRole(null)
      setTotalModules(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSkillGenome()
  }, [])

  return {
    skillGenome,
    role,
    totalModules,
    loading,
    error,
    refetch: fetchSkillGenome,
  }
}
