// Roadmap type definitions for Prisma models
export interface RoadmapNode {
  id: string
  nodeId: string
  title: string
  description?: string | null
  type: string
  difficulty: string
  estimatedHours: number
  skillsGained: string[]
  why?: string | null
  impactExecution: number
  impactProblemSolving: number
  dependencies: string[]
  roadmapId: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Roadmap {
  id: string
  userId: string
  role: string
  domain: string
  estimatedCompletionMonths: number
  readinessScore: number
  nodes?: RoadmapNode[]
  progress?: RoadmapProgress[]
  createdAt: Date
  updatedAt: Date
}

export interface RoadmapProgress {
  id: string
  userId: string
  nodeId: string
  roadmapId: string
  status: string
  startedAt?: Date | null
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}
