/**
 * SYSTEM INITIALIZER
 * 
 * When user confirms their role, THIS activates the entire institution
 * 
 * Orchestrates:
 * 1. Roadmap generation (learning path)
 * 2. Labs initialization (first 3 labs ready)
 * 3. Capability baseline (initial metrics)
 * 4. Dashboard configuration (role-specific UI)
 * 
 * Result: User goes from "decided" to "journeying" instantly
 */

import { generateRoadmap, RoadmapNode } from './roadmap-generator'
import { initializeLabs, InitializedLab } from './labs-initializer'
import { createCapabilityBaseline, CapabilityBaseline } from './capability-baseline'
import { ROLE_DATABASE } from './role-intelligence-db'

// ============================================================================
// TYPES
// ============================================================================

export interface SystemInitializationInput {
  userId: string
  roleName: string
  domain: string
  statedInterests: string[]
  detectedTraits: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  learningStyle: string
  availableHoursPerWeek: number
}

export interface DashboardConfig {
  roleTitle: string
  roleguide: string
  primaryPath: string
  estimatedTimeline: string
  nextMilestone: string
  uiTheme: string
  focusAreas: string[]
  progressMetrics: {
    name: string
    unit: string
    target: number
    current: number
  }[]
}

export interface SystemInitializationOutput {
  success: boolean
  activationMessage: string
  roadmap: {
    phases: RoadmapNode[]
    totalWeeks: number
    milestones: string[]
  }
  initialLabs: InitializedLab[]
  capabilityBaseline: CapabilityBaseline
  dashboardConfig: DashboardConfig
  nextActions: string[]
  motivationalMessage: string
}

// ============================================================================
// MAIN INITIALIZATION ORCHESTRATOR
// ============================================================================

