import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-auth'

// Helper function to build detailed skill analyses from nodes
function buildSkillAnalyses(nodes: any[]) {
  const analyses: Record<string, any> = {}

  nodes.forEach((node) => {
    analyses[node.id] = {
      skillId: node.id,
      name: node.label,
      proficiency: node.proficiency || 0,
      meaning: getSkillMeaning(node.label),
      workContext: getWorkContext(node.label),
      capabilityAnalysis: getCapabilityAnalysis(node.label, node.proficiency || 0),
      dependencies: [],
      dependents: [],
      growthImpact: getGrowthImpact(node.label),
      strategicInsight: getStrategicInsight(node.label),
      relatedSkills: [],
      nextSteps: getNextSteps(node.label, node.proficiency || 0),
    }
  })

  return analyses
}

function getSkillMeaning(skillName: string): string {
  const meanings: Record<string, string> = {
    javascript: 'The foundational language enabling dynamic web interactions',
    typescript: 'Superset of JavaScript adding static type checking for safer codebases',
    react: 'UI library for building interactive, component-based interfaces',
    nodejs: 'JavaScript runtime enabling server-side development',
    express: 'Minimalist Node.js framework for building REST APIs',
    postgresql: 'Powerful open-source relational database',
    mongodb: 'NoSQL document database for flexible data storage',
    'rest-api': 'Architectural style for building scalable web services',
    docker: 'Containerization platform for consistent deployment',
    git: 'Distributed version control for collaborative development',
    algorithms: 'Step-by-step procedures for solving computational problems',
    'data-structures': 'Organized methods for storing and accessing data',
    'system-design': 'Architecture of large-scale distributed systems',
    'html-css': 'Foundation markup and styling for web interfaces',
    tailwind: 'Utility-first CSS framework for rapid UI development',
    'state-management': 'Patterns for managing application state',
    testing: 'Strategies for validating code correctness',
    authentication: 'Mechanisms for verifying user identity',
    redis: 'In-memory data store for caching and performance',
    oop: 'Paradigm for organizing code into reusable objects',
    'ci-cd': 'Automated continuous integration and deployment',
    graphql: 'Query language for efficient API data fetching',
    'problem-solving': 'Ability to analyze and develop effective solutions',
    communication: 'Skill in conveying ideas and team collaboration',
  }
  return meanings[skillName.toLowerCase()] || `Understanding of ${skillName}`
}

function getWorkContext(skillName: string): string {
  const contexts: Record<string, string> = {
    javascript: 'Frontend development, automation, scripting',
    typescript: 'Large projects, type-safe services',
    react: 'Interactive dashboards, visualization',
    nodejs: 'REST APIs, microservices',
    postgresql: 'Complex queries, transactions',
  }
  return contexts[skillName.toLowerCase()] || 'Professional development contexts'
}

function getCapabilityAnalysis(skillName: string, proficiency: number): string {
  const level = proficiency >= 75 ? 'Advanced' : proficiency >= 60 ? 'Intermediate' : 'Foundational'
  return `${level} understanding of ${skillName}`
}

function getGrowthImpact(skillName: string): string {
  return `Strong impact on career growth and project outcomes`
}

function getStrategicInsight(skillName: string): string {
  return `Continue building depth in this skill for career advancement`
}

function getNextSteps(skillName: string, proficiency: number): string[] {
  if (proficiency >= 75) {
    return ['Mentor others', 'Contribute to open source', 'Explore advanced patterns']
  } else if (proficiency >= 60) {
    return ['Build a project', 'Study advanced concepts', 'Review production code']
  } else if (proficiency >= 40) {
    return ['Complete more labs', 'Build a project', 'Study best practices']
  }
  return ['Complete foundational labs', 'Study basics', 'Build small projects']
}

// GET /api/genome — Get or create skill genome
export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    let genome = await prisma.skillGenome.findUnique({
      where: { userId: session.user.id },
    })

    if (!genome) {
      // Initialize with default skill nodes
      const defaultNodes = [
        { id: 'javascript', label: 'JavaScript', level: 0, category: 'frontend', x: 30, y: 20 },
        { id: 'typescript', label: 'TypeScript', level: 0, category: 'frontend', x: 50, y: 15 },
        { id: 'react', label: 'React', level: 0, category: 'frontend', x: 20, y: 35 },
        { id: 'html_css', label: 'HTML/CSS', level: 0, category: 'frontend', x: 10, y: 25 },
        { id: 'nodejs', label: 'Node.js', level: 0, category: 'backend', x: 70, y: 40 },
        { id: 'python', label: 'Python', level: 0, category: 'backend', x: 80, y: 55 },
        { id: 'sql', label: 'SQL', level: 0, category: 'backend', x: 65, y: 65 },
        { id: 'git', label: 'Git', level: 0, category: 'devops', x: 40, y: 75 },
        { id: 'docker', label: 'Docker', level: 0, category: 'devops', x: 25, y: 80 },
        { id: 'algorithms', label: 'Algorithms', level: 0, category: 'cs_fundamentals', x: 55, y: 50 },
        { id: 'system_design', label: 'System Design', level: 0, category: 'cs_fundamentals', x: 85, y: 30 },
        { id: 'testing', label: 'Testing', level: 0, category: 'devops', x: 45, y: 85 },
      ]

      const defaultEdges = [
        { from: 'javascript', to: 'typescript', strength: 0.8 },
        { from: 'javascript', to: 'react', strength: 0.9 },
        { from: 'typescript', to: 'nodejs', strength: 0.7 },
        { from: 'react', to: 'html_css', strength: 0.6 },
        { from: 'nodejs', to: 'sql', strength: 0.7 },
        { from: 'nodejs', to: 'docker', strength: 0.5 },
        { from: 'python', to: 'algorithms', strength: 0.6 },
        { from: 'algorithms', to: 'system_design', strength: 0.5 },
        { from: 'docker', to: 'git', strength: 0.4 },
        { from: 'git', to: 'testing', strength: 0.3 },
      ]

      genome = await prisma.skillGenome.create({
        data: {
          userId: session.user.id,
          nodes: JSON.stringify(defaultNodes),
          edges: JSON.stringify(defaultEdges),
          weakClusters: JSON.stringify(['backend', 'devops']),
          bridgeSkills: JSON.stringify(['typescript', 'docker']),
          compoundingSkills: JSON.stringify(['javascript', 'algorithms']),
        },
      })
    }

    const nodes = JSON.parse(genome.nodes || '[]')
    return success({
      ...genome,
      nodes,
      edges: JSON.parse(genome.edges || '[]'),
      weakClusters: JSON.parse(genome.weakClusters || '[]'),
      bridgeSkills: JSON.parse(genome.bridgeSkills || '[]'),
      compoundingSkills: JSON.parse(genome.compoundingSkills || '[]'),
      skillAnalyses: buildSkillAnalyses(nodes),
      gaps: [],
      lastUpdated: genome.updatedAt,
    })
  } catch (error) {
    console.error('Genome GET error:', error)
    return serverError()
  }
}

// POST /api/genome — Update skill genome (after lab completion, etc.)
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return unauthorized()

    const body = await req.json()
    const { nodes, edges, weakClusters, bridgeSkills, compoundingSkills } = body

    const updateData: Record<string, unknown> = { lastAnalyzed: new Date() }

    if (nodes) updateData.nodes = JSON.stringify(nodes)
    if (edges) updateData.edges = JSON.stringify(edges)
    if (weakClusters) updateData.weakClusters = JSON.stringify(weakClusters)
    if (bridgeSkills) updateData.bridgeSkills = JSON.stringify(bridgeSkills)
    if (compoundingSkills) updateData.compoundingSkills = JSON.stringify(compoundingSkills)

    // Calculate scores from nodes if provided
    if (nodes) {
      const parsedNodes = Array.isArray(nodes) ? nodes : JSON.parse(nodes)
      const categories = new Map<string, number[]>()
      parsedNodes.forEach((node: { category: string; level: number }) => {
        if (!categories.has(node.category)) categories.set(node.category, [])
        categories.get(node.category)!.push(node.level || 0)
      })

      let totalStrength = 0
      let maxDepth = 0
      categories.forEach((levels) => {
        const avg = levels.reduce((a, b) => a + b, 0) / levels.length
        totalStrength += avg
        maxDepth = Math.max(maxDepth, Math.max(...levels))
      })

      updateData.breadthScore = Math.round((categories.size / 5) * 100)
      updateData.depthScore = Math.round((maxDepth / 5) * 100)
      updateData.coreStrength = Math.round((totalStrength / Math.max(categories.size, 1)) * 20)
    }

    let genome = await prisma.skillGenome.findUnique({
      where: { userId: session.user.id },
    })

    if (genome) {
      genome = await prisma.skillGenome.update({
        where: { userId: session.user.id },
        data: updateData,
      })
    } else {
      genome = await prisma.skillGenome.create({
        data: {
          userId: session.user.id,
          ...updateData,
        } as Parameters<typeof prisma.skillGenome.create>[0]['data'],
      })
    }

    const parsedNodes = JSON.parse(genome.nodes || '[]')
    return success({
      ...genome,
      nodes: parsedNodes,
      edges: JSON.parse(genome.edges || '[]'),
      weakClusters: JSON.parse(genome.weakClusters || '[]'),
      bridgeSkills: JSON.parse(genome.bridgeSkills || '[]'),
      compoundingSkills: JSON.parse(genome.compoundingSkills || '[]'),
      skillAnalyses: buildSkillAnalyses(parsedNodes),
      gaps: [],
      lastUpdated: genome.updatedAt,
    })
  } catch (error) {
    console.error('Genome POST error:', error)
    return serverError()
  }
}