export async function initializeSystem(
  input: SystemInitializationInput
): Promise<SystemInitializationOutput> {
  console.log(`🚀 Initializing system for ${input.roleName}...`)

  try {
    // STEP 1: Generate personalized roadmap
    console.log('📍 Generating roadmap...')
    const roadmap = await generateRoadmap({
      role: input.roleName,
      domain: input.domain,
      interests: input.statedInterests,
      skillLevel: input.skillLevel,
      availableHours: input.availableHoursPerWeek,
    })

    // STEP 2: Initialize first 3 labs
    console.log('🧪 Initializing labs...')
    const initialLabs = await initializeLabs({
      userId: input.userId,
      role: input.roleName,
      skillLevel: input.skillLevel,
      learningStyle: input.learningStyle,
      roadmapPhases: roadmap.phases,
    })

    // STEP 3: Create capability baseline
    console.log('📊 Creating capability baseline...')
    const baseline = createCapabilityBaseline({
      userId: input.userId,
      role: input.roleName,
      skillLevel: input.skillLevel,
      interests: input.statedInterests,
      traits: input.detectedTraits,
    })

    // STEP 4: Configure dashboard
    console.log('🎨 Configuring dashboard...')
    const dashboardConfig = buildDashboardConfig({
      role: input.roleName,
      domain: input.domain,
      roadmap,
      baseline,
    })

    // STEP 5: Generate activation message
    const activationMessage = generateActivationMessage(input.roleName, input.domain)

    // STEP 6: Generate next actions
    const nextActions = generateNextActions(input.roleName, roadmap, initialLabs)

    // STEP 7: Motivational message
    const motivationalMessage = generateMotivationalMessage(input.roleName, input.skillLevel)

    return {
      success: true,
      activationMessage,
      roadmap: {
        phases: roadmap.phases,
        totalWeeks: roadmap.totalWeeks,
        milestones: roadmap.milestones,
      },
      initialLabs,
      capabilityBaseline: baseline,
      dashboardConfig,
      nextActions,
      motivationalMessage,
    }
  } catch (error) {
    console.error('System initialization failed:', error)
    throw new Error(`Failed to initialize system: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ============================================================================
// ACTIVATION MESSAGE GENERATOR
// ============================================================================

function generateActivationMessage(role: string, domain: string): string {
  const roleData = ROLE_DATABASE[role]
  const timelineWeeks = roleData?.estimatedTimeToJob || 24

  return `
🎉 Your ${role} journey is officially launched!

**You're now on the path to ${domain}**

Here's what just activated:

✅ **Your Personalized Roadmap** is ready
   → ${timelineWeeks} weeks to job-ready
   → 5 strategic phases
   → Clear milestones

✅ **Your First 3 Labs** are assigned
   → Start immediately
   → Difficulty adapted to your level
   → Real skill-building tasks

✅ **Your Capability Profile** is initialized
   → Baseline metrics established
   → Growth areas identified
   → Personal benchmark set

✅ **Your Dashboard** is configured
   → Role-specific insights
   → Progress tracking
   → Next steps highlighted

You're no longer exploring. You're now building.

Let's go. 🚀
  `.trim()
}

// ============================================================================
// NEXT ACTIONS GENERATOR
// ============================================================================

function generateNextActions(
  role: string,
  roadmap: { phases: RoadmapNode[]; totalWeeks: number },
  labs: InitializedLab[]
): string[] {
  const firstPhase = roadmap.phases[0]
  const firstLab = labs[0]

  return [
    `📖 Read the "${firstPhase?.name || 'Foundation'}" phase overview`,
    `🧪 Start Lab 1: "${firstLab?.title || 'Getting Started'}"`,
    `📝 Complete the assessment questionnaire`,
    `🎯 Set your first weekly milestone`,
    `👥 Join the ${role} community channel`,
  ]
}

// ============================================================================
// MOTIVATIONAL MESSAGE
// ============================================================================

function generateMotivationalMessage(role: string, skillLevel: string): string {
  const messages: Record<string, Record<string, string>> = {
    'Backend Engineer': {
      beginner: "You're starting a career in deep systems thinking. This is hard. It's also incredibly rewarding. You'll build things that power the internet.",
      intermediate: "You've built before. Now you're going deeper—architecture, scale, reliability. This is where backend gets real.",
      advanced: "You know the fundamentals. This path takes you from solid engineer to systems architect. That's rare.",
    },
    'Frontend Engineer': {
      beginner: "You're learning to make the digital world beautiful and usable. Start small, build fast, iterate constantly. That's how great UIs happen.",
      intermediate: "You've made things look good. Now you'll make them feel right. Performance, accessibility, user delight—that's the next level.",
      advanced: "You know your craft. This journey takes you from good frontend engineer to UX engineer. That's the leap.",
    },
    'Data Scientist': {
      beginner: "90% of this job is data wrangling. It's boring. It's also essential. Master it, and the interesting 10% becomes possible.",
      intermediate: "You can clean data. Now learn to ask the right questions. That's what separates analysts from scientists.",
      advanced: "You know ML theory. This path teaches you what actually works in production. Meta-learning (learning how to learn from data) is your next skill.",
    },
    'DevOps Engineer': {
      beginner: "You're learning to be the person nobody thanks when everything works. When it breaks at 3am, you'll be a hero. Worth it.",
      intermediate: "You've run systems. Now learn to design them. Infrastructure as code. Chaos engineering. Reliability at scale.",
      advanced: "You're building the future of DevOps. Platform engineering. AI-driven operations. You're not just maintaining—you're innovating.",
    },
    'Product Manager': {
      beginner: "You're learning that product management is 40% strategy, 40% negotiation, 20% actually deciding. It's a skill. You'll get good at it.",
      intermediate: "You've managed features. Now manage bets. Product thinking at scale. That's where PM becomes valuable.",
      advanced: "You write strategy that shapes companies. Not many people get here. You're in that club now.",
    },
  }

  const roleMessages = messages[role] || messages['Backend Engineer']
  return roleMessages[skillLevel] || roleMessages['beginner']
}

// ============================================================================
// DASHBOARD CONFIGURATION
// ============================================================================

function buildDashboardConfig(input: {
  role: string
  domain: string
  roadmap: { phases: RoadmapNode[]; totalWeeks: number; milestones: string[] }
  baseline: CapabilityBaseline
}): DashboardConfig {
  const roleData = ROLE_DATABASE[input.role]

  return {
    roleTitle: `${input.role} Engineer`,
    roleguide: `You're on a ${input.roadmap.totalWeeks}-week journey to become a ${input.role}.`,
    primaryPath: input.roadmap.phases[0]?.name || 'Foundation',
    estimatedTimeline: `${input.roadmap.totalWeeks} weeks to job-ready`,
    nextMilestone: input.roadmap.milestones[0] || 'Complete Foundation Phase',
    uiTheme: getThemeForRole(input.role),
    focusAreas: input.baseline.capabilityGaps.slice(0, 3),
    progressMetrics: [
      {
        name: 'Roadmap Progress',
        unit: '%',
        target: 100,
        current: 0,
      },
      {
        name: 'Labs Completed',
        unit: 'labs',
        target: roleData?.estimatedLabsRequired || 15,
        current: 0,
      },
      {
        name: 'Skills Gained',
        unit: 'skills',
        target: roleData?.skillsRequired?.length || 12,
        current: 0,
      },
      {
        name: 'Portfolio Projects',
        unit: 'projects',
        target: 3,
        current: 0,
      },
    ],
  }
}

function getThemeForRole(role: string): string {
  const themes: Record<string, string> = {
    'Backend Engineer': 'deep-blue',
    'Frontend Engineer': 'vibrant-purple',
    'Data Scientist': 'neural-green',
    'DevOps Engineer': 'steel-grey',
    'Product Manager': 'strategic-orange',
  }
  return themes[role] || 'default'
}

// ============================================================================
// SYSTEM STATE SETTER
// ============================================================================

/**
 * Mark system as "active" in user's profile
 * This prevents re-initialization and gates access to full features
 */
export async function markSystemAsActive(userId: string, role: string): Promise<void> {
  // TODO: Update user profile in Prisma
  // await prisma.user.update({
  //   where: { id: userId },
  //   data: {
  //     systemInitialized: true,
  //     selectedRole: role,
  //     systemActivatedAt: new Date(),
  //   }
  // })
  console.log(`✅ System marked active for user ${userId} (${role})`)
}
